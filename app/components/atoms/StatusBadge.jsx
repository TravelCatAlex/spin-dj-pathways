'use client';

/**
 * ATOM — StatusBadge
 * Green for completed work, amber for anything still in flight.
 */
export default function StatusBadge({ status }) {
  if (!status) return null;

  const inProgress = status !== 'Completed';

  return (
    <span
      className={`media-card__badge${
        inProgress ? ' media-card__badge--progress' : ''
      }`}
    >
      {status}
    </span>
  );
}
