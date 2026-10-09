import { requireRole } from '../lib/require-role';

/**
 * LAYOUT — /teacher
 *
 * The guard, and nothing else. `requireRole` sends a student here to `/student`
 * and an unlinked identity to `/unlinked`, so by the time children render the
 * viewer is a teacher.
 *
 * IT IS NAVIGATION, NOT PROTECTION. A student who reached this page anyway
 * would see an empty roster, because `app.current_teacher_id()` is NULL for them
 * and every policy in migration 0055 compares with `=`. The redirect is so they
 * get their own dashboard instead of a correct-but-blank one.
 */
export default async function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireRole('teacher');

  return <>{children}</>;
}
