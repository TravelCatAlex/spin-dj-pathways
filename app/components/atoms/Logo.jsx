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
 */
export default function Logo({ width = 150, priority = false, className = '' }) {
  const { loaded, holderRef, imgProps } = useImageLoaded();

  return (
    <span
      ref={holderRef}
      className={`relative block overflow-hidden ${className}`}
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
