import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { sessionSupabase } from '../../../lib/supabase-session';

/**
 * GET /api/v1/quiz - the active questions and their options.
 *
 * Read with the viewer's JWT; migration 0059's policies return only active
 * questions (quiz_question_read) and their options. Any signed-in user may read
 * the quiz - it is the quiz, not anyone's data.
 */
export const dynamic = 'force-dynamic';

interface QuestionRow {
  id: string;
  prompt: string;
  sort: number;
  allow_text: boolean;
}

interface OptionRow {
  id: string;
  question_id: string;
  label: string;
  sort: number;
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

  const { data: questionRows, error: qError } = await db
    .from('quiz_question')
    .select('id, prompt, sort, allow_text')
    .order('sort', { ascending: true });

  if (qError) {
    return commit(
      NextResponse.json(
        { error: { code: 'query_failed', message: qError.message } },
        { status: 500 },
      ),
    );
  }

  const { data: optionRows, error: oError } = await db
    .from('quiz_option')
    .select('id, question_id, label, sort')
    .order('sort', { ascending: true });

  if (oError) {
    return commit(
      NextResponse.json(
        { error: { code: 'query_failed', message: oError.message } },
        { status: 500 },
      ),
    );
  }

  const questions = (questionRows ?? []) as QuestionRow[];
  const options = (optionRows ?? []) as OptionRow[];

  return commit(
    NextResponse.json({
      questions: questions.map((q) => ({
        id: q.id,
        prompt: q.prompt,
        allow_text: q.allow_text,
        options: options
          .filter((o) => o.question_id === q.id)
          .map((o) => ({ id: o.id, label: o.label })),
      })),
    }),
  );
}
