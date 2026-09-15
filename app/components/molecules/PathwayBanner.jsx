'use client';

import Image from 'next/image';
import { PATHWAY_BANNER } from '../../lib/fixtures';

/**
 * MOLECULE — PathwayBanner
 *
 * The band's aspect ratio changes with the viewport (roughly 3.5:1 to 5.9:1),
 * so no fixed-ratio artwork can fill it with `cover` without slicing the mic.
 *
 * Instead the band is composited from two layers: a CSS gradient tuned to the
 * artwork's own left-edge colours fills the full width, and the artwork is
 * fitted to the band's HEIGHT and pinned right on top of it, its left edge
 * masked so it dissolves into the gradient. The result reads as full-bleed at
 * every width while the mic is never cropped — and it stays correct whatever
 * ratio the source image happens to be.
 */
export default function PathwayBanner() {
  return (
    <div className="pathway-card__bg" aria-hidden="true">
      <span className="pathway-card__wash" />

      <Image
        src={PATHWAY_BANNER.src}
        alt=""
        fill
        priority
        quality={90}
        sizes="(max-width: 760px) 200vw, (max-width: 1180px) 100vw, 1100px"
        className="pathway-card__art"
        style={{ objectFit: 'cover', objectPosition: 'right center' }}
      />

      <span className="pathway-card__scrim" />
    </div>
  );
}
