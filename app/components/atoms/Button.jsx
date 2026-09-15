'use client';

const BASE =
  'inline-flex items-center justify-center gap-1.5 rounded-[10px] border border-transparent ' +
  'text-[13px] font-semibold transition-[transform,background-color,color,border-color,box-shadow] ' +
  'duration-150 ease-out active:translate-y-px';

const VARIANTS = {
  primary:
    'bg-purple text-white shadow-[0_6px_16px_rgba(124,58,237,0.26)] hover:bg-purple-600',
  outline:
    'bg-purple-50 text-purple border-purple-100 hover:bg-purple-100 hover:border-purple',
  soft:
    'bg-surface text-purple border-line rounded-full shadow-sm hover:border-purple',
  ghost:
    'bg-transparent text-purple !px-0.5 !py-1 !text-[12.5px] hover:underline',
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
