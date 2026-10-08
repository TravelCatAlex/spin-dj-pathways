import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { sessionSupabase } from '../../lib/supabase-session';

/**
 * POST /auth/signout - end the session for real.
 *
 * What this replaces was `router.push('/login')` in the student layout, which
 * navigated away and left the session entirely intact: the back button, or
 * typing /student, put you straight back in. On a shared machine - a studio
 * laptop, which is exactly where this portal gets used - that is not a cosmetic
 * difference.
 *
 * POST, never GET. A GET sign-out can be fired by any <img> tag on any page the
 * student visits, and logging people out is a nuisance a stranger should not be
 * able to arrange.
 *
 * signOut() revokes the refresh token at the Auth server and clears the cookies
 * through the same setAll path that set them, which is why this goes through
 * sessionSupabase and commit() rather than deleting cookies by name. The names
 * are @supabase/ssr's business and have changed between versions.
 */
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const { supabase, commit } = sessionSupabase(request);

  const { error } = await supabase.auth.signOut();

  if (error) {
    // Still clear what we can and still send them to /login. A sign-out that
    // reports failure and leaves the user sitting in the dashboard is worse
    // than one that quietly does its local half.
    console.warn('[auth] sign-out error', { status: error.status, code: error.code });
  }

  return commit(NextResponse.json({ ok: true }));
}
