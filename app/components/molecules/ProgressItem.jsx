'use client';

import Icon from '../atoms/Icon';

/**
 * MOLECULE — ProgressItem
 * Coloured circular status badge + title + description.
 */
export default function ProgressItem({ icon, title, description, accent }) {
  return (
    <div className="flex items-start gap-2.5">
      <span
        className="mt-px grid h-[22px] w-[22px] shrink-0 place-items-center rounded-full text-[10px]"
        style={{ background: `${accent}1f`, color: accent }}
      >
        <Icon name={icon} />
      </span>
      <div>
        <p className="m-0 mb-0.5 text-[12.5px] font-bold">{title}</p>
        <p className="m-0 text-[12px] text-ink-soft">{description}</p>
      </div>
    </div>
  );
}
