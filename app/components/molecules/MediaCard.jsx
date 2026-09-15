'use client';

import Image from 'next/image';
import Icon from '../atoms/Icon';
import StatusBadge from '../atoms/StatusBadge';

/**
 * MOLECULE — MediaCard
 * Thumbnail with a play affordance, status badge, title, date and type chip.
 *
 * The thumbnail goes through next/image so the browser gets a variant sized
 * for the card rather than the full-resolution source. A scrim sits over it
 * to keep the play button and badge legible on bright artwork.
 */
export default function MediaCard({
  icon,
  title,
  status,
  meta,
  metaIcon,
  kind,
  thumbnailUrl,
  onClick,
}) {
  return (
    <button type="button" className="media-card" onClick={onClick}>
      <div className="media-card__thumb">
        {thumbnailUrl ? (
          <>
            <Image
              src={thumbnailUrl}
              alt=""
              fill
              sizes="(max-width: 760px) 100vw, (max-width: 980px) 33vw, 220px"
              style={{ objectFit: 'cover' }}
            />
            <span className="media-card__scrim" />
          </>
        ) : (
          <Icon name={icon} size={28} />
        )}

        <span className="media-card__play">
          <Icon name="play" size={14} />
        </span>
        <StatusBadge status={status} />
      </div>

      <div className="media-card__body">
        <p className="media-card__title">{title}</p>
        <div className="media-card__foot">
          <p className="media-card__meta">
            <Icon name={metaIcon} size={12} />
            {meta}
          </p>
          {kind && <span className="media-card__kind">{kind}</span>}
        </div>
      </div>
    </button>
  );
}
