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
      className={`flex w-full items-center gap-2.5 rounded-[10px] border-0 px-3 py-2.5 text-left text-[13.5px] transition-[background-color,color,box-shadow] duration-150 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple ${
        active
          ? 'bg-purple font-semibold text-white shadow-[0_6px_16px_rgba(124,58,237,0.28)]'
          : // Inactive: the whole row — icon and label — shifts to purple on
            // hover, so the tint reads as deliberate rather than a stray wash.
            'bg-transparent font-medium text-ink-soft hover:bg-purple-100/60 hover:text-purple'
      }`}
      aria-current={active ? 'page' : undefined}
      onClick={onClick}
    >
      <Icon name={icon} />
      {label}
    </button>
  );
}
