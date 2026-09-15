'use client';

/**
 * ATOM — Skeleton
 * The placeholder shown in an image's place until it has loaded.
 *
 * Fills its positioned parent, so every caller only has to make that parent
 * `relative` and give it the image's final dimensions — the skeleton then
 * occupies exactly the space the image will, and nothing reflows when the
 * two swap.
 *
 * `tone` follows the surface underneath: a pale sheen would vanish on the
 * hero's near-black purple, and a light one would glare on a white card.
 *
 * aria-hidden throughout — this is the visual stand-in for content that is
 * still arriving, and a screen reader should hear the image's alt text when
 * it lands, not an announcement about loading.
 */
const TONES = {
  light: {
    base: 'bg-[#eceaf3]',
    sheen: 'via-white/70',
  },
  lavender: {
    base: 'bg-[linear-gradient(135deg,#d9c6ff,#f3ecff)]',
    sheen: 'via-white/55',
  },
  dark: {
    base: 'bg-[#26085f]',
    sheen: 'via-white/10',
  },
};

export default function Skeleton({ tone = 'light', rounded = '', className = '' }) {
  const { base, sheen } = TONES[tone] ?? TONES.light;

  return (
    <span
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 overflow-hidden ${base} ${rounded} ${className}`}
    >
      {/* The travelling band. Transform only, so it composites on the GPU and
          costs nothing even with several on screen at once. */}
      <span
        className={`absolute inset-0 animate-[var(--animate-shimmer)] bg-gradient-to-r from-transparent ${sheen} to-transparent motion-reduce:animate-none`}
      />
    </span>
  );
}
