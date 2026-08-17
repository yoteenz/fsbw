import { Link } from 'react-router-dom';
import { useAIOAuth } from '../../auth/AIOAuthProvider';
import { homepageRoadmapStages, homepageRoadReadyPromptHref } from '../../data/homepageMobileContent';
import { useStartBusinessJourney } from '../../journeys/useStartBusinessJourney';
import { getAioIconSrc } from '../../config/aioIconRegistry';
import { AIOButton } from '../AIOButton';
import { aioPaths } from '../../utils/paths';

export function AioRoadReadyJourney() {
  const { isAuthenticated } = useAIOAuth();
  const journey = useStartBusinessJourney();
  const hasProgress =
    isAuthenticated &&
    journey.progress.applicableCount > 0 &&
    (journey.progress.completedCount > 0 ||
      journey.nextAction?.status === 'in_progress' ||
      journey.nextAction?.status === 'action_required');

  const roadmapHref = hasProgress
    ? (journey.nextAction?.ctaRoute ?? aioPaths.roadReady)
    : homepageRoadReadyPromptHref;
  const roadmapLabel = hasProgress ? 'Continue My Roadmap' : 'Get My Roadmap';

  return (
    <section className="aio-home-section aio-home-roadmap" aria-labelledby="aio-home-roadmap-heading">
      <div className="aio-home-roadmap__layout">
        <div className="aio-home-roadmap__intro">
          <p className="aio-home-eyebrow">From formation to freight</p>
          <h2 id="aio-home-roadmap-heading" className="aio-home-roadmap__title">
            YOUR ROADMAP
            <br />
            TO SUCCESS
          </h2>
          <p className="aio-home-roadmap__sub">
            Road Ready™ shows you where you are and what&apos;s next—so nothing gets missed.
          </p>
          <AIOButton to={roadmapHref} variant="gold" className="aio-home-roadmap__intro-cta" showArrow>
            {roadmapLabel}
          </AIOButton>
        </div>

        <div className="aio-home-roadmap__main">
          <div className="aio-home-roadmap__track" role="list" aria-label="Business lifecycle stages">
            <div className="aio-home-roadmap__line" aria-hidden="true" />
            {homepageRoadmapStages.map((stage) => (
              <Link key={stage.id} to={stage.href} className="aio-home-roadmap__stage" role="listitem">
                <span className="aio-home-roadmap__stage-num">{stage.number}</span>
                <span className="aio-home-roadmap__stage-icon-wrap">
                  <img
                    src={getAioIconSrc(stage.iconKey)}
                    alt=""
                    className="aio-home-roadmap__stage-icon"
                    width={28}
                    height={28}
                  />
                </span>
                <span className="aio-home-roadmap__stage-title">{stage.title}</span>
                <span className="aio-home-roadmap__stage-desc">{stage.description}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="aio-home-roadmap__prompt">
        {hasProgress ? (
          <>
            <p className="aio-home-roadmap__prompt-eyebrow">Your roadmap</p>
            <p className="aio-home-roadmap__prompt-stat">{journey.progress.percent}% complete</p>
            {journey.nextAction ? (
              <p className="aio-home-roadmap__prompt-next">Next step: {journey.nextAction.def.shortTitle} →</p>
            ) : null}
            <Link to={roadmapHref} className="aio-home-roadmap__prompt-cta">
              Continue My Roadmap →
            </Link>
          </>
        ) : (
          <>
            <p className="aio-home-roadmap__prompt-eyebrow">Not sure where you are?</p>
            <p className="aio-home-roadmap__prompt-body">
              Answer a few questions and we&apos;ll build your custom roadmap.
            </p>
            <Link to={homepageRoadReadyPromptHref} className="aio-home-roadmap__prompt-cta">
              Get My Roadmap →
            </Link>
          </>
        )}
      </div>
    </section>
  );
}
