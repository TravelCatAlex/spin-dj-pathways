'use client';

import { Check } from 'lucide-react';

/**
 * ATOM — StepDot
 * One node of the project stage stepper. state: done | current | todo.
 * Completed steps use a vector check; the other two are drawn in CSS.
 */
export default function StepDot({ state = 'todo', label }) {
  return (
    <div
      role="listitem"
      className={`stepper__node stepper__node--${state}`}
      title={label}
      aria-current={state === 'current' ? 'step' : undefined}
    >
      {state === 'done' && (
        <Check size={13} strokeWidth={3} aria-hidden="true" focusable="false" />
      )}
    </div>
  );
}
