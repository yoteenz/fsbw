import { Link, useParams } from 'react-router-dom';
import { useMemo } from 'react';
import { useDemoStore } from '../../demo/useDemoStore';
import {
  activatePolicyFromEvidence,
  getInsuranceMetrics,
  getQuotesForRequest,
  recordInsuranceQuote,
  recordPartnerReferral,
} from '../../demo/insuranceActions';
import {
  DEMO_INSURANCE_LABEL,
  INSURANCE_READINESS_CHECKLIST,
  INSURANCE_REQUEST_STATUS_LABELS,
  INSURANCE_REQUEST_TYPE_LABELS,
  POLICY_STATUS_LABELS,
  QUOTE_SOURCE_LABELS,
} from '../../insurance/insuranceConfig';
import { formatMoney } from '../../billing/money';
import { dollarsToMinor } from '../../billing/money';
import { aioPaths } from '../../utils/paths';

export function InsuranceCommandCenterPage() {
  const store = useDemoStore();
  const metrics = useMemo(() => getInsuranceMetrics(store), [store]);
  const openRequests = store.insuranceRequests.filter((r) => !['completed', 'cancelled', 'declined'].includes(r.status));

  return (
    <div className="aio-insurance-office">
      <header className="aio-office-page__header">
        <h1>Insurance Command Center</h1>
        <p>{DEMO_INSURANCE_LABEL}</p>
        <div className="aio-office-action-bar">
          <Link to={aioPaths.officeInsuranceRequests} className="aio-btn aio-btn--sm">Requests</Link>
          <Link to={aioPaths.officeInsurancePolicies} className="aio-btn aio-btn--sm">Policies</Link>
          <Link to={aioPaths.officeInsurancePartners} className="aio-btn aio-btn--sm">Partners</Link>
          <Link to={aioPaths.officeInsuranceCertificates} className="aio-btn aio-btn--sm">COIs</Link>
          <Link to={aioPaths.officeInsuranceReadiness} className="aio-btn aio-btn--sm">Readiness</Link>
        </div>
      </header>
      <div className="aio-insurance-office-metrics">
        <div className="aio-office-metric-card"><span>{metrics.openRequests}</span><label>Open Requests</label></div>
        <div className="aio-office-metric-card"><span>{metrics.incompleteRequests}</span><label>Incomplete</label></div>
        <div className="aio-office-metric-card"><span>{metrics.partnerReview}</span><label>Partner Review</label></div>
        <div className="aio-office-metric-card"><span>{metrics.policiesExpiring}</span><label>Expiring</label></div>
        <div className="aio-office-metric-card"><span>{metrics.coiRequests}</span><label>COI Requests</label></div>
        <div className="aio-office-metric-card"><span>{metrics.roadReadyBlockers}</span><label>Issues</label></div>
      </div>
      <section className="aio-office-panel">
        <h2>Active Requests</h2>
        {openRequests.map((r) => {
          const client = store.clients.find((c) => c.id === r.organizationId);
          return (
            <Link key={r.id} to={aioPaths.officeInsuranceRequest(r.id)} className="aio-office-list-row">
              <span>{r.requestNumber} · {client?.companyName}</span>
              <span>{INSURANCE_REQUEST_STATUS_LABELS[r.status]}</span>
            </Link>
          );
        })}
      </section>
    </div>
  );
}

export function InsuranceRequestsListPage() {
  const store = useDemoStore();
  return (
    <div className="aio-office-page">
      <Link to={aioPaths.officeInsurance} className="aio-office-link">← Command Center</Link>
      <h1>Insurance Requests</h1>
      {store.insuranceRequests.map((r) => (
        <Link key={r.id} to={aioPaths.officeInsuranceRequest(r.id)} className="aio-office-list-row">
          {r.requestNumber} · {INSURANCE_REQUEST_STATUS_LABELS[r.status]}
        </Link>
      ))}
    </div>
  );
}

