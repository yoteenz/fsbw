import { Link, useParams } from 'react-router-dom';
import { useMemo } from 'react';
import { useDemoStore } from '../../demo/useDemoStore';
import {
  getOfficeFactoringMetrics,
  getSubmissions,
  submitToProvider,
  updateSubmissionStatus,
} from '../../demo/factoringActions';
import { SUBMISSION_STATUS_LABELS, DEMO_FACTORING_LABEL, REVIEW_CHECKLIST_ITEMS } from '../../factoring/factoringConfig';
import { formatMoney } from '../../billing/money';
import { aioPaths } from '../../utils/paths';
import { detectAmountMismatch } from '../../factoring/factoringRules';

export function FactoringCommandCenterPage() {
  const store = useDemoStore();
  const metrics = useMemo(() => getOfficeFactoringMetrics(store), [store]);
  const subs = store.factoringSubmissions;

  return (
    <div className="aio-factoring-office">
      <header className="aio-office-page__header">
        <h1>Factoring Command Center</h1>
        <p>{DEMO_FACTORING_LABEL}</p>
        <div className="aio-office-action-bar">
          <Link to={aioPaths.officeFactoringSubmissions} className="aio-btn aio-btn--sm">All Submissions</Link>
          <Link to={aioPaths.officeFactoringClients} className="aio-btn aio-btn--sm">Clients</Link>
          <Link to={aioPaths.officeFactoringProviders} className="aio-btn aio-btn--sm">Providers</Link>
        </div>
      </header>
      <div className="aio-factoring-office-metrics">
        <div className="aio-office-metric-card"><span className="aio-office-metric-card__value">{metrics.ready}</span><span className="aio-office-metric-card__label">Ready</span></div>
        <div className="aio-office-metric-card"><span className="aio-office-metric-card__value">{metrics.documentsNeeded}</span><span className="aio-office-metric-card__label">Documents Needed</span></div>
        <div className="aio-office-metric-card"><span className="aio-office-metric-card__value">{metrics.providerReview}</span><span className="aio-office-metric-card__label">Provider Review</span></div>
        <div className="aio-office-metric-card"><span className="aio-office-metric-card__value">{metrics.fundingPending}</span><span className="aio-office-metric-card__label">Funding Pending</span></div>
        <div className="aio-office-metric-card"><span className="aio-office-metric-card__value">{metrics.funded}</span><span className="aio-office-metric-card__label">Reported Funded</span></div>
        <div className="aio-office-metric-card"><span className="aio-office-metric-card__value">{metrics.issues}</span><span className="aio-office-metric-card__label">Issues</span></div>
      </div>
      <section className="aio-office-panel">
        <h2>Pipeline</h2>
        {subs.map((s) => {
          const client = store.clients.find((c) => c.id === s.organizationId);
          const load = store.loads.find((l) => l.id === s.loadId);
          return (
            <Link key={s.id} to={aioPaths.officeFactoringSubmission(s.id)} className="aio-office-list-row">
              <span>{client?.companyName} · {load?.loadNumber}</span>
              <span>{SUBMISSION_STATUS_LABELS[s.status]}</span>
              <span>{formatMoney(s.submittedAmountMinor)}</span>
            </Link>
          );
        })}
      </section>
    </div>
  );
}

