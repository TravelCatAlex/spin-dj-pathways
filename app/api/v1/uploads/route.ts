import { randomUUID } from 'node:crypto';
import { NextResponse } from 'next/server';
import { serverSupabase } from '../../../lib/supabase';

/**
 * Signed upload and download URLs for Supabase Storage, recorded in `creation`.
 *
 * ================================ NO AUTH =================================
 * No handler here asks who is calling, and `studentId` is taken from the
 * request. That matches the dashboard route beside it and is temporary, but the
 * consequence is worse here: a stranger can write, repeatedly, and can claim any
 * student's id while doing it. Do not deploy publicly. The fix is the one
 * REQUIRED_APIS.md already specifies — a signed-in student, `me` implied, no id
 * accepted — plus a rate limit in front of POST.
 * ==========================================================================
 *
 * THE LISTING COMES FROM THE DATABASE, NOT THE BUCKET, AND THAT IS THE POINT.
 * It used to call `storage.list()`, which works exactly as long as there is one
 * student: Storage has no `student_id`, so it cannot say whose file is whose and
 * every student saw everybody's work. It also could not say what a file was
 * CALLED — the object is named with a uuid precisely so a caller cannot
 * overwrite someone else's, so the bucket holds `3efb220b-....jpg` and the real
 * name was returned once by the sign call and then lost.
 *
 * THE FILE NEVER PASSES THROUGH THIS ROUTE. The browser uploads straight to
 * storage with the signed URL; a route handler would otherwise buffer the whole
 * file in memory and re-send it, which is what serverless body limits exist to
 * stop. It also means this route CANNOT enforce size or type — it never sees the
 * bytes. `contentType` and `size` below are what the caller CLAIMS, stored as
 * labels for the icon and the file size shown in the UI. The bucket's own limits
 * are the only real enforcement, and a check here would look like protection
 * while providing none.
 *
 * TWO STEPS, SO AN ABANDONED UPLOAD IS COUNTABLE. POST writes the row and signs;
 * PATCH marks it uploaded once the browser confirms the file landed. A row left
 * with `uploaded_at` null is an upload that was started and never finished —
 * visible and countable, rather than an orphan object in the bucket that nothing
 * knows about.
 */

export const dynamic = 'force-dynamic';

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

const DOWNLOAD_TTL_SECONDS = 300;
const DEFAULT_LIST_LIMIT = 5;

/**
 * The most a listing returns however large `?limit=` is. Not politeness: every
 * row returned is also signed, so an unbounded limit turns one careless query
 * string into a request that signs a student's entire history.
 */
const MAX_LIST_LIMIT = 50;

/**
 * Pulls a safe extension off the caller's filename.
 *
 * Only the extension, and only when short and alphanumeric — so `../../etc/passwd`
 * and a 4,000-character name both reduce to nothing. It is cosmetic: it helps a
 * human recognise the object in a bucket listing, and is never trusted. The name
 * the STUDENT sees comes from `creation.original_filename`.
 */
function safeExtension(filename: unknown): string {
  if (typeof filename !== 'string') return '';
  const dot = filename.lastIndexOf('.');
  if (dot < 0) return '';
  const ext = filename.slice(dot + 1).toLowerCase();
  return /^[a-z0-9]{1,8}$/.test(ext) ? `.${ext}` : '';
}

function asText(v: unknown): string | null {
  return typeof v === 'string' && v.trim() !== '' ? v : null;
}

interface UploadBody {
  filename?: unknown;
  contentType?: unknown;
  size?: unknown;
  studentId?: unknown;
}

/**
 * POST /api/v1/uploads
 * Body: { studentId, filename?, contentType?, size? }
 *
 * Writes the `creation` row, then signs. In that order on purpose: a signed URL
 * handed out with no row behind it is exactly the orphan this design avoids.
 */
export async function POST(request: Request): Promise<NextResponse> {
  let body: UploadBody = {};
  try {
    body = (await request.json()) as UploadBody;
  } catch {
    // An unparseable body is still a missing studentId below, so it fails there
    // with a message that says which field is wrong.
  }

  const studentId = asText(body.studentId);
  if (studentId === null) {
    return NextResponse.json(
      { error: { code: 'student_required', message: 'studentId is required.' } },
      { status: 400 },
    );
  }

  const originalFilename = asText(body.filename);
  const path = `${randomUUID()}${safeExtension(originalFilename)}`;

  try {
    const db = serverSupabase();

    const { data: created, error: insertError } = await db
      .from('creation')
      .insert({
        student_id: studentId,
        storage_path: path,
        original_filename: originalFilename,
        content_type: asText(body.contentType),
        size_bytes: typeof body.size === 'number' ? body.size : null,
      })
      .select('id')
      .single();

    if (insertError !== null) {
      // A bad studentId lands here as a foreign-key violation, which is the
      // honest answer: there is no such student.
      console.error('creation insert failed', insertError);
      return NextResponse.json(
        { error: { code: 'not_recorded', message: 'Could not record the upload.' } },
        { status: 400 },
      );
    }

    const { data, error } = await db.storage
      .from(bucketName())
      .createSignedUploadUrl(path);

    if (error !== null) {
      console.error('createSignedUploadUrl failed', error);
      return NextResponse.json(
        { error: { code: 'upload_url_failed', message: 'Could not create an upload URL.' } },
        { status: 502 },
      );
    }

    return NextResponse.json({
      creationId: created.id,
      path: data.path,
      signedUrl: data.signedUrl,
      token: data.token,
      originalFilename,
    });
  } catch (err) {
    console.error('upload route failed', err);
    return NextResponse.json(
      { error: { code: 'not_configured', message: 'Storage is not configured.' } },
      { status: 500 },
    );
  }
}

