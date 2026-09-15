'use client';

import Button from '../atoms/Button';
import Icon from '../atoms/Icon';

/**
 * ORGANISM — TopBar
 * Greeting, date, and the profile CTA.
 */
export default function TopBar({ user, dateLabel, onViewProfile }) {
  return (
    <header className="topbar">
      <div>
        <h1 className="topbar__title">
          Welcome back, {user.firstName}! <Icon glyph="👋" />
        </h1>
        <p className="topbar__subtitle">Let&apos;s keep creating amazing things.</p>
      </div>
      <div className="topbar__right">
        <p className="topbar__date">
          <Icon glyph="📅" /> {dateLabel}
        </p>
        <Button onClick={onViewProfile}>
          <Icon glyph="👤" /> View My Profile
        </Button>
      </div>
    </header>
  );
}
