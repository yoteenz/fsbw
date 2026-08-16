import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { AIOButton } from '../components/AIOButton';
import { AIOSectionHeader } from '../components/AIOSectionHeader';
import { AIOIcon } from '../components/AIOIcon';
import {
  BookkeepingBillingToggle,
  BookkeepingCategoryChips,
  BookkeepingDisclosuresBlock,
  BookkeepingFeatureMatrix,
  BookkeepingPlanCards,
} from '../components/bookkeeping/BookkeepingPlanSection';
import { BookkeepingComparisonMatrix } from '../components/bookkeeping/BookkeepingComparisonMatrix';
import {
  BOOKKEEPING_AUTOPILOT_COPY,
  BOOKKEEPING_AUTOPILOT_FLOW,
  BOOKKEEPING_AUTOPILOT_HEADLINE,
  BOOKKEEPING_VALUE_HEADLINE,
  BOOKKEEPING_VALUE_STACK,
  BOOKKEEPING_VALUE_SUBHEAD,
} from '../bookkeeping/autopilot/competitiveMatrix';
import { BOOKKEEPING_FAQ, BOOKKEEPING_SERVICE_SLUG, BOOKS_RESCUE_SERVICE_SLUG, DEMO_BOOKKEEPING_LABEL } from '../bookkeeping/bookkeepingConfig';
import { BOOKS_RESCUE_STARTING_PRICE_MINOR } from '../bookkeeping/bookkeepingPlans';
import { formatMoney } from '../billing/money';
import { getPublicServiceCta } from '../launch/serviceActivationLaunch';
import { aioPaths } from '../utils/paths';
import type { BookkeepingBillingInterval } from '../bookkeeping/bookkeepingTypes';

