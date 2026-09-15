'use client';

import Icon from '../atoms/Icon';
import Avatar from '../atoms/Avatar';

/**
 * MOLECULE — SessionDetail
 * Icon + label on the left, value right-aligned. The value may carry its own
 * avatar (the teacher) or a small icon.
 *
 * Both sides are spans, not paragraphs: Avatar renders a div, and a div is
 * not valid inside <p> — the browser would close the paragraph early and
 * break hydration.
 */
export default function SessionDetail({ label, value, icon, valueIcon, avatarUrl }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-line py-[9px] last:border-b-0">
      <span className="m-0 flex items-center gap-2 text-[12.5px] text-muted [&>svg]:shrink-0 [&>svg]:text-muted">
        <Icon name={icon} size={14} />
        {label}
      </span>
      <span className="m-0 flex items-center gap-[7px] text-right text-[13px] font-bold [&>svg]:shrink-0 [&>svg]:text-purple">
        {avatarUrl !== undefined ? (
          <Avatar name={value} src={avatarUrl} size={20} />
        ) : (
          <Icon name={valueIcon} size={13} />
        )}
        {value}
      </span>
    </div>
  );
}
