'use client';

import Card from '../molecules/Card';
import Button from '../atoms/Button';
import MediaCard from '../molecules/MediaCard';

/**
 * ORGANISM — CreationsSection ("My Creations")
 * The grid keeps its natural height inside the equal-height split row, so
 * stretching it can't open a dead gap between each title and its date row.
 */
export default function CreationsSection({ creations, onViewAll, onOpen }) {
  return (
    <Card
      className="flex flex-col"
      title="My Creations"
      icon="film"
      action={
        <Button variant="ghost" onClick={onViewAll}>
          View All
        </Button>
      }
    >
      {/* Three across when there's room, dropping to two then one on its own —
          below ~150px a thumbnail is too cramped to read. */}
      <div className="grid grid-cols-3 content-start gap-4 max-[760px]:grid-cols-1">
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
