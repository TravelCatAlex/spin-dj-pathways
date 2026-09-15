'use client';

import Card from '../molecules/Card';
import JourneyStep from '../molecules/JourneyStep';

/**
 * ORGANISM — JourneySection ("Your Pathway Journey")
 * Seven across, dropping to four, two, then one as the viewport narrows.
 */
export default function JourneySection({ steps }) {
  return (
    <Card title="Your Pathway Journey" icon="pathway">
      <ol className="m-0 grid list-none grid-cols-7 gap-2.5 p-0 max-[1180px]:grid-cols-4 max-[1180px]:gap-y-5 max-[760px]:grid-cols-2 max-[420px]:grid-cols-1">
        {steps.map((step, idx) => (
          <JourneyStep
            key={step.id}
            icon={step.icon}
            title={step.title}
            description={step.description}
            accent={step.accent}
            showArrow={idx < steps.length - 1}
            hideArrowAtMedium={idx % 4 === 3}
          />
        ))}
      </ol>
    </Card>
  );
}
