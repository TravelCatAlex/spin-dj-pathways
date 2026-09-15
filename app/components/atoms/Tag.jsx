'use client';

import { m } from 'motion/react';
import { rise, spring, springFast } from '../../lib/motion';

import Icon from './Icon';

/**
 * ATOM — Tag
 * Pill-shaped interest chip: tinted circular icon beside the label.
 *
 * Hover answers in the tag's own accent rather than a house purple. Every
 * interest already carries a colour (Marvel red, Gaming blue, Podcasts teal)
 * and it was only being spent on the icon disc — picking it up on the border
 * and fill makes six chips feel like six things rather than one control
 * repeated, which is the whole point of a card called "Things I'm Into".
 *
 * That is why the colours are variants here instead of Tailwind `hover:`
 * classes: the value comes from data, so it cannot be a utility class.
 */
export default function Tag({ icon, name, accent, onClick }) {
  const chip = {
    ...rise,
    hover: {
      y: -2,
      backgroundColor: `${accent}14`,
      borderColor: `${accent}59`,
      transition: spring,
    },
    tap: { scale: 0.97, transition: springFast },
  };

  // The disc leans in and grows a little. Rotation is slight and negative on
  // purpose — a nudge, not a spin.
  const disc = {
    hover: { scale: 1.14, rotate: -6, transition: spring },
  };

  return (
    <m.button
      type="button"
      variants={chip}
      whileHover="hover"
      whileTap="tap"
      className="flex items-center gap-2 rounded-full border border-line bg-[#fafaff] px-2.5 py-2 text-left"
      onClick={onClick}
    >
      <m.span
        variants={disc}
        className="m-0 grid h-6 w-6 shrink-0 place-items-center rounded-full"
        style={accent ? { background: `${accent}47`, color: accent } : undefined}
      >
        <Icon name={icon} size={13} />
      </m.span>
      <span className="m-0 truncate text-[11.5px] font-semibold">{name}</span>
    </m.button>
  );
}
