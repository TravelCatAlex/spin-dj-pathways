/**
 * The two roles, and where each one's portal starts.
 *
 * THIS LIVES IN ITS OWN FILE BECAUSE THREE PLACES NEED IT and a second copy
 * would drift: `/api/v1/me` answers the browser's "who am I", `/auth/verify`
 * chooses where to send somebody who has just signed in, and `proxy.ts` decides
 * which prefix each role may stand on. Three statements of "teachers go to
 * /teacher" is three chances for one of them to be wrong, and the wrong one
 * would be a redirect loop.
 *
 * It is also why this is not exported from the route handler. Next type-checks
 * `route.ts` against a fixed set of exports, so a shared helper living there is
 * a build error waiting for the next version to notice it.
 */

/**
 * `identity_one_role_check` (migration 0039) makes student and teacher
 * exclusive, so there is no case where both are set.
 *
 * `none` is a real state rather than an error: an identity exists and carries
 * neither role. RUNBOOK §10a covers it.
 */
export type Role = 'student' | 'teacher' | 'none';

/**
 * Where this role's portal starts.
 *
 * `none` goes to `/login`. There is nothing to show a human the database cannot
 * place, and a blank dashboard explains nothing - the same reasoning that makes
 * `/auth/verify` sign out a session it could not link.
 */
export function homeFor(role: Role): string {
  if (role === 'teacher') return '/teacher';
  if (role === 'student') return '/student';
  return '/login';
}

/**
 * The prefix each role owns, for the proxy's cross-role guard.
 *
 * A student on `/teacher` and a teacher on `/student` are both wrong, and both
 * must be sent somewhere that will not send them back. Deriving this from
 * `homeFor` rather than listing it twice is what makes that impossible.
 */
export const ROLE_PREFIXES: ReadonlyArray<{ prefix: string; role: Role }> = [
  { prefix: '/student', role: 'student' },
  { prefix: '/teacher', role: 'teacher' },
];

export function prefixOwner(pathname: string): Role | null {
  for (const { prefix, role } of ROLE_PREFIXES) {
    if (pathname === prefix || pathname.startsWith(`${prefix}/`)) return role;
  }
  return null;
}
