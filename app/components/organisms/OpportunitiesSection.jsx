'use client';

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
      title="Upcoming Opportunities"
      icon="target"
      action={
        <Button variant="ghost" onClick={onViewAll}>
          View All
        </Button>
      }
    >
      <div className="opp-list">
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
      </div>
    </Card>
  );
}