export function FactoringSubmissionsListPage() {
  const store = useDemoStore();
  return (
    <div className="aio-office-page">
      <header className="aio-office-page__header"><h1>Factoring Submissions</h1></header>
      <div className="aio-office-table-wrap">
        <table className="aio-office-table">
          <thead><tr><th>Carrier</th><th>Load</th><th>Amount</th><th>Status</th></tr></thead>
          <tbody>
            {store.factoringSubmissions.map((s) => {
              const client = store.clients.find((c) => c.id === s.organizationId);
              const load = store.loads.find((l) => l.id === s.loadId);
              return (
                <tr key={s.id}>
                  <td>{client?.companyName}</td>
                  <td><Link to={aioPaths.officeFactoringSubmission(s.id)}>{load?.loadNumber}</Link></td>
                  <td>{formatMoney(s.submittedAmountMinor)}</td>
                  <td>{SUBMISSION_STATUS_LABELS[s.status]}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function OfficeFactoringSubmissionDetailPage() {
  const { submissionId } = useParams<{ submissionId: string }>();
  const store = useDemoStore();
  const sub = store.factoringSubmissions.find((s) => s.id === submissionId);
  if (!sub) return <p>Not found.</p>;
  const load = store.loads.find((l) => l.id === sub.loadId);
  const inv = store.freightInvoices.find((f) => f.id === sub.freightInvoiceId);
  const provider = store.factoringProviders.find((p) => p.id === sub.providerId);
  const mismatch = load && inv ? detectAmountMismatch(load, inv) : false;

  return (
    <div className="aio-office-page">
      <Link to={aioPaths.officeFactoring} className="aio-office-link">← Command Center</Link>
      <h1>Submission Review</h1>
      <p>{SUBMISSION_STATUS_LABELS[sub.status]} · {provider?.name}</p>
      {mismatch && (
        <section className="aio-office-panel aio-office-panel--highlight">
          <h2>Amount Mismatch</h2>
          <p>Load gross {formatMoney(load!.confirmedGrossMinor)} vs freight invoice {formatMoney(inv!.amountMinor)}</p>
        </section>
      )}
      <section className="aio-office-panel">
        <h2>Checklist</h2>
        <ul>{REVIEW_CHECKLIST_ITEMS.map((item) => <li key={item}>{item}</li>)}</ul>
      </section>
      <div className="aio-office-action-bar">
        {['ready', 'submitted'].includes(sub.status) && (
          <button type="button" className="aio-btn aio-btn--gold" onClick={() => submitToProvider(sub.id, 'staff-6')}>
            {sub.status === 'ready' ? 'Submit to Provider (Manual)' : 'Mark Provider Review'}
          </button>
        )}
        {sub.status === 'submitted' && (
          <button type="button" className="aio-btn aio-btn--outline" onClick={() => updateSubmissionStatus(sub.id, 'provider_review', 'staff-6')}>At Provider Review</button>
        )}
        {sub.status === 'provider_review' && (
          <button type="button" className="aio-btn aio-btn--gold" onClick={() => updateSubmissionStatus(sub.id, 'approved', 'staff-6')}>Record Approved</button>
        )}
        {sub.status === 'approved' && (
          <button type="button" className="aio-btn aio-btn--gold" onClick={() => updateSubmissionStatus(sub.id, 'funding_pending', 'staff-6')}>Funding Pending</button>
        )}
        {sub.status === 'funding_pending' && (
          <button type="button" className="aio-btn aio-btn--gold" onClick={() => updateSubmissionStatus(sub.id, 'funded', 'staff-6', { advanceMinor: Math.round(sub.submittedAmountMinor * 0.95), reserveMinor: Math.round(sub.submittedAmountMinor * 0.05) })}>Record Reported Funding</button>
        )}
      </div>
      {sub.status === 'funded' && (
        <p className="aio-prototype-note">Funded record locked — ordinary edits blocked.</p>
      )}
    </div>
  );
}

export function FactoringClientsListPage() {
  const store = useDemoStore();
  const active = store.factoringProfiles.filter((p) => p.enrollmentStatus === 'active' || p.enrollmentStatus === 'approved');
  return (
    <div className="aio-office-page">
      <header className="aio-office-page__header"><h1>Factoring Clients</h1></header>
      {active.map((p) => {
        const client = store.clients.find((c) => c.id === p.organizationId);
        return (
          <Link key={p.id} to={aioPaths.officeFactoringClient(p.organizationId)} className="aio-office-list-row">
            <span>{client?.companyName}</span>
            <span>{p.hasExistingFactor ? 'Existing factor' : 'Partner'}</span>
          </Link>
        );
      })}
    </div>
  );
}

export function FactoringClientDetailPage() {
  const { clientId } = useParams<{ clientId: string }>();
  const store = useDemoStore();
  const profile = store.factoringProfiles.find((p) => p.organizationId === clientId);
  const client = store.clients.find((c) => c.id === clientId);
  const subs = getSubmissions(clientId, store);
  if (!client || !profile) return <p>Not found.</p>;
  return (
    <div className="aio-office-page">
      <Link to={aioPaths.officeFactoringClients} className="aio-office-link">← Clients</Link>
      <h1>{client.companyName}</h1>
      <p>Mode: {profile.serviceMode} · {profile.hasExistingFactor ? `Existing: ${profile.existingProviderName}` : 'Partner workflow'}</p>
      <section className="aio-office-panel">
        <h2>Submissions</h2>
        {subs.map((s) => (
          <Link key={s.id} to={aioPaths.officeFactoringSubmission(s.id)} className="aio-office-list-row">
            {SUBMISSION_STATUS_LABELS[s.status]} · {formatMoney(s.submittedAmountMinor)}
          </Link>
        ))}
      </section>
      <Link to={aioPaths.officeClientRoadReady(clientId!)} className="aio-rr-link">Road Ready →</Link>
    </div>
  );
}

export function FactoringProvidersPage() {
  const store = useDemoStore();
  return (
    <div className="aio-office-page">
      <header className="aio-office-page__header"><h1>Factoring Providers</h1><p>Fictional demo providers only.</p></header>
      {store.factoringProviders.map((p) => (
        <div key={p.id} className="aio-office-panel">
          <h3>{p.name}</h3>
          <p>{p.status.replace(/_/g, ' ')} · {p.submissionMethod.replace(/_/g, ' ')}</p>
        </div>
      ))}
    </div>
  );
}
