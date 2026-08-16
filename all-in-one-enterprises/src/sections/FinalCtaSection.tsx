import { Link } from 'react-router-dom';
import { aioGetStarted, aioPaths } from '../utils/paths';
import { AIOButton } from '../components/AIOButton';

export function FinalCtaSection() {
  return (
    <section className="aio-section aio-section--dark aio-final-cta" aria-labelledby="aio-final-cta-heading">
      <div className="aio-container aio-final-cta__inner">
        <div>
          <h2 id="aio-final-cta-heading" className="aio-display-md aio-final-cta__title">
            Ready to get rolling?
          </h2>
          <p className="aio-final-cta__desc">
            Let us handle the paperwork so you can focus on the road ahead.
          </p>
        </div>
        <div className="aio-final-cta__actions aio-cta-row">
          <AIOButton
            to={aioGetStarted('start-business')}
            variant="gold"
            className="aio-btn--block aio-cta-row__link"
          >
            Start My Business
          </AIOButton>
          <AIOButton
            to={aioPaths.contact}
            variant="outline-gold"
            className="aio-btn--block aio-cta-row__link"
            showArrow
          >
            Request a Quote
          </AIOButton>
          <Link to={aioPaths.requestCallback} className="aio-final-cta__tertiary">
            Talk to an Expert →
          </Link>
        </div>
      </div>
    </section>
  );
}
