'use client';

import { useState } from 'react';
import { m } from 'motion/react';

import StepDot from '../atoms/StepDot';
import StepConnector from '../atoms/StepConnector';

/** Seconds between one node lighting up and the next. */
const BEAT = 0.3;
/** Held back so the timeline starts after its card has settled. */
const LEAD = 0.2;
/** How long the travelling light takes to cross one rail. */
const SEG = 0.5;
/** Quiet time at the end of the run before the light sets off again. */
const PAUSE = 2.4;


/**
 * MOLECULE — Stepper
 * The project timeline: an icon node per stage, joined by a rail that is
 * filled up to the current stage and faint beyond it.
 * Labels shrink at 1240px and hide below 980px so the row still fits.
 *
 * On load the progress reads left to right: each node pops, then the rail
 * leaving it wipes purple into the next. Delays are computed here rather than
 * staggered by a parent, because the row alternates node/rail/node and the
 * two have to interleave exactly — a node and the rail feeding it can't both
 * claim the same beat.
 */
export default function Stepper({ steps, currentIndex }) {
  // The travelling light waits for the timeline to report itself built rather
  // than for a delay that guesses when that will be. The last node fires
  // onAnimationComplete, which flips this — so if the springs are retuned, or
  // a stage is added, or the device is slow, the light still starts exactly
  // when the build ends instead of drifting into it.
  const [built, setBuilt] = useState(false);
  // It travels the completed rails and stops at the current node, so the run
  // spans currentIndex segments rather than the whole row. Each rail waits
  // out the full cycle minus its own crossing, so the next picks the light up
  // exactly as this one drops it and the run reads as a single pulse.
  const cycle = Math.max(currentIndex, 1) * SEG + PAUSE;

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
            {/* The whole step is the hover target, so pointing at either the
                dot or its label lifts the node and brightens the text. */}
            <m.div
              className="group flex shrink-0 cursor-default flex-col items-center gap-2"
              custom={LEAD + idx * BEAT}
              initial="hidden"
              animate="show"
              whileHover="hover"
            >
              <StepDot
                state={state}
                icon={step.icon}
                label={step.label}
                delay={LEAD + idx * BEAT}
                onArrived={
                  idx === steps.length - 1 ? () => setBuilt(true) : undefined
                }
              />
              <span
                className={`whitespace-nowrap text-[10.5px] transition-colors duration-200 group-hover:text-white max-[1240px]:text-[9.5px] max-[980px]:hidden ${
                  state === 'current'
                    ? 'font-bold text-white'
                    : state === 'done'
                      ? 'text-white/80'
                      : 'text-white/55'
                }`}
              >
                {step.label}
              </span>
            </m.div>
            {idx < steps.length - 1 && (
              <StepConnector
                filled={idx < currentIndex}
                delay={LEAD + idx * BEAT + BEAT / 2}
                sheenActive={built}
                sheenDelay={idx * SEG}
                sheenDuration={SEG}
                sheenRepeatDelay={cycle - SEG}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
