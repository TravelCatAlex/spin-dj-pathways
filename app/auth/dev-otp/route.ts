import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { serverSupabase } from '../../lib/supabase';

/**
 * POST /auth/dev-otp — DEV ONLY. Returns the raw OTP token for an email so
 * the sign-in form can autofill it without checking email.
 *
 * Disabled at runtime unless NEXT_PUBLIC_DEV_OTP_ENTRY=true. Even when
 * enabled, this is not a security hole: the token returned here is the same
 * one /auth/verify demands, and /auth/verify still runs the full identity
 * check. This only saves a developer from switching to their inbox.
 */
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  if (process.env.NEXT_PUBLIC_DEV_OTP_ENTRY !== 'true') {
    return NextResponse.json({ error: 'not found' }, { status: 404 });
  }

  let email: unknown;
  try {
    ({ email } = await request.json());
  } catch {
    return NextResponse.json({ error: 'malformed' }, { status: 400 });
  }

  if (typeof email !== 'string' || email.trim() === '') {
    return NextResponse.json({ error: 'malformed' }, { status: 400 });
  }

  const address = email.trim().toLowerCase();
  const admin = serverSupabase();

  // Same admission check as /auth/otp — only addresses on the roll get a token.
  const { data: identityId, error: rollError } = await admin.rpc('identity_for_email', {
    p_email: address,
  });

  if (rollError || identityId == null) {
    return NextResponse.json({ error: 'address not on roll' }, { status: 403 });
  }

  // Same provisioning step as /auth/otp — generateLink requires the user to
  // already exist in auth.users; createUser is idempotent (email_exists is fine).
  const { error: createError } = await admin.auth.admin.createUser({
    email: address,
    email_confirm: true,
  });

  if (createError && createError.code !== 'email_exists') {
    console.warn('[dev-otp] provisioning failed', { code: createError.code });
    return NextResponse.json({ error: 'could not provision user' }, { status: 500 });
  }

  // generateLink with type 'magiclink' returns email_otp without sending any email.
  // 'email' is not a valid GenerateLinkType in supabase-js; 'magiclink' is the
  // correct variant for OTP generation and its response includes email_otp.
  const { data, error } = await admin.auth.admin.generateLink({
    type: 'magiclink',
    email: address,
  });

  if (error || !data?.properties?.email_otp) {
    console.warn('[dev-otp] generateLink failed', { error });
    return NextResponse.json({ error: 'could not generate token' }, { status: 500 });
  }

  return NextResponse.json({ token: data.properties.email_otp });
}
