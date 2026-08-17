import { Link } from 'react-router-dom';
import { useAIOAuth } from '../../auth/AIOAuthProvider';
import { useStartBusinessJourney } from '../../journeys/useStartBusinessJourney';
import { aioGetStarted, aioPaths } from '../../utils/paths';
import { AIOButton } from '../AIOButton';

export function AioHomepageFinalCTA() {
  const { isAuthenticated } = useAIOAuth();
  const journey = useStartBusinessJourney();
  const hasProgress =
    isAuthenticated &&
    (journey.progress.completedCount > 0 || journey.nextAction?.status === 'in_progress');
  const roadmapHref = hasProgress
    ? (journey.nextAction?.ctaRoute ?? aioPaths.roadReady)
    : aioGetStarted();
  const roadmapLabel = hasProgress ? 'Continue My Roadmap' : 'Start My Roadmap';

  return (
    <section className="aio-home-section aio-home-final-cta" aria-labelledby="aio-home-final-cta-heading">
      <h2 id="aio-home-final-cta-heading" className="aio-home-final-cta__title">
        READY TO MOVE FORWARD?
      </h2>
      <p className="aio-home-final-cta__sub">
        Start from scratch, check your existing business, or talk with AIO about what you need.
      </p>
      <div className="aio-home-final-cta__actions">
        <AIOButton to={roadmapHref} variant="gold" className="aio-btn--block" showArrow>
          {roadmapLabel}
        </AIOButton>
        <AIOButton to={aioPaths.contact} variant="outline-gold" className="aio-btn--block" showArrow>
          Talk to AIO
        </AIOButton>
      </div>
      <p className="aio-home-final-cta__tertiary">
        Already know what you need?{' '}
        <Link to={aioPaths.services}>View all services →</Link>
      </p>
    </section>
  );
}
