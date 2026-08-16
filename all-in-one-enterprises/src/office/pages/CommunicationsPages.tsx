import { Link, useParams } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { useDemoStore } from '../../demo/useDemoStore';
import {
  addInternalNote,
  assignConversation,
  conversationContextLabel,
  conversationPartyLabel,
  filterInboxQueue,
  getConversation,
  getConversationMessages,
  getInboxMetrics,
  getOutboxMessages,
  recordEmailSentExternally,
  sendPortalMessage,
  type CommInboxQueue,
} from '../../demo/communicationActions';
import { conversationPreview, deriveConversationStatusFromLegacy } from '../../communications/communicationEngine';
import { resolveEmailProvider } from '../../communications/communicationProviders';
import { aioPaths } from '../../utils/paths';
import { hasOfficePermission, resolveOfficeStaffContext } from '../../office-core/officeContext';

const QUEUES: { id: CommInboxQueue; label: string }[] = [
  { id: 'unassigned', label: 'Unassigned' },
  { id: 'needs_reply', label: 'Needs Reply' },
  { id: 'waiting_on_customer', label: 'Waiting on Customer' },
  { id: 'follow_up_today', label: 'Follow Up Today' },
  { id: 'high_priority', label: 'High Priority' },
  { id: 'recent', label: 'Recent' },
  { id: 'resolved', label: 'Resolved' },
];

function ConversationRow({ convId }: { convId: string }) {
  const store = useDemoStore();
  const conv = getConversation(convId, store);
  if (!conv) return null;
  const msgs = getConversationMessages(conv.id, store);
  const preview = conversationPreview(msgs);
  const staff = store.staff.find((s) => s.id === conv.assignedUserId);
  const age = conv.lastMessageAt
    ? `${Math.max(0, Math.floor((Date.now() - new Date(conv.lastMessageAt).getTime()) / 86400000))}d`
    : '—';

  return (
    <Link to={aioPaths.officeCommunication(conv.id)} className="aio-comm-row">
      <div className="aio-comm-row__main">
        <strong>{conversationPartyLabel(conv, store)}</strong>
        <span className="aio-comm-row__subject">{conv.subject}</span>
        <small className="aio-muted">{conversationContextLabel(conv, store)} · {preview || 'No messages'}</small>
      </div>
      <div className="aio-comm-row__meta">
        <span className={`aio-badge aio-badge--${conv.priority === 'urgent' ? 'urgent' : 'progress'}`}>
          {deriveConversationStatusFromLegacy(conv.status)}
        </span>
        <span className="aio-muted">{staff?.name ?? 'Unassigned'}</span>
        <span className="aio-muted">{age}</span>
      </div>
    </Link>
  );
}

export function OfficeCommunicationsHubPage() {
  const [queue, setQueue] = useState<CommInboxQueue>('needs_reply');
  const store = useDemoStore();
  const metrics = getInboxMetrics(store);
  const convs = useMemo(() => filterInboxQueue(queue, store), [queue, store]);

  return (
    <div className="aio-office-page">
      <header className="aio-office-page__header">
        <h1>Communications</h1>
        <p>Unified staff inbox — conversations across CRM, service, dispatch, and more (DEMO).</p>
        <div className="aio-inline-actions">
          <Link to={aioPaths.officeCommunicationsOutbox} className="aio-btn aio-btn--outline aio-btn--sm">Outbox</Link>
          <Link to={aioPaths.officeAppointments} className="aio-btn aio-btn--outline aio-btn--sm">Appointments</Link>
        </div>
      </header>
      <div className="aio-metrics-grid aio-metrics-grid--compact">
        <div className="aio-metric-card"><div className="aio-metric-card__value">{metrics.unassigned}</div><div className="aio-metric-card__label">Unassigned</div></div>
        <div className="aio-metric-card"><div className="aio-metric-card__value">{metrics.needsReply}</div><div className="aio-metric-card__label">Needs Reply</div></div>
        <div className="aio-metric-card"><div className="aio-metric-card__value">{metrics.waitingOnCustomer}</div><div className="aio-metric-card__label">Waiting Customer</div></div>
        <div className="aio-metric-card"><div className="aio-metric-card__value">{metrics.highPriority}</div><div className="aio-metric-card__label">High Priority</div></div>
      </div>
      <div className="aio-filter-row">
        {QUEUES.map((q) => (
          <button
            key={q.id}
            type="button"
            className={`aio-chip ${queue === q.id ? 'aio-chip--active' : ''}`}
            onClick={() => setQueue(q.id)}
          >
            {q.label}
          </button>
        ))}
      </div>
      <div className="aio-comm-list">
        {convs.length === 0 ? (
          <p className="aio-empty-state__text">No conversations in this queue.</p>
        ) : (
          convs.map((c) => <ConversationRow key={c.id} convId={c.id} />)
        )}
      </div>
    </div>
  );
}

