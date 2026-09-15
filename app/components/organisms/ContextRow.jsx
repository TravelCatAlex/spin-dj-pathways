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
    <div className="context-bar">
      {chips.map((chip) => (
        <ContextChip
          key={chip.id}
          label={chip.label}
          value={chip.value}
          icon={chip.icon}
          accent={chip.accent}
          onClick={() => onChipClick?.(chip)}
        />
      ))}

      <button
        type="button"
        className="context-bar__profile"
        onClick={onViewProfile}
      >
        <Icon name="user" size={14} />
        View My Profile
        <Icon name="chevronRight" size={14} />
      </button>
    </div>
  );
}
