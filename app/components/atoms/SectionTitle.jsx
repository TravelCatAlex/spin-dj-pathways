'use client';

import Icon from './Icon';

/**
 * ATOM — SectionTitle
 * The small uppercase heading used at the top of every card.
 */
export default function SectionTitle({ icon, children }) {
  return (
    <h3 className="card__title">
      <Icon glyph={icon} />
      {children}
    </h3>
  );
}
