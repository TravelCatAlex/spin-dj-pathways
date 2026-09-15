'use client';

import Icon from './Icon';

/**
 * ATOM — Tag
 * Pill-shaped interest chip: tinted circular icon beside the label.
 */
export default function Tag({ icon, name, accent, onClick }) {
  return (
    <button
      type="button"
      className="flex items-center gap-2 rounded-full border border-line bg-[#fafaff] px-2.5 py-2 text-left transition-[background-color,border-color,transform] duration-150 ease-out hover:-translate-y-px hover:border-purple-100 hover:bg-purple-50"
      onClick={onClick}
    >
      <span
        className="m-0 grid h-6 w-6 shrink-0 place-items-center rounded-full"
        style={accent ? { background: `${accent}24`, color: accent } : undefined}
      >
        <Icon name={icon} size={13} />
      </span>
      <span className="m-0 truncate text-[11.5px] font-semibold">{name}</span>
    </button>
  );
}
