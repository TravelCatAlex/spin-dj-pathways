'use client';

import { m } from 'motion/react';
import { group } from '../../lib/motion';

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
    <Card className="flex h-full flex-col" title="Things I'm Into" icon="heart">
      <m.div className="mb-3.5 grid grid-cols-2 gap-[9px]" variants={group(0.04)}>
        {interests.map((interest) => (
          <Tag
            key={interest.id}
            icon={interest.icon}
            name={interest.name}
            accent={interest.accent}
            onClick={() => onSelect?.(interest)}
          />
        ))}
      </m.div>
      <Button className="group mt-auto" variant="outline" block onClick={onEdit}>
        Edit My Interests
        {/* The pencil tips back as if being picked up. Plain CSS: Button is
            not a motion element, so nothing is writing an inline transform
            that a class would lose to. */}
        <span className="inline-flex transition-transform duration-200 ease-out group-hover:-rotate-[18deg] motion-reduce:transition-none">
          <Icon name="edit" />
        </span>
      </Button>
    </Card>
  );
}
