'use client';

import Icon from '../atoms/Icon';
import StatusBadge from '../atoms/StatusBadge';

/**
 * MOLECULE — MediaCard
 * Thumbnail with a play affordance, status badge, title, date and type chip.
 */
export default function MediaCard({
  icon,
  title,
  status,
  meta,
  metaIcon,
  kind,
  thumbnailUrl,
  gradient,
  onClick,
}) {
  const thumbStyle = thumbnailUrl
    ? {
        backgroundImage: `url(${thumbnailUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }
    : gradient
      ? { background: gradient }
      : undefined;

  return (
    <button type="button" className="media-card" onClick={onClick}>
      <div className="media-card__thumb" style={thumbStyle}>
        <span className="media-card__play">
          <Icon name="play" size={14} />
        </span>
        <StatusBadge status={status} />
      </div>
      <div className="media-card__body">
        <p className="media-card__title">{title}</p>
        <div className="media-card__foot">
          <p className="media-card__meta">
            <Icon name={metaIcon} />
            {meta}
          </p>
          {kind && <span className="media-card__kind">{kind}</span>}
        </div>
      </div>
    </button>
  );
}
