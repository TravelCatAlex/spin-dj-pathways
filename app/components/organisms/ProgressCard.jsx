'use client';

import { m } from 'motion/react';

import Card from '../molecules/Card';
import Button from '../atoms/Button';
import ProgressItem from '../molecules/ProgressItem';
import { group } from '../../lib/motion';

/**
 * ORGANISM — ProgressCard ("My Progress")
 *
 * The header wears charted bars, not the trending arrow: the first item
 * already uses that arrow to mean "improving", and repeating it in the header
 * made the two read as related when they are not.
 *
 * "See All" sits in the header rather than as a footer button, for the reason
 * `InterestsCard` records — three stacked purple buttons in one row competed
 * with the page's single primary action.
 */
export default function ProgressCard({ items, onSeeAll }) {
  return (
    <Card
      className="flex h-full flex-col"
      title="My Progress"
      icon="chart"
      action={
        <Button variant="ghost" onClick={onSeeAll}>
          See All
        </Button>
      }
    >
      <m.div
        className="flex flex-col justify-between gap-[15px]"
        variants={group(0.05)}
      >
        {items.map((item) => (
          <ProgressItem
            key={item.id}
            icon={item.icon}
            title={item.title}
            description={item.description}
            accent={item.accent}
          />
        ))}
      </m.div>
    </Card>
  );
}
