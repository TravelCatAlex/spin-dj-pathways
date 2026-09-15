'use client';

/**
 * ATOM — StepDot
 * One node of the project stage stepper. state: done | current | todo.
 */
const GLYPH = { done: '✓', current: '●', todo: '○' };

export default function StepDot({ state = 'todo', label }) {
  return (
    <div
      role="listitem"
      className={`stepper__node stepper__node--${state}`}
      title={label}
      aria-current={state === 'current' ? 'step' : undefined}
    >
      {GLYPH[state]}
    </div>
  );
}
