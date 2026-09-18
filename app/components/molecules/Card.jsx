'use client';

import SectionTitle from '../atoms/SectionTitle';

/**
 * MOLECULE — Card
 * Surface + optional titled header with a right-aligned action slot.
 */
export default function Card({
  title,
  icon,
  action,
  tinted = false,
  className = '',
  children,
}) {
  const classes = [
    // 16px on a normal screen, 14px once the viewport is narrow enough that a
    // card is nearly the full width - at that point the padding is a visible
    // share of the line length rather than a margin around it.
    //
    // ONE RULE, HERE. Every panel that wants to look like a card uses this
    // component; a wrapper setting its own p-[22px] is how the dashboard ended
    // up with two card paddings six pixels apart on the same screen.
    'rounded-lg border p-4 shadow-sm max-[560px]:p-3.5',
    tinted ? 'border-purple-100 bg-purple-50' : 'border-line bg-surface',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <section className={classes}>
      {(title || action) && (
        <header className="mb-5 flex items-center justify-between gap-3">
          {title && <SectionTitle icon={icon}>{title}</SectionTitle>}
          {action}
        </header>
      )}
      {children}
    </section>
  );
}
