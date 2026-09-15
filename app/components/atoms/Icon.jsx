'use client';

/**
 * ATOM — Icon
 * Wraps a decorative emoji/glyph and hides it from assistive tech.
 * Single place to swap emoji for an icon font or SVG set later.
 */
export default function Icon({ glyph, className = '', ...rest }) {
  if (!glyph) return null;

  return (
    <span className={className} aria-hidden="true" {...rest}>
      {glyph}
    </span>
  );
}
