'use client';

import { ICONS } from './iconRegistry';

/**
 * ATOM — Icon
 * Renders a Lucide vector icon by semantic name. SVG, so it stays sharp at
 * any resolution or zoom and inherits `currentColor` from its parent.
 *
 * Decorative by default (aria-hidden); pass `title` when the icon is the only
 * carrier of meaning.
 */
export default function Icon({
  name,
  size = 16,
  strokeWidth = 2,
  className = '',
  title,
  ...rest
}) {
  const Glyph = ICONS[name];

  if (!Glyph) return null;

  return (
    <Glyph
      size={size}
      strokeWidth={strokeWidth}
      className={className}
      aria-hidden={title ? undefined : 'true'}
      aria-label={title}
      role={title ? 'img' : undefined}
      focusable="false"
      {...rest}
    />
  );
}
