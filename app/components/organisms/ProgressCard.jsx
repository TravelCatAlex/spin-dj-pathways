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
    <Card className="flex flex-col" title="My Progress" icon="trending">
      <div className="mb-[15px] flex flex-col gap-[13px]">
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
      <Button className="mt-auto" variant="outline" block onClick={onSeeAll}>
        See All Progress <Icon name="arrowRight" size={14} />
      </Button>
    </Card>
  );
}
