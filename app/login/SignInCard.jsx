'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { m } from 'motion/react';

import Logo from '../components/atoms/Logo';
import { gate, gateItem, gateButton, GATE_TIMES } from '../lib/motion';

/**
 * The sign-in card — email, then the code that was emailed.
 *
 * EVERY REFUSAL READS THE SAME, AND THAT IS THE DESIGN RATHER THAN LAZINESS.
 * Asking for a code always advances to the second stage and always says the
 * same sentence, whether the address is on one student record, on sixteen of
 * them, or on none. Measured 8 Oct 2026: 51 addresses in this database sit on
 * more than one student row, the worst is shared by 16, and 17 students have no
 * address at all. A form that answered differently would be a lookup service
 * for who attends this studio. An operator tells those cases apart in RUNBOOK
 * §10a, with the database in front of them; the screen never does.
 *
 * SIGNING IN NEVER CREATES AN ACCOUNT. The server sends `shouldCreateUser:
 * false`, so an address nobody holds gets exactly the silence a typo gets.
 *
 * The visual language is the role gate's, unchanged — same card, same logo,
 * same staggered entrance — because this is the same door with a real lock on
 * it, and relearning the screen is not part of what sign-in should cost.
 */

/** One sentence for every refusal. See the header. */
const REFUSED = 'That code did not work. Check it and try again, or send a new one.';

/** Said after a code is requested, whatever actually happened. */
const SENT = 'If that address is on your account, a six-digit code is on its way.';

/** Said only when the request never reached us, which is about the network. */
const UNREACHABLE = 'Could not reach the server. Check your connection and try again.';

