'use client';

import { m } from 'motion/react';

import Card from '../molecules/Card';
import Button from '../atoms/Button';
import SessionDetail from '../molecules/SessionDetail';
import { group } from '../../lib/motion';

/**
 * ORGANISM — NextSessionCard
 * Date with the start time as a pill, then label/value detail rows.
 * Fills the hero row's height: the list spreads, the button pins to the base.
 */
export default function NextSessionCard({ session, onViewSchedule }) {
  return (
    <Card className="flex flex-col" title="Next Session" icon="calendar">
      <div className="mb-5 flex items-center justify-between gap-2.5">
        <p className="m-0 text-[16px] font-extrabold">{session.dateLabel}</p>
        <span className="shrink-0 rounded-full bg-purple-50 px-[11px] py-1 text-[12.5px] font-bold text-purple">
          {session.timeLabel}
        </span>
      </div>

      {/* Teacher, then Program, Location, Project — the order you would read
          them, so the sequence reinforces the hierarchy instead of fighting it. */}
      <m.div
        className="mx-0 mb-4 mt-0.5 flex flex-1 flex-col justify-evenly"
        variants={group(0.09)}
      >
        {session.details.map((detail, idx) => (
          <SessionDetail
            key={detail.id}
            label={detail.label}
            value={detail.value}
            icon={detail.icon}
            valueIcon={detail.valueIcon}
            avatarUrl={detail.avatarUrl}
            isLast={idx === session.details.length - 1}
          />
        ))}
      </m.div>

      <Button className="mt-auto" block onClick={onViewSchedule}>
        View Full Schedule
      </Button>
    </Card>
  );
}
