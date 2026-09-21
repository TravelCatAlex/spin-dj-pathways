import { redirect } from 'next/navigation';

/**
 * The app has no home of its own — routing starts at the role gate, the same
 * screen that used to be the initial state of the single page this app was.
 */
export default function RootPage() {
  redirect('/login');
}
