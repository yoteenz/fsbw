import { Link, useParams } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { useDemoStore } from '../../../demo/useDemoStore';
import {
  addExistingPolicy,
  getActivePolicy,
  getOrganizationId,
  getPoliciesForOrg,
  getQuotesForRequest,
  getRequestsForOrg,
  getVehicleCoverageSummary,
  selectQuoteExternal,
  submitInsuranceRequest,
  requestCertificate,
} from '../../../demo/insuranceActions';
import {
  COVERAGE_TYPE_LABELS,
  DEMO_INSURANCE_LABEL,
  INSURANCE_DISCLOSURE,
  INSURANCE_REQUEST_STATUS_LABELS,
  INSURANCE_REQUEST_TYPE_LABELS,
  POLICY_STATUS_LABELS,
  QUOTE_SOURCE_LABELS,
} from '../../../insurance/insuranceConfig';
import { maskPolicyNumber } from '../../../insurance/insuranceCalculations';
import { formatMoney } from '../../../billing/money';
import { aioPaths } from '../../../utils/paths';
import type { CoverageType } from '../../../insurance/insuranceTypes';

export function InsuranceHomePage() {
  const store = useDemoStore();
  const orgId = getOrganizationId(store);
  const policies = getPoliciesForOrg(orgId, store);
  const active = getActivePolicy(orgId, store);
  const requests = getRequestsForOrg(orgId, store).filter((r) => !['completed', 'cancelled'].includes(r.status));
  const cois = store.insuranceCertificates.filter((c) => c.organizationId === orgId);
  const vehicleSummary = useMemo(() => getVehicleCoverageSummary(orgId, store), [orgId, store]);
  const expiring = policies.filter((p) => p.status === 'expiring_soon').length;

  if (!policies.length && !requests.length) {
    return (
      <div className="aio-insurance">
        <header className="aio-insurance-hero">
          <h1>Let&apos;s get your insurance in order.</h1>
          <p>{DEMO_INSURANCE_LABEL}</p>
        </header>
        <p>Add your existing coverage or request help preparing for commercial trucking insurance.</p>
        <div className="aio-insurance-actions">
          <Link to={aioPaths.portalInsuranceRequest} className="aio-btn aio-btn--gold">Request Insurance Help</Link>
          <Link to={`${aioPaths.portalInsuranceRequest}?existing=1`} className="aio-btn aio-btn--outline">Add Existing Policy</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="aio-insurance">
      <header className="aio-insurance-hero aio-insurance-hero--compact">
        <h1>Insurance Center</h1>
        <p>{DEMO_INSURANCE_LABEL}</p>
      </header>
      <div className="aio-insurance-metrics">
        <div className="aio-insurance-metric"><span>{policies.filter((p) => p.status === 'active' || p.status === 'expiring_soon').length}</span><label>Active Policies</label></div>
        <div className="aio-insurance-metric"><span>{expiring}</span><label>Expiring Soon</label></div>
        <div className="aio-insurance-metric"><span>{cois.filter((c) => c.status === 'issued').length}</span><label>COIs</label></div>
        <div className="aio-insurance-metric"><span>{requests.length}</span><label>Open Requests</label></div>
      </div>
      {active && (
        <section className="aio-insurance-panel">
          <h2>Current Coverage</h2>
          <p><strong>{active.carrierName}</strong> · {POLICY_STATUS_LABELS[active.status]}</p>
          <p>Expires {active.expirationDate ?? '—'} · {active.verificationState.replace(/_/g, ' ')}</p>
          {!active.verificationState.includes('verified') && !active.verificationState.includes('reviewed') && (
            <p className="aio-prototype-note">Customer-reported — not independently verified.</p>
          )}
        </section>
      )}
      {vehicleSummary.reviewNeeded && (
        <p className="aio-insurance-warn">Review needed — fleet unit count may not match policy vehicle schedule.</p>
      )}
      <div className="aio-insurance-actions">
        <Link to={aioPaths.portalInsuranceRequest} className="aio-btn aio-btn--gold aio-btn--sm">Request Help</Link>
        <Link to={aioPaths.portalInsuranceCertificates} className="aio-btn aio-btn--outline aio-btn--sm">Certificates</Link>
        <Link to={aioPaths.portalInsuranceRenewals} className="aio-btn aio-btn--outline aio-btn--sm">Renewals</Link>
        <Link to={aioPaths.portalVault} className="aio-btn aio-btn--outline aio-btn--sm">Documents</Link>
      </div>
      <section className="aio-insurance-panel">
        <h2>My Policies</h2>
        {policies.map((p) => (
          <Link key={p.id} to={aioPaths.portalInsurancePolicy(p.id)} className="aio-insurance-row">
            <span>{p.carrierName}</span>
            <span>{POLICY_STATUS_LABELS[p.status]}</span>
          </Link>
        ))}
      </section>
    </div>
  );
}

export function InsuranceRequestPage() {
  const store = useDemoStore();
  const orgId = getOrganizationId(store);
  const profile = store.roadReadyProfiles.find((p) => p.organizationId === orgId);
  const units = store.powerUnits.filter((u) => u.organizationId === orgId);
  const [coverageNeeds, setCoverageNeeds] = useState<CoverageType[]>(['auto_liability']);
  const params = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
  const isExisting = params.get('existing') === '1';
  const [carrierName, setCarrierName] = useState('');
  const [policyNumber, setPolicyNumber] = useState('');
  const [expirationDate, setExpirationDate] = useState('');

  if (isExisting) {
    return (
      <div className="aio-insurance">
        <Link to={aioPaths.portalInsurance} className="aio-rr-link">← Insurance</Link>
        <h1>Add Existing Policy</h1>
        <label className="aio-insurance-field">Carrier Name<input value={carrierName} onChange={(e) => setCarrierName(e.target.value)} /></label>
        <label className="aio-insurance-field">Policy Number<input value={policyNumber} onChange={(e) => setPolicyNumber(e.target.value)} /></label>
        <label className="aio-insurance-field">Expiration Date<input type="date" value={expirationDate} onChange={(e) => setExpirationDate(e.target.value)} /></label>
        <button
          type="button"
          className="aio-btn aio-btn--gold"
          onClick={() => {
            if (!carrierName) return;
            const id = addExistingPolicy(orgId, { carrierName, policyNumber, expirationDate, policyType: 'Commercial Auto' });
            window.location.href = aioPaths.portalInsurancePolicy(id);
          }}
        >
          Save Policy Record
        </button>
      </div>
    );
  }

  return (
    <div className="aio-insurance">
      <Link to={aioPaths.portalInsurance} className="aio-rr-link">← Insurance</Link>
      <h1>Request Insurance Help</h1>
      <p className="aio-prototype-note">{INSURANCE_DISCLOSURE}</p>
      <section className="aio-insurance-panel">
        <h2>Prefilled Business</h2>
        <p>{profile?.business?.legalName ?? store.clients.find((c) => c.id === orgId)?.companyName}</p>
        <p>USDOT {profile?.authority?.usdotNumber ?? '—'} · MC {profile?.authority?.mcNumber ?? '—'}</p>
      </section>
      <section className="aio-insurance-panel">
        <h2>Fleet ({units.length} units)</h2>
        {units.map((u) => (
          <p key={u.id}>{u.nickname ?? u.id} · {u.year} {u.make} {u.model}</p>
        ))}
      </section>
      <section className="aio-insurance-panel">
        <h2>Coverage Needs</h2>
        {(Object.keys(COVERAGE_TYPE_LABELS) as CoverageType[]).slice(0, 4).map((key) => (
          <label key={key} className="aio-insurance-check">
            <input
              type="checkbox"
              checked={coverageNeeds.includes(key)}
              onChange={(e) => setCoverageNeeds((prev) => (e.target.checked ? [...prev, key] : prev.filter((k) => k !== key)))}
            />
            {COVERAGE_TYPE_LABELS[key]}
          </label>
        ))}
      </section>
      <button
        type="button"
        className="aio-btn aio-btn--gold"
        onClick={() => {
          const id = submitInsuranceRequest(orgId, {
            requestType: 'new_coverage',
            coverageNeeds,
            selectedPowerUnitIds: units.map((u) => u.id),
          });
          window.location.href = aioPaths.portalInsuranceRequestDetail(id);
        }}
      >
        Submit Request
      </button>
    </div>
  );
}

export function InsuranceRequestDetailPage() {
  const { requestId } = useParams();
  const store = useDemoStore();
  const orgId = getOrganizationId(store);
  const req = store.insuranceRequests.find((r) => r.id === requestId && r.organizationId === orgId);
  if (!req) return <p>Request not found.</p>;
  const quotes = getQuotesForRequest(req.id, store);

  return (
    <div className="aio-insurance">
      <Link to={aioPaths.portalInsurance} className="aio-rr-link">← Insurance</Link>
      <h1>{req.requestNumber}</h1>
      <p>{INSURANCE_REQUEST_TYPE_LABELS[req.requestType]} · {INSURANCE_REQUEST_STATUS_LABELS[req.status]}</p>
      {quotes.length > 0 && (
        <section className="aio-insurance-panel">
          <h2>Coverage Options Received</h2>
          <p className="aio-prototype-note">Quote information provided by licensed provider where applicable.</p>
          {quotes.map((q) => (
            <div key={q.id} className="aio-insurance-card">
              <strong>{q.insuranceCarrierName}</strong>
              <p>{q.coverageSummary}</p>
              {q.premiumMinor != null && <p>Reported premium: {formatMoney(q.premiumMinor)}/yr</p>}
              <p>Source: {QUOTE_SOURCE_LABELS[q.source]}</p>
              {req.status === 'customer_review' && (
                <button type="button" className="aio-btn aio-btn--outline aio-btn--sm" onClick={() => selectQuoteExternal(req.id, q.id, orgId)}>
                  Selected Externally
                </button>
              )}
            </div>
          ))}
        </section>
      )}
      <p className="aio-prototype-note">Binding and premium collection are not available through All In One in this mode.</p>
    </div>
  );
}

export function InsurancePolicyDetailPage() {
  const { policyId } = useParams();
  const store = useDemoStore();
  const orgId = getOrganizationId(store);
  const policy = store.insurancePolicies.find((p) => p.id === policyId && p.organizationId === orgId);
  if (!policy) return <p>Policy not found.</p>;
  const coverages = store.insurancePolicyCoverages.filter((c) => c.policyId === policy.id);
  const vehicles = store.insurancePolicyVehicles.filter((v) => v.policyId === policy.id);

  return (
    <div className="aio-insurance">
      <Link to={aioPaths.portalInsurance} className="aio-rr-link">← Insurance</Link>
      <h1>{policy.carrierName}</h1>
      <p>{POLICY_STATUS_LABELS[policy.status]} · {policy.verificationState.replace(/_/g, ' ')}</p>
      <dl className="aio-office-dl">
        <dt>Policy Number</dt><dd>{maskPolicyNumber(policy.policyNumber)}</dd>
        <dt>Effective</dt><dd>{policy.effectiveDate ?? '—'}</dd>
        <dt>Expiration</dt><dd>{policy.expirationDate ?? '—'}</dt>
        <dt>Agency</dt><dd>{policy.agencyName ?? '—'}</dt>
      </dl>
      <section className="aio-insurance-panel">
        <h2>Coverages</h2>
        {coverages.map((c) => (
          <p key={c.id}>{COVERAGE_TYPE_LABELS[c.coverageType]}{c.limitMinor ? ` · ${formatMoney(c.limitMinor)} limit` : ''}</p>
        ))}
      </section>
      <section className="aio-insurance-panel">
        <h2>Covered Vehicles</h2>
        {vehicles.map((v) => {
          const unit = store.powerUnits.find((u) => u.id === v.powerUnitId);
          return <p key={v.id}>{unit?.nickname ?? v.powerUnitId} · {unit?.year} {unit?.make}</p>;
        })}
      </section>
    </div>
  );
}

export function InsuranceCertificatesPage() {
  const store = useDemoStore();
  const orgId = getOrganizationId(store);
  const certs = store.insuranceCertificates.filter((c) => c.organizationId === orgId);
  const holders = store.insuranceCertificateHolders.filter((h) => h.organizationId === orgId);

  return (
    <div className="aio-insurance">
      <Link to={aioPaths.portalInsurance} className="aio-rr-link">← Insurance</Link>
      <h1>Certificates of Insurance</h1>
      <Link to={aioPaths.portalInsuranceCertificateNew} className="aio-btn aio-btn--gold aio-btn--sm">Request COI</Link>
      {certs.map((c) => {
        const holder = holders.find((h) => h.id === c.certificateHolderId) ?? store.insuranceCertificateHolders.find((h) => h.id === c.certificateHolderId);
        return (
          <div key={c.id} className="aio-insurance-card">
            <strong>{holder?.name ?? 'Certificate Holder'}</strong>
            <p>{c.status.replace(/_/g, ' ')}</p>
          </div>
        );
      })}
    </div>
  );
}

export function InsuranceCertificateNewPage() {
  const store = useDemoStore();
  const orgId = getOrganizationId(store);
  const holders = store.insuranceCertificateHolders.filter((h) => h.organizationId === orgId);
  const [holderId, setHolderId] = useState(holders[0]?.id ?? '');

  return (
    <div className="aio-insurance">
      <Link to={aioPaths.portalInsuranceCertificates} className="aio-rr-link">← Certificates</Link>
      <h1>Request Certificate</h1>
      <p className="aio-prototype-note">All In One coordinates COI requests — issuance requires authorized sources.</p>
      {holders.length > 0 && (
        <label className="aio-insurance-field">
          Certificate Holder
          <select value={holderId} onChange={(e) => setHolderId(e.target.value)}>
            {holders.map((h) => <option key={h.id} value={h.id}>{h.name}</option>)}
          </select>
        </label>
      )}
      <button
        type="button"
        className="aio-btn aio-btn--gold"
        disabled={!holderId}
        onClick={() => {
          requestCertificate(orgId, holderId);
          window.location.href = aioPaths.portalInsuranceCertificates;
        }}
      >
        Submit COI Request
      </button>
    </div>
  );
}

export function InsuranceRenewalsPage() {
  const store = useDemoStore();
  const orgId = getOrganizationId(store);
  const renewals = store.renewals.filter((r) => r.organizationId === orgId && r.category === 'insurance');
  const expiring = getPoliciesForOrg(orgId, store).filter((p) => p.status === 'expiring_soon');

  return (
    <div className="aio-insurance">
      <Link to={aioPaths.portalInsurance} className="aio-rr-link">← Insurance</Link>
      <h1>Insurance Renewals</h1>
      {expiring.map((p) => (
        <div key={p.id} className="aio-insurance-card">
          <strong>{p.carrierName}</strong>
          <p>Expires {p.expirationDate}</p>
          <Link to={aioPaths.portalInsuranceRequest} className="aio-btn aio-btn--outline aio-btn--sm">Start Renewal Request</Link>
        </div>
      ))}
      {renewals.map((r) => (
        <div key={r.id} className="aio-insurance-card">
          <strong>{r.title}</strong>
          <p>{r.status.replace(/_/g, ' ')}</p>
        </div>
      ))}
    </div>
  );
}
