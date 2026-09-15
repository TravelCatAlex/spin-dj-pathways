'use client';

import Icon from '../atoms/Icon';
import Button from '../atoms/Button';

/**
 * MOLECULE — OpportunityRow
 * Accent-bordered row with an "I'm Interested" toggle.
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
      <div>
        <p className="opp-row__icon">
          <Icon glyph={icon} />
        </p>
        <p className="opp-row__title">{title}</p>
        <p className="opp-row__meta">{when}</p>
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
            : { color: accent, borderColor: accent }
        }
      >
        {interested ? '✓ Interested' : "I'm Interested"}
      </Button>
    </div>
  );
}
