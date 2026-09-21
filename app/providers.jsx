'use client';

import { LazyMotion, MotionConfig, domMax } from 'motion/react';

/**
 * Motion features for the whole app, mounted once at the root.
 *
 * This used to sit inside SpinDJDashboard, which was the only route there
 * was. Now the role gate and every dashboard tab are their own route, so no
 * component sits above all of them except the root layout — and LazyMotion
 * has to, because a feature bundle loaded per route would be re-fetched on
 * every navigation.
 *
 * domMax rather than domAnimation: the sidebar's active pill uses layoutId,
 * and layout animations are not part of the smaller feature bundle.
 *
 * reducedMotion="user" honours the OS setting for every descendant at once.
 */
export default function Providers({ children }) {
  return (
    <LazyMotion features={domMax}>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </LazyMotion>
  );
}
