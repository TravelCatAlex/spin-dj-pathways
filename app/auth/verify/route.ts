import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { sessionSupabase } from '../../lib/supabase-session';

/**
 * POST /auth/verify - exchange the emailed code for a session, then link it.
 *
 * TWO THINGS HAPPEN HERE AND BOTH MUST SUCCEED. verifyOtp mints the session;
 * `app.link_signed_in_identity()` attaches that auth user to exactly one
 * identity row. A student who holds a session but no identity is the worst of
 * the possible outcomes - every policy in 0053 resolves "me" through the
 * identity hub, so they would be signed in and see an empty dashboard with no
 * explanation. So a failed link SIGNS THEM BACK OUT and reports the same
 * refusal as a wrong code.
 *
 * THE FUNCTION TAKES NO PARAMETERS, AND MUST NOT. It reads the email from the
 * JWT claim Supabase Auth has just verified by sending a code to it. An email
 * parameter would let any signed-in caller name any address and be linked to
 * that person; the address below goes to verifyOtp, never to the link.
 *
 * It is idempotent. On every sign-in after the first the function finds the
 * existing link and returns it without touching the email at all, so this route
 * does not need to know whether it is a first sign-in.
 */
export const dynamic = 'force-dynamic';

/**
 * Where to send them next.
 *
 * ONLY A PATH ON THIS ORIGIN. `next` arrives in a query string, which means it
 * arrives from whoever wrote the link - an open redirect is the standard way to
 * make a phishing page wear your domain. A value starting `//` is a protocol-
 * relative URL to somebody else's host, which is why the second test is there.
 */
function safeNext(value: unknown): string {
  if (typeof value !== 'string') return '/student';
  if (!value.startsWith('/') || value.startsWith('//')) return '/student';
  return value;
}

export async function POST(request: NextRequest) {
  let body: { email?: unknown; token?: unknown; next?: unknown };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'malformed' }, { status: 400 });
  }

  const { email, token } = body;

  if (typeof email !== 'string' || typeof token !== 'string') {
    return NextResponse.json({ error: 'malformed' }, { status: 400 });
  }

  const { supabase, commit } = sessionSupabase(request);

  const { error: verifyError } = await supabase.auth.verifyOtp({
    email: email.trim().toLowerCase(),
    token: token.trim(),
    type: 'email',
  });

  if (verifyError) {
    console.warn('[auth] code rejected', { status: verifyError.status, code: verifyError.code });
    return commit(NextResponse.json({ error: 'refused' }, { status: 401 }));
  }

  // The session now exists. From here a failure must not leave it standing.
  const { error: linkError } = await supabase.rpc('link_signed_in_identity');

  if (linkError) {
    // Zero matches, several matches, an address already linked to another auth
    // user - all 28000 from the function, and all the same answer here. The
    // code is logged so RUNBOOK §10a can tell them apart against the database.
    console.warn('[auth] identity link refused', { code: linkError.code, message: linkError.message });

    await supabase.auth.signOut();
    return commit(NextResponse.json({ error: 'refused' }, { status: 401 }));
  }

  return commit(NextResponse.json({ ok: true, next: safeNext(body.next) }));
}
