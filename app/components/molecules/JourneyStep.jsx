'use client';

import Icon from '../atoms/Icon';

/**
 * MOLECULE — JourneyStep
 * One coloured circle + title + description in the Pathway Journey stepper.
 */
export default function JourneyStep({ icon, title, description, accent, showArrow }) {
  return (
    <li className="journey__step">
      <div
        className="journey__icon"
        style={{
          background: accent,
          boxShadow: `0 6px 14px ${accent}47`,
        }}
      >
        <Icon name={icon} size={20} />
      </div>
      <p className="journey__title">{title}</p>
      <p className="journey__desc">{description}</p>
      {showArrow && (
        <div className="journey__arrow">
          <Icon name="arrowRight" size={18} strokeWidth={2.5} />
        </div>
      )}
    </li>
  );
}
