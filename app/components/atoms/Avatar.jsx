'use client';

import Image from 'next/image';
import Skeleton from './Skeleton';
import { useImageLoaded } from '../../lib/useImageLoaded';

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
 *
 * While a photo loads, a skeleton fills the disc. If it fails, the initials
 * take over rather than leaving an empty circle — a name is more use than a
 * broken image.
 */
export default function Avatar({ name = '', src = null, size = 30, ring = false }) {
  const { loaded, failed, holderRef, imgProps } = useImageLoaded();

  const style = {
    width: size,
    height: size,
    flexBasis: size,
    fontSize: Math.round(size * 0.36),
  };

  const showPhoto = src && !failed;

  const className = [
    'relative grid place-items-center shrink-0 overflow-hidden rounded-full font-bold text-white',
    showPhoto
      ? 'bg-purple-50'
      : 'bg-[linear-gradient(135deg,var(--color-purple),var(--color-purple-700))]',
    ring ? 'shadow-[0_0_0_2px_var(--color-surface),0_0_0_4px_var(--color-purple)]' : '',
  ]
    .filter(Boolean)
    .join(' ');

  if (!showPhoto) {
    return (
      <div className={className} style={style} aria-hidden="true">
        {initialsOf(name)}
      </div>
    );
  }

  return (
    <div ref={holderRef} className={className} style={style}>
      {!loaded && <Skeleton tone="light" rounded="rounded-full" />}
      <Image
        {...imgProps}
        src={src}
        alt={name ? `${name}'s profile photo` : ''}
        width={size * 2}
        height={size * 2}
        sizes={`${size}px`}
        className={`h-full w-full object-cover transition-opacity duration-300 ease-out motion-reduce:transition-none ${
          loaded ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </div>
  );
}
