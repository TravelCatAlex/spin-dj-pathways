'use client';

const BAR =
  'block h-0.5 w-full rounded-sm bg-ink transition-[transform,opacity] duration-200 ease-out ' +
  'motion-reduce:transition-none';

/**
 * ATOM — MenuToggle
 * Three-line hamburger that morphs into an X. Visible only at mobile widths.
 */
export default function MenuToggle({ open, controls, onClick }) {
  return (
    <button
      type="button"
      className="hidden h-10 w-10 flex-col justify-center gap-[5px] rounded-sm border border-line bg-surface px-[9px] py-0 max-[760px]:flex"
      aria-expanded={open}
      aria-controls={controls}
      aria-label={open ? 'Close menu' : 'Open menu'}
      onClick={onClick}
    >
      <span className={`${BAR} ${open ? 'translate-y-[7px] rotate-45' : ''}`} />
      <span className={`${BAR} ${open ? 'opacity-0' : ''}`} />
      <span className={`${BAR} ${open ? '-translate-y-[7px] -rotate-45' : ''}`} />
    </button>
  );
}
