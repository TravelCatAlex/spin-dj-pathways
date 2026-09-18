'use client';

import { useEffect, useState } from 'react';

import { CONTEXT_CHIPS, CURRENT_USER, DASHBOARD_DATE, NEXT_SESSION } from './fixtures';

/**
 * Live dashboard data, mapped into the shapes the components already take.
 *
 * FOUR SECTIONS OF TWELVE ARE REAL. Identity, the context chips, the next
 * session and the schedule have a source in the database. The other eight -
 * pathway, project, interests, progress, feedback, creations, opportunities,
 * journey - do not exist in WellnessLiving and have no table yet, so they keep
 * rendering from fixtures. That is recorded here rather than left for somebody
 * to discover by wondering why a card never changes.
 *
 * THE API SHAPE IS NOT THE FIXTURE SHAPE, despite what REQUIRED_APIS.md claims.
 * The fixtures carry presentation with them - chip accent colours, per-row
 * icons, pre-formatted date and time strings - and none of that belongs in a
 * response. So the mapping lives here: the API sends values, this file dresses
 * them, and the components stay untouched.
 *
 * FIXTURES ARE THE FALLBACK, NOT THE DEFAULT. While the request is in flight,
 * and if it fails, the dashboard shows what it always showed. `isLive` says
 * which you are looking at, so a failed fetch cannot quietly masquerade as real
 * data - that is exactly the confusion this whole exercise exists to remove.
 */

// NO AUTH YET. The dashboard asks for one hard-coded student because the API
// takes an id in the path and nobody signs in. When sign-in lands, this
// constant and the id in the URL both disappear: the route becomes `me` and the
// database answers for whoever is holding the session.
export const DEMO_STUDENT_ID =
  process.env.NEXT_PUBLIC_DEMO_STUDENT_ID ?? 'a3b3ca43-60a3-4049-9bd8-98dbf3c72c32';

function toUser(profile) {
  if (!profile) return CURRENT_USER;
  return {
    id: profile.id,
    firstName: profile.firstName ?? '',
    lastName: profile.lastName ?? '',
    email: profile.email ?? '',
    phone: profile.phone ?? null,
    dateOfBirth: profile.dateOfBirth ?? null,
    role: profile.role ?? 'Student',
    // A real person has no uploaded avatar, and borrowing the fixture's would
    // put a stock photo of someone else on their account.
    avatarUrl: profile.avatarUrl ?? null,
  };
}

/**
 * The context row.
 *
 * A chip with no value is DROPPED, not shown empty and not filled in. Program
 * and organization have no table yet; an "Organization: —" chip would read as a
 * missing value for this student rather than a part of the system nobody has
 * built, and the two need different responses from whoever sees it.
 */
function toChips(context) {
  if (!context) return CONTEXT_CHIPS;
  const value = {
    program: context.program?.name ?? null,
    org: context.organization?.name ?? null,
    class: context.class?.name ?? null,
  };
  return CONTEXT_CHIPS.map((chip) => ({ ...chip, value: value[chip.id] })).filter(
    (chip) => chip.value != null && chip.value !== '',
  );
}

function dateLabel(iso, opts) {
  if (!iso) return null;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d.toLocaleDateString('en-US', opts);
}

function timeLabel(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? null
    : d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

/**
 * A session time, read as the STUDIO's wall clock.
 *
 * `localStart` arrives as `YYYY-MM-DD HH:MM:SS` with no zone on the end, which
 * is the point: it is already the studio's time. Appending `Z` and letting the
 * browser convert would be the bug this exists to avoid - the first live render
 * showed 7:30 PM for a 10:00 AM New York session, because the viewer was in
 * India and `startsAt` is an instant, not a class time.
 *
 * So it is parsed as plain text. No Date, no zone maths, nothing that could
 * shift it. Falling back to `startsAt` only when there is no local value at all,
 * which is wrong-but-visible rather than blank.
 */
function studioTime(session) {
  const local = session.localStart;
  if (typeof local === 'string' && local.length >= 16) {
    const [datePart, timePart] = local.split(/[T ]/);
    const [y, m, d] = datePart.split('-').map(Number);
    let [hh, mm] = timePart.split(':').map(Number);
    const suffix = hh >= 12 ? 'PM' : 'AM';
    const hour12 = hh % 12 === 0 ? 12 : hh % 12;
    // Constructed with Date.UTC and read back in UTC, so the calendar maths for
    // the weekday is right and no local offset can creep in.
    const asUtc = new Date(Date.UTC(y, m - 1, d));
    return {
      date: asUtc.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        timeZone: 'UTC',
      }),
      time: `${hour12}:${String(mm).padStart(2, '0')} ${suffix}`,
      zone: session.timezoneLabel ?? null,
    };
  }
  return {
    date: dateLabel(session.startsAt, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }),
    time: timeLabel(session.startsAt),
    zone: session.timezoneLabel ?? null,
  };
}

/**
 * The Next Session card.
 *
 * Its detail rows are built from what exists. A row is omitted rather than
 * carrying a placeholder: "Project: —" on a dashboard with no project table
 * invites somebody to go looking for the student's missing project.
 */
