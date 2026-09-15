'use client';

import Card from '../molecules/Card';
import Button from '../atoms/Button';
import SessionDetail from '../molecules/SessionDetail';

/**
 * ORGANISM — NextSessionCard
 * Date with the start time as a pill, then label/value detail rows.
 */
export default function NextSessionCard({ session, onViewSchedule }) {
  return (
    <Card title="Next Session" icon="📅">
      <div className="session__head">
        <p className="session__date">{session.dateLabel}</p>
        <span className="session__time">{session.timeLabel}</span>
      </div>

      <div className="session__list">
        {session.details.map((detail) => (
          <SessionDetail
            key={detail.id}
            label={detail.label}
            value={detail.value}
            icon={detail.icon}
          />
        ))}
      </div>

      <Button block onClick={onViewSchedule}>
        View Full Schedule
      </Button>
    </Card>
  );
}
