'use client';

import { m } from 'motion/react';
import { group } from '../../lib/motion';

import { useState } from 'react';
import Card from '../molecules/Card';
import Button from '../atoms/Button';
import OpportunityRow from '../molecules/OpportunityRow';

/**
 * ORGANISM — OpportunitiesSection ("Upcoming Opportunities")
 * A vertical list beside My Creations. Owns the local interested-toggle
 * state until POST/DELETE /opportunities/{id}/interest lands.
 */
export default function OpportunitiesSection({ opportunities, onViewAll }) {
  const [interested, setInterested] = useState({});

  const toggle = (id) =>
    setInterested((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <Card
      className="flex flex-col"
      title="Upcoming Opportunities"
      icon="target"
      action={
        <Button variant="ghost" onClick={onViewAll}>
          View All
        </Button>
      }
    >
      {/* Stretches to fill the equal-height card. */}
      <m.div className="flex flex-col gap-2.5" variants={group(0.05)}>
        {opportunities.map((opp) => (
          <OpportunityRow
            key={opp.id}
            title={opp.title}
            when={opp.when}
            icon={opp.icon}
            accent={opp.accent}
            cta={opp.cta}
            interested={Boolean(interested[opp.id])}
            onToggle={() => toggle(opp.id)}
          />
        ))}
      </m.div>
    </Card>
  );
}
