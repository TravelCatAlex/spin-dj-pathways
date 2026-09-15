'use client';

import Image from 'next/image';
import { LOGO } from '../../lib/fixtures';

/**
 * ATOM — Logo
 * The SPIN DJ PATHWAYS wordmark. Width-driven: pass `width` and the height
 * follows the asset's intrinsic aspect ratio, so it never distorts.
 */
export default function Logo({ width = 150, priority = false, className = '' }) {
  return (
    <Image
      src={LOGO.src}
      alt="Spin DJ Pathways"
      width={LOGO.width}
      height={LOGO.height}
      priority={priority}
      className={className}
      style={{ width, height: 'auto', display: 'block' }}
    />
  );
}
