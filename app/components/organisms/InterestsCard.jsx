'use client';

import Card from '../molecules/Card';
import Button from '../atoms/Button';
import Tag from '../atoms/Tag';
import Icon from '../atoms/Icon';

/**
 * ORGANISM — InterestsCard ("Things I'm Into")
 */
export default function InterestsCard({ interests, onEdit, onSelect }) {
  return (
    <Card title="Things I'm Into" icon="❤️">
      <div className="tag-grid">
        {interests.map((interest) => (
          <Tag
            key={interest.id}
            icon={interest.icon}
            name={interest.name}
            onClick={() => onSelect?.(interest)}
          />
        ))}
      </div>
      <Button block onClick={onEdit}>
        Edit My Interests <Icon glyph="✏️" />
      </Button>
    </Card>
  );
}
