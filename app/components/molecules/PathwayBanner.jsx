'use client';

import Image from 'next/image';
import { PATHWAY_BANNER } from '../../lib/fixtures';

/**
 * MOLECULE — PathwayBanner
 * Full-bleed artwork behind the pathway hero card.
 *
 * The artwork is fitted to the band's height and pinned right, so the mic is
 * never sliced; the card's own purple fills the space to its left. A gradient
 * scrim blends that seam and keeps the heading legible.
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
        sizes="(max-width: 760px) 150vw, 700px"
        style={{ objectFit: 'contain', objectPosition: 'right center' }}
      />
      <span className="pathway-card__scrim" />
    </div>
  );
}
