'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, LazyMotion, MotionConfig, domMax, m } from 'motion/react';

import Logo from './atoms/Logo';
import StudentDashboardPage from './pages/StudentDashboardPage';
import { gate, gateItem, gateButton, GATE_TIMES } from '../lib/motion';

const ROLES = ['student', 'teacher', 'organization'];

/**
 * Role gate. Student resolves to the full dashboard; the other roles are
 * out of scope for this milestone.
 *
 * AnimatePresence wraps the swap so choosing a role is a handoff rather than
 * a hard cut: the gate fades back, and only once it has left does the
 * dashboard mount and run its own stagger. Without the presence boundary
 * React would unmount the gate the instant state changed and there would be
 * nothing left to animate out.
 *
 * domMax rather than domAnimation: the sidebar's active pill uses layoutId,
 * and layout animations are not part of the smaller feature bundle.
 *
 * Each element below carries its own delay through `custom`. Nested
 * staggerChildren did not survive this tree — the buttons sit two containers
 * down and rendered fully visible from the first frame while the prompt never
 * started. Explicit delays cannot skip a level.
 */
export default function SpinDJDashboard() {
  const [role, setRole] = useState(null);
  // Once the opening sequence is done the buttons rest on a delay-free
  // variant, so releasing a hover snaps them back instead of replaying the
  // entrance delay. GATE_TIMES drives both, so they cannot drift apart.
  const [entered, setEntered] = useState(false);

  // Re-armed whenever the gate comes back, not just on first mount. Logging
  // out returns to this screen with the component still mounted, so a
  // mount-only reset left `entered` true and the buttons appeared already
  // finished — the sequence only played after a full reload.
  //
  // Only the reset lives here now. Flipping it back on is the last button's
  // job, via onAnimationComplete: the sequence reports that it has finished
  // rather than a timer predicting when it will. That removes the guess — and
  // the `+ 0.3` fudge that went with it — so retuning the delays or running
  // on a slow device cannot leave the two out of step.
  useEffect(() => {
    if (!role) setEntered(false);
  }, [role]);

  const dashboard =
    role === 'student' ? (
      <StudentDashboardPage onLogout={() => setRole(null)} />
    ) : (
      <div className="min-w-0 flex-1 px-[30px] pb-12 pt-[26px] max-[980px]:px-[18px] max-[980px]:pb-10 max-[980px]:pt-[22px]">
        <h1 className="m-0 mb-5 text-left text-[24px] font-extrabold text-ink">
          {role === 'teacher' ? 'Teacher' : 'Organization'} Dashboard
        </h1>
        <div className="mb-5 rounded-lg border border-dashed border-line bg-surface px-6 py-14 text-center text-muted">
          Coming soon
        </div>
        <button
          type="button"
          className="inline-flex items-center justify-center gap-1.5 rounded-[10px] border border-transparent bg-purple px-[15px] py-[9px] text-[13px] font-semibold text-white shadow-[0_6px_16px_rgba(124,58,237,0.26)] transition-[transform,background-color] duration-150 ease-out hover:bg-purple-600 active:translate-y-px"
          onClick={() => setRole(null)}
        >
          Change Role
        </button>
      </div>
    );

  return (
    <LazyMotion features={domMax}>
      <MotionConfig reducedMotion="user">
        <AnimatePresence mode="wait">
          {!role ? (
            // suppressHydrationWarning on this subtree, not decoration:
            // extensions like Bitdefender stamp attributes (bis_skin_checked)
            // onto every div before React hydrates, and React reports those as
            // mismatches. React only suppresses one level deep, so each
            // wrapper needs its own.
            //
            // This is the whole exposed surface: hydration runs once, against
            // the initially server-rendered tree, and that is the role screen.
            // Everything past it renders after a click — client-side only,
            // never hydrated — so no dashboard element can produce it.
            <m.div
              key="gate"
              suppressHydrationWarning
              className="grid min-h-screen place-items-center bg-[linear-gradient(135deg,#faf8ff_0%,#e7dcff_100%)] p-6 text-center text-ink"
              variants={gate}
              initial="hidden"
              animate="show"
              exit="exit"
            >
              <div
                suppressHydrationWarning
                className="w-full max-w-[520px] rounded-[20px] border border-line bg-surface px-10 py-12 shadow-[0_24px_60px_rgba(124,58,237,0.14)] max-[520px]:px-6 max-[520px]:py-9"
              >
                {/* The logo is transparent and the card is white, so it needs
                    no backing panel of its own. */}
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

                <div
                  suppressHydrationWarning
                  className="flex flex-wrap justify-center gap-3"
                >
                  {ROLES.map((r, idx) => (
                    <m.button
                      key={r}
                      suppressHydrationWarning
                      type="button"
                      className="rounded-[10px] border-0 bg-purple px-[26px] py-[13px] font-bold capitalize text-white shadow-[0_3px_8px_rgba(124,58,237,0.22)]"
                      variants={gateButton}
                      custom={
                        GATE_TIMES.firstButton + idx * GATE_TIMES.betweenButtons
                      }
                      initial="hidden"
                      animate={entered ? 'rest' : 'show'}
                      // The last button to arrive ends the sequence, which
                      // moves them all onto the delay-free resting variant.
                      onAnimationComplete={
                        idx === ROLES.length - 1
                          ? () => setEntered(true)
                          : undefined
                      }
                      whileHover="hover"
                      whileTap="tap"
                      onClick={() => setRole(r)}
                    >
                      {r}
                    </m.button>
                  ))}
                </div>
              </div>
            </m.div>
          ) : (
            <m.div
              key="app"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { duration: 0.3 } }}
            >
              {dashboard}
            </m.div>
          )}
        </AnimatePresence>
      </MotionConfig>
    </LazyMotion>
  );
}
