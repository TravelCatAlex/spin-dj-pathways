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
      className={`absolute bottom-2 left-2 z-[1] rounded-[5px] px-2 py-[3px] text-[10px] font-bold text-white ${
        inProgress ? 'bg-amber' : 'bg-green'
      }`}
    >
      {status}
    </span>
  );
}
