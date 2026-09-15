'use client';

import Icon from '../atoms/Icon';

/**
 * MOLECULE — StageCallout
 * Current stage + the single next action, shown inside the pathway hero card.
 */
export default function StageCallout({ stage, nextAction }) {
  return (
    <div className="stage-callout">
      <p className="stage-callout__label">Stage</p>
      <p className="stage-callout__stage">{stage}</p>
      <p className="stage-callout__next">
        <Icon glyph="▶️" /> {nextAction}
      </p>
    </div>
  );
}
