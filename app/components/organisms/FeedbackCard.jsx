'use client';

import Card from '../molecules/Card';
import Button from '../atoms/Button';

/**
 * ORGANISM — FeedbackCard ("Coach's Feedback")
 */
export default function FeedbackCard({ feedback, onViewAll }) {
  return (
    <Card title="Coach's Feedback" icon="⭐" tinted>
      <p className="feedback__meta">
        {feedback.coach} • {feedback.date}
      </p>
      <blockquote className="feedback__quote">
        &ldquo;{feedback.message}&rdquo;
      </blockquote>
      <Button variant="outline" block onClick={onViewAll}>
        View All Feedback →
      </Button>
    </Card>
  );
}
