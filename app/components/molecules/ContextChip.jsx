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
        <Icon name={icon} />
        {value}
        <Icon name="chevronRight" size={14} />
      </button>
    );
  }

  return (
    <button type="button" className="context-chip" onClick={onClick}>
      <p className="context-chip__label">{label}</p>
      <p className="context-chip__value">
        <Icon name={icon} />
        {value}
      </p>
    </button>
  );
}
