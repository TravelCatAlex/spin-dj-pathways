'use client';

import Card from '../molecules/Card';
import Button from '../atoms/Button';
import Avatar from '../atoms/Avatar';
import Icon from '../atoms/Icon';

/**
 * ORGANISM — FeedbackCard ("Coach's Feedback")
 * Author row: avatar + name on the left, date pushed to the right.
 */
export default function FeedbackCard({ feedback, onViewAll }) {
  return (
    <Card className="flex flex-col" title="Coach's Feedback" icon="star">
      <div className="mb-3 flex items-center gap-[9px]">
        <Avatar
          name={feedback.coach}
          src={feedback.coachAvatarUrl}
          size={30}
          ring
        />
        <p className="m-0 text-[13px] font-bold">{feedback.coach}</p>
        <p className="m-0 ml-auto whitespace-nowrap text-[11px] text-muted">
          {feedback.date}
        </p>
      </div>

      <blockquote className="m-0 mb-[15px] text-[13px] leading-[1.6] text-ink">
        &ldquo;{feedback.message}&rdquo;
      </blockquote>

      <Button className="mt-auto" variant="outline" block onClick={onViewAll}>
        View All Feedback <Icon name="arrowRight" size={14} />
      </Button>
    </Card>
  );
}
