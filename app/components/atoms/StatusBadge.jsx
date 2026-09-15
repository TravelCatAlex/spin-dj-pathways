'use client';

import { m } from 'motion/react';

/**
 * ATOM — StatusBadge
 * Green for completed work, amber for anything still in flight.
 *
 * Only the in-flight badge breathes. A finished creation is finished — motion
 * on it would be decoration, whereas a slow pulse on the amber one marks the
 * single creation still being worked on. That makes the movement information
 * rather than ornament, and keeps one thing moving instead of three.
 *
 * Opacity only, never scale. This badge is small, text-bearing and pinned to
 * a corner: scaling it resamples the type every frame and nudges its edges by
 * a sub-pixel, which reads as a 1px horizontal twitch rather than a pulse.
 * Fading leaves the geometry untouched, so it breathes instead of wobbling.
 */
export default function StatusBadge({ status }) {
  if (!status) return null;

  const inProgress = status !== 'Completed';

  return (
    <m.span
      className={`absolute bottom-2 left-2 z-[1] rounded-[5px] px-2 py-[3px] text-[10px] font-bold text-white ${
        inProgress ? 'bg-amber' : 'bg-green'
      }`}
      animate={inProgress ? { opacity: [1, 0.68, 1] } : { opacity: 1 }}
      transition={
        inProgress
          ? { duration: 2.2, ease: 'easeInOut', repeat: Infinity, repeatDelay: 0.6 }
          : { duration: 0 }
      }
    >
      {status}
    </m.span>
  );
}
