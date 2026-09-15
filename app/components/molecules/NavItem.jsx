'use client';

import Icon from '../atoms/Icon';

/**
 * MOLECULE — NavItem
 * One sidebar navigation entry.
 */
export default function NavItem({ icon, label, active = false, onClick }) {
  return (
    <button
      type="button"
      className={`nav-item${active ? ' nav-item--active' : ''}`}
      aria-current={active ? 'page' : undefined}
      onClick={onClick}
    >
      <Icon name={icon} />
      {label}
    </button>
  );
}
