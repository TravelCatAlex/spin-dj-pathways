import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { redirect } from 'next/navigation';

import { homeFor } from './role';
import type { Role } from './role';

/**
 * The cross-role guard, for a Server Component layout.
 *
 * ===================== WHY THIS IS NOT IN THE PROXY =====================
 * A role is not in the JWT. It lives on `app.identity`, so answering "is this
 * person a teacher" costs a database round trip - and `proxy.ts` runs on EVERY
 * navigation including prefetches, which is precisely why it uses `getClaims()`
 * (local, no round trip) rather than `getUser()`. Putting a query there would
 * undo that decision for every request in the app, to answer a question only
 * two prefixes care about.
 *
 * So the proxy keeps doing what it is good at - signed in or not - and this runs
 * once per entry into a role's section, in the layout, which Next keeps mounted
 * while you navigate inside it.
 *
 * AND IT IS STILL NOT THE SECURITY BOUNDARY. Migration 0055 is. A student who
 * somehow reached `/teacher` would see a page with nothing on it, because
 * `app.current_teacher_id()` is NULL for them and every roster policy compares
 * with `=`. This redirect exists so that person gets their own dashboard instead
 * of an empty one - it is navigation, not protection.
 * =======================================================================
 *
 * WHY IT CANNOT LOOP. The redirect target comes from `homeFor()`, the same
 * function `/auth/verify` and `/api/v1/me` use, and it is only ever called when
 * the role does NOT own the current prefix. A teacher on `/student` is sent to
 * `/teacher`, whose guard then finds the role correct and sends them nowhere.
 * The one case that WOULD bounce is an identity with neither role. Sending it to
 * `/login` loops forever: the proxy sends a signed-in visitor from `/login` to
 * `/student`, whose guard sends them back. So it goes to `/unlinked`, which is
 * outside every guarded prefix and is not `/login` - the only path through this
 * that no rule wants to move.
 */

/**
 * A read-only Supabase client for a Server Component.
 *
 * It CANNOT write cookies - `cookies().set()` throws in a Server Component, and
 * `sessionSupabase()` exists to buffer writes until a route handler has a
 * response to put them on. There is no response here. So `setAll` is a
 * deliberate no-op and a rotated token is simply dropped on this request: the
 * proxy refreshes the session on the very same navigation, which is where that
 * job belongs. Dropping it here is safe; pretending to write it would not be.
 */
async function readOnlyClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error('Supabase auth is not configured. See .env.example.');
  }

  const store = await cookies();

  return createServerClient(url, key, {
    // `app`, not `public` - migration 0047. The three clients in this app must
    // not disagree about this, or a query works through one and 404s through
    // another.
    db: { schema: 'app' },
    cookies: {
      getAll() {
        return store.getAll();
      },
      setAll() {
        // See above. Intentionally nothing.
      },
    },
  });
}

/**
 * Resolve the signed-in human's role, or null when there is no session.
 *
 * `identity_self_select` (migration 0053) is `auth_user_id = auth.uid()`, so
 * this returns exactly one row - theirs - with no filter to get wrong.
 */
export async function currentRole(): Promise<Role | null> {
  const supabase = await readOnlyClient();

  // getUser(), not getSession(). getSession() trusts the cookie without
  // revalidating the JWT, and a forged one would be believed.
  const { data: auth, error: authError } = await supabase.auth.getUser();
  if (authError || auth?.user == null) return null;

  const { data: rows, error } = await supabase
    .from('identity')
    .select('student_id, teacher_id')
    .limit(1);

  if (error) throw error;

  const identity = (rows as { student_id: string | null; teacher_id: string | null }[] | null)?.[0];
  if (identity === undefined) return 'none';

  if (identity.teacher_id !== null) return 'teacher';
  if (identity.student_id !== null) return 'student';
  return 'none';
}

/**
 * Stand on this prefix, or be sent to the one that is yours.
 *
 * Signed out is left to the proxy rather than handled again here: it has already
 * redirected with a `next` parameter so signing in finishes the journey, and a
 * second opinion about it would discard that.
 */
export async function requireRole(expected: Role): Promise<void> {
  const role = await currentRole();

  // No session. The proxy has already dealt with it; if it somehow has not,
  // sending them to sign in is the right answer and costs nothing.
  if (role === null) redirect('/login');

  if (role === expected) return;

  // An identity with neither role. `/login` would bounce straight back off the
  // proxy's signed-in rule and loop, so this goes to a page outside every
  // guarded prefix that says so plainly and offers a way out. RUNBOOK §10a
  // covers the database side.
  if (role === 'none') redirect('/unlinked');

  redirect(homeFor(role));
}
