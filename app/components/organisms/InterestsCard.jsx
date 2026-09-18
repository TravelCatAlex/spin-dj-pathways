'use client';

import { m } from 'motion/react';

import Card from '../molecules/Card';
import Button from '../atoms/Button';
import Tag from '../atoms/Tag';
import { group } from '../../lib/motion';

/**
 * ORGANISM — InterestsCard ("Things I'm Into")
 *
 * The edit action moved from a full-width button in the footer to a link in
 * the header. Three cards sat in this row, each ending in its own purple
 * button, and the row read as three calls to action competing with the one
 * primary button on the page — "View Full Schedule" in Next Session. These
 * are places to look, not things to do; the header link says so.
 */
export default function InterestsCard({ interests, onEdit, onSelect }) {
  return (
    <Card
      className="flex h-full flex-col"
      title="Things I'm Into"
      icon="heart"
      action={
        <Button variant="ghost" onClick={onEdit}>
          Edit
        </Button>
      }
    >
      <m.div className="grid grid-cols-2 gap-[9px]" variants={group(0.04)}>
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
    </Card>
  );
}
