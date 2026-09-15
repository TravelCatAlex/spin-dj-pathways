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
    'avatar',
    src ? 'avatar--photo' : '',
    ring ? 'avatar--ring' : '',
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
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
      />
    </div>
  );
}
