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
  /* A student with nothing booked is a real state, and it arrived with real
   * data: the fixture always had a session, so this component read
   * `session.dateLabel` straight and threw the first time a live student had
   * none.
   *
   * It says so rather than hiding the card. A card that disappears reads as a
   * page that failed to load; a card that says the schedule is empty reads as
   * the schedule being empty, which is the true thing. */
  if (!session) {
    return (
      <Card className="flex flex-col" title="Next Session" icon="calendar">
        <div className="flex flex-1 flex-col items-center justify-center py-8 text-center">
          <p className="m-0 text-[15px] font-bold text-ink">Nothing booked yet</p>
          <p className="m-0 mt-1.5 text-[13px] text-muted">
            Your next session will appear here once it is scheduled.
          </p>
        </div>
        <Button className="mt-auto" block onClick={onViewSchedule}>
          View Full Schedule
        </Button>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col" title="Next Session" icon="calendar">
      <div className="mb-1.5 flex items-center justify-between gap-2.5">
        <p className="m-0 text-[16px] font-extrabold">{session.dateLabel}</p>
        <span className="shrink-0 rounded-full bg-purple-50 px-[11px] py-1 text-[12.5px] font-bold text-purple">
          {session.timeLabel}
        </span>
      </div>

      {/* WHAT the session is, under WHEN it is.
          Omitted rather than reserved when null - an empty line under the date
          reads as a component that failed to fill itself. Two lines at most, so
          a long WellnessLiving title cannot push the detail rows off the card. */}
      {session.title ? (
        <p className="m-0 mb-4 line-clamp-2 text-[12.5px] font-medium leading-snug text-ink/70">
          {session.title}
        </p>
      ) : (
        <div className="mb-4" />
      )}

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
