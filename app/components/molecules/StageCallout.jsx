'use client';

import Icon from '../atoms/Icon';

/**
 * MOLECULE — StageCallout
 * Current stage on the left, the single next action plus a go button
 * on the right. Sits inside the purple hero card.
 */
export default function StageCallout({ stage, nextAction, onGo }) {
  return (
    <div className="stage-callout">
      <div className="stage-callout__block">
        <p className="stage-callout__label">Stage</p>
        <p className="stage-callout__stage">{stage}</p>
        <p className="stage-callout__here">
          <Icon glyph="📍" /> You&apos;re here
        </p>
      </div>

      <div className="stage-callout__block stage-callout__block--next">
        <p className="stage-callout__label">Next Step</p>
        <p className="stage-callout__next">{nextAction}</p>
      </div>

      <button
        type="button"
        className="stage-callout__go"
        aria-label={`Start: ${nextAction}`}
        onClick={onGo}
      >
        ›
      </button>
    </div>
  );
}
