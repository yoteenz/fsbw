import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AIOButton } from '../components/AIOButton';
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
import {
  AioPageShell,
  AioCinematicHero,
  AioSectionHeading,
  AioProcessRail,
  OperationalFooterCta,
} from '../components/page-system';
import { AioDesktopContextShell } from '../components/context-rail';
import { buildBookkeepingRail } from '../context-rail/configs';

export function BookkeepingPage() {
  const { t } = useTranslation('contextRail');
  const [interval, setInterval] = useState<BookkeepingBillingInterval>('MONTHLY');
  const activation = getPublicServiceCta(BOOKKEEPING_SERVICE_SLUG);
  const rescueActivation = getPublicServiceCta(BOOKS_RESCUE_SERVICE_SLUG);

  useEffect(() => {
    document.title = 'Trucking Bookkeeping Services | All In One Enterprises Inc.';
  }, []);

  return (
    <AioPageShell>
      <AioDesktopContextShell config={buildBookkeepingRail(t)} scrollSpy>
      <AioCinematicHero
        eyebrow="Bookkeeping Built For Trucking"
        title={
          <>
            Bookkeeping that
            <br />
            works as hard
            <br />
            as you do.
          </>
        }
        description="Keep your books clean, your expenses organized, and your financial picture clear with bookkeeping built around the realities of running a trucking business."
        breadcrumbs={[
          { label: 'Services', href: aioPaths.services },
          { label: 'Bookkeeping' },
        ]}
        actions={
          <>
            <AIOButton href="#plans" variant="gold" showArrow>
              View Plans
            </AIOButton>
            <AIOButton to={aioPaths.bookkeepingAssessment} variant="outline-gold" showArrow>
              Get My Recommendation
            </AIOButton>
          </>
        }
        compact
      />

      <div className="aio-ps-body">
        <div className="aio-container">
          <section id="acr-bk-how" className="aio-ps-block">
            <AioSectionHeading
              eyebrow="How it works"
              title="Send documents. We do the work. You get clarity."
              subtitle="All In One understands the financial categories that matter to carriers, owner-operators, and fleets."
              light
            />
            <AioProcessRail
              steps={BOOKKEEPING_AUTOPILOT_FLOW.map((step, index) => ({
                number: String(index + 1).padStart(2, '0'),
                title: step,
              }))}
            />
            <BookkeepingCategoryChips />
          </section>

      <section id="acr-bk-included" className="aio-ps-block">
          <AioSectionHeading eyebrow="Automation" title={BOOKKEEPING_AUTOPILOT_HEADLINE} subtitle={BOOKKEEPING_AUTOPILOT_COPY} light />
          <ul className="aio-bk-trust-list">
            <li>All In One does not store your online banking password</li>
            <li>Secure account connection through approved providers where enabled</li>
            <li>Human review for exceptions and material decisions</li>
            <li>Clear audit trail for automated classifications</li>
          </ul>
      </section>

      <section id="acr-bk-overview" className="aio-ps-block">
          <AioSectionHeading
            light
            eyebrow="Why All In One Is Different"
            title={BOOKKEEPING_VALUE_HEADLINE}
            subtitle={BOOKKEEPING_VALUE_SUBHEAD}
          />
          <div className="aio-bk-value-stack">
            {BOOKKEEPING_VALUE_STACK.map((item) => (
              <span key={item} className="aio-bk-value-stack__item">{item}</span>
            ))}
          </div>
      </section>

      <section className="aio-ps-block" id="compare">
          <AioSectionHeading eyebrow="Compare Your Options" title="Service model comparison" subtitle="Compare service types — not aggressive claims against individual competitors." light />
          <BookkeepingComparisonMatrix />
      </section>

      <section id="acr-bk-packages" className="aio-ps-block">
          <AioSectionHeading eyebrow="Packages" title="Compare bookkeeping plans" subtitle="All prices shown as starting at — final pricing depends on operational complexity." light />
          <div className="aio-bk-plans-toolbar">
            <BookkeepingBillingToggle interval={interval} onChange={setInterval} />
          </div>
          <BookkeepingPlanCards interval={interval} />
      </section>

      <section id="acr-bk-onboarding" className="aio-ps-block">
          <div className="aio-two-col">
            <div>
              <AioSectionHeading
                light
                eyebrow="One-Time Cleanup"
                title="Books Rescue"
                subtitle="Your books are behind. We'll help get them current before recurring bookkeeping begins."
              />
              <p className="aio-ps-contact-meta">
                Starting at {formatMoney(BOOKS_RESCUE_STARTING_PRICE_MINOR)} one-time. Final quote depends on months
                behind, accounts, and transaction volume.
              </p>
              <Link to={aioPaths.bookkeepingAssessment}>
                <AIOButton variant="gold" style={{ marginTop: '1.25rem' }}>
                  {rescueActivation.allowed ? 'Start Cleanup Assessment' : rescueActivation.label}
                </AIOButton>
              </Link>
            </div>
            <div className="aio-ps-action-panel">
              <AIOIcon icon="reportsAnalytics" size={48} alt="" />
              <h3 className="aio-ps-action-panel__title">Not a fourth tier</h3>
              <p className="aio-ps-contact-meta">Books Rescue is a one-time cleanup service — not a recurring subscription plan.</p>
            </div>
          </div>
      </section>

      <section className="aio-ps-block">
          <AioSectionHeading eyebrow="Compare" title="Full feature matrix" light />
          <BookkeepingFeatureMatrix />
      </section>

      <section className="aio-ps-block">
          <AioSectionHeading eyebrow="FAQ" title="Bookkeeping questions" light />
          <div className="aio-bk-faq">
            {BOOKKEEPING_FAQ.map((item) => (
              <details key={item.question} className="aio-bk-faq__item">
                <summary>{item.question}</summary>
                <p>{item.answer}</p>
              </details>
            ))}
          </div>
      </section>

      <BookkeepingDisclosuresBlock />
          <p className="aio-ps-disclaimer">{DEMO_BOOKKEEPING_LABEL}</p>
          {!activation.allowed && (
            <p className="aio-ps-disclaimer">Public CTA: {activation.label} ({activation.state})</p>
          )}
        </div>
      </div>

      <section className="aio-ps-footer-cta">
        <div className="aio-container aio-ps-footer-cta__inner">
          <OperationalFooterCta title="Choose a plan" buttonLabel="View Plans" buttonTo={`${aioPaths.bookkeeping}#plans`} />
        </div>
      </section>
      </AioDesktopContextShell>
    </AioPageShell>
  );
}
