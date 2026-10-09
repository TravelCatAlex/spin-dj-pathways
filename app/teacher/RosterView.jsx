'use client';

import { useEffect, useState } from 'react';

/**
 * The roster, fetched as the viewer.
 *
 * NOTHING HERE DECIDES WHO IS SHOWN. `/api/v1/teachers/me/roster` carries the
 * viewer's own JWT and migration 0055's policies answer underneath it, so this
 * component renders whatever came back and has no filtering of its own to get
 * wrong. There is no teacher id to pass and none to tamper with.
 *
 * A 401 sends them to sign in rather than falling back to anything. The student
 * dashboard learned that the hard way: a fetch failure used to render fixtures,
 * so a broken route looked like a working page with somebody else's data on it.
 */
export default function RosterView() {
  const [state, setState] = useState({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const response = await fetch('/api/v1/teachers/me/roster');

        if (response.status === 401) {
          window.location.href = '/login';
          return;
        }

        const body = await response.json();

        if (cancelled) return;

        if (!response.ok) {
          setState({ status: 'error', code: body?.error?.code ?? 'unknown' });
          return;
        }

        setState({ status: 'ready', data: body });
      } catch {
        if (!cancelled) setState({ status: 'error', code: 'fetch_failed' });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  if (state.status === 'loading') {
    return <p className="text-sm text-muted">Loading the roster…</p>;
  }

  if (state.status === 'error') {
    // The code is shown on purpose. RUNBOOK §10a is written against these codes,
    // and "something went wrong" sends a teacher to support with nothing.
    return (
      <p className="text-sm text-ink-soft">
        The roster could not be loaded ({state.code}).
      </p>
    );
  }

  const { teacher, students, sessions } = state.data;

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-lg font-semibold text-ink">
          {teacher?.name ? `${teacher.name}’s roster` : 'Your roster'}
        </h1>
        <p className="text-sm text-muted">
          {students.length === 0
            ? 'Nobody has attended one of your sessions yet.'
            : `${students.length} student${students.length === 1 ? '' : 's'} across ${sessions.length} session${sessions.length === 1 ? '' : 's'}.`}
        </p>
      </header>

      {students.length > 0 && (
        <section className="flex flex-col gap-2">
          <h2 className="text-sm font-semibold text-ink-soft">Students</h2>
          <ul className="divide-y divide-line">
            {students.map((student) => (
              <li
                key={student.id}
                className="flex items-baseline justify-between gap-4 py-2"
              >
                <span className="text-sm text-ink">
                  {student.name ?? 'Name not recorded'}
                  {/* The address is how a studio tells two Jacks apart. */}
                  {student.email && (
                    <span className="ml-2 text-xs text-muted">{student.email}</span>
                  )}
                </span>
                <span className="shrink-0 text-xs text-muted">
                  {student.sessions_attended} attended
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {sessions.length > 0 && (
        <section className="flex flex-col gap-2">
          <h2 className="text-sm font-semibold text-ink-soft">Sessions</h2>
          <ul className="divide-y divide-line">
            {sessions.map((session) => (
              <li key={session.id} className="flex flex-col gap-0.5 py-2">
                <span className="text-sm text-ink">
                  {session.title ?? 'Untitled session'}
                  {session.cohort && (
                    <span className="ml-2 text-xs text-muted">{session.cohort}</span>
                  )}
                </span>
                <span className="text-xs text-muted">
                  {/*
                    local_start is the STUDIO's wall time, stored as
                    WellnessLiving sent it. Rendering starts_at here would show
                    the viewer's timezone, which is nobody's class time - it read
                    7:30 PM in Ahmedabad for a 10:00 AM New York session.
                  */}
                  {session.local_start ?? 'Time not recorded'}
                  {session.timezone_label ? ` ${session.timezone_label}` : ''}
                  {' · '}
                  {session.attended} attended
                  {session.no_shows > 0 ? `, ${session.no_shows} no-show` : ''}
                  {session.is_cancelled ? ' · cancelled' : ''}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
