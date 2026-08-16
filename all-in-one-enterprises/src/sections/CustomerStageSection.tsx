import { Link } from 'react-router-dom';
import { aioPaths } from '../utils/paths';
import { AIOSectionHeader } from '../components/AIOSectionHeader';
import { AIOButton } from '../components/AIOButton';

export function CustomerStageSection() {
  return (
    <section className="aio-section aio-section--light aio-section--spacious" aria-labelledby="aio-stage-heading">
      <div className="aio-container">
        <AIOSectionHeader align="center" eyebrow="Where are you in your journey?" title="Choose your path forward" />
        <div className="aio-stage-split" id="aio-stage-heading">
          <article className="aio-stage-card aio-stage-card--start">
            <p className="aio-stage-card__eyebrow">New to trucking?</p>
            <h3 className="aio-stage-card__title">Starting from scratch?</h3>
            <p className="aio-stage-card__desc">
              From formation to your first load, we&apos;ll help you understand what comes next.
            </p>
            <Link to={aioPaths.startYourBusiness}>
              <AIOButton variant="gold">Start My Business →</AIOButton>
            </Link>
          </article>
          <article className="aio-stage-card aio-stage-card--operate">
            <p className="aio-stage-card__eyebrow">Already operating?</p>
            <h3 className="aio-stage-card__title">Already on the road?</h3>
            <p className="aio-stage-card__desc">
              Keep your trucks moving, cash flowing, and your operation growing.
            </p>
            <div className="aio-stage-card__links">
              <Link to={aioPaths.dispatching} className="aio-stage-card__link">
                Dispatch
              </Link>
              <Link to={aioPaths.factoring} className="aio-stage-card__link">
                Factoring
              </Link>
              <Link to={aioPaths.brokerage} className="aio-stage-card__link">
                Brokerage
              </Link>
              <Link to={aioPaths.permitting} className="aio-stage-card__link">
                Permits
              </Link>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