export function BookkeepingPage() {
  const [interval, setInterval] = useState<BookkeepingBillingInterval>('MONTHLY');
  const activation = getPublicServiceCta(BOOKKEEPING_SERVICE_SLUG);
  const rescueActivation = getPublicServiceCta(BOOKS_RESCUE_SERVICE_SLUG);

  useEffect(() => {
    document.title = 'Trucking Bookkeeping Services | All In One Enterprises Inc.';
  }, []);

  return (
    <>
      <div className="aio-page-hero aio-bk-hero">
        <div className="aio-container">
          <p className="aio-page-hero__breadcrumb">Services / Operate / Bookkeeping</p>
          <p className="aio-label aio-bk-hero__eyebrow">Bookkeeping Built For Trucking</p>
          <h1 className="aio-page-hero__title">
            Know where your money is going.
            <br />
            And what your trucks are actually making.
          </h1>
          <p className="aio-page-hero__desc">
            Keep your books clean, your expenses organized, and your financial picture clear with bookkeeping built
            around the realities of running a trucking business.
          </p>
          <div className="aio-hero__actions aio-bk-hero__actions">
            <a href="#plans">
              <AIOButton variant="gold">View Plans</AIOButton>
            </a>
            <Link to={aioPaths.bookkeepingAssessment}>
              <AIOButton variant="outline">Get My Recommendation</AIOButton>
            </Link>
          </div>
          <p className="aio-bk-hero__tertiary">
            <Link to={`${aioPaths.bookkeeping}#books-rescue`}>Books behind? Start with Books Rescue →</Link>
          </p>
        </div>
      </div>

      <section className="aio-section aio-section--light">
        <div className="aio-container">
          <AIOSectionHeader
            eyebrow="Built For Carriers"
            title="Your business isn't generic. Your books shouldn't be either."
            subtitle="All In One understands the financial categories that matter to carriers, owner-operators, and fleets."
          />
          <BookkeepingCategoryChips />
        </div>
      </section>

      <section className="aio-page-content" id="autopilot">
        <div className="aio-container">
          <AIOSectionHeader
            eyebrow="Automation"
            title={BOOKKEEPING_AUTOPILOT_HEADLINE}
            subtitle={BOOKKEEPING_AUTOPILOT_COPY}
          />
          <div className="aio-bk-autopilot-flow">
            {BOOKKEEPING_AUTOPILOT_FLOW.map((step, i) => (
              <span key={step} className="aio-bk-autopilot-flow__step">
                {step}
                {i < BOOKKEEPING_AUTOPILOT_FLOW.length - 1 && <span className="aio-bk-autopilot-flow__arrow" aria-hidden>→</span>}
              </span>
            ))}
          </div>
          <ul className="aio-bk-trust-list">
            <li>All In One does not store your online banking password</li>
            <li>Secure account connection through approved providers where enabled</li>
            <li>Human review for exceptions and material decisions</li>
            <li>Clear audit trail for automated classifications</li>
          </ul>
        </div>
      </section>

      <section className="aio-section aio-section--dark" id="why-different">
        <div className="aio-container">
          <AIOSectionHeader
            light
            eyebrow="Why All In One Is Different"
            title={BOOKKEEPING_VALUE_HEADLINE}
            subtitle={BOOKKEEPING_VALUE_SUBHEAD}
          />
          <p style={{ color: 'rgba(255,255,255,0.75)', maxWidth: '42rem', marginBottom: '2rem' }}>
            Built for the road. Designed for the whole business. One bookkeeping service with a trucking ecosystem behind it.
          </p>
          <div className="aio-bk-value-stack">
            {BOOKKEEPING_VALUE_STACK.map((item) => (
              <span key={item} className="aio-bk-value-stack__item">{item}</span>
            ))}
          </div>
        </div>
      </section>

      <section className="aio-page-content" id="compare">
        <div className="aio-container">
          <AIOSectionHeader
            eyebrow="Compare Your Options"
            title="Service model comparison"
            subtitle="Compare service types — not aggressive claims against individual competitors."
          />
          <BookkeepingComparisonMatrix />
        </div>
      </section>

      <section className="aio-page-content" id="plans">
        <div className="aio-container">
          <AIOSectionHeader
            eyebrow="Plans"
            title="Compare bookkeeping plans"
            subtitle="All prices shown as starting at — final pricing depends on operational complexity."
          />
          <div className="aio-bk-plans-toolbar">
            <BookkeepingBillingToggle interval={interval} onChange={setInterval} />
          </div>
          <BookkeepingPlanCards interval={interval} />
        </div>
      </section>

      <section className="aio-section aio-section--dark" id="books-rescue">
        <div className="aio-container aio-two-col">
          <div>
            <AIOSectionHeader
              light
              eyebrow="One-Time Cleanup"
              title="Books Rescue"
              subtitle="Your books are behind. We'll help get them current before recurring bookkeeping begins."
            />
            <p style={{ color: 'rgba(255,255,255,0.75)', maxWidth: '36rem' }}>
              For several months uncategorized, unreconciled accounts, missing categories, or incomplete historical
              records — Books Rescue is the first step. Starting at {formatMoney(BOOKS_RESCUE_STARTING_PRICE_MINOR)} one-time.
              Final quote depends on months behind, accounts, and transaction volume — not unlimited cleanup.
            </p>
            <Link to={aioPaths.bookkeepingAssessment}>
              <AIOButton variant="gold" style={{ marginTop: '1.25rem' }}>
                {rescueActivation.allowed ? 'Start Cleanup Assessment' : rescueActivation.label}
              </AIOButton>
            </Link>
          </div>
          <div className="aio-card aio-card--gold-border">
            <AIOIcon icon="reportsAnalytics" size={48} alt="" />
            <h3 className="aio-intent-card__title">Not a fourth tier</h3>
            <p>Books Rescue is a one-time cleanup service — starting at $749, not a recurring subscription plan.</p>
          </div>
        </div>
      </section>

      <section className="aio-page-content">
        <div className="aio-container">
          <AIOSectionHeader eyebrow="Compare" title="Full feature matrix" />
          <BookkeepingFeatureMatrix />
        </div>
      </section>

      <section className="aio-section aio-section--light">
        <div className="aio-container">
          <AIOSectionHeader eyebrow="FAQ" title="Bookkeeping questions" />
          <div className="aio-bk-faq">
            {BOOKKEEPING_FAQ.map((item) => (
              <details key={item.question} className="aio-bk-faq__item">
                <summary>{item.question}</summary>
                <p>{item.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="aio-page-content">
        <div className="aio-container">
          <BookkeepingDisclosuresBlock />
          <p className="aio-prototype-note" style={{ marginTop: '2rem' }}>{DEMO_BOOKKEEPING_LABEL}</p>
          {!activation.allowed && (
            <p className="aio-prototype-note">Public CTA: {activation.label} ({activation.state})</p>
          )}
        </div>
      </section>
    </>
  );
}
