import { createServerClient } from '@supabase/ssr';
import type { NextRequest, NextResponse } from 'next/server';

/**
 * The signed-in student's Supabase client, for anything that can set cookies.
 *
 * THIS IS THE ANON KEY, AND THAT IS THE POINT. `supabase.ts` beside this file
 * holds a SERVICE ROLE client that bypasses RLS entirely; it exists because the
 * dashboard route still takes a student id in the path and has nothing else to
 * authorise with. This client is the opposite: it carries the viewer's own JWT,
 * so migration 0053's policies decide what it can read, and a route handler
 * stops being able to fetch somebody else's rows even by mistake. That is the
 * actual protection - not a check in a handler, which is a thing that can be
 * forgotten.
 *
 * WHY IT BUFFERS COOKIES INSTEAD OF WRITING THEM. @supabase/ssr rotates an
 * expiring token during `getClaims()` or `getUser()` and must write the new one
 * back. A route handler does not have its response yet at that point - the body
 * depends on how the call turns out - and `cookies().set()` throws outright in a
 * Server Component. So writes are collected here and `commit()` puts them on
 * whichever response is finally returned. Dropping them is the classic
 * refresh-loop bug: the rotated token never reaches the browser, the next
 * request presents the stale one, and the student is signed out at random.
 *
 * `setAll` takes a SECOND argument in @supabase/ssr 0.12 and ignoring it is a
 * real defect, not a lint nit. It carries
 * `Cache-Control: private, no-cache, no-store, must-revalidate, max-age=0`.
 * A response that sets an auth cookie must never be cached, or a CDN can hand
 * one student's session token to the next person who asks.
 */
export function sessionSupabase(request: NextRequest) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;

  const missing = [
    url ? null : 'SUPABASE_URL',
    key ? null : 'SUPABASE_ANON_KEY',
  ].filter(Boolean);

  // Fails closed, for the same reason `supabase.ts` does: an unconfigured
  // client and a signed-out visitor both look like "no session", and only one
  // of them is a bug. A thrown error names which.
  if (missing.length > 0) {
    throw new Error(
      `Supabase auth is not configured: ${missing.join(', ')} missing. See .env.example.`,
    );
  }

  const pendingCookies: { name: string; value: string; options: Record<string, unknown> }[] = [];
  const pendingHeaders: Record<string, string> = {};

  const supabase = createServerClient(url as string, key as string, {
    // The portal's tables are in `app`, not `public` - migration 0047. The
    // service-role client in supabase.ts says the same thing for the same
    // reason; the two must not disagree, or a query works through one client
    // and 404s through the other.
    db: { schema: 'app' },
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        for (const cookie of cookiesToSet) {
          pendingCookies.push({ ...cookie, options: { ...cookie.options } });
        }
        Object.assign(pendingHeaders, headers);
      },
    },
  });

  /** Put everything the client wanted to write onto the response being sent. */
  function commit<R extends NextResponse>(response: R): R {
    for (const { name, value, options } of pendingCookies) {
      response.cookies.set(name, value, options);
    }
    for (const [header, value] of Object.entries(pendingHeaders)) {
      response.headers.set(header, value);
    }
    return response;
  }

  return { supabase, commit };
}
