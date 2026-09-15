'use client';

import Image from 'next/image';
import { PATHWAY_BANNER } from '../../lib/fixtures';

/**
 * MOLECULE — PathwayBanner
 * Full-bleed artwork behind the pathway hero card.
 *
 * next/image handles responsive sizing and AVIF/WebP conversion. A gradient
 * scrim over the left half keeps the heading legible on top of the artwork —
 * the source image is brightest on its right, where the mic sits.
 */
export default function PathwayBanner() {
  return (
    <div className="pathway-card__bg" aria-hidden="true">
      <Image
        src={PATHWAY_BANNER.src}
        alt=""
        fill
        priority
        quality={90}
        sizes="(max-width: 1180px) 140vw, 100vw"
        style={{ objectFit: 'cover', objectPosition: 'right center' }}
      />
      <span className="pathway-card__scrim" />
    </div>
  );
}
