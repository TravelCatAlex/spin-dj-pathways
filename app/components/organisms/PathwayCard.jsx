'use client';

import { m } from 'motion/react';

import Icon from '../atoms/Icon';
import Stepper from '../molecules/Stepper';
import StageCallout from '../molecules/StageCallout';
import PathwayBanner from '../molecules/PathwayBanner';
import { delayedRise, HERO_TIMES } from '../../lib/motion';

const EYEBROW =
  'm-0 mb-[7px] text-[10px] font-semibold uppercase tracking-[1.1px] opacity-[0.72]';

/**
 * ORGANISM — PathwayCard
 *
 * Two bands in one card: the pathway header sits on the banner artwork,
 * the current project sits on flat deep purple beneath it.
 *
 * No drop shadow: the card is near-black purple on a near-white canvas, so
 * its own edge separates it. The glow it used to carry sat 16px low and read
 * as a smudge under the card rather than lift.
 *
 * The upper band broadcasts "hover" so the artwork inside PathwayBanner can
 * drift without the band itself moving. The card does not lift the way the
 * smaller cards do — it is the widest element on the page, and raising the
 * whole thing reads as the layout shifting rather than a card responding.
 */
export default function PathwayCard({ pathway, project, onStartNextStep }) {
  return (
    <div className="overflow-hidden rounded-xl bg-[#1d0569] text-white">
      {/* Upper band: artwork sits behind the pathway header. */}
      <m.div
        whileHover="hover"
        className="relative min-h-[178px] px-[22px] pb-[22px] pt-5 max-[760px]:px-4"
      >
        <PathwayBanner />

        <div className="relative z-[1]">
          <m.p
            variants={delayedRise}
            custom={HERO_TIMES.eyebrow}
            className={EYEBROW}
          >
            Current Pathway
          </m.p>

          <m.h2
            variants={delayedRise}
            custom={HERO_TIMES.title}
            className="m-0 mb-2.5 text-[25px] font-extrabold tracking-[-0.4px]"
          >
            {pathway.title}
          </m.h2>

          {/* Lands after the title: it qualifies the pathway, so it reads as
              an answer to the name rather than arriving alongside it. */}
          <m.span
            variants={delayedRise}
            custom={HERO_TIMES.badge}
            className="inline-flex items-center gap-1.5 rounded-full bg-[#e0d5fa] px-3.5 py-1.5 text-[11.5px] font-semibold text-black shadow-[0_2px_10px_rgba(224,213,250,0.3)]"
          >
            <Icon name={pathway.trackIcon} size={13} />
            {pathway.track}
          </m.span>

          <m.p
            variants={delayedRise}
            custom={HERO_TIMES.description}
            className="m-0 mt-2.5 max-w-[42ch] text-[12.5px] opacity-85 max-[760px]:max-w-none"
          >
            {pathway.description}
          </m.p>
        </div>
      </m.div>

      {/* Lower band: flat deep purple, no artwork. */}
      <div className="relative border-t border-white/[0.07] bg-[#1e0767] px-[22px] pb-5 pt-[18px] max-[760px]:px-4">
        <p className={EYEBROW}>Current Project</p>
        <h3 className="m-0 mb-[18px] flex items-center gap-2 text-[17px] font-extrabold">
          <Icon name={project.icon} size={17} />
          {project.title}
        </h3>

        <Stepper steps={project.stages} currentIndex={project.currentStageIndex} />

        <StageCallout
          stage={project.stages[project.currentStageIndex].label}
          nextAction={project.nextAction}
          onGo={onStartNextStep}
        />
      </div>
    </div>
  );
}
