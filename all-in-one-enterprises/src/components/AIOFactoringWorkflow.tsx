import type { MockFactoringInvoice } from '../data/mockFactoring';
import { mockFactoringWorkflowDocuments } from '../data/mockFactoring';
import { AIOButton } from './AIOButton';
import { AIODocumentChecklist } from './AIODocumentChecklist';
import { AIOFundingEstimate } from './AIOFundingEstimate';

type Props = {
  invoice: MockFactoringInvoice;
  step: 'review' | 'complete';
  onContinue: () => void;
  onClose: () => void;
};

export function AIOFactoringWorkflow({ invoice, step, onContinue, onClose }: Props) {
  return (
    <div className="aio-factoring-modal" role="dialog" aria-modal="true" aria-labelledby="aio-factoring-modal-title">
      <div className="aio-factoring-modal__backdrop" onClick={onClose} aria-hidden="true" />
      <div className="aio-factoring-modal__panel">
        <button type="button" className="aio-factoring-modal__close" onClick={onClose} aria-label="Close">
          ×
        </button>

        {step === 'review' ? (
          <>
            <p className="aio-label" style={{ color: 'var(--aio-gold-dark)', marginBottom: '0.5rem' }}>
              Factoring Review · Load #{invoice.loadNumber}
            </p>
            <h2 id="aio-factoring-modal-title" className="aio-display-md" style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>
              Submit for Factoring Review
            </h2>
            <p className="aio-factoring-disclaimer">
              Illustrative estimates only. Funding subject to approval and applicable terms. All In One Enterprises Inc.
              does not directly purchase receivables or guarantee funding in this prototype.
            </p>

            <AIOFundingEstimate
              invoiceAmount={invoice.invoiceAmount}
              sampleFactoringFee={invoice.sampleFactoringFee}
              sampleNetProceeds={invoice.sampleNetProceeds}
            />

            <div style={{ marginTop: '1.25rem' }}>
              <h3 className="aio-portal-panel__title">Required Documents</h3>
              <AIODocumentChecklist documents={mockFactoringWorkflowDocuments} />
            </div>

            <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <AIOButton variant="gold" onClick={onContinue}>
                Continue to Review
              </AIOButton>
              <AIOButton variant="outline-dark" onClick={onClose}>
                Cancel
              </AIOButton>
            </div>
          </>
        ) : (
          <>
            <h2 id="aio-factoring-modal-title" className="aio-display-md" style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>
              Demo Submission Complete
            </h2>
            <p style={{ lineHeight: 1.65, color: 'var(--aio-gray-800)' }}>
              Ready for future factoring integration. No financial information was transmitted. When a qualified
              factoring partner is connected, this workflow will submit eligible invoices for partner review.
            </p>
            <div style={{ marginTop: '1.5rem' }}>
              <AIOButton variant="gold" onClick={onClose}>
                Close
              </AIOButton>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
