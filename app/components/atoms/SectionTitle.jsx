'use client';

import Icon from './Icon';

/**
 * ATOM — SectionTitle
 * The small uppercase heading used at the top of every card. Purple is
 * set here rather than per-card, so all twelve sections stay in step.
 */
export default function SectionTitle({ icon, children }) {
  return (
    <h3 className="m-0 flex items-center gap-[7px] text-[11.5px] font-extrabold uppercase tracking-[0.8px] text-purple">
      <Icon name={icon} />
      {children}
    </h3>
  );
}
