import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { sessionSupabase } from '../../../../../lib/supabase-session';

/**
 * GET /api/v1/students/me/suggestions - the courses the LLM suggested for the
 * signed-in student.
 *
 * These are the ranked courses the model picked in the student's most recent quiz
 * attempt, stored on quiz_suggestion by the attempts route (0059). Read under the
 * student's own RLS. Empty until they take the quiz - the home "Opportunities to
 * Try" card then keeps its default fixture.
 *
 * Shaped for that card (id/title/description/icon/accent): title is the course,
 * description the model's rationale, accent rotates. Ordered best-fit first (rank).
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

  // The latest attempt (RLS returns only this student's).
  const { data: attempts, error: attemptError } = await db
    .from('quiz_attempt')
    .select('id')
    .order('created_at', { ascending: false })
    .limit(1);

  if (attemptError) {
    return commit(
      NextResponse.json(
        { error: { code: 'query_failed', message: attemptError.message } },
        { status: 500 },
      ),
    );
  }

  const attemptId = (attempts as { id: string }[] | null)?.[0]?.id;
  if (!attemptId) {
    return commit(NextResponse.json({ suggestions: [] }));
  }

  // Its suggested courses, best fit first.
  const { data: rows, error } = await db
    .from('quiz_suggestion')
    .select('course_title, teacher_name, rationale, rank')
    .eq('attempt_id', attemptId)
    .order('rank', { ascending: true });

  if (error) {
    return commit(
      NextResponse.json(
        { error: { code: 'query_failed', message: error.message } },
        { status: 500 },
      ),
    );
  }

  const suggestions = (
    (rows as {
      course_title: string;
      teacher_name: string | null;
      rationale: string | null;
      rank: number;
    }[] | null) ?? []
  ).map((r, i) => ({
    id: `${slug(r.course_title) || 'course'}-${i}`,
    title: r.course_title,
    description:
      r.rationale ?? (r.teacher_name ? `Taught by ${r.teacher_name}` : 'Suggested for you'),
    icon: 'music',
    accent: ACCENTS[i % ACCENTS.length],
  }));

  return commit(NextResponse.json({ suggestions }));
}