function ContextPanel({ convId }: { convId: string }) {
  const store = useDemoStore();
  const conv = getConversation(convId, store);
  if (!conv) return null;
  const client = conv.organizationId ? store.clients.find((c) => c.id === conv.organizationId) : undefined;
  const lead = conv.leadId ? store.crmLeads?.find((l) => l.id === conv.leadId) : undefined;
  const req = conv.primaryContextType === 'service_request' && conv.primaryContextId
    ? store.requests.find((r) => r.id === conv.primaryContextId)
    : undefined;

  return (
    <aside className="aio-comm-context">
      <h3>Context</h3>
      <dl className="aio-dl">
        <dt>Customer / Prospect</dt>
        <dd>{client?.companyName ?? lead?.businessName ?? '—'}</dd>
        <dt>Type</dt>
        <dd>{conv.conversationType.replace(/_/g, ' ')}</dd>
        <dt>Status</dt>
        <dd>{deriveConversationStatusFromLegacy(conv.status)}</dd>
        {req && (
          <>
            <dt>Service</dt>
            <dd>{req.services.map((s) => s.title).join(' + ')}</dd>
          </>
        )}
        {conv.leadId && (
          <>
            <dt>Lead</dt>
            <dd><Link to={aioPaths.officeCrmLead(conv.leadId)}>View lead</Link></dd>
          </>
        )}
        {conv.organizationId && (
          <>
            <dt>Client 360</dt>
            <dd><Link to={aioPaths.officeClient(conv.organizationId)}>Open client</Link></dd>
          </>
        )}
      </dl>
    </aside>
  );
}

