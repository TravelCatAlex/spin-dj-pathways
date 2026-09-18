'use client';

import { m } from 'motion/react';

import Card from '../molecules/Card';
import Button from '../atoms/Button';
import LinkRow from '../molecules/LinkRow';
import { group } from '../../lib/motion';

/**
 * ORGANISM — NextProjectsCard ("Possible Next Projects")
 *
 * Suggestions drawn from the student's interests. It sits directly below
 * "Things I'm Into" in the same column, which is the argument for the card
 * existing at all: the tags say what you like, this says what you could make
 * out of that, and the two read top to bottom as cause and effect.
 */
export default function NextProjectsCard({ projects, onSeeAll, onSelect }) {
  return (
    <Card
      className="flex h-full flex-col"
      title="Possible Next Projects"
      icon="idea"
      action={
        <Button variant="ghost" onClick={onSeeAll}>
          See All
        </Button>
      }
    >
      <m.div className="flex flex-col" variants={group(0.06)}>
        {projects.map((project, idx) => (
          <LinkRow
            key={project.id}
            title={project.title}
            description={project.description}
            icon={project.icon}
            accent={project.accent}
            divided={idx > 0}
            onClick={() => onSelect?.(project)}
          />
        ))}
      </m.div>
    </Card>
  );
}
