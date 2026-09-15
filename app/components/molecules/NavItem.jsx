'use client';

import { m } from 'motion/react';

import Icon from '../atoms/Icon';
import { railItem, navIcon, spring } from '../../lib/motion';

/**
 * MOLECULE — NavItem
 * One sidebar navigation entry.
 *
 * The active state is a single pill shared across every row via `layoutId`:
 * when the tab changes, Motion moves that one element from the old row to the
 * new one instead of fading one out and another in. The nav then reads as one
 * control with a moving marker rather than five independent buttons.
 *
 * The pill is a sibling behind the content, not a background on the button.
 * A background cannot travel between elements; an absolutely positioned
 * element with a shared layoutId can.
 */
export default function NavItem({ icon, label, active = false, onClick, delay = 0 }) {
  return (
    <m.button
      type="button"
      custom={delay}
      variants={railItem}
      initial="hidden"
      animate="show"
      whileHover="hover"
      className={`group relative flex w-full items-center gap-2.5 rounded-[10px] border-0 bg-transparent px-3 py-2.5 text-left text-[13.5px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple ${
        active ? '' : 'hover:bg-purple-100/60'
      }`}
      aria-current={active ? 'page' : undefined}
      onClick={onClick}
    >
      {active && (
        <m.span
          layoutId="nav-active-pill"
          aria-hidden="true"
          className="absolute inset-0 rounded-[10px] bg-purple shadow-[0_6px_16px_rgba(124,58,237,0.28)]"
          transition={spring}
        />
      )}

      {/* The icon takes the same colour as the label. Colouring only the
          label left this inheriting ink, which reads as a black glyph on the
          purple pill. */}
      <m.span
        variants={navIcon}
        className={`relative z-[1] inline-flex transition-colors duration-150 ease-out ${
          active ? 'text-white' : 'text-ink-soft group-hover:text-purple'
        }`}
      >
        <Icon name={icon} />
      </m.span>
      <span
        className={`relative z-[1] transition-colors duration-150 ease-out ${
          active
            ? 'font-semibold text-white'
            : 'font-medium text-ink-soft group-hover:text-purple'
        }`}
      >
        {label}
      </span>
    </m.button>
  );
}
