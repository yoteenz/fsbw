import { aioPaths } from '../utils/paths';
import { AIOButton } from '../components/AIOButton';
import { AIOSectionHeader } from '../components/AIOSectionHeader';
import { mockFactoringHowItWorks } from '../data/mockFactoring';
import {
  OperationalServiceTemplate,
  OperationalFooterCta,
  type FeatureItem,
} from '../components/page-system';

const FACTORING_CAPABILITIES: FeatureItem[] = [
  { label: 'Invoice submission workflow', icon: 'invoiceBilling' },
  { label: 'Load document reuse', icon: 'bolPod' },
  { label: 'Partner funding review', icon: 'factoring' },
  { label: 'Status tracking in portal', icon: 'routeTracking' },
];

export function FactoringPage() {
  return (
    <OperationalServiceTemplate
      eyebrow="Factoring Solutions"
      title={
        <>
          Get paid faster.
          <br />
          Improve cash flow.
        </>
      }
      description="All In One helps eligible carriers connect approved freight invoices to factoring partners for faster access to working capital. Funding subject to approval — All In One is not a lender."
      breadcrumbs={[
        { label: 'Services', href: aioPaths.services },
        { label: 'Factoring' },
      ]}
      primaryCta={
        <AIOButton to={aioPaths.portalFactoring} variant="gold" showArrow>
          Check Eligibility
        </AIOButton>
      }
      secondaryCta={
        <AIOButton href="#how-factoring-works" variant="outline-gold">
          How It Works
        </AIOButton>
      }
      capabilities={FACTORING_CAPABILITIES}
      processSteps={mockFactoringHowItWorks.map((step) => ({
        number: step.step,
        title: step.title,
        description: step.subtitle,
      }))}
      audience={[
        { label: 'Owner-Operators', description: 'Turn completed loads into working capital when eligible.' },
        { label: 'Small Fleets', description: 'Centralize invoice submission and funding status.' },
        { label: 'Growing Carriers', description: 'Connect dispatch documents to factoring workflow.' },
      ]}
      importantNote={
        <>
          <strong>Important:</strong> All In One does not directly purchase receivables, advance funds, or guarantee
          approval. Funding is processed by qualified factoring partners when applicable.
        </>
      }
      footerCta={
        <OperationalFooterCta
          title="Ready to explore factoring?"
          buttonLabel="Open Factoring Portal"
          buttonTo={aioPaths.portalFactoring}
        />
      }
    >
      <section id="how-factoring-works" className="aio-ps-block">
        <AIOSectionHeader
          light
          eyebrow="Partner model"
          title="Customer experience owned by All In One"
          subtitle="All In One owns the carrier-facing workflow while partners handle underwriting and funding."
        />
        <ul className="aio-ps-requirements__list">
          <li>Submit eligible invoices from your command center</li>
          <li>Reuse load documents already on file</li>
          <li>Track review and funding status in one place</li>
          <li>Broker / debtor eligibility reviewed when applicable</li>
        </ul>
        <p className="aio-ps-disclaimer" style={{ marginTop: '1.5rem' }}>
          Platform in development · debug preview. No bank account or payment credentials are collected in this
          environment.
        </p>
      </section>
    </OperationalServiceTemplate>
  );
}
