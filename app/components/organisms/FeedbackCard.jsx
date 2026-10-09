'use client';

import { m } from 'motion/react';

import Card from '../molecules/Card';
import Button from '../atoms/Button';
import Avatar from '../atoms/Avatar';
import Skeleton from '../atoms/Skeleton';
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
export default function FeedbackCard({ feedback, onSeeAll, loading = false }) {
  const author = {
    ...rise,
    hover: { x: 2, transition: spring },
  };

  const portrait = {
    hover: { scale: 1.08, transition: spring },
  };

  if (loading) {
    // The whole quote is unknown until the note lands, so the whole quote waits -
    // author row and message both. Showing the fixture here would read as a real
    // coach's words that then changed to someone else's.
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
        <div className="mb-3 flex items-center gap-[9px]">
          <span className="relative block h-[30px] w-[30px] shrink-0 overflow-hidden rounded-full">
            <Skeleton tone="light" rounded="rounded-full" />
          </span>
          <span className="relative block h-[13px] w-24 overflow-hidden rounded">
            <Skeleton tone="light" rounded="rounded" />
          </span>
          <span className="relative ml-auto block h-[11px] w-16 overflow-hidden rounded">
            <Skeleton tone="light" rounded="rounded" />
          </span>
        </div>
        <div className="flex flex-col gap-2">
          {['w-full', 'w-full', 'w-2/3'].map((w, i) => (
            <span key={i} className={`relative block h-[12px] overflow-hidden rounded ${w}`}>
              <Skeleton tone="light" rounded="rounded" />
            </span>
          ))}
        </div>
      </Card>
    );
  }

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
      {/* initial/animate are set HERE rather than inherited from the Reveal
          wrapper. This card mounts its real content AFTER a fetch, by which time
          the Reveal's `whileInView` has already fired once and will not fire
          again - so a subtree relying on inherited state mounts at `hidden` and
          the quote never appears. Driving it from its own mount makes it animate
          in whenever it lands, skeleton-swap or not. */}
      <m.div variants={group(0.09)} initial="hidden" animate="show">
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
