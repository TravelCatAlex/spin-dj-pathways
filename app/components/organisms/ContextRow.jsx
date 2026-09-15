'use client';

import { m } from 'motion/react';

import ContextChip from '../molecules/ContextChip';
import Icon from '../atoms/Icon';
import { rise, group } from '../../lib/motion';

/**
 * ORGANISM — ContextRow
 * A single card holding the pathway/organization/class sections,
 * with the profile shortcut pinned to its right edge.
 */
export default function ContextRow({ chips, onChipClick, onViewProfile }) {
  return (
    // Chips sequence left to right, then the profile pill — the bar was the
    // one row on the page arriving as a single block.
    <m.div
      className="mb-[18px] flex items-stretch gap-0 rounded-lg border border-line bg-surface p-1.5 shadow-sm max-[980px]:flex-col max-[980px]:items-stretch max-[980px]:p-2"
      variants={group(0.08)}
    >
      {chips.map((chip, idx) => (
        <ContextChip
          key={chip.id}
          label={chip.label}
          value={chip.value}
          icon={chip.icon}
          accent={chip.accent}
          divided={idx > 0}
          first={idx === 0}
          last={idx === chips.length - 1}
          onClick={() => onChipClick?.(chip)}
        />
      ))}

      <m.button
        type="button"
        variants={rise}
        className="group ml-1.5 inline-flex shrink-0 items-center justify-center gap-[7px] self-center whitespace-nowrap rounded-full border border-line bg-surface px-[15px] py-[9px] max-[980px]:ml-0 max-[980px]:mt-1.5 max-[980px]:w-full max-[980px]:self-stretch text-[12.5px] font-semibold text-purple transition-[border-color,background-color] duration-150 ease-out hover:border-purple hover:bg-purple-50 max-[760px]:mx-0 max-[760px]:mt-1.5 max-[760px]:justify-center"
        onClick={onViewProfile}
      >
        <Icon name="user" size={14} />
        View My Profile
        {/* The last arrow on the page that was not nudging. */}
        <span className="inline-flex transition-transform duration-200 ease-out group-hover:translate-x-1 motion-reduce:transition-none">
          <Icon name="chevronRight" size={14} />
        </span>
      </m.button>
    </m.div>
  );
}
