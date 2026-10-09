import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { sessionSupabase } from '../../../../../lib/supabase-session';

/**
 * GET /api/v1/teachers/me/roster - the students the signed-in teacher taught.
 *
 * =========================== NO ID, FOR THE SAME REASON ===========================
 * There is no teacher id in this path and nothing to pass. The client below
 * carries the VIEWER'S OWN JWT, so migration 0055's policies decide every query
 * here: `class_session` returns the sessions they are named on, `cohort` the
 * groups those belong to, `attendance_record` the attendance on them, and
 * `student` the humans who turned up. A handler that forgot to filter would
 * still return nothing it should not.
 *
 * This route therefore contains NO authorisation logic at all, and that absence
 * is the design. The dashboard route beside it says the same thing at length.
 * ==================================================================================
 *
 * WHAT A ROSTER IS HERE: reachability through ATTENDANCE, not enrolment. A
 * student who enrolled and never came is on nobody's roster, because
 * `attendance_record` is what this database can actually prove. That rule lives
 * in `app.teaches_student()` (migration 0055), not in this file - two statements
 * of it would drift, and the drift would show a teacher a student the database
 * then refuses to return.
 *
 * READ-ONLY. There is no POST here and there is no write policy behind it: a
 * teacher cannot mark attendance, and task 032 scoped that out deliberately.
 */
export const dynamic = 'force-dynamic';

interface SessionRow {
  id: string;
  cohort_id: string | null;
  title: string | null;
  starts_at: string | null;
  /**
   * The studio's WALL TIME, as WellnessLiving sent it - see the long note in
   * the student dashboard route. It cannot be derived from `starts_at`, and
   * rendering `starts_at` in the browser shows the VIEWER's timezone, which is
   * nobody's class time.
   */
  local_start: string | null;
  timezone_label: string | null;
  is_cancelled: boolean | null;
}

interface AttendanceRow {
  class_session_id: string | null;
  student_id: string | null;
  is_attended: boolean | null;
  is_no_show: boolean | null;
}

interface StudentRow {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
}

interface CohortRow {
  id: string;
  title: string | null;
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

  // No filter: `teacher_self_select` resolves the row from the JWT.
  const { data: teachers, error: teacherError } = await db
    .from('teacher')
    .select('id, first_name, last_name')
    .limit(1);

  if (teacherError) {
    return commit(
      NextResponse.json(
        { error: { code: 'query_failed', message: teacherError.message } },
        { status: 500 },
      ),
    );
  }

  const teacher = (teachers as (StudentRow & { id: string })[] | null)?.[0];

  if (teacher === undefined) {
    // Signed in, and row security returns no teacher row. Either this identity
    // is a student's, or it carries no role at all. Not a bad request, and
    // worth its own code so RUNBOOK §10a can be reached for rather than this
    // being read as "a teacher with no classes".
    return commit(
      NextResponse.json(
        {
          error: {
            code: 'no_teacher_for_session',
            message: 'This account is not linked to a teacher record.',
          },
        },
        { status: 404 },
      ),
    );
  }

  // Every session this teacher is named on. No `.in()` and no id list, so the
  // URL-length trap the dashboard route documents cannot arise here: the filter
  // is a policy, not a query string.
  const { data: sessionRows, error: sessionError } = await db
    .from('class_session')
    .select('id, cohort_id, title, starts_at, local_start, timezone_label, is_cancelled')
    .order('starts_at', { ascending: false });

  if (sessionError) {
    return commit(
      NextResponse.json(
        { error: { code: 'query_failed', message: sessionError.message } },
        { status: 500 },
      ),
    );
  }

  const sessions = (sessionRows ?? []) as SessionRow[];

  const { data: attendanceRows, error: attendanceError } = await db
    .from('attendance_record')
    .select('class_session_id, student_id, is_attended, is_no_show');

  if (attendanceError) {
    return commit(
      NextResponse.json(
        { error: { code: 'query_failed', message: attendanceError.message } },
        { status: 500 },
      ),
    );
  }

  const attendance = (attendanceRows ?? []) as AttendanceRow[];

  const { data: studentRows, error: studentError } = await db
    .from('student')
    .select('id, first_name, last_name, email')
    .order('last_name', { ascending: true });

  if (studentError) {
    return commit(
      NextResponse.json(
        { error: { code: 'query_failed', message: studentError.message } },
        { status: 500 },
      ),
    );
  }

  const students = (studentRows ?? []) as StudentRow[];

  const { data: cohortRows, error: cohortError } = await db
    .from('cohort')
    .select('id, title');

  if (cohortError) {
    return commit(
      NextResponse.json(
        { error: { code: 'query_failed', message: cohortError.message } },
        { status: 500 },
      ),
    );
  }

  const cohorts = (cohortRows ?? []) as CohortRow[];
  const cohortTitle = new Map(cohorts.map((c) => [c.id, c.title]));

  // How many of this teacher's sessions each student attended. Counted from the
  // rows RLS already returned, so it cannot include a session somebody else
  // taught - there is no way to ask for one.
  const attendedCount = new Map<string, number>();
  for (const row of attendance) {
    if (row.student_id === null) continue;
    if (row.is_attended !== true) continue;
    attendedCount.set(row.student_id, (attendedCount.get(row.student_id) ?? 0) + 1);
  }

  return commit(
    NextResponse.json({
      teacher: {
        name: fullName(teacher.first_name, teacher.last_name),
      },
      /**
       * `email` IS included, and that is a decision rather than an oversight. A
       * teacher who takes a register needs to tell two students with the same
       * first name apart, and the address is how the studio already does it.
       * It is the viewer's own roster and nobody else's.
       */
      students: students.map((s) => ({
        id: s.id,
        name: fullName(s.first_name, s.last_name),
        email: s.email,
        sessions_attended: attendedCount.get(s.id) ?? 0,
      })),
      sessions: sessions.map((s) => ({
        id: s.id,
        title: s.title,
        cohort: s.cohort_id === null ? null : (cohortTitle.get(s.cohort_id) ?? null),
        starts_at: s.starts_at,
        local_start: s.local_start,
        timezone_label: s.timezone_label,
        is_cancelled: s.is_cancelled,
        attended: attendance.filter(
          (a) => a.class_session_id === s.id && a.is_attended === true,
        ).length,
        no_shows: attendance.filter(
          (a) => a.class_session_id === s.id && a.is_no_show === true,
        ).length,
      })),
      cohorts: cohorts.map((c) => ({ id: c.id, title: c.title })),
    }),
  );
}
