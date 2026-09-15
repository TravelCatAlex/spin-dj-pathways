'use client';

import ContextChip from '../molecules/ContextChip';
import Icon from '../atoms/Icon';

/**
 * ORGANISM — ContextRow
 * A single card holding the pathway/organization/class sections,
 * with the profile shortcut pinned to its right edge.
 */
export default function ContextRow({ chips, onChipClick, onViewProfile }) {
  return (
    <div className="mb-[18px] flex items-stretch gap-0 rounded-lg border border-line bg-surface p-1.5 shadow-sm max-[980px]:flex-wrap max-[760px]:flex-col max-[760px]:items-stretch max-[760px]:p-2">
      {chips.map((chip, idx) => (
        <ContextChip
          key={chip.id}
          label={chip.label}
          value={chip.value}
          icon={chip.icon}
          accent={chip.accent}
          divided={idx > 0}
          onClick={() => onChipClick?.(chip)}
        />
      ))}

      <button
        type="button"
        className="ml-1.5 inline-flex shrink-0 items-center gap-[7px] self-center whitespace-nowrap rounded-full border border-line bg-surface px-[15px] py-[9px] text-[12.5px] font-semibold text-purple transition-[border-color,background-color] duration-150 ease-out hover:border-purple hover:bg-purple-50 max-[760px]:mx-0 max-[760px]:mt-1.5 max-[760px]:justify-center"
        onClick={onViewProfile}
      >
        <Icon name="user" size={14} />
        View My Profile
        <Icon name="chevronRight" size={14} />
      </button>
    </div>
  );
}
