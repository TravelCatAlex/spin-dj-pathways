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
    'rounded-lg border p-[17px] shadow-sm',
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
