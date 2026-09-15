'use client';

import {
  AnimatePresence,
  LazyMotion,
  MotionConfig,
  domAnimation,
  m,
} from 'motion/react';
import { group, view } from '../../lib/motion';

/**
 * MOLECULE — Stagger
 * Runs its <Reveal> children in sequence and re-runs whenever `trigger`
 * changes, which is how switching tabs animates the new view in.
 *
 * No initial={false} on AnimatePresence. It is passed down through
 * PresenceContext, so every motion component beneath it — including the
 * inner stagger and its children — skips its initial on the first render.
 * That first render is the moment the dashboard is reached after choosing a
 * role, so the home page arrived fully formed while every later tab switch
 * animated correctly. The role gate's own exit has already finished by then
 * (SpinDJDashboard also uses mode="wait"), so nothing double-animates.
 *
 * Two nested elements, deliberately. AnimatePresence waits for the whole
 * exiting subtree to finish before mounting the next view, and several
 * Reveals drive themselves with `whileInView` — those are detached from the
 * parent's variant tree, so when the exit was a variant on the staggering
 * element itself the presence never resolved and the content froze on the old
 * tab while the sidebar moved on.
 *
 * So the outer element owns enter/exit with plain values and no variants,
 * and the inner one owns the stagger. The exit is then a single self-contained
 * tween that cannot wait on anything.
 *
 * LazyMotion + the `m` component load only the features these animations use
 * (~6kb) instead of motion's full bundle — the page already carries six WebP
 * images, so the saving is worth the one extra wrapper.
 *
 * reducedMotion="user" honours the OS setting for every descendant at once:
 * transforms are dropped and opacity is kept. Doing it here rather than in
 * each variant keeps the server and client markup identical, which a media
 * query read during render would not.
 */
export default function Stagger({ trigger, className = '', children }) {
  return (
    <LazyMotion features={domAnimation}>
      <MotionConfig reducedMotion="user">
        <AnimatePresence mode="wait">
          <m.div
            key={trigger}
            className={className}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.18 } }}
            exit={view.exit}
          >
            <m.div variants={group(0.12)} initial="hidden" animate="show">
              {children}
            </m.div>
          </m.div>
        </AnimatePresence>
      </MotionConfig>
    </LazyMotion>
  );
}
