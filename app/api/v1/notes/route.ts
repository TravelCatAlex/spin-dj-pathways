import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { sessionSupabase } from '../../../lib/supabase-session';

/**
 * GET  /api/v1/notes  - the signed-in teacher's own notes, both kinds.
 * POST /api/v1/notes  - create a note (private personal, or public to a student).
 *
 * ============================ NO ID, SAME AS THE ROSTER ============================
 * The client below carries the VIEWER'S OWN JWT, so migration 0056's policies
 * decide everything. On GET, `teacher_note_author_select` returns only the rows
 * this teacher wrote. On POST, `teacher_note_author_insert`'s WITH CHECK refuses
 * any row whose `author_teacher_id` is not this teacher, and any PUBLIC note whose
 * student this teacher did not teach (`app.teaches_student`). A handler that forgot
 * a check would still be unable to write a note it should not - the roster rule is
 * the database's, not this file's.
 *
 * This is the first WRITE route in the portal. It uses sessionSupabase() (the anon
 * key + the viewer's JWT), never the service-role client in supabase.ts, for
 * exactly that reason.
 * ==================================================================================
 */
export const dynamic = 'force-dynamic';

interface NoteRow {
  id: string;
  visibility: 'private' | 'public';
  student_id: string | null;
  body: string;
  created_at: string;
  updated_at: string;
}

interface StudentNameRow {
  id: string;
  first_name: string | null;
  last_name: string | null;
}

function fullName(first: string | null, last: string | null): string | null {
  const name = [first, last].filter((p) => p !== null && p !== '').join(' ').trim();
  return name === '' ? null : name;
}

/** The teacher's own id, resolved by RLS from the JWT. Null when there is none. */
async function teacherId(
  db: ReturnType<typeof sessionSupabase>['supabase'],
): Promise<{ id: string } | { error: NextResponse }> {
  const { data, error } = await db.from('teacher').select('id').limit(1);

  if (error) {
    return {
      error: NextResponse.json(
        { error: { code: 'query_failed', message: error.message } },
        { status: 500 },
      ),
    };
  }

  const teacher = (data as { id: string }[] | null)?.[0];
  if (teacher === undefined) {
    // Signed in, but RLS returns no teacher row - a student, or an unlinked
    // identity. Its own code, so RUNBOOK §10a is reachable, not "no notes".
    return {
      error: NextResponse.json(
        {
          error: {
            code: 'no_teacher_for_session',
            message: 'This account is not linked to a teacher record.',
          },
        },
        { status: 404 },
      ),
    };
  }

  return { id: teacher.id };
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

  const teacher = await teacherId(db);
  if ('error' in teacher) return commit(teacher.error);

  const { data: noteRows, error: noteError } = await db
    .from('teacher_note')
    .select('id, visibility, student_id, body, created_at, updated_at')
    .order('created_at', { ascending: false });

  if (noteError) {
    return commit(
      NextResponse.json(
        { error: { code: 'query_failed', message: noteError.message } },
        { status: 500 },
      ),
    );
  }

  const notes = (noteRows ?? []) as NoteRow[];

  // The names for the public notes' subjects. RLS returns only this teacher's
  // roster here, which is exactly the set every public note points into (the
  // write rule guaranteed it), so a missing name means a roster that has since
  // moved rather than a leak.
  const { data: studentRows, error: studentError } = await db
    .from('student')
    .select('id, first_name, last_name');

  if (studentError) {
    return commit(
      NextResponse.json(
        { error: { code: 'query_failed', message: studentError.message } },
        { status: 500 },
      ),
    );
  }

  const nameById = new Map(
    (studentRows as StudentNameRow[] | null ?? []).map((s) => [
      s.id,
      fullName(s.first_name, s.last_name),
    ]),
  );

  return commit(
    NextResponse.json({
      notes: notes.map((n) => ({
        id: n.id,
        visibility: n.visibility,
        student_id: n.student_id,
        student_name: n.student_id === null ? null : (nameById.get(n.student_id) ?? null),
        body: n.body,
        created_at: n.created_at,
        updated_at: n.updated_at,
      })),
    }),
  );
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

  const input = payload as {
    visibility?: unknown;
    student_id?: unknown;
    body?: unknown;
  };

  const visibility = input.visibility;
  const body = typeof input.body === 'string' ? input.body.trim() : '';
  const studentId =
    typeof input.student_id === 'string' && input.student_id !== '' ? input.student_id : null;

  // Shape is validated here for a clear 400; the TRUTH of the rules - author is
  // me, the student is on my roster - is enforced by RLS below, not by this.
  if (visibility !== 'private' && visibility !== 'public') {
    return commit(
      NextResponse.json(
        { error: { code: 'bad_request', message: 'visibility must be "private" or "public".' } },
        { status: 400 },
      ),
    );
  }
  if (body === '') {
    return commit(
      NextResponse.json(
        { error: { code: 'bad_request', message: 'A note needs some text.' } },
        { status: 400 },
      ),
    );
  }
  if (visibility === 'public' && studentId === null) {
    return commit(
      NextResponse.json(
        { error: { code: 'bad_request', message: 'A public note needs a student.' } },
        { status: 400 },
      ),
    );
  }
  if (visibility === 'private' && studentId !== null) {
    return commit(
      NextResponse.json(
        { error: { code: 'bad_request', message: 'A private note has no student.' } },
        { status: 400 },
      ),
    );
  }

  const teacher = await teacherId(db);
  if ('error' in teacher) return commit(teacher.error);

  const { data: inserted, error: insertError } = await db
    .from('teacher_note')
    .insert({
      author_teacher_id: teacher.id,
      student_id: visibility === 'public' ? studentId : null,
      visibility,
      body,
    })
    .select('id, visibility, student_id, body, created_at, updated_at')
    .limit(1);

  if (insertError) {
    // 42501 is the RLS refusal - a public note to a student off the roster, or a
    // forged author. It is a permission problem, not a server fault, so it reads
    // as 403 and the code is surfaced for the UI to explain.
    const status = insertError.code === '42501' ? 403 : 400;
    return commit(
      NextResponse.json(
        {
          error: {
            code: insertError.code === '42501' ? 'not_allowed' : 'insert_failed',
            message:
              insertError.code === '42501'
                ? 'You can only write a public note about a student you have taught.'
                : insertError.message,
          },
        },
        { status },
      ),
    );
  }

  const row = (inserted as NoteRow[] | null)?.[0];

  return commit(NextResponse.json({ note: row }, { status: 201 }));
}
