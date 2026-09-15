'use client';

import Icon from '../atoms/Icon';
import Button from '../atoms/Button';

/**
 * MOLECULE — OpportunityRow
 * Accent-bordered row with a tinted icon badge and an interest toggle.
 * Stateless: the parent organism owns `interested`.
 */
export default function OpportunityRow({
  title,
  when,
  icon,
  accent,
  interested = false,
  onToggle,
}) {
  return (
    <div className="opp-row" style={{ borderLeftColor: accent }}>
      <div className="opp-row__main">
        <span
          className="opp-row__icon"
          style={{ background: `${accent}1f`, color: accent }}
        >
          <Icon name={icon} />
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
        aria-pressed={interested}
        onClick={onToggle}
        style={
          interested
            ? { background: accent, color: '#fff', borderColor: accent }
            : { color: accent, borderColor: `${accent}59` }
        }
      >
        {interested ? '✓ Interested' : "I'm Interested"}
      </Button>
    </div>
  );
}
