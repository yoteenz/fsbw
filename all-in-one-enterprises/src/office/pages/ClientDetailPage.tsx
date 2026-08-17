import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useDemoStore } from '../../demo/useDemoStore';
import { addInternalNote } from '../../demo/demoActions';
import { getClient360View } from '../../office-core/client360Service';
import { hasOfficePermission, resolveOfficeStaffContext } from '../../office-core/officeContext';
import { OfficeNextActionHero } from '../../components/OfficeCommandCenterComponents';
import { aioPaths } from '../../utils/paths';

const TAB_LABELS: Record<string, string> = {
  overview: 'Overview',
  services: 'Services',
  road_ready: 'Road Ready',
  fleet: 'Fleet',
  documents: 'Documents',
  insurance: 'Insurance',
  operations: 'Operations',
  factoring: 'Factoring',
  brokerage: 'Brokerage',
  billing: 'Billing',
  messages: 'Messages',
  activity: 'Activity',
  internal_notes: 'Internal Notes',
};

export function ClientDetailPage() {
  const { clientId } = useParams<{ clientId: string }>();
  const store = useDemoStore();
  const ctx = resolveOfficeStaffContext(store);
  const view = clientId ? getClient360View(store, clientId) : null;
  const [tab, setTab] = useState('overview');
  const [note, setNote] = useState('');
  const [composerMode, setComposerMode] = useState<'internal' | 'customer'>('internal');

  if (!view) return <p>Client not found.</p>;

  const client = store.clients.find((c) => c.id === clientId)!;
  const requests = store.requests.filter((r) => r.clientId === clientId);
  const docs = store.documents.filter((d) => (d.organizationId ?? d.clientId) === clientId);
  const notes = store.notes.filter((n) => n.clientId === clientId);
  const messages = store.messages.filter((m) => m.clientId === clientId && m.visibility === 'customer');
  const loads = store.loads.filter((l) => l.organizationId === clientId);

  return (
    <div className="aio-office-page aio-client-360">
      <header className="aio-office-client-header">
        <Link to={aioPaths.officeClients} className="aio-office-link">← Clients</Link>
        <h1>{view.companyName}</h1>
        <p>{view.primaryContact} · {view.email} {view.phone && <>· {view.phone}</>}</p>
        <div className="aio-office-client-meta">
          <span className={`aio-cc-status aio-cc-status--${view.operationalStatus}`}>{view.operationalStatusLabel}</span>
          <span>Assigned: {view.assignedStaffName ?? 'Unassigned'}</span>
          <span>Road Ready: {view.roadReadyProgress}%</span>
          <span>Customer since {view.customerSince}</span>
          <Link to={aioPaths.officeClientRoadReady(client.id)} className="aio-office-link">Road Ready Review →</Link>
        </div>
        {view.pinnedNotes.map((n) => (
          <div key={n.body.slice(0, 20)} className="aio-oc-pinned-note">📌 {n.body}</div>
        ))}
      </header>

      {view.nextStaffAction && <OfficeNextActionHero action={view.nextStaffAction} />}

      <nav className="aio-office-tabs" aria-label="Client 360 tabs">
        {view.tabs.map((t) => (
          <button key={t} type="button" className={tab === t ? 'aio-office-tabs__tab--active' : ''} onClick={() => setTab(t)}>
            {TAB_LABELS[t] ?? t}
          </button>
        ))}
      </nav>

      {tab === 'overview' && (
        <div className="aio-oc-client-overview">
          <section className="aio-oc-panel">
            <h2 className="aio-oc-panel__title">Customer Status</h2>
            <p>{view.operationalStatusLabel} · {view.activeRequests} active requests · Billing: {view.billingStatus}</p>
          </section>
          <div className="aio-office-two-col">
            <section className="aio-oc-panel">
              <h2 className="aio-oc-panel__title">All In One Waiting On</h2>
              {view.allInOneWaitingOn.length === 0 ? <p className="aio-empty-state__text">Nothing blocked on staff.</p> : view.allInOneWaitingOn.map((w) => (
                <Link key={w.id} to={w.ctaHref} className="aio-office-list-row">{w.title}</Link>
              ))}
            </section>
            <section className="aio-oc-panel">
              <h2 className="aio-oc-panel__title">Customer Waiting On</h2>
              {view.customerWaitingOn.length === 0 ? <p className="aio-empty-state__text">No customer dependencies.</p> : view.customerWaitingOn.map((w) => (
                <div key={w.id} className="aio-office-list-row">{w.title}</div>
              ))}
            </section>
            <section className="aio-oc-panel">
              <h2 className="aio-oc-panel__title">Service Relationships</h2>
              <ul className="aio-cc-services-list">
                {view.activeServices.map((s) => (
                  <li key={s.name}><strong>{s.name}</strong> <span>{s.status}</span></li>
                ))}
              </ul>
            </section>
            <section className="aio-oc-panel">
              <h2 className="aio-oc-panel__title">Upcoming Deadlines</h2>
              {view.upcomingDeadlines.map((d) => (
                <div key={d.label} className="aio-office-list-row">{d.label} — {d.dueDate}</div>
              ))}
            </section>
          </div>
        </div>
      )}

      {tab === 'services' && (
        <section className="aio-oc-panel">
          {requests.map((r) => (
            <Link key={r.id} to={aioPaths.officeRequest(r.id)} className="aio-office-list-row">{r.requestNumber} — {r.statusLabel}</Link>
          ))}
        </section>
      )}

      {tab === 'documents' && (
        <section className="aio-oc-panel">
          <p className="aio-doc-vault-record__meta">Secure business records, filings, and historical documents.</p>
          <Link to={aioPaths.officeClientDocuments(client.id)} className="aio-btn aio-btn--gold aio-btn--sm">
            Open Document Vault →
          </Link>
          <ul className="aio-doc-vault-list" style={{ marginTop: '1rem' }}>
            {docs.slice(0, 5).map((d) => (
              <li key={d.id} className="aio-doc-vault-record">
                <span>{d.title ?? d.name} — {d.status}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {tab === 'operations' && loads.map((l) => (
        <Link key={l.id} to={aioPaths.officeLoad(l.id)} className="aio-office-list-row">{l.loadNumber} — {l.operationalStatus}</Link>
      ))}

      {tab === 'messages' && (
        <section className="aio-oc-panel">
          <div className="aio-oc-composer-tabs">
            <button type="button" className={composerMode === 'internal' ? 'aio-oc-composer-tabs--active' : ''} onClick={() => setComposerMode('internal')}>Internal Note</button>
            <button type="button" className={composerMode === 'customer' ? 'aio-oc-composer-tabs--active' : ''} onClick={() => setComposerMode('customer')}>Customer Message</button>
          </div>
          {messages.map((m) => (
            <div key={m.id} className="aio-office-list-row"><strong>{m.authorName}:</strong> {m.body}</div>
          ))}
          {composerMode === 'internal' ? (
            <form onSubmit={(e) => { e.preventDefault(); if (note.trim()) { addInternalNote(client.id, note.trim(), ctx.staffId); setNote(''); } }}>
              <textarea className="aio-intake-input aio-intake-textarea aio-oc-composer--internal" rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Internal note — never visible to customer" />
              <button type="submit" className="aio-btn aio-btn--outline-dark aio-btn--sm">Add Internal Note</button>
            </form>
          ) : (
            <p className="aio-prototype-note">Customer message composer routes through canonical messaging (demo: use Inbox).</p>
          )}
        </section>
      )}

      {tab === 'activity' && (
        <ul className="aio-office-activity">
          {view.timeline.map((t, i) => (
            <li key={`${t.createdAt}-${i}`}><time>{new Date(t.createdAt).toLocaleString()}</time><span>{t.title}</span></li>
          ))}
        </ul>
      )}

      {tab === 'internal_notes' && (
        <section className="aio-oc-panel">
          <p className="aio-prototype-note">Staff-only — never visible in customer portal.</p>
          {notes.map((n) => (
            <article key={n.id} className="aio-office-note">
              <header>{new Date(n.createdAt).toLocaleDateString()} — {n.authorInitials} {n.pinned && '· PINNED'}</header>
              <p>{n.body}</p>
            </article>
          ))}
        </section>
      )}

      {tab === 'billing' && hasOfficePermission(ctx, 'billing.read') && (
        <section className="aio-oc-panel">
          <p>{view.billingStatus}</p>
          <Link to={aioPaths.officeBilling} className="aio-office-link">Billing Desk →</Link>
        </section>
      )}

      {['road_ready', 'fleet', 'insurance', 'factoring', 'brokerage'].includes(tab) && (
        <section className="aio-oc-panel">
          <p className="aio-empty-state__text">{TAB_LABELS[tab]} — deep links to canonical division systems.</p>
          {tab === 'road_ready' && <Link to={aioPaths.officeClientRoadReady(client.id)}>Road Ready Review →</Link>}
          {tab === 'insurance' && <Link to={aioPaths.officeInsurance}>Insurance Office →</Link>}
          {tab === 'factoring' && hasOfficePermission(ctx, 'factoring_finance.read') && <Link to={aioPaths.officeFactoring}>Factoring Office →</Link>}
          {tab === 'brokerage' && hasOfficePermission(ctx, 'brokerage_finance.read') && <Link to={aioPaths.officeBrokerage}>Brokerage Office →</Link>}
        </section>
      )}
    </div>
  );
}