export default function SignInCard({ next }) {
  const router = useRouter();

  const [stage, setStage] = useState('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [notice, setNotice] = useState(null);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  // The code field, focused when the stage changes. `autoFocus` as an attribute
  // only fires on mount, and this input mounts once and then stays.
  const codeRef = useRef(null);

  async function requestCode(event) {
    if (event) event.preventDefault();
    if (busy || email.trim() === '') return;

    setBusy(true);
    setError(null);

    try {
      // The answer is deliberately not inspected. That endpoint returns 202 for
      // every outcome, so there is nothing here worth branching on — and a
      // branch is exactly what would turn this screen into an oracle.
      await fetch('/auth/otp', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
    } catch {
      // A network failure is genuinely about the connection rather than about
      // any account, so it is the one thing that may say what went wrong.
      setError(UNREACHABLE);
      setBusy(false);
      return;
    }

    setNotice(SENT);
    setStage('code');
    setBusy(false);
    requestAnimationFrame(() => codeRef.current?.focus());
  }

  async function submitCode(event) {
    event.preventDefault();
    if (busy || code.trim() === '') return;

    setBusy(true);
    setError(null);

    let payload = null;

    try {
      const response = await fetch('/auth/verify', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), token: code.trim(), next }),
      });

      payload = await response.json().catch(() => null);

      if (!response.ok) {
        // A wrong code, an unknown address, an address shared by sixteen
        // students, an identity already linked to somebody else — the server
        // returns one status for all of them and this reads one sentence.
        setError(REFUSED);
        setCode('');
        setBusy(false);
        codeRef.current?.focus();
        return;
      }
    } catch {
      setError(UNREACHABLE);
      setBusy(false);
      return;
    }

    // replace, not push: the sign-in screen should not be a back-button step
    // once it has done its job. refresh() re-runs the server components with
    // the cookie that was just set, so the dashboard renders as this student
    // rather than as nobody.
    router.replace(payload?.next ?? '/student');
    router.refresh();
  }

  const onEmailStage = stage === 'email';

  return (
    // suppressHydrationWarning on this subtree, not decoration: extensions like
    // Bitdefender stamp attributes (bis_skin_checked) onto every div before
    // React hydrates, and React reports those as mismatches. React only
    // suppresses one level deep, so each wrapper needs its own.
    <m.div
      suppressHydrationWarning
      className="grid min-h-screen place-items-center bg-[linear-gradient(135deg,#faf8ff_0%,#e7dcff_100%)] p-6 text-center text-ink max-[380px]:p-4"
      variants={gate}
      initial="hidden"
      animate="show"
    >
      <div
        suppressHydrationWarning
        className="w-full max-w-[520px] rounded-[20px] border border-line bg-surface px-10 py-12 shadow-[0_24px_60px_rgba(124,58,237,0.14)] max-[520px]:px-6 max-[520px]:py-9"
      >
        {/* The logo is transparent and the card is white, so it needs no
            backing panel of its own. */}
        <m.div
          suppressHydrationWarning
          variants={gateItem}
          custom={GATE_TIMES.logo}
          initial="hidden"
          animate="show"
        >
          <Logo width={260} priority className="mx-auto mb-[26px]" />
        </m.div>

        <m.p
          suppressHydrationWarning
          className="m-0 mb-7 text-balance text-ink-soft"
          variants={gateItem}
          custom={GATE_TIMES.prompt}
          initial="hidden"
          animate="show"
        >
          {onEmailStage ? 'Enter the email address your studio has for you' : notice}
        </m.p>

        <form onSubmit={onEmailStage ? requestCode : submitCode}>
          {onEmailStage ? (
            <>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="mb-4 w-full rounded-[10px] border border-line bg-white px-4 py-3 text-center text-ink outline-none focus:border-purple"
              />
            </>
          ) : (
            <>
              <label htmlFor="code" className="sr-only">
                Six-digit code
              </label>
              <input
                id="code"
                name="code"
                ref={codeRef}
                // `one-time-code` is what lets a phone offer the code straight
                // from the notification instead of making someone switch apps
                // to read it and come back.
                autoComplete="one-time-code"
                inputMode="numeric"
                maxLength={6}
                required
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="000000"
                className="mb-4 w-full rounded-[10px] border border-line bg-white px-4 py-3 text-center text-[22px] tracking-[0.4em] text-ink outline-none focus:border-purple"
              />
            </>
          )}

          {/* aria-live, so a screen reader hears the refusal. Without it the
              message appears silently and the field simply empties.

              min-h is one line of text-sm, held whether or not there is a
              message. It is the only thing keeping the button still: let this
              collapse and a refusal shoves the button 20px down the screen,
              under a thumb already travelling toward where it used to be. */}
          <p
            role="status"
            aria-live="polite"
            className="m-0 mb-4 min-h-[1.25rem] text-sm text-rose-600"
          >
            {error}
          </p>

          <m.button
            suppressHydrationWarning
            type="submit"
            disabled={busy}
            className="w-full rounded-[10px] border-0 bg-purple px-[26px] py-[13px] font-bold text-white shadow-[0_3px_8px_rgba(124,58,237,0.22)] disabled:opacity-60"
            variants={gateButton}
            custom={GATE_TIMES.firstButton}
            initial="hidden"
            animate="show"
            whileHover={busy ? undefined : 'hover'}
            whileTap={busy ? undefined : 'tap'}
          >
            {onEmailStage
              ? busy
                ? 'Sending…'
                : 'Email me a code'
              : busy
                ? 'Checking…'
                : 'Sign in'}
          </m.button>
        </form>

        {!onEmailStage && (
          <div className="mt-5 flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm text-ink-soft">
            <button
              type="button"
              className="underline underline-offset-4 disabled:opacity-60"
              disabled={busy}
              onClick={requestCode}
            >
              Send another code
            </button>
            <button
              type="button"
              className="underline underline-offset-4 disabled:opacity-60"
              disabled={busy}
              onClick={() => {
                setStage('email');
                setCode('');
                setError(null);
                setNotice(null);
              }}
            >
              Use a different address
            </button>
          </div>
        )}
      </div>
    </m.div>
  );
}
