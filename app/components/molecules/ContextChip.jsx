'use client';

import Icon from '../atoms/Icon';

/**
 * MOLECULE — ContextChip
 * One divided section of the context bar: tinted icon tile + label/value.
 * `divided` draws the hairline separating it from the previous chip —
 * vertical on wide screens, horizontal once the bar stacks below 760px.
 */
export default function ContextChip({ label, value, icon, accent, divided, onClick }) {
  return (
    <button
      type="button"
      className={`flex min-w-0 flex-1 items-center gap-2.5 rounded-[10px] border-0 bg-transparent px-3.5 py-2 text-left transition-colors duration-150 ease-out hover:bg-purple-50 max-[980px]:flex-[1_1_45%] ${
        divided
          ? 'rounded-l-none border-l border-l-line max-[760px]:rounded-[10px] max-[760px]:border-l-0 max-[760px]:border-t max-[760px]:border-t-line'
          : ''
      }`}
      onClick={onClick}
    >
      <span
        className="grid h-[30px] w-[30px] shrink-0 place-items-center rounded-[9px] bg-purple-50 text-purple"
        style={accent ? { background: `${accent}1f`, color: accent } : undefined}
      >
        <Icon name={icon} size={15} />
      </span>
      <span className="min-w-0">
        <span className="m-0 block text-[10px] tracking-[0.4px] text-muted">
          {label}
        </span>
        <span className="m-0 block truncate text-[13px] font-bold">{value}</span>
      </span>
    </button>
  );
}
