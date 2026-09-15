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
  const classes = ['card', tinted ? 'card--tinted' : '', className]
    .filter(Boolean)
    .join(' ');

  return (
    <section className={classes}>
      {(title || action) && (
        <header className="card__head">
          {title && <SectionTitle icon={icon}>{title}</SectionTitle>}
          {action}
        </header>
      )}
      {children}
    </section>
  );
}
