'use client';

import Image from 'next/image';

/** "Coach Jordan" -> "CJ"; a single word yields one letter. */
function initialsOf(name) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');
}

/**
 * ATOM — Avatar
 * Renders a photo when `src` is given, otherwise initials on a purple disc.
 * The ring is drawn with box-shadow so it never changes the element's
 * footprint, keeping rows aligned whichever branch renders.
 */
export default function Avatar({ name = '', src = null, size = 30, ring = false }) {
  const style = {
    width: size,
    height: size,
    flexBasis: size,
    fontSize: Math.round(size * 0.36),
  };

  const className = [
    'relative grid place-items-center shrink-0 overflow-hidden rounded-full font-bold text-white',
    src
      ? 'bg-purple-50'
      : 'bg-[linear-gradient(135deg,var(--color-purple),var(--color-purple-700))]',
    ring ? 'shadow-[0_0_0_2px_var(--color-surface),0_0_0_4px_var(--color-purple)]' : '',
  ]
    .filter(Boolean)
    .join(' ');

  if (!src) {
    return (
      <div className={className} style={style} aria-hidden="true">
        {initialsOf(name)}
      </div>
    );
  }

  return (
    <div className={className} style={style}>
      <Image
        src={src}
        alt={name ? `${name}'s profile photo` : ''}
        width={size * 2}
        height={size * 2}
        sizes={`${size}px`}
        className="h-full w-full object-cover"
      />
    </div>
  );
}
