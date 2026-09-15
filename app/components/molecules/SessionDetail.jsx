'use client';

import { m } from 'motion/react';

import Icon from '../atoms/Icon';
import Avatar from '../atoms/Avatar';
import { rise, spring } from '../../lib/motion';

/**
 * MOLECULE — SessionDetail
 * Icon + label on the left, value right-aligned. The value may carry its own
 * avatar (the teacher) or a small icon.
 *
 * Both sides are spans, not paragraphs: Avatar renders a div, and a div is
 * not valid inside <p> — the browser would close the paragraph early and
 * break hydration.
 *
 * The rule beneath each row is drawn rather than declared, so the card fills
 * itself in like a schedule entry being written out. The row keeps a
 * transparent 1px bottom border: the visible line is now an element, and
 * without that reservation every row would lose a pixel of height.
 */
export default function SessionDetail({
  label,
  value,
  icon,
  valueIcon,
  avatarUrl,
  isLast = false,
}) {
  const row = {
    ...rise,
    hover: { x: 2, transition: spring },
  };

  const rule = {
    hidden: { scaleX: 0 },
    show: {
      scaleX: 1,
      transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.12 },
    },
  };

  const portrait = { hover: { scale: 1.12, transition: spring } };

  return (
    <m.div
      className="relative flex cursor-default items-center justify-between gap-3 border-b border-transparent py-[9px]"
      variants={row}
      whileHover="hover"
    >
      <span className="m-0 flex items-center gap-2 text-[12.5px] text-muted [&>svg]:shrink-0 [&>svg]:text-muted">
        <Icon name={icon} size={14} />
        {label}
      </span>
      <span className="m-0 flex items-center gap-[7px] text-right text-[13px] font-bold [&>svg]:shrink-0 [&>svg]:text-purple">
        {avatarUrl !== undefined ? (
          <m.span variants={portrait} className="inline-flex">
            <Avatar name={value} src={avatarUrl} size={20} />
          </m.span>
        ) : (
          <Icon name={valueIcon} size={13} />
        )}
        {value}
      </span>

      {!isLast && (
        <m.span
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-px origin-left bg-line"
          variants={rule}
        />
      )}
    </m.div>
  );
}
