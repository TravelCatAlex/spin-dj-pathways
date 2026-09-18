'use client';

import { m } from 'motion/react';
import { rise, spring } from '../../lib/motion';

import Icon from '../atoms/Icon';

/**
 * MOLECULE — LinkRow
 * Tinted icon tile + title + description, with a chevron standing for "there
 * is more behind this".
 *
 * One component for both Possible Next Projects and Opportunities to Try.
 * They are the same offer in two flavours — here is a thing you could do —
 * and giving each its own row component was how the two cards drifted apart
 * last time: one grew a date line and an interest toggle, the other stayed a
 * plain list, and side by side they stopped reading as a pair.
 *
 * The whole row is the target, not the chevron. A 14px glyph is a poor tap
 * target on a phone, and the title beside it is the thing anyone actually
 * aims at.
 *
 * A rounded square, not the disc used by My Progress: those badges report
 * something that has already happened to you, these rows are things you can
 * open. Different shape, different job — the page has one disc vocabulary and
 * one tile vocabulary rather than one shape meaning two things.
 */
export default function LinkRow({
  title,
  description,
  icon,
  accent,
  divided = false,
  onClick,
}) {
  const row = {
    ...rise,
    hover: { x: 3, transition: spring },
  };

  // The tile answers in the row's own colour, the way the interest tags and
  // progress badges already do — six rows across two cards, six colours,
  // rather than one control repeated.
  const tile = {
    hover: {
      scale: 1.08,
      backgroundColor: `${accent}3d`,
      transition: spring,
    },
  };

  const chevron = { hover: { x: 3, transition: spring } };

  return (
    <m.button
      type="button"
      variants={row}
      whileHover="hover"
      onClick={onClick}
      className={`group flex w-full items-center gap-3 border-0 bg-transparent px-1 py-[11px] text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple ${
        divided ? 'border-t border-t-line' : ''
      }`}
    >
      <m.span
        variants={tile}
        className="grid h-[34px] w-[34px] shrink-0 place-items-center rounded-[10px]"
        style={{ background: `${accent}24`, color: accent }}
      >
        <Icon name={icon} size={16} />
      </m.span>

      <span className="min-w-0 flex-1 block">
        <span className="m-0 mb-0.5 block truncate text-[12.5px] font-bold transition-colors duration-200 group-hover:text-purple">
          {title}
        </span>
        <span className="m-0 block truncate text-[11.5px] text-muted">
          {description}
        </span>
      </span>

      <m.span
        variants={chevron}
        aria-hidden="true"
        className="shrink-0 text-muted transition-colors duration-200 group-hover:text-purple"
      >
        <Icon name="chevronRight" size={16} />
      </m.span>
    </m.button>
  );
}
