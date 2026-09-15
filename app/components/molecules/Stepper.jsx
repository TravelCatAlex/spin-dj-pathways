'use client';

import StepDot from '../atoms/StepDot';
import StepConnector from '../atoms/StepConnector';

/**
 * MOLECULE — Stepper
 * The project timeline: an icon node per stage, joined by a rail that is
 * filled up to the current stage and faint beyond it.
 * Labels shrink at 1240px and hide below 980px so the row still fits.
 */
export default function Stepper({ steps, currentIndex }) {
  return (
    <div
      className="mb-4 flex items-start"
      role="list"
      aria-label={`Stage ${currentIndex + 1} of ${steps.length}: ${steps[currentIndex]?.label}`}
    >
      {steps.map((step, idx) => {
        const state =
          idx < currentIndex ? 'done' : idx === currentIndex ? 'current' : 'todo';

        return (
          <div key={step.id} className="contents">
            <div className="flex shrink-0 flex-col items-center gap-2">
              <StepDot state={state} icon={step.icon} label={step.label} />
              <span
                className={`whitespace-nowrap text-[10.5px] max-[1240px]:text-[9.5px] max-[980px]:hidden ${
                  state === 'current'
                    ? 'font-bold text-white'
                    : state === 'done'
                      ? 'text-white/80'
                      : 'text-white/55'
                }`}
              >
                {step.label}
              </span>
            </div>
            {idx < steps.length - 1 && <StepConnector filled={idx < currentIndex} />}
          </div>
        );
      })}
    </div>
  );
}
