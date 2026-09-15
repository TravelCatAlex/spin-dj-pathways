'use client';

import StepDot from '../atoms/StepDot';
import StepConnector from '../atoms/StepConnector';

/**
 * MOLECULE — Stepper
 * Labelled dots + connectors for the project stage sequence.
 * Labels hide below 980px so the row still fits.
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
            <div className={`stepper__step stepper__step--${state}`}>
              <StepDot state={state} label={step} />
              <span className="stepper__label">{step}</span>
            </div>
            {idx < steps.length - 1 && <StepConnector />}
          </div>
        );
      })}
    </div>
  );
}
