import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { sessionSupabase } from '../../lib/supabase-session';
import { serverSupabase } from '../../lib/supabase';

/**
 * POST /auth/otp - send a one-time code to an address the roll already admits.
 *
 * IT ANSWERS THE SAME WAY EVERY TIME, AND THAT IS THE WHOLE DESIGN. Unknown
 * address, address shared by sixteen students, provider refused, rate limited -
 * all of them return the same 202. A form that answers differently is an oracle
 * for who has an account, and the measurement behind that is not hypothetical:
 * 51 addresses in this database sit on more than one student row and the worst
 * is shared by 16. RUNBOOK §10a is where an operator tells the cases apart,
 * with the database in front of them.
 *
 * ============================= WHY IT PROVISIONS =============================
 * Measured 8 Oct 2026, through this form, against live:
 *
 *   POST /auth/v1/otp  ->  422 otp_disabled "Signups not allowed for otp"
 *   auth.users ......... 0 rows
 *
 * `shouldCreateUser: false` is the closed door, and it was closed against
 * EVERYONE. The rule says a code goes only to "an address already in the
 * database" - but that database is `app.student`, and the table Supabase Auth
 * consults is `auth.users`, which nothing in this flow had ever written to. The
 * sign-in was unreachable from the first commit, and the uniform 202 meant it
 * looked exactly like the unconfigured SMTP everyone assumed was the cause.
 *
 * So the roll is consulted HERE, by this server, and an auth user is created
 * only for an address it admits. The door stays shut: `shouldCreateUser` is
 * still false, so Supabase Auth still refuses to invent an account on its own,
 * and the only thing that can open one is a student row that already exists.
 * `app.identity_for_email()` (migration 0054) is the admission test, and it is
 * THE SAME FUNCTION `link_signed_in_identity()` uses at verification - which is
 * the point of it being a function. Two copies of that rule would drift, and the
 * drift would mail codes to people the verify step then refuses.
 * ==========================================================================
 *
 * WHAT THIS STILL DOES NOT DO. Delivery needs custom SMTP and a `{{ .Token }}`
 * template - Supabase's built-in sender reaches project members only, a few
 * messages an hour, and the default template mails a magic link rather than the
 * six digits the next screen asks for. RUNBOOK §4f. Until that is configured
 * this returns 202 and nothing arrives, which is indistinguishable from every
 * other failure by design.
 *
 * ONE HONEST WEAKNESS, RECORDED RATHER THAN PAPERED OVER. A refused address now
 * returns without the two round trips an admitted one makes, so the replies
 * differ in TIMING even though they are identical in content. That is a weaker
 * oracle than a different status code and a much weaker one than a different
 * message, but it is not nothing. Equalising it means doing the work anyway for
 * an address we have already decided to refuse, which is its own kind of silly;
 * the honest fix is a rate limit in front of this route, which task 028 lists
 * and this round does not build.
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

  const address = email.trim().toLowerCase();
  const { supabase, commit } = sessionSupabase(request);

  // ---------------------------------------------------------------------------
  // Is this address on the roll?
  // ---------------------------------------------------------------------------
  // SERVICE ROLE, DELIBERATELY, AND IT NEVER LEAVES THIS FUNCTION. The answer is
  // precisely the fact the 202 above exists to withhold, so `identity_for_email`
  // is granted to `service_role` alone - a signed-in student cannot call it and
  // probe addresses. Nothing derived from it reaches the response.
  const admin = serverSupabase();

  const { data: identityId, error: rollError } = await admin.rpc('identity_for_email', {
    p_email: address,
  });

  if (rollError) {
    // A broken admission test must refuse, not admit. Logged without the
    // address - server logs are read by more people than the database is.
    console.warn('[auth] roll lookup failed', { code: rollError.code, message: rollError.message });
    return commit(NextResponse.json({ ok: true }, { status: 202 }));
  }

  if (identityId == null) {
    // Zero matches or several. Different facts to an operator, the same
    // non-answer here, and no code sent either way.
    return commit(NextResponse.json({ ok: true }, { status: 202 }));
  }

  // ---------------------------------------------------------------------------
  // Make sure Supabase Auth has somebody to send to
  // ---------------------------------------------------------------------------
  // `email_confirm: true` because the roll IS the confirmation. This address was
  // put there by the studio, and a student cannot confirm an address before
  // signing in when signing in is the thing that needs confirming. Leaving it
  // false creates the user in an unconfirmed state that then refuses the very
  // code this route is about to send.
  //
  // No password is set and none can be: nothing in this portal signs in with
  // one, so the account is reachable only by a code mailed to the address the
  // studio already holds.
  //
  // THE SECOND SIGN-IN LANDS HERE TOO and must be harmless. `createUser` answers
  // `email_exists` for an address it already has, which is the expected reply on
  // every sign-in after the first - not a failure, and not logged as one.
  const { error: createError } = await admin.auth.admin.createUser({
    email: address,
    email_confirm: true,
  });

  if (createError && createError.code !== 'email_exists') {
    console.warn('[auth] provisioning refused', {
      status: createError.status,
      code: createError.code,
    });
    // Falls through on purpose. The send below is the authority on whether an
    // account exists; if provisioning really did fail it refuses, and the
    // student sees the same 202 as every other refusal.
  }

  // ---------------------------------------------------------------------------
  // Send the code
  // ---------------------------------------------------------------------------
  // `shouldCreateUser: false` STAYS. The account above was created against a row
  // the studio already had; this flag is what stops Supabase Auth creating one
  // for an address nobody vouched for, which is what would turn this form into
  // public sign-up against a studio's private roll.
  const { error } = await supabase.auth.signInWithOtp({
    email: address,
    options: { shouldCreateUser: false },
  });

  if (error) {
    // Logged without the address, for the reason above. The status code is
    // enough to find it in RUNBOOK §10a.
    console.warn('[auth] otp request refused', { status: error.status, code: error.code });
  }

  // 202, always. See the header.
  return commit(NextResponse.json({ ok: true }, { status: 202 }));
}
