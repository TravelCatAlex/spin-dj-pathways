'use client';

import { m } from 'motion/react';
import { group } from '../../lib/motion';

import Card from '../molecules/Card';
import JourneyStep from '../molecules/JourneyStep';

/**
 * ORGANISM — JourneySection ("Your Pathway Journey")
 * Seven across, dropping to four, two, then one as the viewport narrows.
 */
/** Seconds between one stage landing and the next setting off. */
const BEAT = 0.22;

/**
 * The trace waits for the card to be on screen. This section sits at the foot
 * of the dashboard, so on load it would draw itself entirely below the fold
 * and be finished before anyone scrolled to it — the one animation on the
 * page nobody would ever see.
 *
 * It draws once. Redrawing it on every return made scrolling up and down feel
 * like the page was restarting itself; a dashboard is scrolled constantly, so
 * an animation that repeats becomes a tic. Switching tabs remounts the tree
 * and the trace runs again, which is the moment it is actually worth seeing.
 */
export default function JourneySection({ steps }) {

  return (
    <Card title="Your Pathway Journey" icon="pathway">
      <m.ol
        variants={group(0)}
        initial="hidden"
        whileInView="show"
        // Matches every other reveal on the page: the same top margin so a
        // trace jumped straight past still draws rather than staying blank.
        viewport={{ amount: 0.4, once: true, margin: '1400px 0px 80px 0px' }}
        className="m-0 grid list-none grid-cols-7 gap-2.5 p-0 max-[1180px]:grid-cols-4 max-[1180px]:gap-y-5 max-[760px]:grid-cols-1">
        {steps.map((step, idx) => (
          <JourneyStep
            key={step.id}
            icon={step.icon}
            title={step.title}
            description={step.description}
            accent={step.accent}
            showArrow={idx < steps.length - 1}
            hideArrowAtMedium={idx % 4 === 3}
            delay={idx * BEAT}
          />
        ))}
      </m.ol>
    </Card>
  );
}