export function InsuranceRequestDetailOfficePage() {
  const { requestId } = useParams();
  const store = useDemoStore();
  const req = store.insuranceRequests.find((r) => r.id === requestId);
  if (!req) return <p>Not found.</p>;
  const client = store.clients.find((c) => c.id === req.organizationId);
  const quotes = getQuotesForRequest(req.id, store);
  const partner = store.insurancePartners.find((p) => p.id === req.partnerId);

  return (
    <div className="aio-office-page">
      <Link to={aioPaths.officeInsuranceRequests} className="aio-office-link">← Requests</Link>
      <h1>{req.requestNumber}</h1>
      <p>{client?.companyName} · {INSURANCE_REQUEST_TYPE_LABELS[req.requestType]}</p>
      <p>Status: {INSURANCE_REQUEST_STATUS_LABELS[req.status]}</p>
      {req.internalNotes && <p className="aio-prototype-note">Internal: {req.internalNotes}</p>}
      <div className="aio-office-action-bar">
        {req.status === 'internal_review' && (
          <button type="button" className="aio-btn aio-btn--gold aio-btn--sm" onClick={() => recordPartnerReferral(req.id, 'ins-partner-demo', 'staff-5')}>
            Record Partner Referral
          </button>
        )}
        {['partner_review', 'quote_options_reported'].includes(req.status) && (
          <button
            type="button"
            className="aio-btn aio-btn--sm"
            onClick={() => recordInsuranceQuote(req.id, {
              insuranceCarrierName: 'Demo Carrier (Staff Entry)',
              premiumMinor: dollarsToMinor(14000),
              coverageSummary: 'Auto Liability $1M',
              quoteReference: 'STAFF-DEMO',
            })}
          >
            Record Demo Quote
          </button>
        )}
      </div>
      {partner && <p>Partner: {partner.agencyName}</p>}
      {quotes.length > 0 && (
        <section className="aio-office-panel">
          <h2>Quote Records</h2>
          {quotes.map((q) => (
            <div key={q.id} className="aio-insurance-card">
              <strong>{q.insuranceCarrierName}</strong>
              <p>{q.coverageSummary}</p>
              {q.premiumMinor != null && <p>{formatMoney(q.premiumMinor)}/yr · {QUOTE_SOURCE_LABELS[q.source]}</p>}
              <p className="aio-prototype-note">Premium is NOT All In One service revenue.</p>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}

export function InsurancePoliciesListPage() {
  const store = useDemoStore();
  return (
    <div className="aio-office-page">
      <Link to={aioPaths.officeInsurance} className="aio-office-link">← Command Center</Link>
      <h1>Policies</h1>
      {store.insurancePolicies.map((p) => {
        const client = store.clients.find((c) => c.id === p.organizationId);
        return (
          <div key={p.id} className="aio-insurance-card">
            <strong>{client?.companyName} · {p.carrierName}</strong>
            <p>{POLICY_STATUS_LABELS[p.status]} · {p.verificationState.replace(/_/g, ' ')}</p>
            {p.status === 'pending' && (
              <button type="button" className="aio-btn aio-btn--sm" onClick={() => activatePolicyFromEvidence(p.id, 'staff-5')}>Activate from Evidence</button>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function InsurancePartnersPage() {
  const store = useDemoStore();
  return (
    <div className="aio-office-page">
      <Link to={aioPaths.officeInsurance} className="aio-office-link">← Command Center</Link>
      <h1>Insurance Partners</h1>
      <p className="aio-prototype-note">Fictional demo partners — not approved insurance providers unless business policy says otherwise.</p>
      {store.insurancePartners.map((p) => (
        <div key={p.id} className="aio-insurance-card">
          <strong>{p.agencyName}</strong>
          <p>{p.status.replace(/_/g, ' ')} · {p.commercialTrucking ? 'Commercial trucking' : 'General'}</p>
          <p>{p.contactName} · {p.email}</p>
        </div>
      ))}
    </div>
  );
}

export function InsuranceCertificatesOfficePage() {
  const store = useDemoStore();
  return (
    <div className="aio-office-page">
      <Link to={aioPaths.officeInsurance} className="aio-office-link">← Command Center</Link>
      <h1>COI Requests</h1>
      {store.insuranceCertificates.map((c) => {
        const client = store.clients.find((cl) => cl.id === c.organizationId);
        return (
          <div key={c.id} className="aio-insurance-card">
            <strong>{client?.companyName}</strong>
            <p>{c.status.replace(/_/g, ' ')}</p>
          </div>
        );
      })}
    </div>
  );
}

export function InsuranceRenewalsOfficePage() {
  const store = useDemoStore();
  const expiring = store.insurancePolicies.filter((p) => p.status === 'expiring_soon');
  return (
    <div className="aio-office-page">
      <Link to={aioPaths.officeInsurance} className="aio-office-link">← Command Center</Link>
      <h1>Renewals</h1>
      {expiring.map((p) => {
        const client = store.clients.find((c) => c.id === p.organizationId);
        return (
          <div key={p.id} className="aio-insurance-card">
            <strong>{client?.companyName}</strong>
            <p>{p.carrierName} · expires {p.expirationDate}</p>
          </div>
        );
      })}
    </div>
  );
}

export function InsuranceReadinessPage() {
  const store = useDemoStore();
  const cap = store.insuranceCapability;
  return (
    <div className="aio-office-page">
      <Link to={aioPaths.officeInsurance} className="aio-office-link">← Command Center</Link>
      <h1>Insurance Operations Readiness</h1>
      <p>Mode: <strong>{cap.operatingMode.toUpperCase()}</strong> · Capability: <strong>{cap.capability.toUpperCase()}</strong></p>
      <p className="aio-prototype-note">Software readiness ≠ legal authorization to sell or bind insurance.</p>
      <ul>
        {(cap.readinessItems.length ? cap.readinessItems : INSURANCE_READINESS_CHECKLIST.map((i) => ({ ...i, status: 'missing' as const }))).map((item) => (
          <li key={item.key}>{item.label}: {item.status.replace(/_/g, ' ')}</li>
        ))}
      </ul>
    </div>
  );
}
