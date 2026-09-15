'use client';

import Icon from '../atoms/Icon';

/**
 * MOLECULE — ProgressItem
 * Coloured circular status badge + title + description.
 */
export default function ProgressItem({ icon, title, description, accent }) {
  return (
    <div className="flex items-center gap-2.5">
      {/* 34px disc, matching the opportunity rows so every circular status
          badge on the page is the same size. */}
      <span
        className="grid h-[34px] w-[34px] shrink-0 place-items-center rounded-full"
        style={{ background: `${accent}29`, color: accent }}
      >
        <Icon name={icon} size={16} />
      </span>
      <div>
        <p className="m-0 mb-0.5 text-[12.5px] font-bold">{title}</p>
        <p className="m-0 text-[12px] text-ink-soft">{description}</p>
      </div>
    </div>
  );
}
