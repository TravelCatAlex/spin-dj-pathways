'use client';

import Icon from '../atoms/Icon';
import Stepper from '../molecules/Stepper';
import StageCallout from '../molecules/StageCallout';
import PathwayBannerArt from '../molecules/PathwayBannerArt';

/**
 * ORGANISM — PathwayCard
 * Creator Pathway hero + the current project stepper beneath it.
 */
export default function PathwayCard({ pathway, project }) {
  return (
    <div className="pathway-card">
      <PathwayBannerArt />

      <p className="pathway-card__eyebrow">Current Pathway</p>
      <h2 className="pathway-card__title">{pathway.title}</h2>
      <span className="pathway-card__badge">
        <Icon glyph={pathway.trackIcon} />
        {pathway.track}
      </span>
      <p className="pathway-card__desc">{pathway.description}</p>

      <hr className="pathway-card__divider" />

      <p className="pathway-card__eyebrow">Current Project</p>
      <h3 className="pathway-card__project-title">
        <Icon glyph={project.icon} />
        {project.title}
      </h3>

      <Stepper steps={project.stages} currentIndex={project.currentStageIndex} />

      <StageCallout
        stage={project.stages[project.currentStageIndex]}
        nextAction={project.nextAction}
      />
    </div>
  );
}
