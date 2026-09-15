'use client';

import Icon from '../atoms/Icon';

/**
 * ORGANISM — TopBar
 * Greeting and the date pill. The profile CTA lives in the context bar.
 */
export default function TopBar({ user, dateLabel }) {
  return (
    <header className="mb-[18px] flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="m-0 mb-[3px] text-[25px] font-extrabold tracking-[-0.5px]">
          Welcome back, {user.firstName}! <Icon name="wave" />
        </h1>
        <p className="m-0 text-[13px] text-muted">
          Let&apos;s keep creating amazing things.
        </p>
      </div>
      {/* Date sits in a bordered pill, matching the design. */}
      <p className="m-0 inline-flex items-center gap-[7px] rounded-full border border-line bg-surface px-[13px] py-[7px] text-[12.5px] font-medium text-ink-soft">
        <Icon name="calendar" /> {dateLabel}
      </p>
    </header>
  );
}
