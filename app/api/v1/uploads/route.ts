import { randomUUID } from 'node:crypto';
import { NextResponse } from 'next/server';
import { serverSupabase } from '../../../lib/supabase';

/**
 * Signed upload and download URLs for Supabase Storage.
 *
 * ================================ NO AUTH =================================
 * Neither handler asks who is calling. That matches the dashboard route beside
 * it and it is a temporary wiring choice, but the consequence here is WORSE
 * than it is there:
 *
 *   * the dashboard route LEAKS - change an id, read someone else's data
 *   * this route also lets a stranger WRITE, repeatedly, into your bucket
 *
 * A signed upload URL is a bearer capability. Anybody who can call POST gets
 * one, and nothing here limits how often. Do not deploy this publicly. The fix
 * is the same one REQUIRED_APIS.md already specifies - a signed-in student, `me`
 * implied, no id in the path - plus a rate limit in front of POST.
 * ==========================================================================
 *
 * THE FILE NEVER PASSES THROUGH THIS ROUTE, AND THAT IS THE POINT.
 * The browser uploads straight to Supabase with the signed URL. A Next.js route
 * handler would otherwise have to buffer the whole file in memory and re-send
 * it, which is slower, costs more, and is what serverless request-body limits
 * exist to stop.
 *
 * IT ALSO MEANS THIS ROUTE CANNOT ENFORCE SIZE OR TYPE. It never sees the bytes.
 * `contentType` below is what the CALLER claims; it is used to name the file and
 * nothing else. The only real enforcement is on the bucket itself - its file size
 * limit and allowed MIME types, in the Supabase dashboard. A check added here
 * would look like protection and provide none.
 *
 * THE SERVER NAMES THE FILE, NEVER THE CALLER.
 * If the caller supplied the path it could write over anything already in the
 * bucket, including another student's work, by guessing or by repeating a name.
 * The stored name is a fresh uuid; the caller's filename is kept only as a label
 * to give back to them.
 */

export const dynamic = 'force-dynamic';

/**
 * Which bucket. Configuration, never a literal - the same rule the sync service
 * holds itself to, where a structural test fails the build on a hardcoded host.
 * Unset is a configuration error, not a default: silently writing into a bucket
 * nobody chose is worse than refusing.
 */
function bucketName(): string {
  const name = process.env.SUPABASE_STORAGE_BUCKET;
  if (!name) {
    throw new Error(
      'SUPABASE_STORAGE_BUCKET is not set. See .env.local — there is no default, ' +
        'because writing into a bucket nobody named is worse than failing.',
    );
  }
  return name;
}

/** How long a download link stays valid, in seconds. */
const DOWNLOAD_TTL_SECONDS = 300;

/** How many files a listing returns when the caller does not say. */
const DEFAULT_LIST_LIMIT = 5;

/**
 * The most a listing will return however large `?limit=` is.
 *
 * Not politeness - every name returned is also signed, and signing is a round
 * trip per batch. An unbounded limit turns one careless query string into a
 * request that signs the whole bucket.
 */
const MAX_LIST_LIMIT = 50;

/**
 * Pulls a safe extension off the caller's filename.
 *
 * Only the extension is taken, and only when it is short and alphanumeric. The
 * rest of the name is discarded, so `../../etc/passwd` and a 4,000-character
 * name both reduce to nothing. The extension is cosmetic - it helps a human
 * recognise the object in the bucket listing - and it is never trusted.
 */
function safeExtension(filename: unknown): string {
  if (typeof filename !== 'string') return '';
  const dot = filename.lastIndexOf('.');
  if (dot < 0) return '';
  const ext = filename.slice(dot + 1).toLowerCase();
  return /^[a-z0-9]{1,8}$/.test(ext) ? `.${ext}` : '';
}

interface UploadRequestBody {
  filename?: unknown;
}

/**
 * POST /api/v1/uploads
 *
 * Body (optional): { "filename": "my-video.mp4" }
 *
 * Returns the signed URL and the token the browser needs, plus the `path` it
 * must quote later to read the file back. Nothing else identifies the object -
 * keep the path.
 */
export async function POST(request: Request): Promise<NextResponse> {
  let body: UploadRequestBody = {};
  try {
    body = (await request.json()) as UploadRequestBody;
  } catch {
    // An empty or unparseable body is fine: filename is optional and everything
    // that matters is generated here. Failing on it would reject `fetch(url,
    // {method:'POST'})` with no body, which is a reasonable way to call this.
  }

  const path = `${randomUUID()}${safeExtension(body.filename)}`;

  try {
    const { data, error } = await serverSupabase()
      .storage.from(bucketName())
      .createSignedUploadUrl(path);

    if (error !== null) {
      // The message can name the bucket and the project, so it is logged rather
      // than returned. A caller learns that it failed, not how the storage is
      // arranged.
      console.error('createSignedUploadUrl failed', error);
      return NextResponse.json(
        { error: { code: 'upload_url_failed', message: 'Could not create an upload URL.' } },
        { status: 502 },
      );
    }

    return NextResponse.json({
      path: data.path,
      signedUrl: data.signedUrl,
      token: data.token,
      originalFilename: typeof body.filename === 'string' ? body.filename : null,
    });
  } catch (err) {
    console.error('upload route failed', err);
    return NextResponse.json(
      { error: { code: 'not_configured', message: 'Storage is not configured.' } },
      { status: 500 },
    );
  }
}

