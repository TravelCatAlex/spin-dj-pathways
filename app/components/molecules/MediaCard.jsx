'use client';

import { m } from 'motion/react';
import { rise, liftCard, spring } from '../../lib/motion';

import Image from 'next/image';
import Skeleton from '../atoms/Skeleton';
import Icon from '../atoms/Icon';
import { useImageLoaded } from '../../lib/useImageLoaded';
import StatusBadge from '../atoms/StatusBadge';

/**
 * MOLECULE — MediaCard
 * Thumbnail with a play affordance, status badge, title, date and type chip.
 *
 * The thumbnail goes through next/image so the browser gets a variant sized
 * for the card rather than the full-resolution source. A scrim sits over it
 * to keep the play button and badge legible on bright artwork.
 *
 * Hover behaves the way a video card is expected to: the artwork pushes in,
 * the play button grows, and the scrim deepens to hold the title and badge
 * legible while the image moves beneath them.
 *
 * The zoom is on the image, never the frame. next/image renders with `fill`,
 * so scaling the container would drag the play button and the status badge
 * along with it; scaling the image alone lets it move behind them, clipped by
 * the frame's existing overflow-hidden.
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
  const {
    loaded: thumbLoaded,
    holderRef: thumbRef,
    imgProps: thumbProps,
  } = useImageLoaded();

  const art = { hover: { scale: 1.07, transition: spring } };

  const scrim = {
    hover: {
      background:
        'linear-gradient(180deg,rgba(20,18,31,0.12) 0%,rgba(20,18,31,0.46) 100%)',
      transition: { duration: 0.25 },
    },
  };

  const play = {
    hover: { scale: 1.18, backgroundColor: 'rgb(255,255,255)', transition: spring },
  };

  return (
    <m.button
      type="button"
      variants={rise}
      {...liftCard}
      className="flex w-full flex-col overflow-hidden rounded-md border border-line bg-surface p-0 text-left transition-shadow duration-200 ease-out hover:shadow-md"
      onClick={onClick}
    >
      {/* Fixed ratio: every thumbnail is the same shape at every width, so a
          card whose title wraps to two lines can't stretch its own video. */}
      <div
        ref={thumbRef}
        className="relative grid aspect-[16/11] place-items-center overflow-hidden bg-[linear-gradient(135deg,#d9c6ff,#f3ecff)] text-purple">
        {thumbnailUrl ? (
          <>
            <m.div className="absolute inset-0" variants={art}>
              {!thumbLoaded && <Skeleton tone="lavender" />}
              <Image
                {...thumbProps}
                src={thumbnailUrl}
                alt=""
                fill
                sizes="(max-width: 760px) 100vw, (max-width: 980px) 33vw, 220px"
                className={`object-cover transition-opacity duration-300 ease-out motion-reduce:transition-none ${
                  thumbLoaded ? 'opacity-100' : 'opacity-0'
                }`}
              />
            </m.div>
            {/* Darkens the artwork just enough for the play button and badge. */}
            <m.span
              className="absolute inset-0 bg-[linear-gradient(180deg,rgba(20,18,31,0.05)_0%,rgba(20,18,31,0.28)_100%)]"
              variants={scrim}
            />
          </>
        ) : (
          <Icon name={icon} size={28} />
        )}

        <m.span
          className="relative grid h-[34px] w-[34px] place-items-center rounded-full bg-white/90 text-[13px] text-purple shadow-[0_3px_10px_rgba(20,18,31,0.18)]"
          variants={play}
        >
          <Icon name="play" size={14} />
        </m.span>
        <StatusBadge status={status} />
      </div>

      <div className="flex flex-col px-[13px] pb-[13px] pt-[11px]">
        {/* Always exactly two lines: every card's date row lands on the same
            baseline no matter how long the title is. */}
        <p className="m-0 mb-2 line-clamp-2 min-h-[2.8em] text-[13px] font-bold leading-[1.4]">
          {title}
        </p>
        <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1.5">
          <p className="m-0 flex min-w-0 items-center gap-[5px] truncate text-[11px] text-muted">
            <Icon name={metaIcon} size={12} />
            {meta}
          </p>
          {kind && (
            <span className="shrink-0 whitespace-nowrap rounded-[5px] bg-purple-50 px-[7px] py-0.5 text-[10px] font-semibold text-purple">
              {kind}
            </span>
          )}
        </div>
      </div>
    </m.button>
  );
}
