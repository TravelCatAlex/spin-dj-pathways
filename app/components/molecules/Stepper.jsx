'use client';

import StepDot from '../atoms/StepDot';
import StepConnector from '../atoms/StepConnector';

/**
 * MOLECULE — Stepper
 * Dots + connectors for the project stage sequence.
 */
export default function Stepper({ steps, currentIndex }) {
  return (
    <div
      className="stepper"
      role="list"
      aria-label={`Stage ${currentIndex + 1} of ${steps.length}`}
    >
      {steps.map((step, idx) => {
        const state =
          idx < currentIndex ? 'done' : idx === currentIndex ? 'current' : 'todo';

        return (
          <div key={step} style={{ display: 'contents' }}>
            <StepDot state={state} label={step} />
            {idx < steps.length - 1 && <StepConnector />}
          </div>
        );
      })}
    </div>
  );
}
