'use client';

import Card from '../molecules/Card';
import Button from '../atoms/Button';
import Icon from '../atoms/Icon';
import ProgressItem from '../molecules/ProgressItem';

/**
 * ORGANISM — ProgressCard ("My Progress")
 */
export default function ProgressCard({ items, onSeeAll }) {
  return (
    <Card title="My Progress" icon="trending">
      <div className="progress-list">
        {items.map((item) => (
          <ProgressItem
            key={item.id}
            icon={item.icon}
            title={item.title}
            description={item.description}
            accent={item.accent}
          />
        ))}
      </div>
      <Button variant="outline" block onClick={onSeeAll}>
        See All Progress <Icon name="arrowRight" size={14} />
      </Button>
    </Card>
  );
}
