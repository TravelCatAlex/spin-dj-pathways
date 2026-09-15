'use client';

import { m } from 'motion/react';
import { rise, spring } from '../../lib/motion';

import ProgressGlyph from '../atoms/ProgressGlyph';

/**
 * MOLECULE — ProgressItem
 * Coloured circular status badge + title + description.
 *
 * The row is the hover target, so pointing anywhere on it answers: the badge
 * grows and deepens into its own accent while the row edges right. Matching
 * the interest tags beside it, so the two cards read as one surface rather
 * than one being alive and the other inert.
 */
export default function ProgressItem({ icon, title, description, accent }) {
  const row = {
    ...rise,
    hover: { x: 3, transition: spring },
  };

  const badge = {
    hover: {
      scale: 1.12,
      backgroundColor: `${accent}66`,
      transition: spring,
    },
  };

  return (
    <m.div
      className="flex cursor-default items-center gap-2.5"
      variants={row}
      whileHover="hover"
    >
      {/* 34px disc, matching the opportunity rows so every circular status
          badge on the page is the same size. */}
      <m.span
        className="grid h-[34px] w-[34px] shrink-0 place-items-center rounded-full"
        // The disc is the icon's own colour at 28%, matching the context
        // chips. At 16% a blue disc reads lavender over white — close enough
        // to the brand purple to look like a different colour from the icon
        // sitting on it.
        style={{ background: `${accent}47`, color: accent }}
        variants={badge}
      >
        <ProgressGlyph icon={icon} />
      </m.span>
      <div>
        <p className="m-0 mb-0.5 text-[12.5px] font-bold">{title}</p>
        <p className="m-0 text-[12px] text-ink-soft">{description}</p>
      </div>
    </m.div>
  );
}
