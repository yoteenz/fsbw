import { Link } from 'react-router-dom';
import { useDemoStore } from '../../demo/useDemoStore';
import { createFreightInvoiceFromLoad } from '../../demo/factoringActions';
import { evaluateLoadFactoringReadiness } from '../../factoring/factoringRules';
import { SUBMISSION_STATUS_LABELS } from '../../factoring/factoringConfig';
import { formatMoney } from '../../billing/money';
import { aioPaths } from '../../utils/paths';
import type { Load } from '../../dispatch/dispatchTypes';

interface LoadFactoringSectionProps {
  load: Load;
  orgId: string;
  office?: boolean;
}

export function LoadFactoringSection({ load, orgId, office }: LoadFactoringSectionProps) {
  const store = useDemoStore();
  if (load.operationalStatus !== 'complete' && load.operationalStatus !== 'pod_needed' && load.factoringHandoffStatus === 'not_ready') {
    return null;
  }
  if (!['complete', 'pod_needed'].includes(load.operationalStatus) && load.factoringHandoffStatus === 'not_ready') {
    return null;
  }

  const freightInvoice = store.freightInvoices.find((f) => f.loadId === load.id && f.status !== 'void');
  const submission = store.factoringSubmissions.find(
    (s) => s.loadId === load.id && !['declined', 'cancelled', 'closed'].includes(s.status),
  );
  const readiness = evaluateLoadFactoringReadiness(load, freightInvoice);
  const provider = submission ? store.factoringProviders.find((p) => p.id === submission.providerId) : undefined;

  if (load.operationalStatus !== 'complete') {
    return (
      <section className="aio-factoring-card">
        <h2>Payment / Factoring</h2>
        <p>Available after load completion and POD.</p>
      </section>
    );
  }

  return (
    <section className="aio-factoring-card">
      <h2>Payment / Factoring</h2>
      <p>Handoff: {load.factoringHandoffStatus.replace(/_/g, ' ')} · Readiness: {readiness.state.replace(/_/g, ' ')}</p>
      {freightInvoice ? (
        <p>
          Freight Invoice {freightInvoice.invoiceNumber}: {formatMoney(freightInvoice.amountMinor)}
          {!office && (
            <Link to={aioPaths.portalFreightInvoice(freightInvoice.id)} className="aio-rr-link"> View invoice</Link>
          )}
        </p>
      ) : readiness.state === 'ready' || readiness.handoffReady ? (
        <button
          type="button"
          className="aio-btn aio-btn--gold aio-btn--sm"
          onClick={() => createFreightInvoiceFromLoad(load.id, orgId)}
        >
          Create Freight Invoice
        </button>
      ) : null}
      {submission && (
        <p>
          Submission: {SUBMISSION_STATUS_LABELS[submission.status]}
          {provider ? ` · ${provider.name}` : ''}
          {submission.reportedAdvanceMinor != null && ` · Reported advance ${formatMoney(submission.reportedAdvanceMinor)}`}
          <Link
            to={office ? aioPaths.officeFactoringSubmission(submission.id) : aioPaths.portalFactoringSubmission(submission.id)}
            className="aio-rr-link"
          >
            View details
          </Link>
        </p>
      )}
      {!office && readiness.handoffReady && (
        <Link to={aioPaths.portalFactoringReady} className="aio-btn aio-btn--outline aio-btn--sm">Review for Factoring</Link>
      )}
      {office && load.factoringHandoffStatus === 'ready' && (
        <Link to={aioPaths.officeFactoring} className="aio-rr-link">Open Factoring Command Center →</Link>
      )}
    </section>
  );
}
