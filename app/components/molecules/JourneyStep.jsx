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
 * One coloured circle + title + description in the Your Journey row.
 *
 * The row traces itself when scrolled to: a stage lands, then the arrow
 * leaving it strokes across to the next. `delay` is what chains them — the
 * parent hands each stage its turn, so four separate fades become one route
 * being drawn.
 *
 * Two connectors, one shown at a time. When the four stages sit across a row
 * the horizontal arrow strokes left to right; once the card is narrow — a phone
 * viewport (`max-[760px]`) or a cramped one-third column (`@max-[300px]`) — the
 * stages stack and a vertical rail draws top to bottom instead. Both signals
 * are read for the reason JourneySection records: the column can be narrow on a
 * wide desktop. The same route, read downward.
 *
 * Both connectors are inline SVG / spans rather than the icon registry,
 * because stroking a line on needs the geometry itself; a registry component
 * returns a finished <svg> with no handle on its path.
 */
export default function JourneyStep({
  icon,
  title,
  description,
  accent,
  showArrow,
  delay = 0,
}) {
  return (
    <m.li
      className="group relative cursor-default px-0.5 text-center"
      custom={delay}
      variants={journeyItem}
    >
      <m.div
        className="mx-auto mb-[9px] grid h-[44px] w-[44px] place-items-center rounded-full text-white"
        style={{ background: accent, boxShadow: `0 6px 14px ${accent}47` }}
        variants={journeyDisc}
        whileHover="hover"
      >
        <Icon name={icon} size={19} />
      </m.div>
      <p className="m-0 mb-[3px] text-[11.5px] font-bold transition-colors duration-200 group-hover:text-purple">
        {title}
      </p>
      <p className="m-0 text-[10px] leading-[1.35] text-muted">{description}</p>

      {/* Horizontal arrow — the row layout. Hidden once the column stacks. */}
      {showArrow && (
        <div className="absolute top-[22px] right-[-9px] grid translate-x-1/2 -translate-y-1/2 place-items-center leading-none text-purple max-[760px]:hidden @max-[300px]:hidden">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            focusable="false"
          >
            <m.path d="M3 12h18" custom={delay} variants={journeyArrow} />
            <m.path
              d="M16 8l4 4-4 4"
              custom={delay + 0.14}
              variants={journeyArrow}
            />
          </svg>
        </div>
      )}

      {/* Vertical rail — the stacked layout. Drops from this disc into the next,
          drawing top to bottom so the journey still reads as a route rather
          than a list of circles. The gap-y between rows is 20px, which is what
          the rail's height bridges. */}
      {showArrow && (
        <m.span
          aria-hidden="true"
          className="absolute bottom-[-20px] left-1/2 hidden h-5 w-[2px] origin-top -translate-x-1/2 rounded-full max-[760px]:block @max-[300px]:block"
          style={{ background: `linear-gradient(180deg, ${accent}, ${accent}2e)` }}
          custom={delay}
          variants={journeyRail}
        />
      )}
    </m.li>
  );
}