/**
 * PATCH /api/v1/uploads
 * Body: { creationId }
 *
 * The browser says the file landed. Until this runs the row reads as an
 * abandoned attempt, which is what makes an abandoned attempt visible at all.
 */
export async function PATCH(request: Request): Promise<NextResponse> {
  let body: { creationId?: unknown } = {};
  try {
    body = (await request.json()) as { creationId?: unknown };
  } catch {
    /* handled by the check below */
  }

  const creationId = asText(body.creationId);
  if (creationId === null) {
    return NextResponse.json(
      { error: { code: 'creation_required', message: 'creationId is required.' } },
      { status: 400 },
    );
  }

  try {
    const { error } = await serverSupabase()
      .from('creation')
      .update({ uploaded_at: new Date().toISOString() })
      .eq('id', creationId);

    if (error !== null) {
      console.error('creation confirm failed', error);
      return NextResponse.json(
        { error: { code: 'confirm_failed', message: 'Could not confirm the upload.' } },
        { status: 502 },
      );
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('confirm route failed', err);
    return NextResponse.json(
      { error: { code: 'not_configured', message: 'Storage is not configured.' } },
      { status: 500 },
    );
  }
}

interface ListedFile {
  id: string;
  path: string;
  name: string;
  size: number | null;
  contentType: string | null;
  createdAt: string | null;
  signedUrl: string | null;
}

interface CreationRow {
  id: string;
  storage_path: string;
  original_filename: string | null;
  content_type: string | null;
  size_bytes: number | null;
  uploaded_at: string | null;
}

/**
 * GET /api/v1/uploads?studentId=…            -> that student's files (?limit=, default 5)
 * GET /api/v1/uploads?path=<storage path>    -> a signed URL for ONE file
 *
 * Signed rather than public in both cases, even for a test bucket: a public URL
 * never expires and cannot be withdrawn once shared or indexed, and this bucket
 * will hold students' own recordings.
 */
export async function GET(request: Request): Promise<NextResponse> {
  const params = new URL(request.url).searchParams;
  const path = params.get('path');

  if (path === null || path === '') {
    const studentId = params.get('studentId');
    if (studentId === null || studentId === '') {
      return NextResponse.json(
        { error: { code: 'student_required', message: 'studentId is required.' } },
        { status: 400 },
      );
    }

    const asked = Number.parseInt(params.get('limit') ?? '', 10);
    const limit = Number.isFinite(asked)
      ? Math.min(Math.max(asked, 1), MAX_LIST_LIMIT)
      : DEFAULT_LIST_LIMIT;

    try {
      const db = serverSupabase();

      const { data, error } = await db
        .from('creation')
        .select('id, storage_path, original_filename, content_type, size_bytes, uploaded_at')
        .eq('student_id', studentId)
        // Only files that actually landed. A row still waiting on its PATCH is
        // an upload in flight or one that was abandoned, and neither is
        // something to show a student as their work.
        .not('uploaded_at', 'is', null)
        .order('uploaded_at', { ascending: false })
        .limit(limit);

      if (error !== null) {
        console.error('creation list failed', error);
        return NextResponse.json(
          { error: { code: 'list_failed', message: 'Could not list files.' } },
          { status: 502 },
        );
      }

      const rows = (data ?? []) as CreationRow[];
      if (rows.length === 0) {
        return NextResponse.json({ limit, files: [] as ListedFile[] });
      }

      // ONE signing call for the page, not one per row: the plural form exists
      // because the singular in a loop is a round trip each time.
      const { data: signed, error: signError } = await db.storage
        .from(bucketName())
        .createSignedUrls(
          rows.map((r) => r.storage_path),
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
        (signed ?? []).map((sgn) => [sgn.path ?? '', sgn.signedUrl ?? null]),
      );

      const files: ListedFile[] = rows.map((r) => ({
        id: r.id,
        path: r.storage_path,
        // What the student called it, falling back to the storage name. The
        // fallback should be rare - it means the row predates the filename being
        // recorded - and showing a uuid is still better than showing nothing.
        name: r.original_filename ?? r.storage_path,
        size: r.size_bytes,
        contentType: r.content_type,
        createdAt: r.uploaded_at,
        signedUrl: urlByPath.get(r.storage_path) ?? null,
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

  // The path came from us as a uuid. A slash or a dot-dot is somebody probing,
  // and no legitimate caller needs either.
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
      // 404 rather than 502: to a reader "no such object" and "cannot sign it"
      // are the same outcome, and telling them apart tells a prober which paths
      // exist.
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
