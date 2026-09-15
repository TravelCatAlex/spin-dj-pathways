'use client';

import { m } from 'motion/react';

import Icon from '../atoms/Icon';
import { liftPanel, nudgeArrow } from '../../lib/motion';

/**
 * MOLECULE — StageCallout
 * A white panel on the project band: current stage on the left, the next
 * action beside it, and a go arrow at the end.
 *
 * The whole panel is the control, not just the arrow — the arrow is a plain
 * span that picks up the panel's hover through `group`, so the affordance is
 * the full-width target while the resting design is unchanged. (A nested
 * <button> inside a <button> would be invalid HTML.)
 */
export default function StageCallout({ stage, nextAction, onGo }) {
  return (
    <m.button
      type="button"
      onClick={onGo}
      {...liftPanel}
      aria-label={`${stage} — next step: ${nextAction}`}
      className="group flex w-full cursor-pointer items-center gap-3.5 rounded-md border-0 bg-white px-3 py-2.5 text-left text-ink shadow-[0_6px_18px_rgba(0,0,0,0.18)] transition-shadow duration-200 ease-out hover:shadow-[0_14px_30px_rgba(0,0,0,0.3)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple motion-reduce:transition-none max-[760px]:flex-wrap max-[760px]:gap-y-2.5"
    >
      <span className="min-w-0 block max-[760px]:basis-full max-[760px]:border-b max-[760px]:border-b-line max-[760px]:pb-2.5">
        <span className="m-0 mb-px block text-[10px] tracking-[0.4px] text-muted">
          Stage
        </span>
        <span className="m-0 block text-[14px] font-bold">{stage}</span>
        <span className="m-0 mt-0.5 flex items-center gap-[5px] text-[10.5px] text-[#e11d48]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#e11d48]" aria-hidden="true" />
          You&apos;re here
        </span>
      </span>

      <span className="flex min-w-0 flex-1 items-center gap-2.5 border-l border-l-line pl-3.5 max-[760px]:border-l-0 max-[760px]:pl-0">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-[9px] bg-purple-50 text-purple">
          <Icon name="video" size={16} />
        </span>
        <span className="min-w-0">
          <span className="m-0 mb-px block text-[10px] tracking-[0.4px] text-muted">
            Next Step
          </span>
          <span className="m-0 block text-[13px] font-bold">{nextAction}</span>
        </span>
      </span>

      {/* Reacts to hover anywhere on the panel. */}
      <m.span
        aria-hidden="true"
        variants={nudgeArrow}
        className="grid h-[30px] w-[30px] shrink-0 place-items-center rounded-full bg-purple-50 text-purple transition-[background-color,color] duration-200 ease-out group-hover:bg-purple group-hover:text-white group-focus-visible:bg-purple group-focus-visible:text-white motion-reduce:transition-none"
      >
        <Icon name="chevronRight" size={16} />
      </m.span>
    </m.button>
  );
}