function toNextSession(session) {
  if (!session) return null;

  const details = [];
  if (session.teacher?.name) {
    details.push({
      id: 'teacher',
      label: 'Teacher',
      icon: 'teacher',
      value: session.teacher.name,
    });
  }
  if (session.cohort?.name) {
    details.push({
      id: 'class',
      label: 'Class',
      icon: 'users',
      value: session.cohort.name,
    });
  }
  if (session.location?.label) {
    details.push({
      id: 'location',
      label: 'Location',
      icon: 'location',
      value: session.location.label,
    });
  }

  /* FOUR MORE ROWS, ALL FROM class_session AND NONE INVENTED.
   *
   * The card had a visible gap under the time because only teacher and location
   * ever survived - a private appointment has no class group, which is most of
   * them. These four are what the table actually holds, so they fill it with
   * facts rather than with padding.
   *
   * Each is still omitted when null. A row reading "Spots: —" sends somebody
   * looking for a number that was never recorded. */

  if (typeof session.durationMinutes === 'number') {
    details.push({
      id: 'duration',
      label: 'Duration',
      icon: 'duration',
      value: `${session.durationMinutes} minutes`,
    });
  }

  if (session.kind) {
    details.push({
      id: 'kind',
      label: 'Type',
      icon: 'users',
      // WellnessLiving keeps classes and appointments in one table and tells
      // them apart by this field. The student-facing words are ours; the
      // distinction is theirs.
      value: session.kind === 'class' ? 'Group class' : 'Private session',
    });
  }

  /* SPOTS ONLY FOR A CLASS, AND ONLY WITH A REAL COUNT.
   *
   * A private appointment comes back capacity 1, booked_count null - and the
   * obvious `bookedCount ?? 0` renders "0 of 1 booked" to the one student who
   * is, demonstrably, booked. WellnessLiving simply does not count seats for
   * something that has one; the null is correct and the 0 was the lie. */
  if (
    session.kind === 'class' &&
    typeof session.capacity === 'number' &&
    typeof session.bookedCount === 'number'
  ) {
    details.push({
      id: 'spots',
      label: 'Spots',
      icon: 'seats',
      value: `${session.bookedCount} of ${session.capacity} booked`,
    });
  }

  /* Status is the one row that is always answerable, which is why it is here
   * rather than an end time: `local_end` is null on every appointment in this
   * business, and deriving it from start + duration would mean doing arithmetic
   * on a zone-less wall time - the exact class of guess this codebase keeps
   * refusing elsewhere. */
  details.push({
    id: 'status',
    label: 'Status',
    icon: session.isCancelled ? 'flag' : 'check',
    value: session.isCancelled ? 'Cancelled' : 'Confirmed',
  });

  const endsAt = session.localEnd ?? session.endsAt;
  if (endsAt) {
    const ends = timeLabel(endsAt);
    if (ends) {
      details.push({ id: 'ends', label: 'Ends', icon: 'clock', value: ends });
    }
  }

  const when = studioTime(session);

  return {
    id: session.id,
    /* WellnessLiving's own name for the session, e.g.
     * "Music For Everyone | Live Performance Instruction | 120 Minutes".
     *
     * It was reaching the API and stopping here, so the card showed a date with
     * nothing to say WHAT it was - the one thing a student most needs to read.
     * Passed through verbatim rather than split on the pipes: the parts are not
     * a fixed schema, and guessing which segment is the class and which is the
     * format would go wrong the first time a title has two segments or four. */
    title: session.title ?? null,
    dateLabel: when.date,
    // The zone label rides along with the time. Without it "10:00 AM" on a
    // screen in another country is a number the reader has to guess at, and the
    // guess is usually their own clock.
    timeLabel: when.zone ? `${when.time} ${when.zone}` : when.time,
    durationMinutes: session.durationMinutes ?? null,
    details,
  };
}

export function useLiveDashboard(studentId = DEMO_STUDENT_ID) {
  const [state, setState] = useState({
    isLive: false,
    loading: true,
    error: null,
    user: CURRENT_USER,
    dateLabel: DASHBOARD_DATE,
    chips: CONTEXT_CHIPS,
    nextSession: NEXT_SESSION,
    sessions: null,
  });

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();

    fetch(`/api/v1/students/${studentId}/dashboard`, { signal: controller.signal })
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => null);
          throw new Error(body?.error?.message ?? `Request failed (${res.status})`);
        }
        return res.json();
      })
      .then((data) => {
        if (cancelled) return;
        setState({
          isLive: true,
          loading: false,
          error: null,
          user: toUser(data.profile),
          // Today, formatted here rather than sent by the API. The dashboard
          // mounts only after a click, so this never renders on the server and
          // cannot produce a hydration mismatch.
          dateLabel:
            dateLabel(new Date().toISOString(), {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            }) ?? DASHBOARD_DATE,
          chips: toChips(data.context),
          // A student with nothing booked has no next session, and the card
          // must say so rather than fall back to somebody else's.
          nextSession: toNextSession(data.nextSession),
          sessions: data.sessions ?? null,
        });
      })
      .catch((error) => {
        if (cancelled || error.name === 'AbortError') return;
        // Fixtures stay on screen, but isLive stays false and the error is
        // carried out, so nothing can report mock data as real.
        setState((prev) => ({ ...prev, loading: false, error: error.message }));
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [studentId]);

  return state;
}
