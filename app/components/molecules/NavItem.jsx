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
      className={`flex w-full items-center gap-2.5 rounded-[10px] border-0 px-3 py-2.5 text-left text-[13.5px] transition-colors duration-150 ease-out ${
        active
          ? 'bg-purple font-semibold text-white shadow-[0_6px_16px_rgba(124,58,237,0.28)]'
          : 'bg-transparent font-medium text-ink-soft hover:bg-purple-50 hover:text-ink'
      }`}
      aria-current={active ? 'page' : undefined}
      onClick={onClick}
    >
      <Icon name={icon} />
      {label}
    </button>
  );
}
