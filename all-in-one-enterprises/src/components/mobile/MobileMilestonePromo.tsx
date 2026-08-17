import { startBusinessJourneyDef } from '../../journeys/startBusinessJourneyConfig';
import { AIOButton } from '../AIOButton';
import { aioPaths } from '../../utils/paths';

export function MobileMilestonePromo() {
  const stages = startBusinessJourneyDef.steps.filter((s) => s.id !== 'roll' || s.order <= 5).slice(0, 5);

  return (
    <section className="aio-mobile-milestones" aria-labelledby="aio-mobile-milestones-heading">
      <div className="aio-container">
        <p className="aio-mobile-milestones__eyebrow">Your milestone path</p>
        <h2 id="aio-mobile-milestones-heading" className="aio-mobile-milestones__title">
          We guide you from
          <br />
          start to success.
        </h2>
        <ol className="aio-mobile-milestones__list">
          {stages.map((step) => (
            <li key={step.id} className="aio-mobile-milestones__item">
              <span className="aio-mobile-milestones__num">{step.number}</span>
              <span className="aio-mobile-milestones__label">{step.title}</span>
            </li>
          ))}
        </ol>
        <AIOButton to={aioPaths.startYourBusiness} variant="gold" showArrow className="aio-mobile-milestones__cta">
          Get My Roadmap
        </AIOButton>
      </div>
    </section>
  );
}
