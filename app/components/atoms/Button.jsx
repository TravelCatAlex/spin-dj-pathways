'use client';

const BASE =
  'inline-flex items-center justify-center gap-1.5 rounded-[10px] border border-transparent ' +
  'text-[13px] font-semibold transition-[transform,background-color,color,border-color,box-shadow] ' +
  'duration-150 ease-out active:translate-y-px';

const VARIANTS = {
  // purple -> purple-600 was a ~6% luminance shift and read as no change at
  // all on a full-width button, so the hover also lifts and deepens its cast.
  primary:
    'bg-purple text-white shadow-[0_6px_16px_rgba(124,58,237,0.26)] ' +
    'hover:-translate-y-px hover:bg-purple-700 hover:shadow-[0_10px_24px_rgba(124,58,237,0.45)]',
  // Outline sits on three card footers — Edit My Interests, See All Progress,
  // View All Feedback — and was a flat colour swap while everything around it
  // had learned to lift. Same 1px rise as primary, at a weight that suits a
  // secondary action: a tinted cast rather than primary's saturated one.
  outline:
    'bg-purple-50 text-purple border-purple-100 ' +
    'hover:-translate-y-px hover:bg-purple-100 hover:border-purple ' +
    'hover:shadow-[0_6px_14px_rgba(124,58,237,0.18)]',
  soft:
    'bg-surface text-purple border-line rounded-full shadow-sm ' +
    'hover:-translate-y-px hover:border-purple hover:shadow-[0_6px_14px_rgba(124,58,237,0.16)]',
  // No lift on ghost: it is inline text beside other text, and raising it
  // would knock the line it sits on out of alignment. It deepens instead.
  ghost:
    'bg-transparent text-purple !px-0.5 !py-1 !text-[12.5px] ' +
    'hover:text-purple-700 hover:underline',
};

/**
 * ATOM — Button
 * variant: primary | outline | soft | ghost.
 */
export default function Button({
  variant = 'primary',
  block = false,
  size,
  className = '',
  children,
  ...rest
}) {
  const classes = [
    BASE,
    size === 'sm' ? 'px-3 py-1.5 text-[12.5px]' : 'px-[15px] py-[9px]',
    VARIANTS[variant] ?? VARIANTS.primary,
    block ? 'w-full' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button type="button" className={classes} {...rest}>
      {children}
    </button>
  );
}
