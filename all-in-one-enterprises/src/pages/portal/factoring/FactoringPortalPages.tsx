import { Link, useParams } from 'react-router-dom';
import { useMemo } from 'react';
import { useDemoStore } from '../../../demo/useDemoStore';
import {
  getCustomerFactoringMetrics,
  getFactoringProfile,
  getOrganizationId,
  getReadyLoads,
  getSubmissions,
  requestFactoringHelp,
} from '../../../demo/factoringActions';
import { SUBMISSION_STATUS_LABELS, DEMO_FACTORING_LABEL, ENROLLMENT_STATUS_LABELS } from '../../../factoring/factoringConfig';
import { formatMoney } from '../../../billing/money';
import { aioPaths } from '../../../utils/paths';
import { isFactoringActive } from '../../../factoring/factoringRules';

export function FactoringHomePage() {
  const store = useDemoStore();
  const orgId = getOrganizationId(store);
  const profile = getFactoringProfile(orgId, store);
  const metrics = useMemo(() => getCustomerFactoringMetrics(orgId, store), [orgId, store]);
  const submissions = getSubmissions(orgId, store).slice(0, 5);
  const issues = store.factoringIssues.filter((i) => i.organizationId === orgId && i.customerActionRequired && i.status !== 'resolved');

  if (!profile || profile.enrollmentStatus === 'not_enrolled') {
    return (
      <div className="aio-factoring">
        <header className="aio-factoring-hero">
          <h1>Get paid without losing track of the paperwork.</h1>
          <p>
            All In One helps organize load documents, freight invoices, and factoring submissions.
            We do not guarantee funding or approval — funding comes from your factoring provider.
          </p>
          <button type="button" className="aio-btn aio-btn--gold" onClick={() => requestFactoringHelp(orgId)}>
            Request Factoring Help
          </button>
          <Link to={aioPaths.factoring} className="aio-btn aio-btn--outline">Learn How It Works</Link>
        </header>
        <p className="aio-prototype-note">{DEMO_FACTORING_LABEL}</p>
      </div>
    );
  }

  if (!isFactoringActive(profile) && profile.enrollmentStatus !== 'interested') {
    return (
      <div className="aio-factoring">
        <h1>Factoring</h1>
        <p>Enrollment: {ENROLLMENT_STATUS_LABELS[profile.enrollmentStatus]}</p>
        <Link to={aioPaths.portalFactoringApplication} className="aio-btn aio-btn--gold">Continue Application</Link>
      </div>
    );
  }

  return (
    <div className="aio-factoring">
      <header className="aio-factoring-hero aio-factoring-hero--compact">
        <h1>Factoring</h1>
        <p className="aio-prototype-note">{DEMO_FACTORING_LABEL}</p>
      </header>

      <div className="aio-factoring-metrics">
        <div className="aio-factoring-metric"><span>{metrics.readyToSubmit}</span><label>Ready to Submit</label></div>
        <div className="aio-factoring-metric"><span>{metrics.inReview}</span><label>In Review</label></div>
        <div className="aio-factoring-metric"><span>{metrics.fundingPending}</span><label>Funding Pending</label></div>
        <div className="aio-factoring-metric"><span>{metrics.fundedPeriod}</span><label>Reported Funded</label></div>
        {metrics.actionNeeded > 0 && (
          <div className="aio-factoring-metric aio-factoring-metric--warn"><span>{metrics.actionNeeded}</span><label>Action Needed</label></div>
        )}
      </div>

      {issues.length > 0 && (
        <section className="aio-factoring-card aio-factoring-card--warn">
          <h2>Action Needed</h2>
          {issues.map((i) => (
            <Link key={i.id} to={i.submissionId ? aioPaths.portalFactoringSubmission(i.submissionId) : aioPaths.portalFactoringReady}>
              {i.summary}
            </Link>
          ))}
        </section>
      )}

      <section className="aio-factoring-card">
        <h2>Ready for Factoring</h2>
        <Link to={aioPaths.portalFactoringReady} className="aio-rr-link">View all ready loads →</Link>
      </section>

      <section className="aio-factoring-card">
        <h2>Recent Submissions</h2>
        {submissions.length === 0 ? (
          <p className="aio-empty-state__text">No submissions yet.</p>
        ) : (
          submissions.map((s) => {
            const load = store.loads.find((l) => l.id === s.loadId);
            return (
              <Link key={s.id} to={aioPaths.portalFactoringSubmission(s.id)} className="aio-factoring-row">
                <strong>{load?.loadNumber ?? s.loadId}</strong>
                <span>{SUBMISSION_STATUS_LABELS[s.status]}</span>
                <span>{formatMoney(s.submittedAmountMinor)}</span>
              </Link>
            );
          })
        )}
      </section>

      <div className="aio-factoring-actions">
        <Link to={aioPaths.portalFactoringHistory} className="aio-btn aio-btn--outline">History</Link>
        <Link to={aioPaths.officeMessages} className="aio-btn aio-btn--outline">Message Specialist</Link>
      </div>
    </div>
  );
}

