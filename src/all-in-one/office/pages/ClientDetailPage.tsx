import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useDemoStore } from '../../demo/useDemoStore';
import { addInternalNote, assignRequest } from '../../demo/demoActions';
import { aioPaths } from '../../utils/paths';

const TABS = ['Overview', 'Roadmap', 'Requests', 'Documents', 'Deadlines', 'Dispatch', 'Factoring', 'Brokerage', 'Billing', 'Messages', 'Activity', 'Internal Notes'] as const;

export function ClientDetailPage() {
  const { clientId } = useParams<{ clientId: string }>();
  const store = useDemoStore();
  const [tab, setTab] = useState<(typeof TABS)[number]>('Overview');
  const [note, setNote] = useState('');
  const client = store.clients.find((c) => c.id === clientId);
  if (!client) return <p>Client not found.</p>;

  const staff = store.staff.find((s) => s.id === client.assignedStaffId);
  const requests = store.requests.filter((r) => r.clientId === clientId);
  const docs = store.documents.filter((d) => (d.organizationId ?? d.clientId) === clientId);
  const renewals = store.renewals.filter((r) => r.organizationId === clientId);
  const notes = store.notes.filter((n) => n.clientId === clientId);
  const deadlines = store.deadlines.filter((d) => d.clientId === clientId);
  const messages = store.messages.filter((m) => m.clientId === clientId && m.visibility === 'customer');

  return (
    <div className="aio-office-page">
      <header className="aio-office-client-header">
        <Link to={aioPaths.officeClients} className="aio-office-link">← Clients</Link>
        <h1>{client.companyName}</h1>
        <p>{client.contactName} · {client.contactEmail} · {client.primaryState}</p>
        <div className="aio-office-client-meta">
          <span className="aio-badge aio-badge--progress">{client.accountStatus}</span>
          <span>Assigned: {staff?.name ?? 'Unassigned'}</span>
          <span>Road Ready: {client.roadmapProgress}%</span>
          <Link to={aioPaths.officeClientRoadReady(client.id)} className="aio-office-link">Road Ready Review →</Link>
          <span>Customer since {client.customerSince}</span>
        </div>
        {staff && (
          <button type="button" className="aio-btn aio-btn--outline-dark aio-btn--sm" onClick={() => requests[0] && assignRequest(requests[0].id, staff.id)}>
            Reassign primary request
          </button>
        )}
      </header>

      <nav className="aio-office-tabs" aria-label="Client profile tabs">
        {TABS.map((t) => (
          <button key={t} type="button" className={tab === t ? 'aio-office-tabs__tab--active' : ''} onClick={() => setTab(t)}>
            {t}
          </button>
        ))}
      </nav>

      {tab === 'Overview' && (
        <div className="aio-office-two-col">
          <section className="aio-office-panel">
            <h2>Open Requests</h2>
            {requests.map((r) => (
              <Link key={r.id} to={aioPaths.officeRequest(r.id)} className="aio-office-list-row">{r.requestNumber} — {r.statusLabel}</Link>
            ))}
          </section>
          <section className="aio-office-panel">
            <h2>Documents Summary</h2>
            <p>{docs.filter((d) => d.verificationStatus === 'verified').length} verified · {docs.filter((d) => ['uploaded', 'under_review'].includes(d.status)).length} in review · {docs.filter((d) => d.status === 'requested').length} requested</p>
            <Link to={aioPaths.officeDocuments} className="aio-office-link">Document Center →</Link>
          </section>
          <section className="aio-office-panel">
            <h2>Renewals</h2>
            {renewals.filter((r) => r.status !== 'completed').slice(0, 4).map((r) => (
              <div key={r.id} className="aio-office-list-row">{r.title} — {r.status.replace(/_/g, ' ')}</div>
            ))}
            <Link to={aioPaths.officeRenewals} className="aio-office-link">Renewal Center →</Link>
          </section>
          <section className="aio-office-panel">
            <h2>Outstanding Documents</h2>
            {docs.filter((d) => d.status === 'requested').map((d) => (
              <div key={d.id} className="aio-office-list-row">{d.title ?? d.name}</div>
            ))}
          </section>
          <section className="aio-office-panel">
            <h2>Upcoming Deadlines</h2>
            {deadlines.filter((d) => !d.complete).map((d) => (
              <div key={d.id} className="aio-office-list-row">{d.label} — {d.dueDate}</div>
            ))}
          </section>
          <section className="aio-office-panel">
            <h2>Recent Messages</h2>
            {messages.slice(0, 3).map((m) => (
              <div key={m.id} className="aio-office-list-row"><strong>{m.authorName}:</strong> {m.body.slice(0, 80)}</div>
            ))}
          </section>
        </div>
      )}

      {tab === 'Internal Notes' && (
        <section className="aio-office-panel">
          <h2>Internal Notes</h2>
          <p className="aio-prototype-note">Staff-only — never visible in customer portal.</p>
          {notes.map((n) => (
            <article key={n.id} className="aio-office-note">
              <header>{new Date(n.createdAt).toLocaleDateString()} — {n.authorInitials}</header>
              <p>{n.body}</p>
            </article>
          ))}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (note.trim()) {
                addInternalNote(client.id, note.trim(), 'staff-2');
                setNote('');
              }
            }}
          >
            <textarea className="aio-intake-input aio-intake-textarea" rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add internal note…" />
            <button type="submit" className="aio-btn aio-btn--gold aio-btn--sm">Add Note</button>
          </form>
        </section>
      )}

      {tab !== 'Overview' && tab !== 'Internal Notes' && (
        <section className="aio-office-panel">
          <p className="aio-empty-state__text">{tab} tab — prototype shell with seed data where applicable.</p>
          {tab === 'Requests' && requests.map((r) => <Link key={r.id} to={aioPaths.officeRequest(r.id)}>{r.requestNumber}</Link>)}
          {tab === 'Documents' && docs.map((d) => <div key={d.id}>{d.title ?? d.name} — {d.status} · {d.verificationStatus}</div>)}
          {tab === 'Deadlines' && deadlines.filter((d) => !d.complete).map((d) => <div key={d.id}>{d.label} — {d.dueDate}</div>)}
        </section>
      )}
    </div>
  );
}
