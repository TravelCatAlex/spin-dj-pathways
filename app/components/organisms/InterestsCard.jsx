'use client';

import Card from '../molecules/Card';
import Button from '../atoms/Button';
import Tag from '../atoms/Tag';
import Icon from '../atoms/Icon';

/**
 * ORGANISM — InterestsCard ("Things I'm Into")
 * The footer button is pushed down with mt-auto so the three cards in the
 * row land their buttons on one line however much content each holds.
 */
export default function InterestsCard({ interests, onEdit, onSelect }) {
  return (
    <Card className="flex flex-col" title="Things I'm Into" icon="heart">
      <div className="mb-3.5 grid grid-cols-2 gap-[9px]">
        {interests.map((interest) => (
          <Tag
            key={interest.id}
            icon={interest.icon}
            name={interest.name}
            accent={interest.accent}
            onClick={() => onSelect?.(interest)}
          />
        ))}
      </div>
      <Button className="mt-auto" variant="outline" block onClick={onEdit}>
        Edit My Interests <Icon name="edit" />
      </Button>
    </Card>
  );
}
