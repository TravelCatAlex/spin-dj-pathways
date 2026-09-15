'use client';

import Card from '../molecules/Card';
import Button from '../atoms/Button';
import Icon from '../atoms/Icon';
import Avatar from '../atoms/Avatar';

/**
 * ORGANISM — FeedbackCard ("Coach's Feedback")
 */
export default function FeedbackCard({ feedback, onViewAll }) {
  return (
    <Card title="Coach's Feedback" icon="star" tinted>
      <div className="feedback__author">
        <Avatar name={feedback.coach} size={24} />
        <p className="feedback__meta">
          {feedback.coach} • {feedback.date}
        </p>
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
