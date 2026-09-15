'use client';

import { m } from 'motion/react';

import Icon from '../atoms/Icon';
import {
  journeyItem,
  journeyDisc,
  journeyArrow,
  journeyRail,
} from '../../lib/motion';

/**
 * MOLECULE — JourneyStep
 * One coloured circle + title + description in the Pathway Journey stepper.
 * `hideArrowAtMedium` blanks the arrow on the last column of the 4-up layout.
 *
 * The row traces itself on load: a stage lands, then the arrow leaving it
 * strokes across to the next. `delay` is what chains them — the parent hands
 * each stage its turn, so seven separate fades become one route being drawn.
 *
 * The arrow is inline SVG rather than the icon registry, because stroking a
 * line on needs the path itself; a registry component returns a finished
 * <svg> with no handle on its geometry.
 */
export default function JourneyStep({
  icon,
  title,
  description,
  accent,
  showArrow,
  hideArrowAtMedium,
  delay = 0,
}) {
  return (
    <m.li
      className="group relative cursor-default px-1 text-center"
      custom={delay}
      variants={journeyItem}
    >
      <m.div
        className="mx-auto mb-[9px] grid h-[46px] w-[46px] place-items-center rounded-full text-white"
        style={{ background: accent, boxShadow: `0 6px 14px ${accent}47` }}
        variants={journeyDisc}
        whileHover="hover"
      >
        <Icon name={icon} size={20} />
      </m.div>
      <p className="m-0 mb-[3px] text-[11.5px] font-bold transition-colors duration-200 group-hover:text-purple">
        {title}
      </p>
      <p className="m-0 text-[10px] leading-[1.35] text-muted">{description}</p>

      {/* Single column: the horizontal arrows no longer make sense, so the
          route continues as a rail dropping into the next stage. Without it
          the journey stops reading as a journey on a phone and becomes a
          plain list of circles. */}
      {showArrow && (
        <m.span
          aria-hidden="true"
          className="absolute bottom-[-20px] left-1/2 hidden h-5 w-[2px] origin-top -translate-x-1/2 rounded-full max-[760px]:block"
          style={{ background: `linear-gradient(180deg, ${accent}, ${accent}2e)` }}
          custom={delay}
          variants={journeyRail}
        />
      )}

      {showArrow && (
        <div
          className={`absolute top-[23px] right-[-5px] grid translate-x-1/2 -translate-y-1/2 place-items-center leading-none text-purple max-[760px]:hidden ${
            hideArrowAtMedium ? 'max-[1180px]:hidden' : ''
          }`}
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            focusable="false"
          >
            <m.path d="M2 12h20" custom={delay} variants={journeyArrow} />
            <m.path
              d="M18 8l4 4-4 4"
              custom={delay + 0.14}
              variants={journeyArrow}
            />
          </svg>
        </div>
      )}
    </m.li>
  );
}
