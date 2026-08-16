import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useDemoStore } from '../../demo/useDemoStore';
import { getRoadReadySummary, verifyRoadReadyItem } from '../../demo/roadReadyActions';
import { runRegulatoryLookup, getCarrierVerifications } from '../../demo/integrationActions';
import { RoadReadyRing } from '../../components/RoadReadyRing';
import { RoadReadyStatusBadge } from '../../components/RoadReadyStatusBadge';
import { EnvBadge, SourceBadge } from './IntegrationPages';
import { aioPaths } from '../../utils/paths';
import { resolveOfficeStaffContext } from '../../office-core/officeContext';
import { hasIntegrationPermission } from '../../integrations/integrationPermissions';
import '../../styles/aio-integrations.css';

export function ClientRoadReadyReviewPage() {
  const { clientId } = useParams<{ clientId: string }>();
  const store = useDemoStore();
  const [note, setNote] = useState('');
  const [usdot, setUsdot] = useState('');
  const [lookupError, setLookupError] = useState<string | null>(null);
  const client = store.clients.find((c) => c.id === clientId);
  const summary = clientId ? getRoadReadySummary(clientId) : null;
  const staffId = store.officeStaffId ?? 'staff-3';
  const staff = store.staff.find((s) => s.id === staffId);
  const ctx = resolveOfficeStaffContext(store);
  const carrierVerifications = clientId ? getCarrierVerifications(clientId) : [];
  const latestCarrierVerification = carrierVerifications[carrierVerifications.length - 1];

  if (!client || !summary) {
    return <p className="aio-office-page">Client or Road Ready profile not found.</p>;
  }

  const verifyQueue = summary.items.filter(
    (i) =>
      i.verificationStatus === 'pending_review' ||
      i.verificationStatus === 'self_reported' ||
      i.status === 'needs_review',
  );

  const rrVerifications = store.roadReadyVerifications.filter((v) => v.organizationId === clientId);

  const onRegulatoryLookup = () => {
    if (!clientId) return;
    if (!hasIntegrationPermission(ctx.permissions, 'integrations.regulatory.verify')) {
      setLookupError('You do not have permission to run regulatory verification.');
      return;
    }
    setLookupError(null);
    runRegulatoryLookup(clientId, usdot.trim(), 'USDOT', staffId);
  };

  return (
    <div className="aio-office-page aio-office-road-ready-review">
      <Link to={aioPaths.officeClient(client.id)} className="aio-office-link">← {client.companyName}</Link>
      <header className="aio-office-client-header">
        <h1>Road Ready Review — {client.companyName}</h1>
        <p>{client.contactName} · {client.contactEmail}</p>
        <div className="aio-office-road-ready-review__header-stats">
          <RoadReadyRing setupProgress={summary.scores.setupProgress} verifiedProgress={summary.scores.verifiedProgress} dual size="sm" />
          <ul>
            <li>Items needing review: <strong>{verifyQueue.length}</strong></li>
            <li>Needs attention: <strong>{summary.scores.needsAttentionCount}</strong></li>
            <li>Open requests: <strong>{store.requests.filter((r) => r.clientId === clientId && r.status !== 'completed').length}</strong></li>
            <li>Last customer update: <strong>{new Date(summary.profile.lastCustomerUpdateAt ?? summary.profile.updatedAt).toLocaleString()}</strong></li>
          </ul>
        </div>
      </header>

      <section className="aio-office-panel aio-int-regulatory">
        <h2>External Carrier Verification</h2>
        <p>Lookup does not overwrite customer-entered business information. Demo USDOT: <strong>1234567</strong></p>
        <div className="aio-int-search-row">
          <input
            className="aio-intake-input"
            placeholder="USDOT number"
            value={usdot}
            onChange={(e) => setUsdot(e.target.value)}
          />
          <button type="button" className="aio-btn aio-btn--gold aio-btn--sm" onClick={onRegulatoryLookup}>
            Check Again
          </button>
          <EnvBadge env="DEMO" />
        </div>
        {lookupError && <p className="aio-int-test-result">{lookupError}</p>}
        {latestCarrierVerification && (
          <div className="aio-int-regulatory__result">
            <SourceBadge source={latestCarrierVerification.source} />
            <p>Checked: {new Date(latestCarrierVerification.checkedAt).toLocaleString()} · Freshness: {latestCarrierVerification.provenance.freshness}</p>
            {latestCarrierVerification.verificationStatus === 'record_found' && (
              <dl>
                <dt>Legal Name</dt><dd>{latestCarrierVerification.legalName}</dd>
                <dt>Operating Status</dt><dd>{latestCarrierVerification.operatingStatus}</dd>
                <dt>Authority</dt><dd>{latestCarrierVerification.authorityStatus}</dd>
                <dt>BOC-3</dt><dd>{latestCarrierVerification.boc3Status}</dd>
                <dt>Insurance (public)</dt><dd>{latestCarrierVerification.insuranceStatus}</dd>
              </dl>
            )}
            {latestCarrierVerification.verificationStatus === 'not_found' && (
              <p>No external record found for this identifier.</p>
            )}
            <p className="aio-prototype-note">FMCSA RECORD FOUND — not independent All In One legal certification.</p>
          </div>
        )}
      </section>

      <section className="aio-office-panel">
        <h2>Items to Verify</h2>
        {verifyQueue.length === 0 ? (
          <p>No items pending verification.</p>
        ) : (
          <ul className="aio-office-verify-queue">
            {verifyQueue.map((item) => (
              <li key={item.id} className="aio-office-verify-row">
                <div>
                  <strong>{item.title}</strong>
                  <span className="aio-rr-item-reason">{item.category}</span>
                  <RoadReadyStatusBadge kind="verification" value={item.verificationStatus} />
                </div>
                <div className="aio-office-verify-row__actions">
                  <button
                    type="button"
                    className="aio-btn aio-btn--gold aio-btn--sm"
                    onClick={() => verifyRoadReadyItem(item.id, staffId, staff?.name ?? 'Staff', 'verified', note || undefined)}
                  >
                    Verify
                  </button>
                  <button
                    type="button"
                    className="aio-btn aio-btn--outline-dark aio-btn--sm"
                    onClick={() => verifyRoadReadyItem(item.id, staffId, staff?.name ?? 'Staff', 'pending_review', note || 'More information requested')}
                  >
                    Request More Info
                  </button>
                  <button
                    type="button"
                    className="aio-btn aio-btn--outline-dark aio-btn--sm"
                    onClick={() => verifyRoadReadyItem(item.id, staffId, staff?.name ?? 'Staff', 'rejected', note || 'Marked invalid')}
                  >
                    Reject
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
        <textarea
          className="aio-intake-input aio-intake-textarea"
          rows={2}
          placeholder="Internal note (optional)…"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
        <p className="aio-prototype-note">Verification actions are audited. Internal notes are not visible to customers unless marked for customer visibility.</p>
      </section>

      <section className="aio-office-panel">
        <h2>Verification Audit</h2>
        {rrVerifications.length === 0 ? (
          <p>No verification events yet.</p>
        ) : (
          <ul className="aio-rr-history__list">
            {rrVerifications.slice(0, 15).map((v) => (
              <li key={v.id}>
                <time dateTime={v.createdAt}>{new Date(v.createdAt).toLocaleString()}</time>
                <span>{v.staffName}: {v.previousVerification} → {v.newVerification}</span>
                {v.note && <small>{v.visibility === 'internal' ? '(internal)' : ''} {v.note}</small>}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="aio-office-panel">
        <h2>All Road Ready Items</h2>
        <ul className="aio-rr-item-list">
          {summary.items.map((item) => (
            <li key={item.id} className="aio-rr-item-row">
              <strong>{item.title}</strong>
              <RoadReadyStatusBadge kind="status" value={item.status} />
              <RoadReadyStatusBadge kind="verification" value={item.verificationStatus} />
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
