import Card from '../components/molecules/Card';

import RosterView from './RosterView';

/**
 * PAGE — /teacher
 *
 * The roster: the students who attended a session this teacher is named on, and
 * those sessions. Read-only, because migration 0055 is read-only - there is no
 * write policy behind any of this and task 032 scoped attendance marking out
 * deliberately.
 *
 * The fetch lives in the client component beside this file rather than here, so
 * the page can render its frame immediately and the roster can show its own
 * loading and error states - the same shape the student dashboard uses.
 */
export const metadata = { title: 'Roster' };

export default function TeacherPage() {
  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-5 px-6 py-8 max-[560px]:px-4">
      <Card>
        <RosterView />
      </Card>
    </main>
  );
}
