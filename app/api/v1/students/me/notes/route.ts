import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { sessionSupabase } from '../../../../../lib/supabase-session';

/**
 * GET /api/v1/students/me/notes - the public notes addressed to the signed-in
 * student, grouped by the teacher who wrote them.
 *
 * ============================ NO ID, SAME AS THE DASHBOARD ============================
 * The client carries the viewer's JWT, and `teacher_note_student_select`
 * (migration 0056) is `visibility = 'public' and student_id = current_student_id()`
 * - so a student reads exactly the public notes written to them and nothing else.
 * Private notes cannot appear here: the kind check keeps their student_id null, and
 * null never equals a student id. There is no id to pass and none to tamper with.
 * ====================================================================================
 *
 * READ-ONLY. A student reads their notes; they do not reply to or edit them. There
 * is no write policy a student could reach, and no POST here.
 */
export const dynamic = 'force-dynamic';

interface NoteRow {
  id: string;
  author_teacher_id: string;
  body: string;
  created_at: string;
}

interface TeacherNameRow {
  id: string;
  first_name: string | null;
  last_name: string | null;
}

function fullName(first: string | null, last: string | null): string | null {
  const name = [first, last].filter((p) => p !== null && p !== '').join(' ').trim();
  return name === '' ? null : name;
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

  const { data: noteRows, error: noteError } = await db
    .from('teacher_note')
    .select('id, author_teacher_id, body, created_at')
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

  // The authors' names. A student may read the teachers who taught them
  // (`teacher_taught_select`, 0055), which is exactly the set that can have
  // written them a note, so every author resolves.
  const { data: teacherRows, error: teacherError } = await db
    .from('teacher')
    .select('id, first_name, last_name');

  if (teacherError) {
    return commit(
      NextResponse.json(
        { error: { code: 'query_failed', message: teacherError.message } },
        { status: 500 },
      ),
    );
  }

  const nameById = new Map(
    (teacherRows as TeacherNameRow[] | null ?? []).map((t) => [
      t.id,
      fullName(t.first_name, t.last_name),
    ]),
  );

  // Group by teacher, preserving the newest-first order the query returned.
  const order: string[] = [];
  const byTeacher = new Map<string, { id: string; body: string; created_at: string }[]>();
  for (const n of notes) {
    if (!byTeacher.has(n.author_teacher_id)) {
      byTeacher.set(n.author_teacher_id, []);
      order.push(n.author_teacher_id);
    }
    byTeacher.get(n.author_teacher_id)!.push({
      id: n.id,
      body: n.body,
      created_at: n.created_at,
    });
  }

  return commit(
    NextResponse.json({
      teachers: order.map((teacherId) => ({
        teacher_id: teacherId,
        teacher_name: nameById.get(teacherId) ?? null,
        notes: byTeacher.get(teacherId) ?? [],
      })),
    }),
  );
}
