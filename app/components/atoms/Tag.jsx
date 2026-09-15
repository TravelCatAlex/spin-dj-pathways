'use client';

import Icon from './Icon';

/**
 * ATOM — Tag
 * Icon + label tile used for interests.
 */
export default function Tag({ icon, name, onClick }) {
  return (
    <button type="button" className="tag" onClick={onClick}>
      <p className="tag__icon">
        <Icon glyph={icon} />
      </p>
      <p className="tag__name">{name}</p>
    </button>
  );
}
