import { NextResponse } from 'next/server';
import { serverSupabase } from '../../../../../lib/supabase';

/**
 * One student's dashboard, in one request.
 *
 * ================================ NO AUTH =================================
 * This route takes a student id in the PATH and returns that student's data to
 * anybody who asks. That is a deliberate, temporary choice for wiring the
 * dashboard up (asked for 18 Sep 2026) and it is not shippable: change the id
 * and you read a different person.
 *
 * What replaces it is not a check in this file. The database already has RLS on
 * with no policies, so the real fix is per-student policies plus the viewer's
 * own session, after which `me` is implied and no id is accepted at all - see
 * REQUIRED_APIS.md, which specifies `/students/me` for exactly this reason.
 * Until then this must not be deployed anywhere public.
 * ==========================================================================
 *
 * WHAT IS REAL AND WHAT IS NULL. Four of the dashboard's twelve sections have a
 * source in this database. The other eight - pathway, project, interests,
 * progress, feedback, creations, opportunities, journey - do not exist in
 * WellnessLiving and have no table here yet, so they are absent from this
 * response rather than invented. The dashboard keeps rendering those from its
 * fixtures, and a null here is a true statement about the data.
 *
 * `program` and `organization` are null for the same reason: those tables are
 * not built yet. `cohort` IS real, so the class chip has a genuine value.
 */

export const dynamic = 'force-dynamic';

interface StudentRow {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  date_of_birth: string | null;
}

interface SessionRow {
  id: string;
  cohort_id: string | null;
  title: string | null;
  starts_at: string | null;
  ends_at: string | null;
  /**
   * The studio's WALL TIME, stored as WellnessLiving sent it.
   *
   * This is what a student must be shown, and it cannot be derived from
   * `starts_at`. WL reports the zone as an ABBREVIATION - "ET" - which does not
   * say whether EST or EDT was in force, so nothing can convert UTC back to it.
   * There is a second reason, independent of the first: a class is scheduled in
   * local wall time, so "Tuesday 6pm" stays 6pm across a daylight-saving change
   * while its UTC value shifts by an hour. The wall time is the business fact.
   *
   * Rendering `starts_at` in the browser instead shows the VIEWER's timezone,
   * which is nobody's class time. It read 7:30 PM in Ahmedabad for a 10:00 AM
   * New York session.
   */
  local_start: string | null;
  local_end: string | null;
  timezone_label: string | null;
  duration_minutes: number | null;
  capacity: number | null;
  booked_count: number | null;
  location_title: string | null;
  kind: string | null;
  is_cancelled: boolean | null;
}

