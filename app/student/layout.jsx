import { requireRole } from '../lib/require-role';
import StudentShell from './StudentShell';

/**
 * LAYOUT — /student
 *
 * A SERVER COMPONENT SINCE 9 OCT 2026, and only so that `requireRole` can run
 * here. The sidebar, the tab routing and the sign-out are unchanged and live in
 * StudentShell beside this file; a layout cannot be both `'use client'` and
 * `await` a guard, which is the whole reason for the split.
 *
 * THE GUARD IS NAVIGATION, NOT PROTECTION. A teacher who reaches `/student`
 * already sees nothing here - migration 0053's `student_self_select` resolves
 * `app.current_student_id()`, which is NULL for them, so the dashboard route
 * answers `no_student_for_session`. This sends them to `/teacher` instead, so
 * the result is their own portal rather than a correct-but-blank one.
 *
 * Next keeps a layout mounted while you navigate within it, so this costs one
 * query on entry to the section rather than one per tab - and the fetch in
 * LiveDashboardProvider still runs once, as before.
 */
export default async function StudentLayout({ children }) {
  await requireRole('student');

  return <StudentShell>{children}</StudentShell>;
}
