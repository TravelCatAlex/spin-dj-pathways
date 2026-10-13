import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { sessionSupabase } from '../../../../../lib/supabase-session';

/**
 * GET /api/v1/students/me/interests - the signed-in student's interests.
 *
 * These are the interest tags the LLM inferred from the student's most recent quiz
 * attempt (answers + free text), stored on quiz_attempt.interests by the attempts
 * route. Read under the student's own RLS (0059). Empty until they take the quiz -
 * the home card then keeps its default.
 *
 * The id/icon/accent are presentation the card needs; the names come straight from
 * the model. The icon is generic and the accent rotates, since the tags are free
 * text rather than a fixed set.
 */
export const dynamic = 'force-dynamic';

const ACCENTS = ['#7c3aed', '#ec4899', '#06b6d4', '#f59e0b', '#10b981', '#ef4444'];

function slug(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  let session: ReturnType<typeof sessionSupabase>;
  try {
    session = sessionSupabase(request);
  } catch (error) {
    return NextResponse.json(
      { error: { code: 'not_configured', message: (error as Error).message } },
      { status: 500 },
    );
  }

  const { supabase: db, commit } = session;

  const { data: auth, error: authError } = await db.auth.getUser();
  if (authError || auth?.user == null) {
    return commit(
      NextResponse.json(
        { error: { code: 'not_signed_in', message: 'Sign in to read this.' } },
        { status: 401 },
      ),
    );
  }

  // The latest attempt's stored interests (RLS returns only this student's).
  const { data: attempts, error } = await db
    .from('quiz_attempt')
    .select('interests')
    .order('created_at', { ascending: false })
    .limit(1);

  if (error) {
    return commit(
      NextResponse.json(
        { error: { code: 'query_failed', message: error.message } },
        { status: 500 },
      ),
    );
  }

  const tags = ((attempts as { interests: string[] | null }[] | null)?.[0]?.interests) ?? [];

  const interests = tags.map((name, i) => ({
    id: `${slug(name) || 'interest'}-${i}`,
    name,
    icon: 'music',
    accent: ACCENTS[i % ACCENTS.length],
  }));

  return commit(NextResponse.json({ interests }));
}
