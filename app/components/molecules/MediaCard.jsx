'use client';

import Icon from '../atoms/Icon';
import StatusBadge from '../atoms/StatusBadge';

/**
 * MOLECULE — MediaCard
 * Thumbnail + title + meta tile used by My Creations.
 */
export default function MediaCard({
  icon,
  title,
  status,
  meta,
  metaIcon,
  thumbnailUrl,
  onClick,
}) {
  return (
    <button type="button" className="media-card" onClick={onClick}>
      <div
        className="media-card__thumb"
        style={
          thumbnailUrl
            ? {
                backgroundImage: `url(${thumbnailUrl})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }
            : undefined
        }
      >
        {!thumbnailUrl && <Icon glyph={icon} />}
        <StatusBadge status={status} />
      </div>
      <div className="media-card__body">
        <p className="media-card__title">{title}</p>
        <p className="media-card__meta">
          <Icon glyph={metaIcon} />
          {meta}
        </p>
      </div>
    </button>
  );
}
