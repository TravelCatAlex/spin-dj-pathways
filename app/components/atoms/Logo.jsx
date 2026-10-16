'use client';

import Image from 'next/image';
import Skeleton from './Skeleton';
import { LOGO } from '../../lib/fixtures';
import { useImageLoaded } from '../../lib/useImageLoaded';

/**
 * ATOM — Logo
 * The SPIN DJ PATHWAYS wordmark. Width-driven: pass `width` and the height
 * follows the asset's intrinsic aspect ratio, so it never distorts.
 *
 * The wrapper reserves that exact ratio up front, so the skeleton occupies
 * the wordmark's final footprint and the sidebar does not jolt when the real
 * thing arrives.
 *
 * `width` is a request, not a floor. `max-w-full` caps the wrapper at whatever
 * the parent actually offers, and `aspect-ratio` recomputes the height from the
 * used width — so a 260px wordmark inside a 224px card narrows instead of
 * spilling out of it. Without that ceiling the inline width wins and the page
 * grows a horizontal scrollbar on a 320px phone.
 */
export default function Logo({ width = 150, priority = false, className = '' }) {
  const { loaded, holderRef, imgProps } = useImageLoaded();

  return (
    <span
      ref={holderRef}
      className={`relative block max-w-full overflow-hidden ${className}`}
      style={{ width, aspectRatio: `${LOGO.width} / ${LOGO.height}` }}
    >
      {!loaded && <Skeleton tone="light" rounded="rounded-[6px]" />}
      <Image
        {...imgProps}
        src={LOGO.src}
        alt="Spin DJ Pathways"
        width={LOGO.width}
        height={LOGO.height}
        priority={priority}
        className={`h-full w-full object-contain transition-opacity duration-300 ease-out motion-reduce:transition-none ${
          loaded ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </span>
  );
}
