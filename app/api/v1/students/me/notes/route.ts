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
 * Private notes cannot appear here, even one that names this student (0063): the
 * policy's `visibility = 'public'` excludes every private note whatever its
 * student_id. There is no id to pass and none to tamper with.
 * ====================================================================================
 *
 * READ-ONLY. A student reads their notes; they do not reply to or edit them. There
 * is no write policy a student could reach, and no POST here.
 *
 * THE STUDIO'S NOTE (0067). The student's own WellnessLiving profile note, written
 * by studio staff, is a public teacher_note to them with NO author - the database
 * allows a null author only on a WL-linked note - so the same query returns it,
 * and it comes back as one more group, `teacher_id: null` and `from_wellness: true`
 * on the group and on each of its notes. Nothing else carries the flag. It has no
 * date (0066): WL does not say when it was written. It comes last.
 */
export const dynamic = 'force-dynamic';

interface NoteRow {
  id: string;
  /** Null only on the studio's WellnessLiving note (0067). */
  author_teacher_id: string | null;
  body: string;
  created_at: string;
}

/** A teacher's notes to this student, or the studio's WellnessLiving note. */
interface NoteGroup {
  teacher_id: string | null;
  /**
   * Present, and true, only on the group of notes from the student's own
   * WellnessLiving profile - on the group and on each of its notes. A teacher's
   * group and notes carry no flag.
   */
  from_wellness?: true;
  teacher_name: string | null;
  /** `created_at` is null for a WellnessLiving note: WL gives no date (0066). */
  notes: { id: string; body: string; created_at: string | null; from_wellness?: true }[];
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
    // Defence in depth, and no longer a formality. A private note may now name a
    // student (0063), so the old guarantee - a private note has no student id and
    // cannot match - no longer holds. teacher_note_student_select's
    // `visibility = 'public'` is the boundary; this repeats it so a private note
    // reaching this route would still be dropped here. Same for soft-deleted rows
    // (0058).
    .eq('visibility', 'public')
    .is('deleted_at', null)
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
  const studioNotes: NoteRow[] = [];
  for (const n of notes) {
    if (n.author_teacher_id === null) {
      studioNotes.push(n);
      continue;
    }
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

  const groups: NoteGroup[] = order.map((teacherId) => ({
    teacher_id: teacherId,
    teacher_name: nameById.get(teacherId) ?? null,
    notes: byTeacher.get(teacherId) ?? [],
  }));

  // The studio's notes about this student (0067) - one per WL note since 0068.
  // Undated, so they cannot be placed among the teachers' groups by date; they go
  // last, which also keeps `teachers[0]` a teacher for the dashboard card, and
  // within the group they keep WL's order (the link's `position`).
  if (studioNotes.length > 0) {
    const { data: linkRows, error: linkError } = await db
      .from('teacher_note_link')
      .select('teacher_note_id, position')
      .in(
        'teacher_note_id',
        studioNotes.map((n) => n.id),
      );

    if (linkError) {
      return commit(
        NextResponse.json(
          { error: { code: 'query_failed', message: linkError.message } },
          { status: 500 },
        ),
      );
    }

    const position = new Map(
      ((linkRows ?? []) as { teacher_note_id: string; position: number }[]).map((l) => [
        l.teacher_note_id,
        l.position,
      ]),
    );

    groups.push({
      teacher_id: null,
      from_wellness: true,
      teacher_name: null,
      notes: [...studioNotes]
        .sort((a, b) => (position.get(a.id) ?? 0) - (position.get(b.id) ?? 0))
        .map((n) => ({ id: n.id, body: n.body, created_at: null, from_wellness: true as const })),
    });
  }

  return commit(NextResponse.json({ teachers: groups }));
}
