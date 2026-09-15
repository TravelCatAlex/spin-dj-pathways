'use client';

import Image from 'next/image';

/**
 * ATOM — Avatar
 * Renders a photo when `src` is given, otherwise falls back to the initial on
 * a purple disc. The ring is drawn with box-shadow so it never changes the
 * element's footprint, keeping rows aligned whichever branch renders.
 */
export default function Avatar({ name = '', src = null, size = 30, ring = false }) {
  const style = {
    width: size,
    height: size,
    flexBasis: size,
    fontSize: Math.round(size * 0.4),
  };

  if (!src) {
    return (
      <div
        className={`avatar${ring ? ' avatar--ring' : ''}`}
        style={style}
        aria-hidden="true"
      >
        {name.charAt(0).toUpperCase()}
      </div>
    );
  }

  return (
    <div className={`avatar avatar--photo${ring ? ' avatar--ring' : ''}`} style={style}>
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
