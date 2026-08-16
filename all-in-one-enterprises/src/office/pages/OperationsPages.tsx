import { Link } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { useDemoStore } from '../../demo/useDemoStore';
import { completeTask } from '../../demo/demoActions';
import { verifyVaultDocument, rejectVaultDocument } from '../../demo/vaultActions';
import { VAULT_CATEGORIES, REJECTION_REASONS } from '../../vault/vaultConfig';
import { canPreviewDocument } from '../../vault/vaultStorage';
import type { RejectionReason } from '../../vault/vaultTypes';
import { formatDaysRemaining } from '../../calendar/calendarService';
import { aioPaths } from '../../utils/paths';

type DocQueue = 'needs_review' | 'requested' | 'expiring' | 'expired' | 'rejected';

export function TasksPage() {
  const store = useDemoStore();
  return (
    <div className="aio-office-page">
      <header className="aio-office-page__header"><h1>Tasks</h1></header>
      <div className="aio-office-table-wrap">
        <table className="aio-office-table">
          <thead>
            <tr><th>Task</th><th>Client</th><th>Assigned</th><th>Priority</th><th>Due</th><th>Status</th><th></th></tr>
          </thead>
          <tbody>
            {store.tasks.map((t) => {
              const client = store.clients.find((c) => c.id === t.clientId);
              const staff = store.staff.find((s) => s.id === t.assignedStaffId);
              return (
                <tr key={t.id}>
                  <td>{t.title}</td>
                  <td>{client ? <Link to={aioPaths.officeClient(client.id)}>{client.companyName}</Link> : '—'}</td>
                  <td>{staff?.name ?? '—'}</td>
                  <td>{t.priority}</td>
                  <td>{t.dueDate ?? '—'}</td>
                  <td>{t.status}</td>
                  <td>{t.status !== 'complete' && <button type="button" className="aio-btn aio-btn--sm aio-btn--gold" onClick={() => completeTask(t.id)}>Complete</button>}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function DeadlinesPage() {
  const store = useDemoStore();
  const [range, setRange] = useState('all');

  const deadlines = useMemo(() => {
    let list = store.deadlines.filter((d) => !d.complete);
    const today = new Date();
    const addDays = (n: number) => new Date(today.getFullYear(), today.getMonth(), today.getDate() + n);
    if (range === 'today') {
      const t = today.toISOString().slice(0, 10);
      list = list.filter((d) => d.dueDate === t);
    } else if (range === '7') list = list.filter((d) => new Date(d.dueDate) <= addDays(7));
    else if (range === '30') list = list.filter((d) => new Date(d.dueDate) <= addDays(30));
    else if (range === 'overdue') list = list.filter((d) => new Date(d.dueDate) < today);
    return list.sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  }, [store.deadlines, range]);

  return (
    <div className="aio-office-page">
      <header className="aio-office-page__header">
        <h1>Deadline Center</h1>
        <p>Company-wide compliance calendar · derived from documents, renewals, and service requests</p>
      </header>
      <div className="aio-office-toolbar">
        <select className="aio-intake-input" value={range} onChange={(e) => setRange(e.target.value)} aria-label="Date range">
          <option value="all">All upcoming</option>
          <option value="today">Today</option>
          <option value="7">Next 7 days</option>
          <option value="30">Next 30 days</option>
          <option value="overdue">Overdue</option>
        </select>
      </div>
      <div className="aio-office-table-wrap">
        <table className="aio-office-table">
          <thead>
            <tr>
              <th>Client</th>
              <th>Deadline</th>
              <th>Category</th>
              <th>Days</th>
              <th>Status</th>
              <th>Source</th>
              <th>Renewal</th>
            </tr>
          </thead>
          <tbody>
            {deadlines.map((d) => {
              const client = store.clients.find((c) => c.id === d.clientId);
              const renewal = d.renewalId ? store.renewals.find((r) => r.id === d.renewalId) : undefined;
              return (
                <tr key={d.id}>
                  <td>{client ? <Link to={aioPaths.officeClient(client.id)}>{client.companyName}</Link> : d.clientId}</td>
                  <td>{d.label}</td>
                  <td>{d.category ?? '—'}</td>
                  <td>{formatDaysRemaining(d.dueDate)}</td>
                  <td><span className={`aio-badge aio-badge--${d.severity.includes('overdue') || d.severity === 'due_today' ? 'alert' : 'progress'}`}>{d.severity.replace(/_/g, ' ')}</span></td>
                  <td>{(d.source ?? 'staff_entered').replace(/_/g, ' ')}</td>
                  <td>{renewal ? <Link to={aioPaths.officeRenewals}>{renewal.status}</Link> : '—'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function DocumentsPage() {
  const store = useDemoStore();
  const [queue, setQueue] = useState<DocQueue>('needs_review');
  const [reviewId, setReviewId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState<RejectionReason>('wrong_document');
  const [rejectMessage, setRejectMessage] = useState('');

  const docs = useMemo(() => {
    const all = store.documents;
    switch (queue) {
      case 'needs_review':
        return all.filter((d) => ['uploaded', 'under_review'].includes(d.status));
      case 'requested':
        return all.filter((d) => d.status === 'requested');
      case 'expiring':
        return all.filter((d) => d.isCurrent && d.expiresAt && d.verificationStatus === 'verified' && daysUntilExp(d.expiresAt) <= 60 && daysUntilExp(d.expiresAt) >= 0);
      case 'expired':
        return all.filter((d) => d.isCurrent && d.expiresAt && daysUntilExp(d.expiresAt) < 0);
      case 'rejected':
        return all.filter((d) => d.status === 'rejected');
      default:
        return all;
    }
  }, [store.documents, queue]);

  const reviewDoc = reviewId ? store.documents.find((d) => d.id === reviewId) : undefined;

  return (
    <div className="aio-office-page">
      <header className="aio-office-page__header">
        <h1>Document Center</h1>
        <p>Verification and document operations · demo storage (data URLs)</p>
      </header>

      <div className="aio-office-doc-queues" role="tablist">
        {([
          ['needs_review', 'Needs Review'],
          ['requested', 'Requested'],
          ['expiring', 'Expiring Soon'],
          ['expired', 'Expired'],
          ['rejected', 'Rejected'],
        ] as const).map(([id, label]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={queue === id}
            className={queue === id ? 'aio-office-doc-queues__active' : ''}
            onClick={() => { setQueue(id); setReviewId(null); }}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="aio-office-table-wrap">
        <table className="aio-office-table">
          <thead>
            <tr>
              <th>Document</th>
              <th>Client</th>
              <th>Category</th>
              <th>Status</th>
              <th>Verification</th>
              <th>Expiration</th>
              <th>Uploaded</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {docs.map((d) => {
              const client = store.clients.find((c) => c.id === (d.organizationId ?? d.clientId));
              return (
                <tr key={d.id}>
                  <td>{d.title ?? d.name}</td>
                  <td>{client ? <Link to={aioPaths.officeClient(client.id)}>{client.companyName}</Link> : '—'}</td>
                  <td>{VAULT_CATEGORIES.find((c) => c.id === d.category)?.label ?? d.category}</td>
                  <td>{d.status.replace(/_/g, ' ')}</td>
                  <td>{d.verificationStatus.replace(/_/g, ' ')}</td>
                  <td>{d.expiresAt ? formatDaysRemaining(d.expiresAt.slice(0, 10)) : '—'}</td>
                  <td>{d.uploadedAt ? new Date(d.uploadedAt).toLocaleDateString() : '—'}</td>
                  <td>
                    <button type="button" className="aio-btn aio-btn--sm aio-btn--gold" onClick={() => setReviewId(d.id)}>Review</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {reviewDoc && (
        <section className="aio-office-panel aio-office-doc-review" role="dialog" aria-label="Document review">
          <h2>Review — {reviewDoc.title}</h2>
          <dl className="aio-rr-detail-dl">
            <div><dt>Client</dt><dd>{store.clients.find((c) => c.id === reviewDoc.organizationId)?.companyName}</dd></div>
            <div><dt>Category</dt><dd>{reviewDoc.category}</dd></div>
            <div><dt>Expiration</dt><dd>{reviewDoc.expiresAt?.slice(0, 10) ?? 'Not set'}</dd></div>
            {reviewDoc.roadReadyItemId && <div><dt>Road Ready</dt><dd>Linked item {reviewDoc.roadReadyItemId}</dd></div>}
          </dl>
          {canPreviewDocument(reviewDoc.mimeType) && reviewDoc.storageReference && (
            reviewDoc.mimeType?.startsWith('image/') ? (
              <img src={reviewDoc.storageReference} alt="" className="aio-vault-preview__img" />
            ) : (
              <a href={reviewDoc.storageReference} target="_blank" rel="noopener noreferrer" className="aio-btn aio-btn--outline">View file</a>
            )
          )}
          <div className="aio-office-verify-row__actions">
            <button type="button" className="aio-btn aio-btn--gold" onClick={() => { verifyVaultDocument(reviewDoc.id, 'staff-2', 'Demo Staff'); setReviewId(null); }}>Verify</button>
            <div className="aio-office-reject-form">
              <select className="aio-intake-input" value={rejectReason} onChange={(e) => setRejectReason(e.target.value as RejectionReason)} aria-label="Rejection reason">
                {REJECTION_REASONS.map((r) => (
                  <option key={r.id} value={r.id}>{r.label}</option>
                ))}
              </select>
              <input className="aio-intake-input" placeholder="Customer message (optional)" value={rejectMessage} onChange={(e) => setRejectMessage(e.target.value)} />
              <button
                type="button"
                className="aio-btn aio-btn--outline"
                onClick={() => {
                  rejectVaultDocument(reviewDoc.id, 'staff-2', rejectReason, rejectMessage || undefined);
                  setReviewId(null);
                  setRejectMessage('');
                }}
              >
                Reject
              </button>
            </div>
            <button type="button" className="aio-btn aio-btn--outline" onClick={() => setReviewId(null)}>Close</button>
          </div>
        </section>
      )}
    </div>
  );
}

function daysUntilExp(iso: string): number {
  const d = new Date(iso.slice(0, 10));
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.ceil((d.getTime() - today.getTime()) / 86400000);
}

export function MessagesPage() {
  const store = useDemoStore();
  const threads = store.clients.map((c) => {
    const msgs = store.messages.filter((m) => m.clientId === c.id);
    const last = msgs[0];
    return { client: c, last, unread: msgs.filter((m) => !m.read && m.from === 'customer').length };
  }).filter((t) => t.last);

  return (
    <div className="aio-office-page">
      <header className="aio-office-page__header"><h1>Messages</h1></header>
      {threads.map(({ client, last, unread }) => (
        <Link key={client.id} to={aioPaths.officeClient(client.id)} className="aio-office-list-row">
          <span>{client.companyName}</span>
          <span>{last?.body.slice(0, 60)}…</span>
          {unread > 0 && <span className="aio-badge aio-badge--alert">{unread} unread</span>}
        </Link>
      ))}
    </div>
  );
}
