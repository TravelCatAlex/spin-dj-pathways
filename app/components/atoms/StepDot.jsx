'use client';

import { Check } from 'lucide-react';

const STATES = {
  done: 'bg-white text-purple-700',
  current: 'bg-orange shadow-[0_0_0_4px_rgba(255,159,28,0.28)]',
  todo: 'bg-white/[0.14] border border-white/[0.32]',
};

/**
 * ATOM — StepDot
 * One node of the project stage stepper. state: done | current | todo.
 * Completed steps use a vector check; the current step carries an inner dot.
 */
export default function StepDot({ state = 'todo', label }) {
  return (
    <div
      role="listitem"
      className={`grid h-6 w-6 place-items-center rounded-full text-[10px] font-bold text-white ${
        STATES[state] ?? STATES.todo
      }`}
      title={label}
      aria-current={state === 'current' ? 'step' : undefined}
    >
      {state === 'done' && (
        <Check size={13} strokeWidth={3} aria-hidden="true" focusable="false" />
      )}
      {state === 'current' && (
        <span className="h-2 w-2 rounded-full bg-white" aria-hidden="true" />
      )}
    </div>
  );
}
