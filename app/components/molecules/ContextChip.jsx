'use client';

import Icon from '../atoms/Icon';

/**
 * MOLECULE — ContextChip
 * Label-over-value chip in the context row.
 */
export default function ContextChip({ label, value, icon, action, onClick }) {
  return (
    <button
      type="button"
      className={`context-chip${action ? ' context-chip--action' : ''}`}
      onClick={onClick}
    >
      <p className="context-chip__label">{label}</p>
      <p className="context-chip__value">
        <Icon glyph={icon} />
        {value}
      </p>
    </button>
  );
}
