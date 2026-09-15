'use client';

import { m } from 'motion/react';
import { rise, riseDelayed } from '../../lib/motion';

/**
 * ATOM — Reveal
 * One section settling into place. Meant to be used inside a <Stagger>, which
 * owns the timing; this only describes the movement.
 *
 * Motion is a state cue here, not decoration: sections rise and fade, far
 * enough to read as arriving, small enough not to shift the layout people are
 * already scanning.
 *
 * `inView` makes the section wait until it is actually on screen instead of
 * inheriting the page's load-time stagger. Half the dashboard sits below the
 * fold on a laptop, so without this their contents — the progress glyphs
 * stroking on, the opportunity rows, the creations grid — finished animating
 * before anyone scrolled down to them. Declaring `whileInView` also detaches
 * the section from the parent stagger, which is the point: it is no longer
 * part of the load sequence.
 *
 * `delay` offsets one section against its siblings, which is what turns
 * sections entering the viewport on the same frame into a cascade rather
 * than a single pop.
 *
 * Keep those delays short. A delay is paid every time the section reveals,
 * including when it is scrolled to on its own much later — so a value tuned
 * to look good in a six-step load cascade reads as lag on a phone, where
 * only one section fits on screen and each one arrives by itself.
 */
export default function Reveal({
  as = 'div',
  className = '',
  inView = false,
  delay = 0,
  children,
  ...rest
}) {
  const Tag = m[as] ?? m.div;

  // amount 0.2: fire as the section's top edge clears, not once it is fully
  // on screen — a tall row would otherwise animate only after you had already
  // scrolled past its opening.
  const trigger = inView
    ? {
        initial: 'hidden',
        whileInView: 'show',
        // once: a dashboard is scrolled up and down constantly, and a section
        // that replayed every time it came back would turn into a tic.
        //
        // The top margin is the important half. An observer only reports a
        // change in intersection, so a section jumped straight past — a
        // scrollbar drag, the End key, a hard flick — never intersects and,
        // with `once`, stays hidden for good: a blank gap where a card should
        // be. Expanding the root upwards means anything recently scrolled
        // past still counts and reveals. It cannot cause an early reveal,
        // because content arriving from below is governed by the bottom
        // figure, which stays small enough to fire just as the section
        // appears.
        viewport: { amount: 0.2, once: true, margin: '1400px 0px 80px 0px' },
      }
    : {};

  // Siblings in one row all cross the viewport threshold together, so a
  // per-card delay is what turns three simultaneous fades into a sequence.
  return (
    <Tag
      className={className}
      variants={delay ? riseDelayed : rise}
      custom={delay}
      {...trigger}
      {...rest}
    >
      {children}
    </Tag>
  );
}
