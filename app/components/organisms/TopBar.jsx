'use client';

import { m } from 'motion/react';

import Icon from '../atoms/Icon';
import { delayedRise, TOPBAR_TIMES } from '../../lib/motion';

/**
 * ORGANISM — TopBar
 * Greeting and the date pill. The profile CTA lives in the context bar.
 *
 * Restrained on purpose: this is a heading, not a control. The three parts
 * arrive in reading order — who you are, the encouragement, then the date —
 * and nothing here responds to hover, because nothing here is clickable.
 */
export default function TopBar({ user, dateLabel }) {
  return (
    <header className="mb-[18px] flex flex-wrap items-center justify-between gap-4">
      <div>
        <m.h1
          variants={delayedRise}
          custom={TOPBAR_TIMES.title}
          className="m-0 mb-[3px] text-[25px] font-extrabold tracking-[-0.5px]"
        >
          Welcome back, {user.firstName}!
        </m.h1>
        <m.p
          variants={delayedRise}
          custom={TOPBAR_TIMES.subtitle}
          className="m-0 text-[13px] text-muted"
        >
          Let&apos;s keep creating amazing things.
        </m.p>
      </div>

      {/* Date sits in a bordered pill, matching the design. */}
      <m.p
        variants={delayedRise}
        custom={TOPBAR_TIMES.date}
        className="m-0 inline-flex items-center gap-[7px] rounded-full border border-line bg-surface px-[13px] py-[7px] text-[12.5px] font-medium text-ink-soft"
      >
        <Icon name="calendar" /> {dateLabel}
      </m.p>
    </header>
  );
}
