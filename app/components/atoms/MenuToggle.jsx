'use client';

/**
 * ATOM — MenuToggle
 * Three-line hamburger that morphs into an X. Visible only at mobile widths
 * (see the .sidebar__toggle rules in globals.css).
 */
export default function MenuToggle({ open, controls, onClick }) {
  return (
    <button
      type="button"
      className={`sidebar__toggle${open ? ' sidebar__toggle--open' : ''}`}
      aria-expanded={open}
      aria-controls={controls}
      aria-label={open ? 'Close menu' : 'Open menu'}
      onClick={onClick}
    >
      <span className="sidebar__toggle-bar" />
      <span className="sidebar__toggle-bar" />
      <span className="sidebar__toggle-bar" />
    </button>
  );
}
