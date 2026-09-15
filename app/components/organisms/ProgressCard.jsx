'use client';

import { m } from 'motion/react';
import { group } from '../../lib/motion';

import Card from '../molecules/Card';
import Button from '../atoms/Button';
import Icon from '../atoms/Icon';
import ProgressItem from '../molecules/ProgressItem';

/**
 * ORGANISM — ProgressCard ("My Progress")
 *
 * The header wears charted bars, not the trending arrow: the first item
 * already uses that arrow to mean "improving", and repeating it in the header
 * made the two read as related when they are not.
 */
export default function ProgressCard({ items, onSeeAll }) {
  return (
    <Card className="flex h-full flex-col" title="My Progress" icon="chart">
      <m.div className="mb-[15px] flex flex-col gap-[13px]" variants={group(0.05)}>
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
      <Button className="group mt-auto" variant="outline" block onClick={onSeeAll}>
        See All Progress
        {/* Nudges the way the stage callout's arrow does, so "go on then" is
            the same gesture wherever it appears. CSS, because Button is not a
            motion element and nothing here writes an inline transform. */}
        <span className="inline-flex transition-transform duration-200 ease-out group-hover:translate-x-1 motion-reduce:transition-none">
          <Icon name="arrowRight" size={14} />
        </span>
      </Button>
    </Card>
  );
}
