import SignOutButton from './SignOutButton';

/**
 * PAGE — /unlinked
 *
 * A signed-in human the database cannot place: an `app.identity` row carrying
 * neither `student_id` nor `teacher_id`.
 *
 * WHY THIS PAGE EXISTS AT ALL, rather than a redirect. Every other destination
 * loops. `/login` bounces signed-in visitors to `/student`, whose guard finds no
 * student role and sends them back; `/student` and `/teacher` are the two places
 * this person does not belong. So the one honest answer is a page outside every
 * guarded prefix that says what happened and offers the way out.
 *
 * It should be unreachable. `/auth/verify` signs out any session it could not
 * link to exactly one identity, so arriving here means the role was removed
 * after that. RUNBOOK §10a is where an operator tells the cases apart with the
 * database in front of them.
 */
export const metadata = { title: 'Account not linked' };

export default function UnlinkedPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-4 px-6">
      <h1 className="text-xl font-semibold text-ink">This account is not linked</h1>
      <p className="text-sm leading-relaxed text-ink-soft">
        You are signed in, but this account is not attached to a student or a
        teacher record, so there is nothing to show you. The studio can put that
        right — tell them the email address you signed in with.
      </p>
      <SignOutButton />
    </main>
  );
}
