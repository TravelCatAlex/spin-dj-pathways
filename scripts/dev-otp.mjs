// =============================================================================
// scripts/dev-otp.mjs — mint a real sign-in code for a test account, LOCALLY.
//
// DEV TOOL. NOT PART OF THE APP. Nothing in `app/` imports this, and nothing
// should: it uses the service-role key, which bypasses RLS entirely and must
// never reach the browser or a request handler. It is run by hand, from a
// developer's machine, against a QA account.
//
// WHAT IT DOES, AND WHAT IT DOES NOT. `generateLink` asks Supabase Auth to
// PRODUCE a one-time code and hands it back in the response. It does NOT send an
// email - no inbox is touched, no SMTP involved, no rate limit spent. The code
// it prints is a real one: typed into the portal's OTP screen it goes through
// the ordinary /auth/verify -> link_signed_in_identity() path, so this is a way
// to sign in without waiting for mail, not a way around the sign-in.
//
// `createUser` first, because generateLink needs the auth user to exist. It is
// harmless to re-run - an existing address answers `email_exists`, which is fine.
//
// The QA address must also be on the roll (an app.student or app.teacher row),
// or the dashboard shows nothing after login - app.identity_for_email() admits
// only addresses the studio already holds. Getting IN needs only the two calls
// below; seeing data needs the row too.
//
//   Usage:  node --env-file=.env scripts/dev-otp.mjs <email>
// =============================================================================
import { createClient } from '@supabase/supabase-js';

const email = process.argv[2];

if (!email) {
  console.error('Usage: node --env-file=.env scripts/dev-otp.mjs <email>');
  process.exit(1);
}

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error('SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY missing. Run with --env-file=.env');
  process.exit(1);
}

const admin = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// Make sure the auth user exists. email_exists on a repeat run is expected.
const { error: createError } = await admin.auth.admin.createUser({
  email,
  email_confirm: true,
});

if (createError && createError.code !== 'email_exists') {
  console.error('createUser failed:', createError.message);
  process.exit(1);
}

// Generate a real code. No email is sent.
const { data, error } = await admin.auth.admin.generateLink({
  type: 'magiclink',
  email,
});

if (error) {
  console.error('generateLink failed:', error.message);
  process.exit(1);
}

const otp = data?.properties?.email_otp;

if (!otp) {
  console.error('No email_otp in the response. Check the OTP template uses {{ .Token }}.');
  process.exit(1);
}

console.log('');
console.log(`  email:  ${email}`);
console.log(`  code:   ${otp}`);
console.log('');
console.log('  Enter this on the portal OTP screen. It expires per Email OTP expiration (600s).');
console.log('');
