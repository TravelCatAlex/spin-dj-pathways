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
    <Card title="Coach's Feedback" icon="star">
      <div className="feedback__author">
        <Avatar
          name={feedback.coach}
          src={feedback.coachAvatarUrl}
          size={30}
          ring
        />
        <p className="feedback__name">{feedback.coach}</p>
        <p className="feedback__date">{feedback.date}</p>
      </div>

      <blockquote className="feedback__quote">
        &ldquo;{feedback.message}&rdquo;
      </blockquote>

      <Button variant="outline" block onClick={onViewAll}>
        View All Feedback <Icon name="arrowRight" size={14} />
      </Button>
    </Card>
  );
}
