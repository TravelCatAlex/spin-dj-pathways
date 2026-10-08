import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { sessionSupabase } from '../../../../../lib/supabase-session';

/**
 * The signed-in student's dashboard, in one request.
 *
 * ============================ NO ID, BY DESIGN ============================
 * This route took a student id in the PATH until 8 Oct 2026 and returned that
 * student's data to anybody who asked - change the id, read a different person.
 * It was a deliberate temporary choice for wiring the dashboard up (asked for
 * 18 Sep 2026) and it was never shippable.
 *
 * WHAT REPLACED IT IS NOT A CHECK IN THIS FILE, and that distinction is the
 * whole point. The client below carries the VIEWER'S OWN JWT, so migration
 * 0053's row security decides every query here. `student` returns one row -
 * theirs - because `student_self_select` says `id = app.current_student_id()`,
 * and `attendance_record`, `class_session`, `cohort` and `teacher` are filtered
 * the same way underneath. A handler that forgot to filter would still return
 * nothing it should not, which a handler holding the service-role key could
 * never promise.
 *
 * So there is no `.eq('id', …)` on the student lookup any more. There is
 * nothing to pass and nothing to tamper with: `me` is whoever holds the cookie.
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

/**
 * The most ids one `.in(...)` filter may carry.
 *
 * PostgREST takes its filters in the QUERY STRING, so `.in('id', ids)` becomes a
 * URL that grows with the list. Past a point the request simply fails, and the
 * failure is not a friendly one - Node's fetch raises `HeadersOverflowError`
 * before anything is sent, so there is no status code to read and the message
 * says "fetch failed".
 *
 * Measured against this database, 8 Oct 2026, with uuid keys (~37 chars each):
 *
 *   300 ids  (~11,100 chars)  ok
 *   400 ids  (~14,800 chars)  HeadersOverflowError
 *   669 ids  (~24,800 chars)  Bad Request
 *
 * 200 is half the first failing size, which leaves room for the rest of the URL
 * and for any proxy with a smaller limit than Node's.
 *
 * THIS IS NOT HYPOTHETICAL. `attendance_record` holds 45,987 rows across 904
 * students; the busiest has 1,257 and **21 students are already over 300**.
 * Their dashboards returned nothing at all - a 500 with "fetch failed" - which
 * the UI then showed as fixtures.
 */
const IN_CHUNK = 200;

function chunked<T>(items: T[]): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += IN_CHUNK) out.push(items.slice(i, i + IN_CHUNK));
  return out;
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  // Typed through the factory rather than re-declared. A bare `let db;`
  // assigned by destructuring infers `any`, and an `any` client silently turns
  // every row below into `any` too - which is how a route loses its types
  // without anything going red.
  let session: ReturnType<typeof sessionSupabase>;

  try {
    session = sessionSupabase(request);
  } catch (error) {
    // Configuration is a 500, not a 404. "Not set up" must never be reported as
    // "this student has nothing".
    return NextResponse.json(
      { error: { code: 'not_configured', message: (error as Error).message } },
      { status: 500 },
    );
  }

  const { supabase: db, commit } = session;

  /**
   * getUser(), not getSession(), and not the proxy's word for it.
   *
   * This is the authoritative check and it belongs here, next to the data.
   * getSession() reads the cookie without revalidating the JWT, so it will
   * happily report a user for a token that was forged or revoked. The proxy's
   * getClaims() is an optimistic filter for redirects and nothing is allowed to
   * depend on it - Next's own authentication guide is explicit that a proxy
   * check must not be the only one.
   */
  const { data: auth, error: authError } = await db.auth.getUser();

  if (authError || auth?.user == null) {
    return commit(
      NextResponse.json(
        { error: { code: 'not_signed_in', message: 'Sign in to read this.' } },
        { status: 401 },
      ),
    );
  }

  // NO FILTER, AND THAT IS NOT AN OVERSIGHT. `student_self_select` resolves the
  // row from the JWT, so this returns exactly one: theirs. An `.eq('id', …)`
  // here would be a second opinion about who the caller is, and two answers to
  // that question is how one of them ends up wrong.
  const { data: students, error: studentError } = await db
    .from('student')
    .select('id, first_name, last_name, email, phone, date_of_birth')
    .limit(1);

  if (studentError) {
    return commit(
      NextResponse.json(
        { error: { code: 'query_failed', message: studentError.message } },
        { status: 500 },
      ),
    );
  }

  const student = (students as StudentRow[] | null)?.[0];
  if (student === undefined) {
    // Signed in, and row security returns nothing. That is an identity that was
    // never linked to a student, or linked to one that has since gone - not a
    // bad request, and worth its own code so RUNBOOK §10a can be reached for
    // rather than this being read as an empty dashboard.
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

  // Which sessions is this student on? attendance_record is keyed on OUR ids -
  // it carries no WellnessLiving field at all, so nothing here needs to know
  // that WellnessLiving exists.
  const { data: attendance, error: attendanceError } = await db
    .from('attendance_record')
    .select('class_session_id, is_attended, is_no_show, is_cancelled_client')
    .eq('student_id', student.id);

  if (attendanceError) {
    return commit(
      NextResponse.json(
        { error: { code: 'query_failed', message: attendanceError.message } },
        { status: 500 },
      ),
    );
  }

  const sessionIds = (attendance ?? []).map((a) => a.class_session_id).filter(Boolean);

  // THE ONLY UNBOUNDED LIST ON THIS ROUTE, so the only one that needs chunking.
  // Everything below derives from `shown`, which is at most 40 sessions, and a
  // teacher or cohort list drawn from 40 sessions cannot overflow a URL.
  const sessions: SessionRow[] = [];
  for (const batch of chunked(sessionIds)) {
    const { data, error } = await db
      .from('class_session')
      .select(
        'id, cohort_id, title, starts_at, ends_at, local_start, local_end, timezone_label, duration_minutes, capacity, booked_count, location_title, kind, is_cancelled',
      )
      .in('id', batch)
      .order('starts_at', { ascending: true });

    if (error) {
      return commit(
        NextResponse.json(
          { error: { code: 'query_failed', message: error.message } },
          { status: 500 },
        ),
      );
    }
    sessions.push(...((data ?? []) as SessionRow[]));
  }

  // Each batch came back ordered, but the batches are not ordered against each
  // other, and everything downstream - next session, upcoming, recent - reads
  // this as one ascending list. Sorting once here is what makes the chunking
  // invisible to the rest of the route.
  //
  // Nulls last, because `starts_at` is nullable and a session with no start is
  // filtered out below rather than shown first.
  sessions.sort((a, b) => {
    if (a.starts_at === null) return 1;
    if (b.starts_at === null) return -1;
    return a.starts_at < b.starts_at ? -1 : a.starts_at > b.starts_at ? 1 : 0;
  });

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

  // Built first, then committed, because the token may have rotated during
  // getUser() above and those cookies have to travel on THIS response.
  const payload = {
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
  };

  return commit(NextResponse.json(payload));
}
