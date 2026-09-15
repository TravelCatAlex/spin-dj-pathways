'use client';

import Icon from '../atoms/Icon';

/**
 * MOLECULE — ProgressItem
 * Coloured circular status badge + title + description.
 */
export default function ProgressItem({ icon, title, description, accent }) {
  return (
    <div className="progress-item">
      <span
        className="progress-item__badge"
        style={{ background: `${accent}1f`, color: accent }}
      >
        <Icon glyph={icon} />
      </span>
      <div>
        <p className="progress-item__title">{title}</p>
        <p className="progress-item__desc">{description}</p>
      </div>
    </div>
  );
}
