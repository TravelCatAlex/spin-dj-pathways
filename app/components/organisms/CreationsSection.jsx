'use client';

import Card from '../molecules/Card';
import Button from '../atoms/Button';
import MediaCard from '../molecules/MediaCard';

/**
 * ORGANISM — CreationsSection ("My Creations")
 */
export default function CreationsSection({ creations, onViewAll, onOpen }) {
  return (
    <Card
      title="My Creations"
      icon="film"
      className="section-gap"
      action={
        <Button variant="ghost" onClick={onViewAll}>
          View All
        </Button>
      }
    >
      <div className="grid-media">
        {creations.map((creation) => (
          <MediaCard
            key={creation.id}
            icon={creation.icon}
            title={creation.title}
            status={creation.status}
            meta={creation.meta}
            metaIcon={creation.metaIcon}
            kind={creation.kind}
            gradient={creation.gradient}
            thumbnailUrl={creation.thumbnailUrl}
            onClick={() => onOpen?.(creation)}
          />
        ))}
      </div>
    </Card>
  );
}
