import { useState } from 'react';
import type { MockFactoringInvoice } from '../data/mockFactoring';
import {
  mockFactoringMetrics,
  mockFactoringInvoices,
  mockFactoringHistory,
  mockFactoringStatements,
} from '../data/mockFactoring';
import { AIOFactoringMetricCard } from '../components/AIOFactoringMetricCard';
import { AIOFactoringInvoiceRow, AIOFactoringInvoiceCard } from '../components/AIOFactoringInvoiceRow';
import { AIOFactoringWorkflow } from '../components/AIOFactoringWorkflow';
import { AIOFactoringHistory } from '../components/AIOFactoringHistory';
import { AIOButton } from '../components/AIOButton';

export function FactoringPortalPage() {
  const [reviewInvoice, setReviewInvoice] = useState<MockFactoringInvoice | null>(null);
  const [workflowStep, setWorkflowStep] = useState<'review' | 'complete'>('review');

  const openReview = (invoice: MockFactoringInvoice) => {
    setReviewInvoice(invoice);
    setWorkflowStep('review');
  };

  const closeReview = () => {
    setReviewInvoice(null);
    setWorkflowStep('review');
  };

  return (
    <>
      <header className="aio-portal-dashboard__header">
        <h1>Factoring</h1>
        <p>Invoice funding options · mock data only · no financial transactions</p>
      </header>

      <div className="aio-factoring-metrics">
        <AIOFactoringMetricCard
          label="Available for Factoring"
          value={`$${mockFactoringMetrics.availableForFactoring.toLocaleString()}`}
        />
        <AIOFactoringMetricCard label="In Review" value={`$${mockFactoringMetrics.inReview.toLocaleString()}`} />
        <AIOFactoringMetricCard
          label="Funded This Week"
          value={`$${mockFactoringMetrics.fundedThisWeek.toLocaleString()}`}
        />
        <AIOFactoringMetricCard
          label="Outstanding Receivables"
          value={`$${mockFactoringMetrics.outstandingReceivables.toLocaleString()}`}
        />
      </div>

      <div className="aio-portal-panel">
        <h2 className="aio-portal-panel__title">Invoices</h2>
        <p className="aio-factoring-disclaimer">
          Illustrative amounts only. Funding subject to approval and applicable terms.
        </p>

        <div className="aio-factoring-history__table-wrap aio-factoring-table--desktop">
          <table className="aio-factoring-table">
            <thead>
              <tr>
                <th>Load #</th>
                <th>Broker / Debtor</th>
                <th>Invoice Amount</th>
                <th>Delivery Date</th>
                <th>Eligibility</th>
                <th>Status</th>
                <th>Est. Proceeds</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {mockFactoringInvoices.map((inv) => (
                <AIOFactoringInvoiceRow key={inv.id} invoice={inv} onReview={openReview} />
              ))}
            </tbody>
          </table>
        </div>

        <div className="aio-factoring-cards--mobile">
          {mockFactoringInvoices.map((inv) => (
            <AIOFactoringInvoiceCard key={inv.id} invoice={inv} onReview={openReview} />
          ))}
        </div>
      </div>

      <div className="aio-portal-panel">
        <h2 className="aio-portal-panel__title">Factoring History</h2>
        <AIOFactoringHistory rows={mockFactoringHistory} />
      </div>

      <div className="aio-portal-panel">
        <h2 className="aio-portal-panel__title">Statements</h2>
        <p style={{ fontSize: '0.875rem', color: 'var(--aio-gray-600)', marginBottom: '1rem' }}>
          Visual placeholder — no generated financial statements in Sprint 01.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {mockFactoringStatements.map((stmt) => (
            <div key={stmt.id} className="aio-factoring-statement-row">
              <span>{stmt.label}</span>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <AIOButton variant="outline-dark" size="sm">
                  View Statement
                </AIOButton>
                <AIOButton variant="outline-dark" size="sm">
                  Download
                </AIOButton>
              </div>
            </div>
          ))}
        </div>
      </div>

      {reviewInvoice ? (
        <AIOFactoringWorkflow
          invoice={reviewInvoice}
          step={workflowStep}
          onContinue={() => setWorkflowStep('complete')}
          onClose={closeReview}
        />
      ) : null}
    </>
  );
}
