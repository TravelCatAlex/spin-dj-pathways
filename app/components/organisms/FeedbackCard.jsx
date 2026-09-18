'use client';

import { m } from 'motion/react';

import Card from '../molecules/Card';
import Button from '../atoms/Button';
import Avatar from '../atoms/Avatar';
import { group, rise, spring } from '../../lib/motion';

/**
 * ORGANISM — FeedbackCard ("Coach's Feedback")
 * Author row: avatar + name on the left, date pushed to the right.
 *
 * The card is a quote, so it arrives like one: whoever said it lands first,
 * then what they said. Fading both together would have made the coach and the
 * praise read as one block of card furniture rather than a person speaking.
 *
 * "See All" moved to the header along with the other two cards in this row —
 * see `InterestsCard` for why.
 */
export default function FeedbackCard({ feedback, onSeeAll }) {
  const author = {
    ...rise,
    hover: { x: 2, transition: spring },
  };

  const portrait = {
    hover: { scale: 1.08, transition: spring },
  };

  return (
    <Card
      className="flex h-full flex-col"
      title="Coach's Feedback"
      icon="star"
      action={
        <Button variant="ghost" onClick={onSeeAll}>
          See All
        </Button>
      }
    >
      <m.div variants={group(0.09)}>
        <m.div
          className="mb-3 flex cursor-default items-center gap-[9px]"
          variants={author}
          whileHover="hover"
        >
          <m.div variants={portrait} className="shrink-0">
            <Avatar name={feedback.coach} src={feedback.coachAvatarUrl} size={30} />
          </m.div>
          <p className="m-0 text-[13px] font-bold">{feedback.coach}</p>
          <p className="m-0 ml-auto whitespace-nowrap text-[11px] text-muted">
            {feedback.date}
          </p>
        </m.div>

        <m.blockquote
          className="m-0 text-[13px] leading-[1.6] text-ink"
          variants={rise}
        >
          &ldquo;{feedback.message}&rdquo;
        </m.blockquote>
      </m.div>
    </Card>
  );
}
