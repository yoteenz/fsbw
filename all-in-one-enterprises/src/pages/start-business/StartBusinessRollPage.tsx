import { Link } from 'react-router-dom';
import { JourneyBackNav } from '../../components/journey/JourneyBackNav';
import { AIOCard } from '../../components/AIOCard';
import { usePageMeta } from '../../hooks/usePageMeta';
import { withJourneyContext } from '../../journeys/journeyContext';
import { aioPaths } from '../../utils/paths';

const OPERATE_OPTIONS = [
  {
    eyebrow: 'Dispatch',
    title: 'Keep your trucks moving',
    desc: 'Professional dispatch support to find loads and manage operations.',
    href: aioPaths.dispatching,
  },
  {
    eyebrow: 'Factoring',
    title: 'Get paid faster',
    desc: 'Factoring solutions designed to help improve cash flow through partners.',
    href: aioPaths.factoring,
  },
  {
    eyebrow: 'Brokerage',
    title: 'Move freight',
    desc: 'Brokerage and shipper solutions to move freight efficiently.',
    href: aioPaths.brokerage,
  },
  {
    eyebrow: 'Bookkeeping',
    title: 'Stay on top of books',
    desc: 'Bookkeeping plans from essentials through full-service support.',
    href: aioPaths.bookkeeping,
  },
  {
    eyebrow: 'Fleet',
    title: 'Manage my fleet',
    desc: 'Fleet tools, renewals, and compliance maintenance in your portal.',
    href: aioPaths.portalFleet,
  },
  {
    eyebrow: 'Compliance',
    title: 'Stay road ready',
    desc: 'Renewals, compliance calendar, and ongoing requirement tracking.',
    href: aioPaths.roadReady,
  },
];

export function StartBusinessRollPage() {
  usePageMeta({
    title: 'Roll — Operate & Grow',
    description: 'Transition from startup to operations with dispatch, factoring, brokerage, and growth services.',
  });

  return (
    <div className="aio-page-content">
      <div className="aio-container">
        <JourneyBackNav />
        <header className="aio-page-section aio-page-section--center">
          <p className="aio-label aio-gold-text">Step 06 — Roll</p>
          <h1 className="aio-display-md">You&apos;re ready to operate. What&apos;s next?</h1>
          <p className="aio-body">
            These are operational and growth services — not legal requirements to begin trucking. Choose what fits your
            business today.
          </p>
        </header>

        <div className="aio-journey-roll-grid">
          {OPERATE_OPTIONS.map((opt) => (
            <AIOCard key={opt.eyebrow} className="aio-journey-roll-card">
              <p className="aio-journey-roll-card__eyebrow">{opt.eyebrow}</p>
              <h2 className="aio-journey-roll-card__title">{opt.title}</h2>
              <p className="aio-journey-roll-card__desc">{opt.desc}</p>
              <Link to={withJourneyContext(opt.href, 'roll')} className="aio-journey-roll-card__cta">
                Explore {opt.eyebrow} →
              </Link>
            </AIOCard>
          ))}
        </div>
      </div>
    </div>
  );
}
