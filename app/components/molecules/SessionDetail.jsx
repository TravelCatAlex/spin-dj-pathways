'use client';

import Icon from '../atoms/Icon';

/**
 * MOLECULE — SessionDetail
 * Label-over-value pair in the Next Session card.
 */
export default function SessionDetail({ label, value, icon }) {
  return (
    <div>
      <p className="session__label">{label}</p>
      <p className="session__value">
        <Icon glyph={icon} />
        {value}
      </p>
    </div>
  );
}
