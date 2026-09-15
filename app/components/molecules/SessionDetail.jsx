'use client';

import Icon from '../atoms/Icon';

/**
 * MOLECULE — SessionDetail
 * Label on the left, value right-aligned — the Next Session row layout.
 */
export default function SessionDetail({ label, value, icon }) {
  return (
    <div className="session__row">
      <p className="session__label">{label}</p>
      <p className="session__value">
        <Icon glyph={icon} />
        {value}
      </p>
    </div>
  );
}
