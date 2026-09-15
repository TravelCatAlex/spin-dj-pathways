'use client';

import Icon from './Icon';

/**
 * ATOM — Tag
 * Pill-shaped interest chip: tinted circular icon beside the label.
 */
export default function Tag({ icon, name, accent, onClick }) {
  return (
    <button type="button" className="tag" onClick={onClick}>
      <span
        className="tag__icon"
        style={accent ? { background: `${accent}24`, color: accent } : undefined}
      >
        <Icon name={icon} size={13} />
      </span>
      <span className="tag__name">{name}</span>
    </button>
  );
}
