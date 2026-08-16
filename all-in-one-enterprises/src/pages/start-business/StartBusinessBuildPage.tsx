import { Link } from 'react-router-dom';
import { JourneyBackNav } from '../../components/journey/JourneyBackNav';
import { AIOCard } from '../../components/AIOCard';
import { usePageMeta } from '../../hooks/usePageMeta';
import { withJourneyContext } from '../../journeys/journeyContext';
import { aioGetStarted, aioPaths } from '../../utils/paths';

export function StartBusinessBuildPage() {
  usePageMeta({
    title: 'Build — Form Your Business',
    description: 'Choose LLC, corporation, or indicate you already have a business entity.',
  });

  return (
    <div className="aio-page-content">
      <div className="aio-container aio-container--narrow">
        <JourneyBackNav />
        <header className="aio-page-section">
          <p className="aio-label aio-gold-text">Step 01 — Build</p>
          <h1 className="aio-display-md">How do you want to form your business?</h1>
          <p className="aio-body">
            Select the path that matches your situation. This is general information — not legal advice. Consult a
            qualified professional for entity-specific guidance.
          </p>
        </header>

        <div className="aio-journey-choice-grid">
          <AIOCard className="aio-journey-choice">
            <h2 className="aio-journey-choice__title">LLC</h2>
            <p className="aio-journey-choice__desc">Flexible structure often used by owner-operators and small fleets.</p>
            <Link to={withJourneyContext(aioGetStarted('llc-formation-assistance'), 'build')} className="aio-btn aio-btn--gold aio-btn--block">
              Start LLC Formation
            </Link>
          </AIOCard>
          <AIOCard className="aio-journey-choice">
            <h2 className="aio-journey-choice__title">Corporation / INC</h2>
            <p className="aio-journey-choice__desc">Corporate structure with distinct ownership and governance options.</p>
            <Link to={withJourneyContext(aioGetStarted('inc-formation-assistance'), 'build')} className="aio-btn aio-btn--gold aio-btn--block">
              Start INC Formation
            </Link>
          </AIOCard>
          <AIOCard className="aio-journey-choice">
            <h2 className="aio-journey-choice__title">I Already Have a Business</h2>
            <p className="aio-journey-choice__desc">Skip formation and continue with authority, insurance, and registration.</p>
            <Link to={withJourneyContext(aioPaths.roadReadyPublic, 'build')} className="aio-btn aio-btn--outline-gold aio-btn--block">
              Update My Road Ready Profile
            </Link>
          </AIOCard>
        </div>

        <p className="aio-journey-disclaimer">
          All In One provides business services and coordination — not legal advice. Entity selection depends on your
          goals, tax situation, and operating model.
        </p>
      </div>
    </div>
  );
}
