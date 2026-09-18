'use client';

import Image from 'next/image';
import { m } from 'motion/react';

import Icon from '../atoms/Icon';
import Skeleton from '../atoms/Skeleton';
import { useImageLoaded } from '../../lib/useImageLoaded';
import { spring } from '../../lib/motion';

/**
 * MOLECULE — ProjectMedia
 * The hero's video still: artwork, a scrim, and a play button over it.
 *
 * Close kin of `MediaCard`, deliberately not the same component. MediaCard is
 * a whole card — status badge, title, date, type chip — and this is only the
 * frame. Widening MediaCard with flags until it could be both would have made
 * the one component on the page that everybody touches the hardest one to
 * change.
 *
 * `tone="dark"` on the skeleton: this sits on the hero's near-black purple,
 * where the light shimmer used on white cards glares.
 *
 * The zoom is on the image, never the frame — scaling the container would
 * drag the play button along with it. Same reasoning MediaCard records.
 */
export default function ProjectMedia({ src, alt = '', onPlay }) {
  const { loaded, holderRef, imgProps } = useImageLoaded();

  const art = { hover: { scale: 1.06, transition: spring } };
  const play = {
    hover: { scale: 1.16, backgroundColor: 'rgb(255,255,255)', transition: spring },
  };

  return (
    <m.button
      type="button"
      onClick={onPlay}
      whileHover="hover"
      aria-label={alt ? `Play ${alt}` : 'Play project video'}
      ref={holderRef}
      className="relative grid aspect-[16/10] w-[232px] shrink-0 place-items-center overflow-hidden rounded-[14px] border-0 bg-[#2b0a7a] p-0 shadow-[0_10px_30px_rgba(0,0,0,0.28)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white max-[1180px]:w-full"
    >
      <m.span className="absolute inset-0 block" variants={art}>
        {!loaded && <Skeleton tone="dark" />}
        <Image
          {...imgProps}
          src={src}
          alt=""
          fill
          sizes="232px"
          className={`object-cover transition-opacity duration-300 ease-out motion-reduce:transition-none ${
            loaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
      </m.span>

      {/* Holds the play button legible over bright artwork. */}
      <span className="absolute inset-0 bg-[linear-gradient(180deg,rgba(20,18,31,0.08)_0%,rgba(20,18,31,0.32)_100%)]" />

      <m.span
        className="relative grid h-[42px] w-[42px] place-items-center rounded-full bg-white/90 text-purple shadow-[0_4px_14px_rgba(0,0,0,0.25)]"
        variants={play}
      >
        <Icon name="play" size={18} />
      </m.span>
    </m.button>
  );
}