export function OfficeConversationDetailPage() {
  const { conversationId } = useParams<{ conversationId: string }>();
  const store = useDemoStore();
  const ctx = resolveOfficeStaffContext(store);
  const [reply, setReply] = useState('');
  const [note, setNote] = useState('');
  const [channel, setChannel] = useState<'portal' | 'email'>('portal');
  const [contextOpen, setContextOpen] = useState(true);

  const conv = conversationId ? getConversation(conversationId, store) : undefined;
  const msgs = conv ? getConversationMessages(conv.id, store) : [];
  const emailProvider = resolveEmailProvider(store.commSettings?.providerMode ?? 'demo');

  if (!conv) {
    return (
      <div className="aio-office-page">
        <p>Conversation not found.</p>
        <Link to={aioPaths.officeCommunications}>← Communications</Link>
      </div>
    );
  }

  const onSend = () => {
    if (!reply.trim()) return;
    if (channel === 'portal') {
      sendPortalMessage(conv.id, reply.trim(), ctx.staffId, ctx.staffName);
    } else {
      recordEmailSentExternally(conv.id, reply.trim(), ctx.staffId, ctx.staffName);
    }
    setReply('');
  };

  const onNote = () => {
    if (!note.trim() || !hasOfficePermission(ctx, 'internal_notes.create')) return;
    addInternalNote(conv.id, note.trim(), ctx.staffId, ctx.staffName);
    setNote('');
  };

  return (
    <div className="aio-office-page aio-comm-detail">
      <header className="aio-office-page__header">
        <Link to={aioPaths.officeCommunications} className="aio-portal-back">← Communications</Link>
        <h1>{conv.subject}</h1>
        <p>{conversationPartyLabel(conv, store)} · {deriveConversationStatusFromLegacy(conv.status)}</p>
        <div className="aio-inline-actions">
          <select
            value={conv.assignedUserId ?? ''}
            onChange={(e) => assignConversation(conv.id, e.target.value)}
            aria-label="Assign staff"
          >
            <option value="">Unassigned</option>
            {store.staff.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
          <button type="button" className="aio-btn aio-btn--outline aio-btn--sm" onClick={() => setContextOpen((o) => !o)}>
            {contextOpen ? 'Hide' : 'Show'} Context
          </button>
        </div>
      </header>
      <div className={`aio-comm-detail__grid ${contextOpen ? '' : 'aio-comm-detail__grid--full'}`}>
        <section className="aio-comm-thread">
          {msgs.map((m) => (
            <article
              key={m.id}
              className={`aio-comm-msg aio-comm-msg--${m.visibility === 'internal_only' ? 'internal' : m.senderType}`}
            >
              <header>
                <strong>{m.senderName}</strong>
                <span className="aio-muted">{new Date(m.createdAt).toLocaleString()}</span>
                {m.visibility === 'internal_only' && <span className="aio-comm-internal-badge">Internal Note</span>}
                {m.channel === 'email' && m.status === 'recorded_externally' && (
                  <span className="aio-comm-demo-badge">Recorded Externally</span>
                )}
              </header>
              <p>{m.body}</p>
            </article>
          ))}
        </section>
        {contextOpen && <ContextPanel convId={conv.id} />}
      </div>
      <section className="aio-comm-composer">
        <h2 className="aio-portal-panel__title">Reply</h2>
        <div className="aio-filter-row">
          <button type="button" className={`aio-chip ${channel === 'portal' ? 'aio-chip--active' : ''}`} onClick={() => setChannel('portal')}>Portal</button>
          <button type="button" className={`aio-chip ${channel === 'email' ? 'aio-chip--active' : ''}`} onClick={() => setChannel('email')}>Email</button>
        </div>
        {channel === 'email' && !emailProvider.isConfigured() && (
          <p className="aio-comm-provider-warn">
            No email provider configured. Copy your message and use <strong>Record as Sent Externally</strong> after sending manually.
          </p>
        )}
        <textarea
          className="aio-textarea"
          rows={4}
          value={reply}
          onChange={(e) => setReply(e.target.value)}
          placeholder={channel === 'portal' ? 'Send message to customer…' : 'Compose email (manual send)…'}
          aria-label="Message body"
        />
        <div className="aio-inline-actions">
          {channel === 'portal' ? (
            <button type="button" className="aio-btn aio-btn--gold" onClick={onSend}>Send Message</button>
          ) : (
            <>
              <button type="button" className="aio-btn aio-btn--outline" onClick={() => navigator.clipboard?.writeText(reply)}>Copy Email</button>
              <button type="button" className="aio-btn aio-btn--gold" onClick={onSend}>Record as Sent Externally</button>
            </>
          )}
        </div>
      </section>
      {hasOfficePermission(ctx, 'internal_notes.create') && (
        <section className="aio-comm-composer aio-comm-composer--internal">
          <h2 className="aio-portal-panel__title">Internal Note</h2>
          <textarea
            className="aio-textarea"
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Staff-only — never visible to customer…"
            aria-label="Internal note"
          />
          <button type="button" className="aio-btn aio-btn--outline" onClick={onNote}>Add Internal Note</button>
        </section>
      )}
    </div>
  );
}

export function OfficeCommunicationsOutboxPage() {
  const store = useDemoStore();
  const msgs = getOutboxMessages(store);

  return (
    <div className="aio-office-page">
      <header className="aio-office-page__header">
        <Link to={aioPaths.officeCommunications} className="aio-portal-back">← Communications</Link>
        <h1>Communication Outbox</h1>
        <p>Draft, demo, recorded-externally, and failed deliveries — truthful status only.</p>
      </header>
      <div className="aio-table-wrap">
        <table className="aio-table">
          <thead><tr><th>Status</th><th>Channel</th><th>Preview</th><th>Conversation</th></tr></thead>
          <tbody>
            {msgs.map((m) => (
              <tr key={m.id}>
                <td><span className="aio-badge">{m.status}</span></td>
                <td>{m.channel}</td>
                <td>{m.body.slice(0, 80)}</td>
                <td><Link to={aioPaths.officeCommunication(m.conversationId)}>Open</Link></td>
              </tr>
            ))}
            {msgs.length === 0 && <tr><td colSpan={4} className="aio-muted">Outbox empty.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function OfficeCommunicationsSettingsPage() {
  const store = useDemoStore();
  const ctx = resolveOfficeStaffContext(store);
  if (!hasOfficePermission(ctx, 'comm.settings.manage')) {
    return (
      <div className="aio-office-page">
        <p>You do not have permission to manage communication settings.</p>
      </div>
    );
  }

  return (
    <div className="aio-office-page">
      <header className="aio-office-page__header">
        <h1>Communication Settings</h1>
        <p>Templates, routing, channels — provider credentials stay server-side (DEMO).</p>
      </header>
      <div className="aio-portal-panel">
        <h2 className="aio-portal-panel__title">Provider Mode</h2>
        <p className="aio-comm-demo-badge aio-comm-demo-badge--block">DEMO COMMUNICATION DELIVERY — external email/SMS not configured</p>
        <p>Mode: {store.commSettings?.providerMode ?? 'demo'}</p>
      </div>
      <div className="aio-portal-panel">
        <h2 className="aio-portal-panel__title">Routing Rules</h2>
        <ul className="aio-list">
          {(store.commRoutingRules ?? []).map((r) => (
            <li key={r.id}>{r.conversationType} → team {r.teamId}</li>
          ))}
        </ul>
      </div>
      <div className="aio-portal-panel">
        <h2 className="aio-portal-panel__title">Templates</h2>
        <ul className="aio-list">
          {(store.commTemplates ?? []).map((t) => (
            <li key={t.id}>{t.name} ({t.category})</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
