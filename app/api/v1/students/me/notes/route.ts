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
 * THE STUDIO'S NOTE (0065). The student's own WellnessLiving profile note, written
 * by studio staff, comes back as one more group: `source: 'wellnessliving'`,
 * `teacher_id: null`. `app.my_wl_note()` is SECURITY DEFINER and keyed on
 * current_student_id() - the caller's own note, never another's, plain text only.
 * Its date is when the sync first saw the note; WL does not say when it was written.
 */
export const dynamic = 'force-dynamic';

interface NoteRow {
  id: string;
  author_teacher_id: string;
  body: string;
  created_at: string;
}

/** One row of `app.my_wl_note()` (migration 0065). */
interface WlNoteRow {
  note_text: string;
  note_seen_at: string;
}

/** A teacher's notes to this student, or the studio's WellnessLiving note. */
interface NoteGroup {
  teacher_id: string | null;
  source: 'teacher' | 'wellnessliving';
  teacher_name: string | null;
  notes: { id: string; body: string; created_at: string }[];
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

  const groups: NoteGroup[] = order.map((teacherId) => ({
    teacher_id: teacherId,
    source: 'teacher',
    teacher_name: nameById.get(teacherId) ?? null,
    notes: byTeacher.get(teacherId) ?? [],
  }));

  // The studio's note about this student (0065) - at most one row.
  const { data: wlRows, error: wlError } = await db.rpc('my_wl_note');

  if (wlError) {
    return commit(
      NextResponse.json(
        { error: { code: 'query_failed', message: wlError.message } },
        { status: 500 },
      ),
    );
  }

  const wl = ((wlRows ?? []) as WlNoteRow[])[0];
  if (wl !== undefined) {
    const studio: NoteGroup = {
      teacher_id: null,
      source: 'wellnessliving',
      teacher_name: null,
      notes: [{ id: 'wl', body: wl.note_text, created_at: wl.note_seen_at }],
    };
    // Groups are ordered by their newest note, so the studio's note goes before
    // the first group whose newest note is older than it was seen.
    const seen = Date.parse(wl.note_seen_at);
    const at = groups.findIndex((g) => Date.parse(g.notes[0]?.created_at ?? '') < seen);
    groups.splice(at === -1 ? groups.length : at, 0, studio);
  }

  return commit(NextResponse.json({ teachers: groups }));
}
