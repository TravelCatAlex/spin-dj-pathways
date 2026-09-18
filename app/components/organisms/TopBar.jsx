'use client';

import { m } from 'motion/react';

import Icon from '../atoms/Icon';
import Skeleton from '../atoms/Skeleton';
import { delayedRise, TOPBAR_TIMES } from '../../lib/motion';

/**
 * ORGANISM — TopBar
 * Greeting and the date pill. The profile CTA lives in the context bar.
 *
 * Restrained on purpose: this is a heading, not a control. The three parts
 * arrive in reading order — who you are, the encouragement, then the date —
 * and nothing here responds to hover, because nothing here is clickable.
 */
export default function TopBar({ loading = false, user, dateLabel }) {
  return (
    <header className="mb-[18px] flex flex-wrap items-center justify-between gap-4">
      <div>
        <m.h1
          variants={delayedRise}
          custom={TOPBAR_TIMES.title}
          className="m-0 mb-[3px] text-[25px] font-extrabold tracking-[-0.5px]"
        >
          {/* The name is the only unknown in this line, so only the name waits.
              Skeletoning the whole greeting would blank a sentence we can
              already write. */}
          Welcome back,{' '}
          {loading ? (
            <span className="relative inline-block h-[19px] w-28 overflow-hidden rounded align-middle">
              <Skeleton tone="light" rounded="rounded" />
            </span>
          ) : (
            user.firstName
          )}
          !{' '}
          {/* The one emoji on the page. Decorative, so it is hidden from
              screen readers — "Welcome back, Avery! waving hand" is noise,
              and the greeting already says everything the glyph does. */}
          <m.span
            aria-hidden="true"
            className="inline-block origin-[70%_80%]"
            animate={{ rotate: [0, 14, -8, 12, 0] }}
            transition={{ duration: 1.6, delay: 0.6, ease: 'easeInOut' }}
          >
            👋
          </m.span>
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
