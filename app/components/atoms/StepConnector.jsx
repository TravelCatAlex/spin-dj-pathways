'use client';

import { m } from 'motion/react';

/**
 * ATOM — StepConnector
 * The rail between two StepDots. `filled` marks the travelled part of the
 * timeline, so progress reads at a glance without counting ticks.
 *
 * The rail is always drawn faint; a completed one carries a purple bar that
 * wipes across it on load. Scaling a bar from its left edge keeps the whole
 * thing on the compositor — animating `width` would relayout the flex row on
 * every frame and drag the dots with it.
 *
 * The sheen is one light crossing the travelled timeline, not a per-rail
 * effect: Stepper hands each rail the moment its turn comes round
 * (`sheenDelay`) and how long to wait afterwards (`sheenRepeatDelay`), so the
 * segments hand the light to one another and it reads as a single pulse.
 *
 * It runs the completed rails only, stopping at the current node. Carrying it
 * on past there would draw a line through stages nobody has reached yet and
 * undo the thing the filled rail exists to say.
 *
 * Wide and faint rather than narrow and bright. A tight, strong highlight on
 * a 3px rail reads as a break in the fill — the eye sees a gap in the line,
 * not a light moving along it. Spreading the same energy over a wider band at
 * a third of the opacity keeps the rail continuous at every frame.
 */
export default function StepConnector({
  filled = false,
  delay = 0,
  sheenActive = false,
  sheenDelay = 0,
  sheenRepeatDelay = 0,
  sheenDuration = 0.5,
}) {
  return (
    <span
      aria-hidden="true"
      className="relative mt-3.5 h-[3px] min-w-2 flex-auto overflow-hidden rounded-full bg-white/20"
    >
      {filled && (
        <>
          <m.span
            className="absolute inset-0 origin-left rounded-full bg-purple"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay }}
          />

          {/* Mounted only once the timeline reports itself built. Before, the
              light set off on a timer that guessed when the fills would be
              done — and when the guess was short it crossed rails that were
              still filling, which read as the fill breaking. */}
          {sheenActive && (
          <m.span
            className="absolute inset-y-0 w-14 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.3),transparent)]"
            initial={{ x: '-150%' }}
            animate={{ x: '450%' }}
            transition={{
              duration: sheenDuration,
              ease: 'linear',
              repeat: Infinity,
              repeatDelay: sheenRepeatDelay,
              delay: sheenDelay,
            }}
          />
          )}
        </>
      )}
    </span>
  );
}
