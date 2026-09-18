'use client';

import { m } from 'motion/react';

import Card from '../molecules/Card';
import Button from '../atoms/Button';
import LinkRow from '../molecules/LinkRow';
import { group } from '../../lib/motion';

/**
 * ORGANISM — OpportunitiesSection ("Opportunities to Try")
 *
 * Ways to take part in a Spin event beyond your own project.
 *
 * The rows used to carry a date and an "I'm Interested" toggle that held its
 * answer in local state. The toggle is gone: registering interest is a real
 * commitment, and a dashboard row that quietly remembered a yes until the
 * page reloaded — with no endpoint behind it — was promising something the
 * product could not keep. Each row now opens the opportunity, and saying yes
 * belongs on the page that can actually record it.
 */
export default function OpportunitiesSection({ opportunities, onSeeAll, onSelect }) {
  return (
    <Card
      className="flex h-full flex-col"
      title="Opportunities to Try"
      icon="users"
      action={
        <Button variant="ghost" onClick={onSeeAll}>
          See All
        </Button>
      }
    >
      <m.div className="flex flex-col" variants={group(0.06)}>
        {opportunities.map((opp, idx) => (
          <LinkRow
            key={opp.id}
            title={opp.title}
            description={opp.description}
            icon={opp.icon}
            accent={opp.accent}
            divided={idx > 0}
            onClick={() => onSelect?.(opp)}
          />
        ))}
      </m.div>
    </Card>
  );
}
