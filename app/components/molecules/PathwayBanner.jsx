'use client';

import Image from 'next/image';
import { PATHWAY_BANNER } from '../../lib/fixtures';

/**
 * MOLECULE — PathwayBanner
 *
 * The band's aspect ratio changes with the viewport (roughly 3.5:1 to 5.9:1),
 * so no fixed-ratio artwork can fill it with `cover` without slicing the mic.
 *
 * Instead the band is composited from two layers: a gradient tuned to the
 * artwork's own left-edge colours fills the full width, and the artwork is
 * fitted over it and pinned right, with a scrim keeping the heading readable.
 */
export default function PathwayBanner() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {/* Base wash, sampled from the artwork's own left edge (#200671 ->
          #3f0e9a) so the two layers meet without a seam. */}
      <span className="absolute inset-0 bg-[radial-gradient(120%_150%_at_88%_45%,rgba(168,26,190,0.5)_0%,rgba(103,16,172,0.22)_38%,rgba(32,6,113,0)_68%),linear-gradient(95deg,#1d0569_0%,#290775_42%,#360a94_74%,#46109f_100%)]" />

      <Image
        src={PATHWAY_BANNER.src}
        alt=""
        fill
        priority
        quality={90}
        sizes="(max-width: 760px) 200vw, (max-width: 1180px) 100vw, 1100px"
        className="object-cover object-right"
      />

      {/* Scrim keeps the heading readable over the artwork's brighter side. */}
      <span className="absolute inset-0 bg-[linear-gradient(100deg,rgba(26,5,92,0.88)_0%,rgba(30,6,100,0.66)_30%,rgba(40,9,120,0.26)_52%,rgba(40,9,120,0)_72%)]" />
    </div>
  );
}
