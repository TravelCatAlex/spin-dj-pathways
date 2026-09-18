'use client';

import { m } from 'motion/react';

import Card from '../molecules/Card';
import JourneyStep from '../molecules/JourneyStep';
import { group, riseDelayed } from '../../lib/motion';

/** Seconds between one stage landing and the next setting off. */
const BEAT = 0.22;

/**
 * ORGANISM — JourneySection ("Your Journey")
 *
 * Four stages across when the card is wide; stacked top to bottom when it is
 * narrow.
 *
 * The switch reads two signals, because the card is narrow in two different
 * ways. A phone narrows the whole viewport (`max-[760px]`). But on desktop the
 * card also sits in a one-third column that gets tight long before the window
 * does — at ~984px the four discs collide even though the viewport is wide — so
 * a container query (`@max-[300px]`, this card marked `@container`) catches the
 * column's own width regardless of the viewport. Either one drops the route to
 * a vertical rail that reads top to bottom. Above both, the discs and their
 * labels have the room to sit across.
 *
 * It used to be seven stages across the full width, naming the pipeline:
 * Intake, Supabase, Rules Recommendation, Teacher Review. That is an
 * architecture diagram — it told a fourteen-year-old that a database is a
 * step in their creative journey. Discover, Create, Share, Grow is the same
 * route described as something a person does, and four of them fit beside the
 * other two cards instead of needing a row to themselves.
 *
 * The trace waits for the card to be on screen: this sits at the foot of the
 * dashboard, so on load it would draw itself entirely below the fold and be
 * finished before anyone scrolled to it — the one animation on the page
 * nobody would ever see.
 *
 * It draws once. Redrawing on every return made scrolling up and down feel
 * like the page was restarting itself; a dashboard is scrolled constantly, so
 * an animation that repeats becomes a tic. Switching tabs remounts the tree
 * and the trace runs again, which is the moment it is actually worth seeing.
 */
export default function JourneySection({ steps, note }) {
  return (
    <Card className="flex h-full flex-col" title="Your Journey" icon="flag">
      <m.div
        variants={group(0)}
        initial="hidden"
        whileInView="show"
        // Matches every other reveal on the page: the same top margin so a
        // trace jumped straight past still draws rather than staying blank.
        viewport={{ amount: 0.4, once: true, margin: '1400px 0px 80px 0px' }}
        className="@container flex h-full flex-col"
      >
        <ol className="mx-0 mb-[18px] mt-0 grid list-none grid-cols-4 gap-1.5 p-0 max-[760px]:grid-cols-1 max-[760px]:gap-y-5 @max-[300px]:grid-cols-1 @max-[300px]:gap-y-5">
          {steps.map((step, idx) => (
            <JourneyStep
              key={step.id}
              icon={step.icon}
              title={step.title}
              description={step.description}
              accent={step.accent}
              showArrow={idx < steps.length - 1}
              delay={idx * BEAT}
            />
          ))}
        </ol>

        {/* Arrives after the route has been drawn, so it reads as the closing
            remark on the journey rather than a banner sitting under it. */}
        {note && (
          <m.p
            variants={riseDelayed}
            custom={steps.length * BEAT}
            className="m-0 mt-auto rounded-[10px] bg-purple-50 px-3 py-2.5 pt-[11px] text-center text-[11.5px] font-semibold text-purple"
          >
            {note}
          </m.p>
        )}
      </m.div>
    </Card>
  );
}