function fullName(first: string | null, last: string | null): string | null {
  const name = [first, last].filter((p) => p !== null && p !== '').join(' ').trim();
  return name === '' ? null : name;
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  // Next 15+ hands params in as a promise.
  const { id } = await context.params;

  let db;
  try {
    db = serverSupabase();
  } catch (error) {
    // Configuration is a 500, not a 404. "Not set up" must never be reported as
    // "this student has nothing".
    return NextResponse.json(
      { error: { code: 'not_configured', message: (error as Error).message } },
      { status: 500 },
    );
  }

  const { data: students, error: studentError } = await db
    .from('student')
    .select('id, first_name, last_name, email, phone, date_of_birth')
    .eq('id', id)
    .limit(1);

  if (studentError) {
    return NextResponse.json(
      { error: { code: 'query_failed', message: studentError.message } },
      { status: 500 },
    );
  }

  const student = (students as StudentRow[] | null)?.[0];
  if (student === undefined) {
    return NextResponse.json(
      { error: { code: 'not_found', message: `No student with id ${id}.` } },
      { status: 404 },
    );
  }

  // Which sessions is this student on? attendance_record is keyed on OUR ids -
  // it carries no WellnessLiving field at all, so nothing here needs to know
  // that WellnessLiving exists.
  const { data: attendance, error: attendanceError } = await db
    .from('attendance_record')
    .select('class_session_id, is_attended, is_no_show, is_cancelled_client')
    .eq('student_id', student.id);

  if (attendanceError) {
    return NextResponse.json(
      { error: { code: 'query_failed', message: attendanceError.message } },
      { status: 500 },
    );
  }

  const sessionIds = (attendance ?? []).map((a) => a.class_session_id).filter(Boolean);

  let sessions: SessionRow[] = [];
  if (sessionIds.length > 0) {
    const { data, error } = await db
      .from('class_session')
      .select(
        'id, cohort_id, title, starts_at, ends_at, local_start, local_end, timezone_label, duration_minutes, capacity, booked_count, location_title, kind, is_cancelled',
      )
      .in('id', sessionIds)
      .order('starts_at', { ascending: true });

    if (error) {
      return NextResponse.json(
        { error: { code: 'query_failed', message: error.message } },
        { status: 500 },
      );
    }
    sessions = (data ?? []) as SessionRow[];
  }

  const nowIso = new Date().toISOString();
  // A cancelled session is not the next session. It stays in the schedule list,
  // flagged, because "it was cancelled" is information the student wants.
  const upcoming = sessions.filter(
    (s) => s.starts_at !== null && s.starts_at >= nowIso && s.is_cancelled !== true,
  );
  const past = sessions.filter((s) => s.starts_at !== null && s.starts_at < nowIso);
  const next = upcoming[0];

  // Teacher and cohort, only for the sessions being returned.
  const shown = [...upcoming.slice(0, 20), ...past.slice(-20)];
  const shownIds = shown.map((s) => s.id);

  const teacherBySession = new Map<string, { id: string; name: string | null }>();
  if (shownIds.length > 0) {
    const { data: links } = await db
      .from('class_session_teacher')
      .select('class_session_id, teacher_id, is_substitute')
      .in('class_session_id', shownIds);

    const teacherIds = [...new Set((links ?? []).map((l) => l.teacher_id).filter(Boolean))];
    if (teacherIds.length > 0) {
      const { data: teachers } = await db
        .from('teacher')
        .select('id, first_name, last_name')
        .in('id', teacherIds);

      const byId = new Map(
        (teachers ?? []).map((t) => [t.id as string, fullName(t.first_name, t.last_name)]),
      );
      for (const link of links ?? []) {
        if (teacherBySession.has(link.class_session_id as string)) continue;
        teacherBySession.set(link.class_session_id as string, {
          id: link.teacher_id as string,
          name: byId.get(link.teacher_id as string) ?? null,
        });
      }
    }
  }

  const cohortIds = [...new Set(shown.map((s) => s.cohort_id).filter(Boolean))] as string[];
  const cohortById = new Map<string, string | null>();
  if (cohortIds.length > 0) {
    const { data: cohorts } = await db
      .from('cohort')
      .select('id, title')
      .in('id', cohortIds);
    for (const c of cohorts ?? []) cohortById.set(c.id as string, (c.title as string) ?? null);
  }

  const asSession = (s: SessionRow) => ({
    id: s.id,
    title: s.title,
    startsAt: s.starts_at,
    endsAt: s.ends_at,
    // What to DISPLAY. startsAt is the instant; localStart is the studio wall
    // time, and only one of them is the class time a student turns up for.
    localStart: s.local_start,
    localEnd: s.local_end,
    timezoneLabel: s.timezone_label,
    durationMinutes: s.duration_minutes,
    // Both nullable and kept that way. A class with no capacity set and one
    // with room for nobody are different facts, and 0 would merge them.
    capacity: s.capacity,
    bookedCount: s.booked_count,
    kind: s.kind,
    isCancelled: s.is_cancelled ?? false,
    teacher: teacherBySession.get(s.id) ?? null,
    cohort:
      s.cohort_id === null
        ? null
        : { id: s.cohort_id, name: cohortById.get(s.cohort_id) ?? null },
    location: s.location_title === null ? null : { type: null, label: s.location_title },
    // No table for either yet. Null is the true answer, not an omission.
    program: null,
    project: null,
  });

  const attended = (attendance ?? []).filter((a) => a.is_attended === true).length;

  // The cohort to show as this student's class. Sessions are ordered ascending,
  // so the LAST cohort-bearing one before now is the most recent class they sat
  // in - a better answer than nothing when the next booking is a one-to-one.
  // Searched within `shown` on purpose: cohort titles were only fetched for
  // those, so looking outside it would find an id whose name we never read and
  // report the class as {id, name: null}.
  const cohortSource =
    next?.cohort_id != null
      ? next
      : [...shown].reverse().find((s) => s.cohort_id !== null);

  const classContext =
    cohortSource?.cohort_id == null
      ? null
      : {
          id: cohortSource.cohort_id,
          name: cohortById.get(cohortSource.cohort_id) ?? null,
        };

  return NextResponse.json({
    profile: {
      id: student.id,
      firstName: student.first_name,
      lastName: student.last_name,
      email: student.email,
      // Selected all along and never returned, so the profile screen had a
      // phone number in the database and none to show.
      phone: student.phone,
      dateOfBirth: student.date_of_birth,
      role: 'Student',
      // A real person has no uploaded avatar here. Null rather than a stock
      // image: a placeholder face reads as somebody's photo.
      avatarUrl: null,
    },
    context: {
      // The class group this student is in.
      //
      // NOT simply "the next session's cohort". A private appointment has no
      // class group at all - WellnessLiving gives it no class key, so there is
      // nothing to point at - and a student whose next booking happens to be a
      // one-to-one would show no class despite being enrolled in one all term.
      // So: the next session's cohort when it has one, else the most recent
      // session that did.
      class: classContext,
      // No tables yet. See the header.
      program: null,
      organization: null,
    },
    nextSession: next === undefined ? null : asSession(next),
    sessions: {
      upcoming: upcoming.slice(0, 20).map(asSession),
      recent: past.slice(-20).reverse().map(asSession),
      totals: {
        booked: sessions.length,
        attended,
        upcoming: upcoming.length,
      },
    },
    // Named so nobody mistakes a missing key for a bug. These are the eight
    // dashboard sections with no source anywhere yet.
    notAvailableYet: [
      'pathway',
      'currentProject',
      'interests',
      'progress',
      'latestFeedback',
      'creations',
      'opportunities',
      'journey',
    ],
  });
}
