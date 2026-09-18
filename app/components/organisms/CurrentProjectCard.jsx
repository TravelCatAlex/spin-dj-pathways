'use client';

import { m } from 'motion/react';

import Icon from '../atoms/Icon';
import Stepper from '../molecules/Stepper';
import ProjectMedia from '../molecules/ProjectMedia';
import ProjectNote from '../molecules/ProjectNote';
import ProjectUploads from './ProjectUploads';
import { delayedRise, HERO_TIMES, nudgeArrow, spring } from '../../lib/motion';

const EYEBROW =
  'm-0 mb-[7px] text-[10px] font-semibold uppercase tracking-[1.1px] opacity-[0.72]';

/**
 * ORGANISM — CurrentProjectCard
 *
 * The hero. Two bands on one deep-purple card: what you are making, then
 * where you are with it.
 *
 * This card used to lead with the pathway ("Creator Pathway") and carry the
 * project as a strip underneath. That put the most abstract thing on the page
 * in its most prominent slot — a pathway is a label you were assigned, while
 * the project is the thing you will actually open today. They have swapped:
 * the pathway now lives on its own tab, and the hero answers "what am I
 * making, and what happens next".
 *
 * The lower band is three notes side by side — stage, focus, latest update —
 * rather than the single "Stage / Next Step" panel it replaces. That panel
 * could only ever say one thing, so the timeline and the last thing that
 * happened had nowhere to go.
 *
 * No drop shadow: near-black purple on a near-white canvas separates itself.
 * The glow it used to carry sat 16px low and read as a smudge under the card.
 */
export default function CurrentProjectCard({
  project,
  onViewDetails,
  onPlay,
  onViewAllUploads = null,
  studentId = null,
}) {
  const stage = project.stages[project.currentStageIndex];

  return (
    <div className="overflow-hidden rounded-xl bg-[#1d0569] text-white">
      {/* Upper band: the project, and a still from it. */}
      <div className="flex items-start gap-6 px-[22px] pb-[22px] pt-5 max-[1180px]:flex-col max-[760px]:px-4">
        <div className="min-w-0 flex-1">
          <m.p variants={delayedRise} custom={HERO_TIMES.eyebrow} className={EYEBROW}>
            Current Project
          </m.p>

          <m.h2
            variants={delayedRise}
            custom={HERO_TIMES.title}
            className="m-0 mb-2 flex items-center gap-2.5 text-[25px] font-extrabold tracking-[-0.4px]"
          >
            <Icon name={project.icon} size={24} />
            {project.title}
          </m.h2>

          <m.p
            variants={delayedRise}
            custom={HERO_TIMES.description}
            className="m-0 mb-3.5 max-w-[46ch] text-[12.5px] opacity-85 max-[760px]:max-w-none"
          >
            {project.description}
          </m.p>

          {/* Lands last: it qualifies the project, so it reads as an answer to
              the name rather than arriving alongside it. */}
          <m.span
            variants={delayedRise}
            custom={HERO_TIMES.badge}
            className="inline-flex items-center gap-2 rounded-full bg-[#5a2fc2] px-3.5 py-1.5 text-[11.5px] font-semibold text-white"
          >
            {/* Breathes, because the stage is live rather than a fixed label —
                the one thing on this card that is still happening. */}
            <m.span
              aria-hidden="true"
              className="h-[7px] w-[7px] rounded-full bg-white"
              animate={{ opacity: [1, 0.35, 1] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
            />
            {project.status}
          </m.span>
        </div>

        <m.div
          variants={delayedRise}
          custom={HERO_TIMES.badge}
          className="max-[1180px]:w-full"
        >
          <ProjectMedia
            src={project.thumbnailUrl}
            alt={project.title}
            onPlay={onPlay}
          />
        </m.div>
      </div>

      {/* Lower band: progress, then the two notes about it. */}
      <div className="grid grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)_minmax(0,1.05fr)] gap-6 border-t border-white/[0.07] bg-[#1e0767] px-[22px] pb-5 pt-[18px] max-[1180px]:grid-cols-1 max-[1180px]:gap-5 max-[760px]:px-4">
        <div className="min-w-0">
          <p className={EYEBROW}>Project Stage</p>
          <Stepper steps={project.stages} currentIndex={project.currentStageIndex} />
        </div>

        {/* Hairlines rather than a gap alone: three columns of small type run
            together otherwise, and the middle note stops reading as its own
            fact. They go once the band stacks. */}
        <div className="min-w-0 border-l border-l-white/[0.09] pl-6 max-[1180px]:border-l-0 max-[1180px]:border-t max-[1180px]:border-t-white/[0.09] max-[1180px]:pl-0 max-[1180px]:pt-5">
          <ProjectNote
            label="Current Focus"
            icon="target"
            title={project.currentFocus.title}
            detail={project.currentFocus.description}
            delay={0.42}
          />
        </div>

        <div className="flex min-w-0 flex-col justify-between gap-3 border-l border-l-white/[0.09] pl-6 max-[1180px]:border-l-0 max-[1180px]:border-t max-[1180px]:border-t-white/[0.09] max-[1180px]:pl-0 max-[1180px]:pt-5">
          <ProjectNote
            label="Latest Update"
            icon="message"
            title={project.latestUpdate.message}
            detail={project.latestUpdate.date}
            delay={0.5}
          />

          <m.button
            type="button"
            onClick={onViewDetails}
            whileHover="hover"
            whileTap={{ scale: 0.98, transition: spring }}
            aria-label={`View details for ${project.title} — currently ${stage?.label}`}
            className="group inline-flex w-full items-center justify-center gap-2 self-end rounded-[10px] border border-white/20 bg-white/[0.12] px-[15px] py-[9px] text-[12.5px] font-semibold text-white transition-colors duration-150 ease-out hover:border-white/35 hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            View Project Details
            {/* The same nudge the rest of the page uses for "go on then". */}
            <m.span variants={nudgeArrow} aria-hidden="true" className="inline-flex">
              <Icon name="arrowRight" size={14} />
            </m.span>
          </m.button>
        </div>
      </div>

      {/* A band of its own rather than a fourth column in the row above. Those
          three are notes ABOUT the project and read as a set; this one is a
          thing you do to it, and squeezing an upload control in beside them
          would have made the set say two different kinds of thing.

          It is also the first part of this card backed by real data rather than
          fixtures, which is a good reason to keep its edges visible. */}
      {/* THE SAME HORIZONTAL PADDING AS THE BANDS ABOVE. The first version put
          this strip as a bare child of the card, outside the padded rows, and it
          sat flush against the left edge while everything above it was inset by
          22px - which read as a broken component rather than a design choice. */}
      <div className="border-t border-white/[0.07] bg-[#1e0767] px-[22px] pb-[18px] pt-[14px] max-[760px]:px-4">
        <ProjectUploads
          studentId={studentId}
          limit={5}
          tone="dark"
          title="Recordings"
          onViewAll={onViewAllUploads}
          showRule={false}
        />
      </div>
    </div>
  );
}
