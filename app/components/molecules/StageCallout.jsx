'use client';

import Icon from '../atoms/Icon';

/**
 * MOLECULE — StageCallout
 * A white panel on the project band: current stage on the left, the next
 * action beside it, and a go button at the end.
 */
export default function StageCallout({ stage, nextAction, onGo }) {
  return (
    <div className="stage-callout">
      <div className="stage-callout__block">
        <p className="stage-callout__label">Stage</p>
        <p className="stage-callout__stage">{stage}</p>
        <p className="stage-callout__here">
          <span className="stage-callout__pulse" aria-hidden="true" />
          You&apos;re here
        </p>
      </div>

      <div className="stage-callout__block stage-callout__block--next">
        <span className="stage-callout__tile">
          <Icon name="video" size={16} />
        </span>
        <span>
          <p className="stage-callout__label">Next Step</p>
          <p className="stage-callout__next">{nextAction}</p>
        </span>
      </div>

      <button
        type="button"
        className="stage-callout__go"
        aria-label={`Start: ${nextAction}`}
        onClick={onGo}
      >
        <Icon name="chevronRight" size={16} />
      </button>
    </div>
  );
}
