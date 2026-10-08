import SignInCard from './SignInCard';

/**
 * PAGE — /login
 *
 * A SERVER SHELL AROUND A CLIENT FORM, and the split is not ceremony. `next`
 * arrives in the query string, and reading it inside a client component means
 * `useSearchParams()`, which opts the whole route into client-side rendering
 * unless it is wrapped in Suspense. Reading it here instead costs one file and
 * keeps the card a plain component that takes a prop.
 *
 * It also puts the open-redirect check on the server, before the value reaches
 * anything that could navigate with it.
 *
 * WHAT THIS REPLACED. Until sign-in landed, /login was a role picker: three
 * buttons that pushed you to /student, /teacher or /organization with no
 * password, no session and no guard. Those two other sections still exist at
 * their own addresses and are still reachable by typing them; what they no
 * longer have is a front door, because the portal's front door is now a
 * student's sign-in. Giving staff their own is a separate piece of work.
 */
export const dynamic = 'force-dynamic';

/**
 * ONLY A PATH ON THIS ORIGIN. A `next` that starts `//` is a protocol-relative
 * URL pointing at somebody else's host, and a sign-in form that forwards to it
 * is the standard way to make a phishing page wear your domain. The verify
 * route repeats this check, because this one is a convenience and that one is
 * the boundary.
 */
function safeNext(value) {
  if (typeof value !== 'string') return null;
  if (!value.startsWith('/') || value.startsWith('//')) return null;
  return value;
}

export default async function LoginPage({ searchParams }) {
  const params = await searchParams;
  return <SignInCard next={safeNext(params?.next)} />;
}
