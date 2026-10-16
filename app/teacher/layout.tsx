import { requireRole } from '../lib/require-role';
import TeacherShell from './TeacherShell';

/**
 * LAYOUT — /teacher
 *
 * A SERVER COMPONENT so `requireRole` can run here - the same split the student
 * layout made. The guard sends a student to `/student` and an unlinked identity
 * to `/unlinked`, so by the time TeacherShell renders the viewer is a teacher.
 * The shell (sidebar, nav, profile, sign-out) is a client component beside this
 * file, because a layout cannot both `await` a guard and be `'use client'`.
 *
 * IT IS NAVIGATION, NOT PROTECTION. A student who reached this page anyway would
 * see empty lists, because `app.current_teacher_id()` is NULL for them and every
 * policy compares with `=`. The redirect is so they get their own dashboard
 * instead of a correct-but-blank one.
 */
export default async function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireRole('teacher');

  return <TeacherShell>{children}</TeacherShell>;
}
