'use client';

import TopBar from '../components/organisms/TopBar';
import Card from '../components/molecules/Card';

import NotesManager from './NotesManager';
import { useTeacherLive } from './TeacherShell';

/**
 * PAGE — /teacher
 *
 * The welcome line, then the notes for the view the sidebar has selected. The
 * shell (TeacherShell) owns the rail, the profile block and the sign-out; this
 * renders what sits in the main column: a greeting, and the Private or Public
 * notes depending on `view`.
 *
 * NotesManager is given its `kind` so each view shows one kind only - its compose
 * box writes that kind, and a public one carries the roster student picker.
 */
export default function TeacherPage() {
  const { user, loading, dateLabel, view } = useTeacherLive();

  return (
    <>
      <TopBar loading={loading} user={user} dateLabel={dateLabel} />
      <Card>
        <NotesManager kind={view} />
      </Card>
    </>
  );
}
