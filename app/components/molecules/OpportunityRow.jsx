'use client';

import Icon from '../atoms/Icon';
import Button from '../atoms/Button';

/**
 * MOLECULE — OpportunityRow
 * Circular tinted icon + copy + action. `cta` picks the wording — some
 * opportunities invite interest, others just link through.
 * Stateless: the parent organism owns `interested`.
 */
export default function OpportunityRow({
  title,
  when,
  icon,
  accent,
  cta = "I'm Interested",
  interested = false,
  onToggle,
}) {
  const isInterestCta = cta === "I'm Interested";
  const label = interested ? '✓ Interested' : cta;

  return (
    <div
      className="flex items-center justify-between gap-3 rounded-md border border-line border-l-4 bg-surface px-[15px] py-[13px] max-[760px]:flex-col max-[760px]:items-stretch"
      style={{ borderLeftColor: accent }}
    >
      <div className="flex min-w-0 items-center gap-[11px]">
        <span
          className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-[14px]"
          style={{ background: `${accent}1f`, color: accent }}
        >
          <Icon name={icon} size={15} />
        </span>
        <div>
          <p className="m-0 mb-0.5 text-[13px] font-bold">{title}</p>
          <p className="m-0 text-[11px] text-muted">{when}</p>
        </div>
      </div>
      <Button
        size="sm"
        variant="outline"
        className="whitespace-nowrap max-[760px]:w-full"
        aria-pressed={isInterestCta ? interested : undefined}
        onClick={onToggle}
        style={
          interested && isInterestCta
            ? { background: accent, color: '#fff', borderColor: accent }
            : { color: accent, borderColor: `${accent}59` }
        }
      >
        {isInterestCta ? label : cta}
      </Button>
    </div>
  );
}
