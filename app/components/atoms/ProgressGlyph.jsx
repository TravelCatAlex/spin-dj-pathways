'use client';

import { m } from 'motion/react';
import { spring } from '../../lib/motion';

/**
 * ATOM — ProgressGlyph
 * The badge inside a progress item, drawn rather than dropped in.
 *
 * These three icons say different things, so they arrive differently: a
 * completion ticks itself off, an improvement climbs, an intention lands.
 * Motion carrying the same meaning as the icon is the whole idea — a shared
 * fade would have made three distinct achievements read as one list.
 *
 * Inlined instead of going through the icon registry: stroking a shape on
 * needs its geometry, and the registry hands back a finished <svg>. Only
 * these three kinds live here; every other icon on the page still comes from
 * the registry, so the icon system is intact.
 */

const draw = (delay) => ({
  hidden: { pathLength: 0, opacity: 0 },
  show: {
    pathLength: 1,
    opacity: 1,
    transition: {
      pathLength: { duration: 0.5, ease: 'easeOut', delay },
      opacity: { duration: 0.01, delay },
    },
  },
});

const pop = (delay) => ({
  hidden: { scale: 0, rotate: -35, opacity: 0 },
  show: {
    scale: 1,
    rotate: 0,
    opacity: 1,
    transition: { ...spring, delay },
  },
});

const SVG = {
  width: 16,
  height: 16,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2.2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
  focusable: 'false',
};

export default function ProgressGlyph({ icon }) {
  // A completion: the ring closes, then the tick is struck through it.
  if (icon === 'check') {
    return (
      <svg {...SVG}>
        <m.circle cx="12" cy="12" r="10" variants={draw(0.1)} />
        <m.path d="m9 12 2 2 4-4" variants={draw(0.4)} />
      </svg>
    );
  }

  // An improvement: the line climbs before its arrowhead lands.
  if (icon === 'trending') {
    return (
      <svg {...SVG}>
        <m.polyline
          points="22 7 13.5 15.5 8.5 10.5 2 17"
          variants={draw(0.1)}
        />
        <m.polyline points="16 7 22 7 22 13" variants={draw(0.45)} />
      </svg>
    );
  }

  // An intention: nothing to trace, so it spins into place instead. Drawing a
  // star outline reads as a scribble; the shape only works whole.
  if (icon === 'star') {
    return (
      <svg {...SVG}>
        <m.polygon
          points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
          variants={pop(0.15)}
          style={{ transformOrigin: 'center' }}
        />
      </svg>
    );
  }

  return null;
}
