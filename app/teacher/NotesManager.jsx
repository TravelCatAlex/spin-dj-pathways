'use client';

import { useEffect, useState } from 'react';

import Button from '../components/atoms/Button';
import Icon from '../components/atoms/Icon';

import { useTeacherLive } from './TeacherShell';

/**
 * One kind of note at a time: `kind` is 'private' or 'public', chosen by the
 * sidebar view. A private note is personal; a public note is about one student
 * from the roster and is the only kind that student will ever see.
 *
 * NOTHING HERE DECIDES WHO MAY DO WHAT. Every call carries the viewer's JWT and
 * migration 0056's policies answer underneath - author-only writes, and the roster
 * rule on a public note. A refused public note (a student off the roster) comes
 * back as `not_allowed` and is shown, not pre-empted here. The student picker is
 * fed from the roster the shell already loaded, so an addressable student is one
 * the database will also accept.
 *
 * The "Add note" button is NOT disabled on an empty form, on purpose: a disabled
 * button says nothing about WHY. It is clickable, and a click with nothing typed
 * (or no student chosen for a public note) answers with the reason instead.
 */

function formatWhen(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function NotesManager({ kind }) {
  const isPublic = kind === 'public';
  const { students } = useTeacherLive();

  const [state, setState] = useState({ status: 'loading' });

  // Compose.
  const [studentId, setStudentId] = useState('');
  const [body, setBody] = useState('');
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState(null);

  // Edit — `savingId` drives the Save button's "Saving…" state.
  const [editingId, setEditingId] = useState(null);
  const [editingBody, setEditingBody] = useState('');
  const [savingId, setSavingId] = useState(null);

  // Delete — a two-step inline confirm; `deletingId` drives "Deleting…".
  const [confirmingId, setConfirmingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  async function loadNotes() {
    try {
      const response = await fetch('/api/v1/notes');
      if (response.status === 401) {
        window.location.href = '/login';
        return;
      }
      const data = await response.json();
      if (!response.ok) {
        setState({ status: 'error', code: data?.error?.code ?? 'unknown' });
        return;
      }
      setState({ status: 'ready', notes: data.notes });
    } catch {
      setState({ status: 'error', code: 'fetch_failed' });
    }
  }

  useEffect(() => {
    loadNotes();
  }, []);

  async function createNote(event) {
    event.preventDefault();
    if (busy) return;

    // Validate on submit, so the message says what is missing rather than the
    // button simply refusing to react.
    if (body.trim() === '') {
      setFormError('Please enter a note.');
      return;
    }
    if (isPublic && studentId === '') {
      setFormError('Please choose a student for this note.');
      return;
    }

    setBusy(true);
    setFormError(null);

    try {
      const response = await fetch('/api/v1/notes', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          visibility: kind,
          student_id: isPublic ? studentId : null,
          body,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        setFormError(data?.error?.message ?? 'That did not save.');
        setBusy(false);
        return;
      }
      setBody('');
      setStudentId('');
      setBusy(false);
      await loadNotes();
    } catch {
      setFormError('Could not reach the server.');
      setBusy(false);
    }
  }

  async function saveEdit(id) {
    if (editingBody.trim() === '' || savingId !== null) return;
    setSavingId(id);
    try {
      const response = await fetch(`/api/v1/notes/${id}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ body: editingBody }),
      });
      if (response.ok) {
        setEditingId(null);
        setEditingBody('');
        await loadNotes();
      }
    } finally {
      setSavingId(null);
    }
  }

  async function confirmDelete(id) {
    if (deletingId !== null) return;
    setDeletingId(id);
    try {
      const response = await fetch(`/api/v1/notes/${id}`, { method: 'DELETE' });
      if (response.ok) {
        setConfirmingId(null);
        await loadNotes();
      }
    } finally {
      setDeletingId(null);
    }
  }

  // Only this view's kind.
  const notes =
    state.status === 'ready' ? state.notes.filter((n) => n.visibility === kind) : [];

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold text-ink">
          {isPublic ? 'Public notes' : 'Private notes'}
        </h2>
        <p className="text-sm text-muted">
          {isPublic
            ? 'Shared with the one student each note is about. Only they can see it.'
            : 'Personal notes, visible only to you.'}
        </p>
      </header>

      {/* Compose */}
      <form onSubmit={createNote} className="flex flex-col gap-3 rounded-lg border border-line p-4">
        <textarea
          value={body}
          onChange={(e) => {
            setBody(e.target.value);
            if (formError) setFormError(null);
          }}
          placeholder={isPublic ? 'Write a note to a student…' : 'Write a private note…'}
          rows={3}
          className="w-full resize-y rounded-[10px] border border-line bg-white px-3 py-2 text-sm text-ink outline-none focus:border-purple"
        />

        <div className="flex flex-wrap items-center gap-3">
          {isPublic && (
            <select
              value={studentId}
              onChange={(e) => {
                setStudentId(e.target.value);
                if (formError) setFormError(null);
              }}
              className="min-w-0 flex-1 rounded-[10px] border border-line bg-white px-3 py-2 text-sm text-ink outline-none focus:border-purple max-[480px]:w-full max-[480px]:flex-none"
            >
              <option value="">Choose a student…</option>
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.name ?? student.email ?? 'Unnamed student'}
                </option>
              ))}
            </select>
          )}

          <div className={isPublic ? '' : 'ml-auto'}>
            <Button type="submit" disabled={busy}>
              {busy ? 'Saving…' : 'Add note'}
            </Button>
          </div>
        </div>

        {isPublic && students.length === 0 && (
          <p className="text-xs text-muted">
            No students on your roster yet — a public note needs someone who has
            attended one of your sessions.
          </p>
        )}
        {formError && <p className="text-sm text-rose-600">{formError}</p>}
      </form>

      {/* List */}
      {state.status === 'loading' && <p className="text-sm text-muted">Loading your notes…</p>}

      {state.status === 'error' && (
        <p className="text-sm text-ink-soft">Your notes could not be loaded ({state.code}).</p>
      )}

      {state.status === 'ready' && notes.length === 0 && (
        <p className="text-sm text-muted">
          {isPublic ? 'No public notes yet.' : 'No private notes yet.'}
        </p>
      )}

      {state.status === 'ready' && notes.length > 0 && (
        <ul className="flex flex-col gap-3">
          {notes.map((note) => {
            const editing = editingId === note.id;
            const confirming = confirmingId === note.id;

            return (
              <li key={note.id} className="rounded-lg border border-line p-3">
                <div className="mb-1.5 flex items-center justify-between gap-3">
                  <span className="flex min-w-0 items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted">
                    <Icon name={isPublic ? 'users' : 'note'} size={13} />
                    <span className="truncate">
                      {isPublic ? (note.student_name ?? 'student') : 'Private'}
                    </span>
                  </span>

                  {/* Actions live top-right, as an aligned pair, so every note's
                      Edit and Delete sit in the same place instead of trailing
                      under a body of unpredictable length. Hidden while editing -
                      the edit form carries its own Save / Cancel. */}
                  {!editing && !confirming && (
                    <div className="flex shrink-0 items-center gap-1">
                      <button
                        type="button"
                        aria-label="Edit note"
                        className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-ink-soft transition-colors hover:bg-purple-50 hover:text-purple"
                        onClick={() => {
                          setEditingId(note.id);
                          setEditingBody(note.body);
                          setConfirmingId(null);
                        }}
                      >
                        <Icon name="edit" size={13} /> Edit
                      </button>
                      <button
                        type="button"
                        aria-label="Delete note"
                        className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-ink-soft transition-colors hover:bg-rose-50 hover:text-rose-600"
                        onClick={() => {
                          setConfirmingId(note.id);
                          setEditingId(null);
                        }}
                      >
                        <Icon name="trash" size={13} /> Delete
                      </button>
                    </div>
                  )}
                </div>

                {editing ? (
                  <div className="flex flex-col gap-2">
                    <textarea
                      value={editingBody}
                      onChange={(e) => setEditingBody(e.target.value)}
                      rows={3}
                      className="w-full resize-y rounded-[10px] border border-line bg-white px-3 py-2 text-sm text-ink outline-none focus:border-purple"
                    />
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        onClick={() => saveEdit(note.id)}
                        disabled={savingId === note.id}
                      >
                        {savingId === note.id ? 'Saving…' : 'Save'}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        disabled={savingId === note.id}
                        onClick={() => {
                          setEditingId(null);
                          setEditingBody('');
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="whitespace-pre-wrap text-sm text-ink">{note.body}</p>

                    {confirming ? (
                      <div className="mt-2 flex flex-wrap items-center gap-2 rounded-md bg-rose-50 px-3 py-2">
                        <span className="text-xs text-rose-700">Delete this note?</span>
                        <div className="ml-auto flex gap-2">
                          <button
                            type="button"
                            className="rounded-md bg-rose-600 px-3 py-1 text-xs font-semibold text-white transition-colors hover:bg-rose-700 disabled:opacity-60"
                            disabled={deletingId === note.id}
                            onClick={() => confirmDelete(note.id)}
                          >
                            {deletingId === note.id ? 'Deleting…' : 'Delete'}
                          </button>
                          <button
                            type="button"
                            className="rounded-md border border-line bg-surface px-3 py-1 text-xs text-ink-soft transition-colors hover:border-purple hover:text-purple disabled:opacity-60"
                            disabled={deletingId === note.id}
                            onClick={() => setConfirmingId(null)}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="mt-2 text-xs text-muted">{formatWhen(note.created_at)}</p>
                    )}
                  </>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