export function FactoringApplicationPage() {
  const store = useDemoStore();
  const orgId = getOrganizationId(store);
  const profile = getFactoringProfile(orgId, store);
  const rr = store.roadReadyProfiles.find((p) => p.organizationId === orgId);

  return (
    <div className="aio-factoring">
      <Link to={aioPaths.portalFactoring} className="aio-rr-link">← Factoring</Link>
      <h1>Factoring Application Assistance</h1>
      <p>Known business information is reused from Road Ready. We do not collect bank login credentials or SSN in Sprint 09.</p>
      <dl className="aio-factoring-confirm">
        <div><dt>Legal Name</dt><dd>{rr?.business?.legalName ?? store.clients.find((c) => c.id === orgId)?.companyName}</dd></div>
        <div><dt>USDOT / MC</dt><dd>{rr?.authority?.usdotNumber ?? '—'} / {rr?.authority?.mcNumber ?? '—'}</dd></div>
      </dl>
      <label>
        Do you already use a factoring company?
        <select defaultValue={profile?.hasExistingFactor ? 'yes' : 'no'}>
          <option value="yes">Yes</option>
          <option value="no">No</option>
          <option value="help">Not Sure / I Want Help Choosing</option>
        </select>
      </label>
      <Link to={aioPaths.portalFactoring} className="aio-btn aio-btn--gold">Save &amp; Continue</Link>
    </div>
  );
}

export function FactoringReadyPage() {
  const store = useDemoStore();
  const orgId = getOrganizationId(store);
  const ready = getReadyLoads(orgId, store);

  return (
    <div className="aio-factoring">
      <Link to={aioPaths.portalFactoring} className="aio-rr-link">← Factoring</Link>
      <h1>Ready for Factoring</h1>
      {ready.map(({ load, readiness, freightInvoice }) => (
        <div key={load.id} className="aio-factoring-card">
          <strong>{load.loadNumber}</strong>
          <p>{load.originCity}, {load.originState} → {load.destinationCity}, {load.destinationState}</p>
          <p>Broker: {load.brokerName} · Gross: {formatMoney(load.confirmedGrossMinor)}</p>
          <p>Status: {readiness.state.replace(/_/g, ' ')}</p>
          <ul>
            {readiness.items.map((item) => (
              <li key={item.kind}>{item.met ? '✓' : '!'} {item.kind}</li>
            ))}
          </ul>
          <Link to={aioPaths.portalDispatchLoad(load.id)} className="aio-btn aio-btn--gold aio-btn--sm">
            Review for Factoring
          </Link>
          {!freightInvoice && readiness.state === 'ready' && (
            <p className="aio-prototype-note">Create a freight invoice from load detail to begin submission.</p>
          )}
        </div>
      ))}
    </div>
  );
}

export function FactoringSubmissionDetailPage() {
  const { submissionId } = useParams();
  const store = useDemoStore();
  const orgId = getOrganizationId(store);
  const sub = store.factoringSubmissions.find((s) => s.id === submissionId && s.organizationId === orgId);
  if (!sub) return <p>Submission not found.</p>;
  const load = store.loads.find((l) => l.id === sub.loadId);
  const freightInvoice = store.freightInvoices.find((f) => f.id === sub.freightInvoiceId);
  const provider = store.factoringProviders.find((p) => p.id === sub.providerId);

  return (
    <div className="aio-factoring">
      <Link to={aioPaths.portalFactoring} className="aio-rr-link">← Factoring</Link>
      <h1>{SUBMISSION_STATUS_LABELS[sub.status]}</h1>
      <p>Load {load?.loadNumber} · Provider: {provider?.name}</p>
      {freightInvoice && (
        <p>Freight Invoice {freightInvoice.invoiceNumber} · {formatMoney(freightInvoice.amountMinor)}</p>
      )}
      <dl className="aio-factoring-metrics">
        <div><dt>Submitted Amount</dt><dd>{formatMoney(sub.submittedAmountMinor)}</dd></div>
        {sub.reportedAdvanceMinor != null && (
          <div><dt>Reported Advance</dt><dd>{formatMoney(sub.reportedAdvanceMinor)}</dd></div>
        )}
        {sub.reportedReserveMinor != null && (
          <div><dt>Reported Reserve</dt><dd>{formatMoney(sub.reportedReserveMinor)}</dd></div>
        )}
      </dl>
      <p className="aio-prototype-note">Reported funding values are provider-reported — not bank-verified.</p>
      <ol className="aio-dispatch-timeline">
        {sub.timeline.filter((t) => t.visibility === 'customer').map((t) => (
          <li key={t.id}>{t.label} · {new Date(t.createdAt).toLocaleString()}</li>
        ))}
      </ol>
    </div>
  );
}

export function FactoringHistoryPage() {
  const store = useDemoStore();
  const orgId = getOrganizationId(store);
  const subs = getSubmissions(orgId, store);

  return (
    <div className="aio-factoring">
      <Link to={aioPaths.portalFactoring} className="aio-rr-link">← Factoring</Link>
      <h1>Factoring History</h1>
      {subs.map((s) => {
        const load = store.loads.find((l) => l.id === s.loadId);
        return (
          <Link key={s.id} to={aioPaths.portalFactoringSubmission(s.id)} className="aio-factoring-row">
            <strong>{load?.loadNumber}</strong>
            <span>{SUBMISSION_STATUS_LABELS[s.status]}</span>
            <span>{formatMoney(s.submittedAmountMinor)}</span>
          </Link>
        );
      })}
    </div>
  );
}
