import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { sessionSupabase } from '../../lib/supabase-session';

/**
 * POST /auth/otp - send a one-time code to an address we already hold.
 *
 * IT ANSWERS THE SAME WAY EVERY TIME, AND THAT IS THE WHOLE DESIGN. Unknown
 * address, address shared by sixteen students, provider refused, rate limited -
 * all of them return the same 202. A form that answers differently is an oracle
 * for who has an account, and the measurement behind that is not hypothetical:
 * 51 addresses in this database sit on more than one student row and the worst
 * is shared by 16. RUNBOOK §10a is where an operator tells the cases apart,
 * with the database in front of them.
 *
 * `shouldCreateUser: false` is the closed door. Supabase Auth's default is to
 * create an account for any address that asks, which would turn this form into
 * public sign-up against a studio's private roll.
 *
 * Note this only reaches an inbox once custom SMTP is configured - Supabase's
 * built-in sender delivers to project members only, a few messages an hour.
 * RUNBOOK §4f. Until then this returns 202 and nothing arrives, which is
 * indistinguishable from every other failure by design.
 */
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  let email: unknown;

  try {
    ({ email } = await request.json());
  } catch {
    return NextResponse.json({ error: 'malformed' }, { status: 400 });
  }

  // A missing or non-string field is the caller's bug, not a sign-in attempt,
  // so this one DOES answer differently. It says nothing about any account.
  if (typeof email !== 'string' || email.trim() === '') {
    return NextResponse.json({ error: 'malformed' }, { status: 400 });
  }

  const { supabase, commit } = sessionSupabase(request);

  const { error } = await supabase.auth.signInWithOtp({
    email: email.trim().toLowerCase(),
    options: { shouldCreateUser: false },
  });

  if (error) {
    // Logged without the address. Server logs are read by more people than the
    // database is, and "who tried to sign in" is the thing this endpoint exists
    // to keep quiet about. The status code is enough to find it in RUNBOOK §10a.
    console.warn('[auth] otp request refused', { status: error.status, code: error.code });
  }

  // 202, always. See the header.
  return commit(NextResponse.json({ ok: true }, { status: 202 }));
}
