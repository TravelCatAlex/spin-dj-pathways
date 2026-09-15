'use client';

import Icon from '../atoms/Icon';

/**
 * MOLECULE — ProgressItem
 * One status-icon + title + description row in My Progress.
 */
export default function ProgressItem({ icon, title, description }) {
  return (
    <div>
      <p className="progress-item__title">
        <Icon glyph={icon} />
        {title}
      </p>
      <p className="progress-item__desc">{description}</p>
    </div>
  );
}
