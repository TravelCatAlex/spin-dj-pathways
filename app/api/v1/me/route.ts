import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { homeFor } from '../../../lib/role';
import type { Role } from '../../../lib/role';
import { sessionSupabase } from '../../../lib/supabase-session';

/**
 * GET /api/v1/me - which role is holding this cookie.
 *
 * ========================= WHY THE SERVER ANSWERS THIS =========================
 * The portal now has two kinds of signed-in human and two destinations. Something
 * has to say which, and the only safe answer is one the browser cannot influence:
 * this reads `app.identity` through the VIEWER'S OWN JWT, so migration 0053's
 * `identity_self_select` (`auth_user_id = auth.uid()`) returns exactly one row -
 * theirs - and the role is whatever that row carries.
 *
 * There is no role in the URL, none in a query string, and none in the request
 * body. A client-supplied role would be a request to be treated as a teacher,
 * and this endpoint would be where that request was granted.
 *
 * IT IS NOT A PERMISSION CHECK, AND MUST NEVER BE USED AS ONE. Nothing is
 * protected by what this returns. A student who forges this answer to "teacher"
 * sees a teacher-shaped page listing nothing, because `app.current_teacher_id()`
 * is NULL for them and every roster policy in 0055 compares with `=`. This
 * endpoint decides what to RENDER; the database decides what can be READ. Those
 * are different questions and keeping them apart is why the wrong answer here is
 * merely an ugly page rather than a leak.
 * ==============================================================================
 *
 * WHAT IT DELIBERATELY DOES NOT RETURN. `app.identity` carries `uid` and
 * `k_staff`, which are WellnessLiving's keys. The portal is specified never to
 * learn that WellnessLiving exists, so they are not selected here - not filtered
 * out after the fact, not selected at all.
 */
export const dynamic = 'force-dynamic';

interface IdentityRow {
  id: string;
  student_id: string | null;
  teacher_id: string | null;
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  let session: ReturnType<typeof sessionSupabase>;

  try {
    session = sessionSupabase(request);
  } catch (error) {
    // Configuration is a 500. "Not set up" must never be reported as "you are
    // nobody" - the same rule the dashboard route states at length.
    return NextResponse.json(
      { error: { code: 'not_configured', message: (error as Error).message } },
      { status: 500 },
    );
  }

  const { supabase: db, commit } = session;

  // getUser(), not getSession(), and not the proxy's word for it. The proxy's
  // getClaims() is an optimistic filter for redirects; this is next to the data.
  const { data: auth, error: authError } = await db.auth.getUser();

  if (authError || auth?.user == null) {
    return commit(
      NextResponse.json(
        { error: { code: 'not_signed_in', message: 'Sign in to read this.' } },
        { status: 401 },
      ),
    );
  }

  // No filter. `identity_self_select` resolves the row from the JWT, so this
  // returns exactly one: theirs. An `.eq('auth_user_id', …)` here would be a
  // second opinion about who the caller is.
  const { data: rows, error: queryError } = await db
    .from('identity')
    .select('id, student_id, teacher_id')
    .limit(1);

  if (queryError) {
    return commit(
      NextResponse.json(
        { error: { code: 'query_failed', message: queryError.message } },
        { status: 500 },
      ),
    );
  }

  const identity = (rows as IdentityRow[] | null)?.[0];

  if (identity === undefined) {
    // A session with no identity row. `/auth/verify` signs people out rather
    // than letting this happen, so reaching it means the link was removed after
    // the fact - worth its own code so RUNBOOK §10a can be reached for.
    return commit(
      NextResponse.json(
        {
          error: {
            code: 'no_identity_for_session',
            message: 'This account is not linked to a person.',
          },
        },
        { status: 404 },
      ),
    );
  }

  const role: Role =
    identity.teacher_id !== null
      ? 'teacher'
      : identity.student_id !== null
        ? 'student'
        : 'none';

  return commit(NextResponse.json({ role, home: homeFor(role) }));
}
