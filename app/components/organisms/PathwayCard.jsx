'use client';

import Icon from '../atoms/Icon';
import Stepper from '../molecules/Stepper';
import StageCallout from '../molecules/StageCallout';
import PathwayBanner from '../molecules/PathwayBanner';

/**
 * ORGANISM — PathwayCard
 *
 * Two bands in one card: the pathway header sits on the banner artwork,
 * the current project sits on flat deep purple beneath it.
 */
export default function PathwayCard({ pathway, project, onStartNextStep }) {
  return (
    <div className="pathway-card">
      <div className="pathway-card__top">
        <PathwayBanner />

        <div className="pathway-card__top-content">
          <p className="pathway-card__eyebrow">Current Pathway</p>
          <h2 className="pathway-card__title">{pathway.title}</h2>
          <span className="pathway-card__badge">
            <Icon name={pathway.trackIcon} size={13} />
            {pathway.track}
          </span>
          <p className="pathway-card__desc">{pathway.description}</p>
        </div>
      </div>

      <div className="pathway-card__bottom">
        <p className="pathway-card__eyebrow">Current Project</p>
        <h3 className="pathway-card__project-title">
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
