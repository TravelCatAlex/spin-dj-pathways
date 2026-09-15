'use client';

import Icon from '../atoms/Icon';

/**
 * MOLECULE — ContextChip
 * One divided section of the context bar: tinted icon tile + label/value.
 */
export default function ContextChip({ label, value, icon, accent, onClick }) {
  return (
    <button type="button" className="context-chip" onClick={onClick}>
      <span
        className="context-chip__tile"
        style={accent ? { background: `${accent}1f`, color: accent } : undefined}
      >
        <Icon name={icon} size={15} />
      </span>
      <span className="context-chip__text">
        <p className="context-chip__label">{label}</p>
        <p className="context-chip__value">{value}</p>
      </span>
    </button>
  );
}
