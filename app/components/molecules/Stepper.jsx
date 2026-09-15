'use client';

import StepDot from '../atoms/StepDot';
import StepConnector from '../atoms/StepConnector';

/**
 * MOLECULE — Stepper
 * Labelled dots + connectors for the project stage sequence.
 * Labels shrink at 1240px and hide below 980px so the row still fits.
 */
export default function Stepper({ steps, currentIndex }) {
  return (
    <div
      className="mb-4 flex items-start"
      role="list"
      aria-label={`Stage ${currentIndex + 1} of ${steps.length}`}
    >
      {steps.map((step, idx) => {
        const state =
          idx < currentIndex ? 'done' : idx === currentIndex ? 'current' : 'todo';

        return (
          <div key={step} className="contents">
            <div className="flex shrink-0 flex-col items-center gap-[7px]">
              <StepDot state={state} label={step} />
              <span
                className={`whitespace-nowrap text-[10.5px] max-[1240px]:text-[9.5px] max-[980px]:hidden ${
                  state === 'current' ? 'font-bold opacity-100' : 'opacity-75'
                }`}
              >
                {step}
              </span>
            </div>
            {idx < steps.length - 1 && <StepConnector />}
          </div>
        );
      })}
    </div>
  );
}
