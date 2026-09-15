'use client';

import Icon from './Icon';

/**
 * ATOM — SectionTitle
 * The small uppercase heading used at the top of every card.
 */
export default function SectionTitle({ icon, children }) {
  return (
    <h3 className="m-0 flex items-center gap-[7px] text-[11.5px] font-extrabold uppercase tracking-[0.8px] text-ink">
      <Icon name={icon} />
      {children}
    </h3>
  );
}
