'use client';

import ContextChip from '../molecules/ContextChip';

/**
 * ORGANISM — ContextRow
 * Pathway / organization / class chips plus the profile shortcut.
 */
export default function ContextRow({ chips, onChipClick }) {
  return (
    <div className="context-row">
      {chips.map((chip) => (
        <ContextChip
          key={chip.id}
          label={chip.label}
          value={chip.value}
          icon={chip.icon}
          action={chip.action}
          onClick={() => onChipClick?.(chip)}
        />
      ))}
    </div>
  );
}
