'use client';

import Icon from '../atoms/Icon';

/**
 * MOLECULE — StageCallout
 * A white panel on the project band: current stage on the left, the next
 * action beside it, and a go button at the end.
 */
export default function StageCallout({ stage, nextAction, onGo }) {
  return (
    <div className="flex items-center gap-3.5 rounded-md bg-white px-3 py-2.5 text-ink shadow-[0_6px_18px_rgba(0,0,0,0.18)] max-[760px]:flex-wrap">
      <div className="min-w-0">
        <p className="m-0 mb-px text-[10px] tracking-[0.4px] text-muted">Stage</p>
        <p className="m-0 text-[14px] font-bold">{stage}</p>
        <p className="m-0 mt-0.5 flex items-center gap-[5px] text-[10.5px] text-[#e11d48]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#e11d48]" aria-hidden="true" />
          You&apos;re here
        </p>
      </div>

      <div className="flex min-w-0 flex-1 items-center gap-2.5 border-l border-l-line pl-3.5 max-[760px]:basis-full max-[760px]:border-l-0 max-[760px]:border-t max-[760px]:border-t-line max-[760px]:pl-0 max-[760px]:pt-2.5">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-[9px] bg-purple-50 text-purple">
          <Icon name="video" size={16} />
        </span>
        <span>
          <p className="m-0 mb-px text-[10px] tracking-[0.4px] text-muted">Next Step</p>
          <p className="m-0 text-[13px] font-bold">{nextAction}</p>
        </span>
      </div>

      <button
        type="button"
        className="grid h-[30px] w-[30px] shrink-0 place-items-center rounded-full border-0 bg-purple-50 text-purple transition-[background-color,transform] duration-150 ease-out hover:translate-x-0.5 hover:bg-purple hover:text-white motion-reduce:transition-none"
        aria-label={`Start: ${nextAction}`}
        onClick={onGo}
      >
        <Icon name="chevronRight" size={16} />
      </button>
    </div>
  );
}
