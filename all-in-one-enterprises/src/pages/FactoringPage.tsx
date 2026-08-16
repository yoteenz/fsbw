import { Link } from 'react-router-dom';
import { aioPaths } from '../utils/paths';
import { AIOButton } from '../components/AIOButton';
import { AIOSectionHeader } from '../components/AIOSectionHeader';
import {
  mockFactoringHowItWorks,
  mockFactoringDocumentFlow,
} from '../data/mockFactoring';

export function FactoringPage() {
  return (
    <>
      <div className="aio-page-hero">
        <div className="aio-container">
          <p className="aio-page-hero__breadcrumb">Services / Factoring Solutions</p>
          <h1 className="aio-page-hero__title">Don&apos;t let completed loads tie up your cash flow.</h1>
          <p className="aio-page-hero__desc">
            All In One Enterprises Inc. is building factoring solutions designed to help eligible carriers turn approved
            freight invoices into faster access to working capital through future factoring partners. Funding subject to
            approval and applicable terms.
          </p>
          <div className="aio-hero__actions" style={{ marginTop: '1.5rem' }}>
            <Link to={aioPaths.portalFactoring}>
              <AIOButton variant="gold">Explore Factoring</AIOButton>
            </Link>
            <a href="#how-factoring-works">
              <AIOButton variant="outline">How Factoring Works</AIOButton>
            </a>
          </div>
          <p className="aio-factoring-disclaimer" style={{ marginTop: '1.25rem', maxWidth: '40rem' }}>
            Platform in development · debug preview. All In One does not directly purchase receivables, advance funds, or
            guarantee approval in this environment.
          </p>
        </div>
      </div>

      <section className="aio-page-content" id="how-factoring-works">
        <div className="aio-container">
          <AIOSectionHeader
            eyebrow="How Factoring Works"
            title="From delivery to funding review"
            subtitle="Approval and funding are not automatic. Each step depends on eligibility, documentation, and applicable partner terms."
          />
          <div className="aio-steps" style={{ marginTop: '2rem' }}>
            {mockFactoringHowItWorks.map((step) => (
              <article key={step.step} className="aio-step">
                <div className="aio-step__num">{step.step}</div>
                <h3 className="aio-step__title">{step.title}</h3>
                <p className="aio-step__sub">{step.subtitle}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="aio-section aio-section--dark">
        <div className="aio-container">
          <AIOSectionHeader
            light
            eyebrow="Document Flow"
            title="Load operations connected to factoring"
            subtitle="Future factoring submissions may reuse documents already associated with a completed load."
          />
          <div className="aio-factoring-flow" style={{ marginTop: '2rem' }}>
            {mockFactoringDocumentFlow.map((step, i) => (
              <div key={step} className="aio-factoring-flow__item">
                <span className="aio-factoring-flow__label">{step}</span>
                {i < mockFactoringDocumentFlow.length - 1 ? (
                  <span className="aio-factoring-flow__arrow" aria-hidden="true">
                    ↓
                  </span>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="aio-section aio-section--light">
        <div className="aio-container aio-two-col">
          <div>
            <AIOSectionHeader
              eyebrow="Partner-Ready Architecture"
              title="Customer experience owned by All In One"
              subtitle="Funding may be processed by a future qualified factoring partner. All In One is designed to own the carrier-facing workflow while partners handle underwriting and funding."
            />
            <ul className="aio-factoring-bullets">
              <li>Submit eligible invoices from your command center</li>
              <li>Reuse load documents already on file</li>
              <li>Track review and funding status in one place</li>
              <li>Broker / debtor eligibility reviewed when applicable</li>
            </ul>
          </div>
          <div className="aio-card aio-card--dark">
            <h3 className="aio-intent-card__title" style={{ color: 'var(--aio-white)' }}>
              Broker / Debtor Eligibility (Future)
            </h3>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.875rem', marginBottom: '1rem' }}>
              Mock concept only — no external credit systems in Sprint 01.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {['Approved', 'Review Required', 'Not Approved', 'Credit Limit Reached'].map((s) => (
                <span key={s} className="aio-badge aio-badge--needed" style={{ alignSelf: 'flex-start' }}>
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="aio-page-content">
        <div className="aio-container" style={{ textAlign: 'center' }}>
          <Link to={aioPaths.portalFactoring}>
            <AIOButton variant="gold">Open Factoring Portal Preview</AIOButton>
          </Link>
          <p className="aio-prototype-note" style={{ textAlign: 'left', marginTop: '2rem' }}>
            Future funding methods under consideration include ACH, same-day ACH, instant payment options, fuel card
            funding, and bank transfer — none are built in Sprint 01. No bank account or payment credentials are
            collected in this prototype.
          </p>
        </div>
      </section>
    </>
  );
}