interface ListedFile {
  path: string;
  size: number | null;
  contentType: string | null;
  createdAt: string | null;
  signedUrl: string | null;
}

/**
 * GET /api/v1/uploads              -> the most recent files  (?limit=, default 5)
 * GET /api/v1/uploads?path=<path>  -> a signed URL for ONE file
 *
 * ONE HANDLER, TWO ANSWERS, chosen by whether `path` is present. Asked for that
 * way on 18 Sep 2026 - "ek common banavi le toy chale, query param" - and it is
 * the shape the App Router pushes towards anyway, since both live at the same
 * route segment. The branch is the first thing in the function so that it stays
 * obvious rather than being discovered half way down.
 *
 * SIGNED RATHER THAN PUBLIC, in both cases and even for a test bucket. A public
 * bucket URL never expires and cannot be withdrawn once it has been shared or
 * indexed; a signed one stops working on its own. For a bucket that will hold
 * students' own recordings, that difference is the whole point.
 */
export async function GET(request: Request): Promise<NextResponse> {
  const params = new URL(request.url).searchParams;
  const path = params.get('path');

  // No path: this is the listing.
  if (path === null || path === '') {
    const asked = Number.parseInt(params.get('limit') ?? '', 10);
    const limit = Number.isFinite(asked)
      ? Math.min(Math.max(asked, 1), MAX_LIST_LIMIT)
      : DEFAULT_LIST_LIMIT;

    try {
      const storage = serverSupabase().storage.from(bucketName());

      const { data, error } = await storage.list('', {
        limit,
        sortBy: { column: 'created_at', order: 'desc' },
      });

      if (error !== null) {
        console.error('storage list failed', error);
        return NextResponse.json(
          { error: { code: 'list_failed', message: 'Could not list files.' } },
          { status: 502 },
        );
      }

      // Supabase returns a placeholder row for an empty folder. It has no id and
      // is not a file; passing its name to the signer produces a URL that 404s.
      const objects = (data ?? []).filter((o) => o.id !== null);

      if (objects.length === 0) {
        return NextResponse.json({ limit, files: [] as ListedFile[] });
      }

      // ONE signing call for the whole page, not one per file. The plural form
      // exists precisely because the singular in a loop is a round trip per row.
      const names = objects.map((o) => o.name);
      const { data: signed, error: signError } = await storage.createSignedUrls(
        names,
        DOWNLOAD_TTL_SECONDS,
      );

      if (signError !== null) {
        console.error('createSignedUrls failed', signError);
        return NextResponse.json(
          { error: { code: 'sign_failed', message: 'Could not sign the files.' } },
          { status: 502 },
        );
      }

      const urlByPath = new Map(
        (signed ?? []).map((s) => [s.path ?? '', s.signedUrl ?? null]),
      );

      const files: ListedFile[] = objects.map((o) => ({
        path: o.name,
        // metadata is whatever the storage API attached; it is not guaranteed,
        // so a missing size reads as null rather than 0 - "unknown" and "empty
        // file" are different facts.
        size: typeof o.metadata?.size === 'number' ? o.metadata.size : null,
        contentType:
          typeof o.metadata?.mimetype === 'string' ? o.metadata.mimetype : null,
        createdAt: o.created_at ?? null,
        signedUrl: urlByPath.get(o.name) ?? null,
      }));

      return NextResponse.json({ limit, files, expiresInSeconds: DOWNLOAD_TTL_SECONDS });
    } catch (err) {
      console.error('list route failed', err);
      return NextResponse.json(
        { error: { code: 'not_configured', message: 'Storage is not configured.' } },
        { status: 500 },
      );
    }
  }

  // The path came from us as a uuid. Anything containing a slash or a dot-dot is
  // somebody probing, and there is no legitimate caller that needs either.
  if (path.includes('/') || path.includes('..')) {
    return NextResponse.json(
      { error: { code: 'bad_path', message: 'Not a path this API issued.' } },
      { status: 400 },
    );
  }

  try {
    const { data, error } = await serverSupabase()
      .storage.from(bucketName())
      .createSignedUrl(path, DOWNLOAD_TTL_SECONDS);

    if (error !== null) {
      console.error('createSignedUrl failed', error);
      // 404 rather than 502: for a reader, "no such object" and "cannot sign for
      // it" are the same outcome, and distinguishing them tells a prober which
      // paths exist.
      return NextResponse.json(
        { error: { code: 'not_found', message: 'No such file.' } },
        { status: 404 },
      );
    }

    return NextResponse.json({
      path,
      signedUrl: data.signedUrl,
      expiresInSeconds: DOWNLOAD_TTL_SECONDS,
    });
  } catch (err) {
    console.error('download route failed', err);
    return NextResponse.json(
      { error: { code: 'not_configured', message: 'Storage is not configured.' } },
      { status: 500 },
    );
  }
}
