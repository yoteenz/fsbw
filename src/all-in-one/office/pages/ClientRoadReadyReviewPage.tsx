import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useDemoStore } from '../../demo/useDemoStore';
import { getRoadReadySummary, verifyRoadReadyItem } from '../../demo/roadReadyActions';
import { RoadReadyRing } from '../../components/RoadReadyRing';
import { RoadReadyStatusBadge } from '../../components/RoadReadyStatusBadge';
import { aioPaths } from '../../utils/paths';

export function ClientRoadReadyReviewPage() {
  const { clientId } = useParams<{ clientId: string }>();
  const store = useDemoStore();
  const [note, setNote] = useState('');
  const client = store.clients.find((c) => c.id === clientId);
  const summary = clientId ? getRoadReadySummary(clientId) : null;
  const staffId = 'staff-3';
  const staff = store.staff.find((s) => s.id === staffId);

  if (!client || !summary) {
    return <p className="aio-office-page">Client or Road Ready profile not found.</p>;
  }

  const verifyQueue = summary.items.filter(
    (i) =>
      i.verificationStatus === 'pending_review' ||
      i.verificationStatus === 'self_reported' ||
      i.status === 'needs_review',
  );

  const verifications = store.roadReadyVerifications.filter((v) => v.organizationId === clientId);

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
        {verifications.length === 0 ? (
          <p>No verification events yet.</p>
        ) : (
          <ul className="aio-rr-history__list">
            {verifications.slice(0, 15).map((v) => (
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
