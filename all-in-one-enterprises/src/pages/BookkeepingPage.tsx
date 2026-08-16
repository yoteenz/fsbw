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
              records — Books Rescue is the first step. Starting at {formatMoney(BOOKS_RESCUE_STARTING_PRICE_MINOR)}.
              Final quote depends on months behind, accounts, and transaction volume.
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
            <p>Books Rescue is a one-time service — not a recurring subscription plan.</p>
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
