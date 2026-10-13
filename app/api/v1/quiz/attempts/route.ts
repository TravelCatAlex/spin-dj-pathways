import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { sessionSupabase } from '../../../../lib/supabase-session';
import { serverSupabase } from '../../../../lib/supabase';
import {
  buildCatalogue,
  recommendCourses,
  type QuizAnswerText,
} from '../../../../lib/quiz-recommender';

/**
 * POST /api/v1/quiz/attempts - take the quiz: save the answers, ask Claude for a
 *   course, save and return the suggestion.
 * GET  /api/v1/quiz/attempts - the student's most recent attempt + its suggestion.
 *
 * THE STUDENT ID IS RESOLVED FROM THE JWT, NOT THE REQUEST. The session client
 * reads the caller's own student row under RLS; that id is then used for the
 * service-role writes (attempt, answers, suggestion). Trusting a caller-supplied
 * id is the uploads-route hole STATUS.md names; deriving it from the verified
 * session is not. Writes go through the service role because `authenticated` has
 * no insert grant on these tables (migration 0059) - history/records a student
 * must not be able to forge.
 */
export const dynamic = 'force-dynamic';

interface AnswerInput {
  question_id: string;
  option_id?: string | null;
  answer_text?: string | null;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
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
        { error: { code: 'not_signed_in', message: 'Sign in to do this.' } },
        { status: 401 },
      ),
    );
  }

  // The caller's own student id, from RLS - never from the request body.
  const { data: students, error: studentError } = await db
    .from('student')
    .select('id')
    .limit(1);
  if (studentError) {
    return commit(
      NextResponse.json(
        { error: { code: 'query_failed', message: studentError.message } },
        { status: 500 },
      ),
    );
  }
  const student = (students as { id: string }[] | null)?.[0];
  if (student === undefined) {
    return commit(
      NextResponse.json(
        {
          error: {
            code: 'no_student_for_session',
            message: 'This account is not linked to a student record.',
          },
        },
        { status: 404 },
      ),
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return commit(
      NextResponse.json(
        { error: { code: 'bad_request', message: 'Body must be JSON.' } },
        { status: 400 },
      ),
    );
  }

  const rawAnswers = (payload as { answers?: unknown }).answers;
  if (!Array.isArray(rawAnswers) || rawAnswers.length === 0) {
    return commit(
      NextResponse.json(
        { error: { code: 'bad_request', message: 'Answer at least one question.' } },
        { status: 400 },
      ),
    );
  }

  // Validate every answer against the real questions/options (service role read).
  const admin = serverSupabase();
  const [{ data: questionRows }, { data: optionRows }] = await Promise.all([
    admin.from('quiz_question').select('id, prompt, is_active, allow_text'),
    admin.from('quiz_option').select('id, question_id, label'),
  ]);

  const questions = new Map(
    (questionRows as { id: string; prompt: string; is_active: boolean; allow_text: boolean }[] | null ?? [])
      .filter((q) => q.is_active)
      .map((q) => [q.id, q]),
  );
  const options = new Map(
    (optionRows as { id: string; question_id: string; label: string }[] | null ?? []).map((o) => [
      o.id,
      o,
    ]),
  );
  // Which questions actually have options (so a text-only question is recognised).
  const hasOptions = new Set(
    (optionRows as { question_id: string }[] | null ?? []).map((o) => o.question_id),
  );

  interface ValidatedAnswer {
    question_id: string;
    option_id: string | null;
    answer_text: string | null;
    // The wording as the student saw it (migration 0062). Saved on the answer so
    // the record stays true if the question or option is reworded later.
    question_prompt: string;
    option_label: string | null;
  }

  const answers: ValidatedAnswer[] = [];
  const answerText: QuizAnswerText[] = [];
  const seenQuestions = new Set<string>();
  for (const a of rawAnswers as AnswerInput[]) {
    const question = questions.get(a?.question_id);
    if (question === undefined) {
      return commit(
        NextResponse.json(
          { error: { code: 'bad_request', message: 'An answer does not match the quiz.' } },
          { status: 400 },
        ),
      );
    }

    const text =
      question.allow_text && typeof a.answer_text === 'string' && a.answer_text.trim() !== ''
        ? a.answer_text.trim()
        : null;

    let optionId: string | null = null;
    let optionLabel: string | null = null;
    if (a.option_id) {
      const option = options.get(a.option_id);
      if (option === undefined || option.question_id !== a.question_id) {
        return commit(
          NextResponse.json(
            { error: { code: 'bad_request', message: 'An answer does not match the quiz.' } },
            { status: 400 },
          ),
        );
      }
      optionId = option.id;
      optionLabel = option.label;
    }

    // A question that has options needs one chosen; a text-only question needs
    // text. Either way an answer must carry something.
    if (hasOptions.has(a.question_id) && optionId === null) {
      return commit(
        NextResponse.json(
          { error: { code: 'bad_request', message: 'Please choose an option for each question.' } },
          { status: 400 },
        ),
      );
    }
    if (optionId === null && text === null) {
      continue; // nothing answered for this (text-only, optional) question - skip it
    }

    if (seenQuestions.has(a.question_id)) continue; // one answer per question
    seenQuestions.add(a.question_id);

    answers.push({
      question_id: a.question_id,
      option_id: optionId,
      answer_text: text,
      question_prompt: question.prompt,
      option_label: optionLabel,
    });
    // What the model reads: the chosen label and/or the typed note.
    const parts = [optionLabel, text ? `(in their words: ${text})` : null].filter(Boolean);
    answerText.push({ prompt: question.prompt, answer: parts.join(' ') || '(no answer)' });
  }

  if (answers.length === 0) {
    return commit(
      NextResponse.json(
        { error: { code: 'bad_request', message: 'Answer at least one question.' } },
        { status: 400 },
      ),
    );
  }

  // Save the attempt and its answers (service role; student id from the session).
  const { data: attemptRows, error: attemptError } = await admin
    .from('quiz_attempt')
    .insert({ student_id: student.id })
    .select('id, created_at')
    .limit(1);
  if (attemptError || !(attemptRows as { id: string }[] | null)?.[0]) {
    return commit(
      NextResponse.json(
        { error: { code: 'insert_failed', message: attemptError?.message ?? 'Could not save attempt.' } },
        { status: 500 },
      ),
    );
  }
  const attempt = (attemptRows as { id: string; created_at: string }[])[0];

  const { error: answersError } = await admin.from('quiz_answer').insert(
    answers.map((a) => ({
      attempt_id: attempt.id,
      question_id: a.question_id,
      option_id: a.option_id,
      answer_text: a.answer_text,
      question_prompt: a.question_prompt,
      option_label: a.option_label,
      student_id: student.id,
    })),
  );
  if (answersError) {
    return commit(
      NextResponse.json(
        { error: { code: 'insert_failed', message: answersError.message } },
        { status: 500 },
      ),
    );
  }

  // Build the catalogue and ask Claude for up to three. A failure here (no API
  // key, API error, no good match) must not lose the saved attempt - return it
  // with an empty list.
  let suggestions: Record<string, unknown>[] = [];
  try {
    const catalogue = await buildCatalogue();
    const { suggestions: recs, interests } = await recommendCourses(answerText, catalogue);

    // Store the model's inferred interests on the attempt (shown on the home card).
    if (interests.length > 0) {
      await admin.from('quiz_attempt').update({ interests }).eq('id', attempt.id);
    }

    if (recs.length > 0) {
      const { data: sugRows, error: sugError } = await admin
        .from('quiz_suggestion')
        .insert(
          recs.map((rec, i) => ({
            attempt_id: attempt.id,
            student_id: student.id,
            course_title: rec.course_title,
            course_category: rec.course_category,
            teacher_name: rec.teacher_name,
            rationale: rec.rationale,
            model: rec.model,
            rank: i + 1,
          })),
        )
        .select('course_title, course_category, teacher_name, rationale, rank')
        .order('rank', { ascending: true });
      if (sugError) {
        return commit(
          NextResponse.json(
            { error: { code: 'insert_failed', message: sugError.message } },
            { status: 500 },
          ),
        );
      }
      suggestions = (sugRows as Record<string, unknown>[] | null) ?? [];
    }
  } catch (error) {
    return commit(
      NextResponse.json({
        attempt_id: attempt.id,
        suggestions: [],
        warning: `Could not generate suggestions: ${(error as Error).message}`,
      }),
    );
  }

  return commit(
    NextResponse.json({
      attempt_id: attempt.id,
      suggestions, // empty when nothing fit
    }),
  );
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

  // The latest attempt and its ranked suggestions, both under the student's RLS.
  const { data: rows, error } = await db
    .from('quiz_attempt')
    .select(
      'id, created_at, quiz_suggestion ( course_title, course_category, teacher_name, rationale, rank )',
    )
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

  const latest = (rows as
    | { id: string; created_at: string; quiz_suggestion: { rank?: number }[] | null }[]
    | null)?.[0];

  if (!latest) {
    return commit(NextResponse.json({ attempt: null }));
  }

  const suggestions = (latest.quiz_suggestion ?? [])
    .slice()
    .sort((a, b) => (a.rank ?? 0) - (b.rank ?? 0));

  return commit(
    NextResponse.json({
      attempt: { id: latest.id, created_at: latest.created_at },
      suggestions,
    }),
  );
}
