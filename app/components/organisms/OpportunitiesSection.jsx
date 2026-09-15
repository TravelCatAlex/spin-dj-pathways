'use client';

import { useState } from 'react';
import Card from '../molecules/Card';
import Button from '../atoms/Button';
import OpportunityRow from '../molecules/OpportunityRow';

/**
 * ORGANISM — OpportunitiesSection ("Upcoming Opportunities")
 * Owns the local interested-toggle state until the POST/DELETE
 * /opportunities/{id}/interest endpoints land.
 */
export default function OpportunitiesSection({ opportunities, onViewAll }) {
  const [interested, setInterested] = useState({});

  const toggle = (id) =>
    setInterested((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <Card
      title="Upcoming Opportunities"
      icon="🎯"
      className="section-gap"
      action={
        <Button variant="ghost" onClick={onViewAll}>
          View All
        </Button>
      }
    >
      <div className="grid-two">
        {opportunities.map((opp) => (
          <OpportunityRow
            key={opp.id}
            title={opp.title}
            when={opp.when}
            icon={opp.icon}
            accent={opp.accent}
            interested={Boolean(interested[opp.id])}
            onToggle={() => toggle(opp.id)}
          />
        ))}
      </div>
    </Card>
  );
}
