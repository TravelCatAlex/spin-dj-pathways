'use client';

import Card from '../molecules/Card';
import JourneyStep from '../molecules/JourneyStep';

/**
 * ORGANISM — JourneySection ("Your Pathway Journey")
 */
export default function JourneySection({ steps }) {
  return (
    <Card title="Your Pathway Journey" icon="🛤️">
      <ol className="journey">
        {steps.map((step, idx) => (
          <JourneyStep
            key={step.id}
            icon={step.icon}
            title={step.title}
            description={step.description}
            showArrow={idx < steps.length - 1}
          />
        ))}
      </ol>
    </Card>
  );
}
