'use client';

import Icon from '../atoms/Icon';

/**
 * ORGANISM — TopBar
 * Greeting and the date pill. The profile CTA lives in the context bar.
 */
export default function TopBar({ user, dateLabel }) {
  return (
    <header className="topbar">
      <div>
        <h1 className="topbar__title">
          Welcome back, {user.firstName}! <Icon name="wave" />
        </h1>
        <p className="topbar__subtitle">Let&apos;s keep creating amazing things.</p>
      </div>
      <p className="topbar__date">
        <Icon name="calendar" /> {dateLabel}
      </p>
    </header>
  );
}
