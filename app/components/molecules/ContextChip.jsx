'use client';

import Icon from '../atoms/Icon';

/**
 * MOLECULE — ContextChip
 * Label-over-value chip. With `action` it renders as a pill button instead.
 */
export default function ContextChip({ label, value, icon, action, onClick }) {
  if (action) {
    return (
      <button
        type="button"
        className="context-chip context-chip--action"
        onClick={onClick}
      >
        <Icon glyph={icon} />
        {value}
        <span aria-hidden="true">›</span>
      </button>
    );
  }

  return (
    <button type="button" className="context-chip" onClick={onClick}>
      <p className="context-chip__label">{label}</p>
      <p className="context-chip__value">
        <Icon glyph={icon} />
        {value}
      </p>
    </button>
  );
}
