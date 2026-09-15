'use client';

import { m } from 'motion/react';

import Icon from './Icon';
import { stepNode, tickDraw } from '../../lib/motion';

const STATES = {
  // Completed: solid violet disc, white tick.
  done: 'bg-purple text-white',
  // Current: white disc with the stage's own icon, lifted by a halo.
  current:
    'bg-white text-purple-700 ring-4 ring-white/25 shadow-[0_2px_10px_rgba(0,0,0,0.25)]',
  // Upcoming: hollow, the icon only hinted at.
  todo: 'border-2 border-white/30 text-white/45',
};

/**
 * ATOM — StepDot
 * One node of the project timeline. state: done | current | todo.
 * Completed nodes show a tick; the rest show the stage's own icon, so the
 * timeline reads as a sequence of activities rather than anonymous dots.
 *
 * Entrance and hover come from the step wrapper in Stepper, which broadcasts
 * the variant and the node's own delay — this only declares how it moves.
 * The size and colour changes stay in CSS, so the two never write `transform`
 * at the same time.
 */
export default function StepDot({
  state = 'todo',
  icon,
  label,
  delay = 0,
  onArrived,
}) {
  const isCurrent = state === 'current';
  const isDone = state === 'done';

  return (
    <m.div
      role="listitem"
      className={`relative grid shrink-0 place-items-center rounded-full transition-[width,height,background-color,border-color,color] duration-200 ${
        isCurrent ? 'h-8 w-8' : 'h-7 w-7'
      } ${STATES[state] ?? STATES.todo}`}
      title={label}
      aria-current={isCurrent ? 'step' : undefined}
      variants={stepNode}
      // Fires when this node finishes its entrance, which is how Stepper
      // knows the build is over without timing it.
      onAnimationComplete={onArrived}
    >
      {/* A slow ping on the stage you are actually on. The card already says
          "You're here" in words; this is the same fact at a glance, and it is
          the only thing on the timeline that keeps moving once everything has
          settled, so the eye lands on the current stage first. */}
      {isCurrent && (
        <m.span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-full ring-2 ring-white/50"
          initial={{ scale: 1, opacity: 0.55 }}
          animate={{ scale: 1.8, opacity: 0 }}
          transition={{
            duration: 2,
            ease: 'easeOut',
            repeat: Infinity,
            repeatDelay: 1.2,
            delay: delay + 0.5,
          }}
        />
      )}

      {isDone ? (
        // Drawn inline rather than through the icon registry: stroking a tick
        // on needs the path itself, and a registry component gives back a
        // finished <svg> with no handle on its geometry.
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          focusable="false"
        >
          <m.path d="M20 6 9 17l-5-5" variants={tickDraw} />
        </svg>
      ) : (
        <Icon name={icon} size={isCurrent ? 16 : 14} strokeWidth={2.2} />
      )}
    </m.div>
  );
}
