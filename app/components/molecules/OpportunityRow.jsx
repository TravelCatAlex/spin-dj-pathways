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
    <div className="opp-row" style={{ borderLeftColor: accent }}>
      <div className="opp-row__main">
        <span
          className="opp-row__icon"
          style={{ background: `${accent}1f`, color: accent }}
        >
          <Icon name={icon} size={15} />
        </span>
        <div>
          <p className="opp-row__title">{title}</p>
          <p className="opp-row__meta">{when}</p>
        </div>
      </div>
      <Button
        size="sm"
        variant="outline"
        className="opp-row__cta"
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
