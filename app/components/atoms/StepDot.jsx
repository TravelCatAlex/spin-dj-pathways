'use client';

import Icon from './Icon';

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
 */
export default function StepDot({ state = 'todo', icon, label }) {
  const isCurrent = state === 'current';

  return (
    <div
      role="listitem"
      className={`grid shrink-0 place-items-center rounded-full transition-all duration-200 ${
        isCurrent ? 'h-8 w-8' : 'h-7 w-7'
      } ${STATES[state] ?? STATES.todo}`}
      title={label}
      aria-current={isCurrent ? 'step' : undefined}
    >
      <Icon
        name={state === 'done' ? 'tick' : icon}
        size={isCurrent ? 16 : 14}
        strokeWidth={state === 'done' ? 3 : 2.2}
      />
    </div>
  );
}
