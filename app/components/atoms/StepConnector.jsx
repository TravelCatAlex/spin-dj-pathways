'use client';

/**
 * ATOM — StepConnector
 * The rail between two StepDots. `filled` marks the travelled part of the
 * timeline, so progress reads at a glance without counting ticks.
 */
export default function StepConnector({ filled = false }) {
  return (
    <span
      aria-hidden="true"
      className={`mt-3.5 h-[3px] min-w-2 flex-auto rounded-full transition-colors duration-200 ${
        filled ? 'bg-purple' : 'bg-white/20'
      }`}
    />
  );
}
