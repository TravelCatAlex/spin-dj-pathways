'use client';

import Icon from '../atoms/Icon';
import Stepper from '../molecules/Stepper';
import StageCallout from '../molecules/StageCallout';
import PathwayBanner from '../molecules/PathwayBanner';

const EYEBROW =
  'm-0 mb-[7px] text-[10px] font-semibold uppercase tracking-[1.1px] opacity-[0.72]';

/**
 * ORGANISM — PathwayCard
 *
 * Two bands in one card: the pathway header sits on the banner artwork,
 * the current project sits on flat deep purple beneath it.
 */
export default function PathwayCard({ pathway, project, onStartNextStep }) {
  return (
    <div className="overflow-hidden rounded-xl bg-[#1d0569] text-white shadow-purple">
      {/* Upper band: artwork sits behind the pathway header. */}
      <div className="relative min-h-[178px] px-[22px] pb-[22px] pt-5 max-[760px]:px-4">
        <PathwayBanner />

        <div className="relative z-[1]">
          <p className={EYEBROW}>Current Pathway</p>
          <h2 className="m-0 mb-2.5 text-[25px] font-extrabold tracking-[-0.4px]">
            {pathway.title}
          </h2>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.16] px-3 py-[5px] text-[11.5px] font-semibold">
            <Icon name={pathway.trackIcon} size={13} />
            {pathway.track}
          </span>
          <p className="m-0 mt-2.5 max-w-[42ch] text-[12.5px] opacity-85 max-[760px]:max-w-none">
            {pathway.description}
          </p>
        </div>
      </div>

      {/* Lower band: flat deep purple, no artwork. */}
      <div className="relative border-t border-white/[0.07] bg-[#1e0767] px-[22px] pb-5 pt-[18px] max-[760px]:px-4">
        <p className={EYEBROW}>Current Project</p>
        <h3 className="m-0 mb-[18px] flex items-center gap-2 text-[17px] font-extrabold">
          <Icon name={project.icon} size={17} />
          {project.title}
        </h3>

        <Stepper steps={project.stages} currentIndex={project.currentStageIndex} />

        <StageCallout
          stage={project.stages[project.currentStageIndex]}
          nextAction={project.nextAction}
          onGo={onStartNextStep}
        />
      </div>
    </div>
  );
}
