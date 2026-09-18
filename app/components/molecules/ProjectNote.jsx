'use client';

import { m } from 'motion/react';

import Icon from '../atoms/Icon';
import { delayedRise } from '../../lib/motion';

/**
 * MOLECULE — ProjectNote
 * One labelled note in the hero's lower band: an icon and label on top, then
 * the line that matters, then its supporting line.
 *
 * Used twice — Current Focus and Latest Update — which is the point. The two
 * are different kinds of fact (what this stage is for, versus what actually
 * happened), and giving them an identical frame is what lets the eye compare
 * them instead of reading them as one paragraph of card furniture.
 *
 * Lives on the hero's deep purple, so every colour here is an opacity of
 * white rather than an ink token: `text-muted` over #1d0569 is unreadable.
 */
export default function ProjectNote({ label, icon, title, detail, delay = 0 }) {
  return (
    <m.div variants={delayedRise} custom={delay} className="min-w-0">
      <p className="m-0 mb-2 flex items-center gap-[7px] text-[10px] font-semibold uppercase tracking-[1.1px] text-white/65">
        <Icon name={icon} size={13} />
        {label}
      </p>
      <p className="m-0 mb-1 text-[12.5px] font-bold leading-[1.4] text-white">
        {title}
      </p>
      {detail && (
        <p className="m-0 text-[11.5px] leading-[1.45] text-white/60">{detail}</p>
      )}
    </m.div>
  );
}
