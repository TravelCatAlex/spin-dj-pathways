'use client';

import { m } from 'motion/react';

import Card from '../molecules/Card';
import Button from '../atoms/Button';
import Avatar from '../atoms/Avatar';
import Icon from '../atoms/Icon';
import { rise, group, spring } from '../../lib/motion';

/**
 * ORGANISM — FeedbackCard ("Coach's Feedback")
 * Author row: avatar + name on the left, date pushed to the right.
 *
 * The card is a quote, so it arrives like one: whoever said it lands first,
 * then what they said. Fading both together would have made the coach and the
 * praise read as one block of card furniture rather than a person speaking.
 */
export default function FeedbackCard({ feedback, onViewAll }) {
  const author = {
    ...rise,
    hover: { x: 2, transition: spring },
  };

  const portrait = {
    hover: { scale: 1.08, transition: spring },
  };

  return (
    <Card className="flex h-full flex-col" title="Coach's Feedback" icon="star">
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
          className="m-0 mb-[15px] text-[13px] leading-[1.6] text-ink"
          variants={rise}
        >
          &ldquo;{feedback.message}&rdquo;
        </m.blockquote>
      </m.div>

      <Button className="group mt-auto" variant="outline" block onClick={onViewAll}>
        View All Feedback
        {/* The same nudge as My Progress and the stage callout — one gesture
            for "go on then", wherever it appears. */}
        <span className="inline-flex transition-transform duration-200 ease-out group-hover:translate-x-1 motion-reduce:transition-none">
          <Icon name="arrowRight" size={14} />
        </span>
      </Button>
    </Card>
  );
}
