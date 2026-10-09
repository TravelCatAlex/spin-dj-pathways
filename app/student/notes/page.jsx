'use client';

import { useEffect, useState } from 'react';

import Reveal from '../../components/atoms/Reveal';
import Card from '../../components/molecules/Card';
import Icon from '../../components/atoms/Icon';

/**
 * PAGE — /student/notes
 *
 * The public notes a teacher has written to this student, grouped by teacher.
 * Read-only: `/api/v1/students/me/notes` carries the viewer's JWT and migration
 * 0056's `teacher_note_student_select` returns exactly the public notes addressed
 * to them - private notes cannot appear, and there is nothing to filter here that
 * could get it wrong. A student reads these; they do not reply to or edit them,
 * and there is no write policy they could reach if they tried.
 *
 * No fixture fallback. The dashboard learned that a fetch failure rendering
 * fixtures looks like a working page with the wrong data on it, so an error says
 * so plainly instead.
 */

function formatWhen(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function StudentNotesPage() {
  const [state, setState] = useState({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const response = await fetch('/api/v1/students/me/notes');
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
        setState({ status: 'ready', teachers: body.teachers });
      } catch {
        if (!cancelled) setState({ status: 'error', code: 'fetch_failed' });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <Reveal as="h1" className="m-0 mb-5 text-left text-[24px] font-extrabold text-ink">
        Notes
      </Reveal>

      <Reveal inView>
        <Card>
          {state.status === 'loading' && <p className="text-sm text-muted">Loading your notes…</p>}

          {state.status === 'error' && (
            <p className="text-sm text-ink-soft">Your notes could not be loaded ({state.code}).</p>
          )}

          {state.status === 'ready' && state.teachers.length === 0 && (
            <p className="text-sm text-muted">No notes from your teachers yet.</p>
          )}

          {state.status === 'ready' && state.teachers.length > 0 && (
            <div className="flex flex-col gap-6">
              {state.teachers.map((teacher) => (
                <section key={teacher.teacher_id} className="flex flex-col gap-2">
                  <h2 className="flex items-center gap-2 text-sm font-semibold text-ink-soft">
                    <Icon name="note" size={14} />
                    {teacher.teacher_name ?? 'Your teacher'}
                  </h2>
                  <ul className="flex flex-col gap-3">
                    {teacher.notes.map((note) => (
                      <li key={note.id} className="rounded-lg border border-line p-3">
                        <p className="whitespace-pre-wrap text-sm text-ink">{note.body}</p>
                        <p className="mt-2 text-xs text-muted">{formatWhen(note.created_at)}</p>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          )}
        </Card>
      </Reveal>
    </>
  );
}
