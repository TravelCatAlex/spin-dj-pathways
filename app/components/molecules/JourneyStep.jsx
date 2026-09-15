'use client';

import Icon from '../atoms/Icon';

/**
 * MOLECULE — JourneyStep
 * One circle + title + description in the Pathway Journey stepper.
 */
export default function JourneyStep({ icon, title, description, showArrow }) {
  return (
    <li className="journey__step">
      <div className="journey__icon">
        <Icon glyph={icon} />
      </div>
      <p className="journey__title">{title}</p>
      <p className="journey__desc">{description}</p>
      {showArrow && (
        <div className="journey__arrow" aria-hidden="true">
          →
        </div>
      )}
    </li>
  );
}
