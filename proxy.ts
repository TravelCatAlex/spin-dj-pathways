import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { sessionSupabase } from './app/lib/supabase-session';

/**
 * PROXY - the session refresh, and an optimistic gate in front of /student.
 *
 * THIS FILE IS `proxy.ts`, NOT `middleware.ts`. Next 16 deprecated and renamed
 * the convention; every @supabase/ssr guide still says middleware. Same
 * behaviour, different file and export name - see
 * node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md
 *
 * IT IS NOT THE SECURITY BOUNDARY, and Next's own authentication guide says as
 * much: a proxy runs on every request including prefetches, so it does
 * optimistic checks and nothing more. The boundary is migration 0053's row
 * security, which answers for the holder of the JWT and cannot be talked out of
 * it by a route that forgets to ask. Delete this file and the data is still
 * safe; what you lose is the redirect, so a signed-out visitor would get an
 * empty dashboard instead of a sign-in screen.
 *
 * WHY `getClaims()` RATHER THAN `getUser()`. getUser() asks the Auth server on
 * every single navigation. getClaims() verifies the JWT locally against the
 * project's signing keys, so the common case costs no round trip - and on a
 * project still using the legacy shared secret it falls back to asking, which
 * is correct and merely slower. `getSession()` is the one that must never be
 * used anywhere on the server: it trusts the cookie without revalidating it.
 *
 * The authoritative check stays close to the data: a route handler returning a
 * student's rows calls getUser() itself, and RLS answers underneath it.
 */

/** Everything below these prefixes requires a session. */
const GUARDED = ['/student'];

function isGuarded(pathname: string) {
  return GUARDED.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export async function proxy(request: NextRequest) {
  const { supabase, commit } = sessionSupabase(request);

  const { data } = await supabase.auth.getClaims();
  const signedIn = data?.claims?.sub != null;

  const { pathname } = request.nextUrl;

  if (!signedIn && isGuarded(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    // Where they were going, so signing in finishes the journey rather than
    // dumping everyone on the dashboard root. The login screen treats this as
    // a path on this origin and nothing else - see the note there.
    url.search = '';
    url.searchParams.set('next', pathname);
    return commit(NextResponse.redirect(url));
  }

  // A signed-in student has no business on the sign-in screen. Without this,
  // the back button after signing in shows the form again, and typing a code
  // into it starts a second, pointless round of email.
  if (signedIn && pathname === '/login') {
    const url = request.nextUrl.clone();
    url.pathname = '/student';
    url.search = '';
    return commit(NextResponse.redirect(url));
  }

  return commit(NextResponse.next({ request }));
}

export const config = {
  /**
   * Without a matcher a proxy runs on EVERY request - static chunks, images,
   * fonts - and an auth redirect there breaks the very page it is protecting.
   *
   * `/auth/*` is excluded deliberately. Those handlers build their own
   * request-scoped client to set or clear the session, and running a second one
   * over the same cookies invites two clients rotating one token.
   */
  matcher: [
    '/((?!_next/static|_next/image|auth/|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?)$).*)',
  ],
};
