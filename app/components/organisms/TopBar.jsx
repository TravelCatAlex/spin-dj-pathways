'use client';

import Button from '../atoms/Button';
import Icon from '../atoms/Icon';

/**
 * ORGANISM — TopBar
 * Greeting, a date pill, and the profile CTA.
 */
export default function TopBar({ user, dateLabel, onViewProfile }) {
  return (
    <header className="topbar">
      <div>
        <h1 className="topbar__title">
          Welcome back, {user.firstName}! <Icon name="wave" />
        </h1>
        <p className="topbar__subtitle">Let&apos;s keep creating amazing things.</p>
      </div>
      <div className="topbar__right">
        <p className="topbar__date">
          <Icon name="calendar" /> {dateLabel}
        </p>
        <Button variant="soft" onClick={onViewProfile}>
          <Icon name="user" /> View My Profile
        </Button>
      </div>
    </header>
  );
}
