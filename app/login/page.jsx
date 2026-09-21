'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { m } from 'motion/react';

import Logo from '../components/atoms/Logo';
import { gate, gateItem, gateButton, GATE_TIMES } from '../lib/motion';

const ROLES = ['student', 'teacher', 'organization'];

/** Role → the section that role lands in. */
const ROLE_HOME = {
  student: '/student',
  teacher: '/teacher',
  organization: '/organization',
};

/**
 * PAGE — /login
 *
 * The role gate, unchanged in appearance and now an address. It was state
 * inside SpinDJDashboard, which meant a refresh threw you back to it, no
 * screen could be linked to, and the browser's back button did nothing.
 *
 * THIS IS A ROLE PICKER, NOT AUTHENTICATION. There is no password, no
 * session and no guard: anyone can type /student directly. It is called
 * /login because that is where sign-in goes when it lands — at which point
 * the buttons below become a form and the sections get a real gate.
 *
 * Each element carries its own delay through `custom`. Nested staggerChildren
 * did not survive this tree — the buttons sit two containers down and
 * rendered fully visible from the first frame while the prompt never started.
 * Explicit delays cannot skip a level.
 */
export default function LoginPage() {
  const router = useRouter();

  // Once the opening sequence is done the buttons rest on a delay-free
  // variant, so releasing a hover snaps them back instead of replaying the
  // entrance delay. GATE_TIMES drives both, so they cannot drift apart.
  const [entered, setEntered] = useState(false);

  // The three destinations, warmed while the gate animates in. router.push
  // does not prefetch the way <Link> does, so without this the first click
  // waits on the route's JavaScript — about the one moment on this screen
  // where a delay is visible.
  useEffect(() => {
    for (const path of Object.values(ROLE_HOME)) router.prefetch(path);
  }, [router]);

  return (
    // suppressHydrationWarning on this subtree, not decoration: extensions
    // like Bitdefender stamp attributes (bis_skin_checked) onto every div
    // before React hydrates, and React reports those as mismatches. React
    // only suppresses one level deep, so each wrapper needs its own.
    <m.div
      suppressHydrationWarning
      className="grid min-h-screen place-items-center bg-[linear-gradient(135deg,#faf8ff_0%,#e7dcff_100%)] p-6 text-center text-ink"
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
          className="m-0 mb-9 text-ink-soft"
          variants={gateItem}
          custom={GATE_TIMES.prompt}
          initial="hidden"
          animate="show"
        >
          Select your role to continue
        </m.p>

        <div suppressHydrationWarning className="flex flex-wrap justify-center gap-3">
          {ROLES.map((role, idx) => (
            <m.button
              key={role}
              suppressHydrationWarning
              type="button"
              className="rounded-[10px] border-0 bg-purple px-[26px] py-[13px] font-bold capitalize text-white shadow-[0_3px_8px_rgba(124,58,237,0.22)]"
              variants={gateButton}
              custom={GATE_TIMES.firstButton + idx * GATE_TIMES.betweenButtons}
              initial="hidden"
              animate={entered ? 'rest' : 'show'}
              // The last button to arrive ends the sequence, which moves them
              // all onto the delay-free resting variant.
              onAnimationComplete={
                idx === ROLES.length - 1 ? () => setEntered(true) : undefined
              }
              whileHover="hover"
              whileTap="tap"
              onClick={() => router.push(ROLE_HOME[role])}
            >
              {role}
            </m.button>
          ))}
        </div>
      </div>
    </m.div>
  );
}
