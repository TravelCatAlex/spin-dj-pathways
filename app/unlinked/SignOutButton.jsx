'use client';

import { useRouter } from 'next/navigation';

/**
 * POST, not GET — the rule the student layout states: a GET sign-out can be
 * fired by any <img> on any page. The navigation happens whether or not the
 * request succeeded, because leaving somebody stuck here to report a failure is
 * worse than doing the local half quietly.
 */
export default function SignOutButton() {
  const router = useRouter();

  async function signOut() {
    try {
      await fetch('/auth/signout', { method: 'POST' });
    } catch {
      // Deliberately swallowed. See above.
    }
    router.replace('/login');
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={signOut}
      className="self-start rounded-md border border-line bg-surface px-4 py-2 text-sm font-medium text-ink shadow-sm"
    >
      Sign out
    </button>
  );
}
