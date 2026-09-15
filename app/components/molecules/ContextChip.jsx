'use client';

import { m } from 'motion/react';

import Icon from '../atoms/Icon';
import { rise, spring } from '../../lib/motion';

/**
 * MOLECULE — ContextChip
 * One divided section of the context bar: tinted icon tile + label/value.
 * `divided` draws the hairline separating it from the previous chip —
 * vertical on wide screens, horizontal once the bar stacks below 760px.
 *
 * Only the row's outer edges are rounded. A radius on an inner edge shows up
 * the moment the hover fill lands: the curve leaves a notch against the next
 * chip's square edge, so the row stops reading as one continuous bar.
 * Stacked below 760px each chip is its own block again and gets all four.
 *
 * Hover answers in the chip's own accent — Program purple, Organization blue,
 * Class teal. Those colours were already in the data and only being spent on
 * the icon tile; a shared purple wash made three different contexts read as
 * one control repeated. The same reason it cannot be a Tailwind `hover:`
 * class: the value comes from data, not a utility.
 */
export default function ContextChip({
  label,
  value,
  icon,
  accent,
  divided,
  first,
  last,
  onClick,
}) {
  // Desktop lays the chips out as a row and mobile stacks them, so the
  // rounded corners belong to the ends of a row on one and the ends of a
  // column on the other.
  //
  // This matters beyond looks: the divider is a border on the chip itself,
  // and a border along one edge of a rounded box curves away at both ends.
  // Rounding every mobile chip left each divider looking inset with curled
  // tails instead of a rule running the width of the card.
  const corners =
    first && last
      ? 'rounded-[10px]'
      : first
        ? 'rounded-l-[10px] rounded-r-none max-[980px]:rounded-t-[10px] max-[980px]:rounded-b-none'
        : last
          ? 'rounded-r-[10px] rounded-l-none max-[980px]:rounded-b-[10px] max-[980px]:rounded-t-none'
          : 'rounded-none';

  const chip = {
    ...rise,
    hover: {
      backgroundColor: accent ? `${accent}14` : 'rgba(124,58,237,0.06)',
      transition: spring,
    },
  };

  // The tile is the only coloured thing in the chip, so it is what moves.
  const tile = {
    hover: {
      scale: 1.1,
      rotate: -5,
      backgroundColor: accent ? `${accent}66` : undefined,
      transition: spring,
    },
  };

  return (
    <m.button
      type="button"
      variants={chip}
      whileHover="hover"
      className={`flex min-w-0 flex-1 items-center gap-2.5 border-0 bg-transparent px-3.5 py-2 text-left ${corners} ${
        divided
          ? 'border-l border-l-line max-[980px]:border-l-0 max-[980px]:border-t max-[980px]:border-t-line'
          : ''
      }`}
      onClick={onClick}
    >
      <m.span
        variants={tile}
        className="grid h-[30px] w-[30px] shrink-0 place-items-center rounded-[9px] bg-purple-50 text-purple"
        // The tile is the icon's own colour at 28%. Anything lighter washes
        // out over white — at 12% the orange tile read as grey-lilac next to
        // its orange icon, and 20% was still closer to neutral than to the
        // hue. 28% carries the colour while the icon stays legible on it.
        style={accent ? { background: `${accent}47`, color: accent } : undefined}
      >
        <Icon name={icon} size={15} />
      </m.span>
      <span className="min-w-0">
        <span className="m-0 block text-[10px] tracking-[0.4px] text-muted">
          {label}
        </span>
        <span className="m-0 block truncate text-[13px] font-bold">{value}</span>
      </span>
    </m.button>
  );
}
