import { Link, useParams } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useDemoStore } from '../../demo/useDemoStore';
import {
  conversationContextLabel,
  filterPortalConversations,
  getConversationMessages,
  getCustomerUnreadCount,
  markConversationRead,
  sendCustomerPortalReply,
  type PortalMessageFilter,
} from '../../demo/communicationActions';
import { authorizeConversationAccess } from '../../communications/communicationEngine';
import { resolveOrganizationId, resolvePortalKind } from '../../portal/organizationContext';
import { aioPaths } from '../../utils/paths';

const FILTERS: { id: PortalMessageFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'needs_reply', label: 'Needs Your Reply' },
  { id: 'service', label: 'Service' },
  { id: 'documents', label: 'Documents' },
  { id: 'billing', label: 'Billing' },
  { id: 'dispatch', label: 'Dispatch' },
  { id: 'other', label: 'Other' },
];

export function PortalMessagesListPage() {
  const [filter, setFilter] = useState<PortalMessageFilter>('all');
  const store = useDemoStore();
  const location = useLocation();
  const orgId = resolveOrganizationId(store, resolvePortalKind(location.pathname));
  const convs = useMemo(() => filterPortalConversations(orgId, filter, store), [orgId, filter, store]);
  const unread = getCustomerUnreadCount(orgId, store);

  return (
    <div className="aio-cc-page">
      <Link to={aioPaths.portal} className="aio-portal-back">← Command Center</Link>
      <h1>Messages</h1>
      {unread > 0 && <p className="aio-badge aio-badge--urgent">{unread} unread</p>}
      <div className="aio-filter-row aio-filter-row--scroll">
        {FILTERS.map((f) => (
          <button key={f.id} type="button" className={`aio-chip ${filter === f.id ? 'aio-chip--active' : ''}`} onClick={() => setFilter(f.id)}>
            {f.label}
          </button>
        ))}
      </div>
      <div className="aio-comm-list">
        {convs.length === 0 ? (
          <p className="aio-empty-state__text">No conversations yet.</p>
        ) : (
          convs.map((c) => {
            const msgs = getConversationMessages(c.id, store, true);
            const last = msgs[msgs.length - 1];
            return (
              <Link key={c.id} to={aioPaths.portalMessage(c.id)} className="aio-portal-request-card">
                <div>
                  <strong>{c.subject}</strong>
                  <br />
                  <small>{conversationContextLabel(c, store)} · {last?.body.slice(0, 60) ?? ''}</small>
                </div>
                <span className="aio-badge aio-badge--progress">{c.status.replace(/_/g, ' ')}</span>
              </Link>
            );
          })
        )}
      </div>
      <Link to={aioPaths.schedule} className="aio-btn aio-btn--outline">Book a Consultation</Link>
    </div>
  );
}

export function PortalConversationDetailPage() {
  const { conversationId } = useParams<{ conversationId: string }>();
  const store = useDemoStore();
  const location = useLocation();
  const orgId = resolveOrganizationId(store, resolvePortalKind(location.pathname));
  const client = store.clients.find((c) => c.id === orgId);
  const [reply, setReply] = useState('');

  const conv = conversationId
    ? authorizeConversationAccess(store, conversationId, { organizationId: orgId })
    : undefined;
  const msgs = conv ? getConversationMessages(conv.id, store, true) : [];

  useEffect(() => {
    if (conv) markConversationRead(conv.id, orgId, 'contact');
  }, [conv?.id, orgId]);

  if (!conv) {
    return (
      <div className="aio-cc-page">
        <p>Conversation not found or access denied.</p>
        <Link to={aioPaths.portalMessages}>← Messages</Link>
      </div>
    );
  }

  const onSend = () => {
    if (!reply.trim()) return;
    sendCustomerPortalReply(conv.id, reply.trim(), orgId, client?.contactName ?? 'Customer');
    setReply('');
  };

  return (
    <div className="aio-cc-page aio-comm-detail">
      <Link to={aioPaths.portalMessages} className="aio-portal-back">← Messages</Link>
      <h1>{conv.subject}</h1>
      <p className="aio-muted">{conversationContextLabel(conv, store)}</p>
      <section className="aio-comm-thread">
        {msgs.map((m) => (
          <article key={m.id} className={`aio-comm-msg aio-comm-msg--${m.senderType}`}>
            <header>
              <strong>{m.senderName}</strong>
              <span className="aio-muted">{new Date(m.createdAt).toLocaleString()}</span>
            </header>
            <p>{m.body}</p>
          </article>
        ))}
      </section>
      <section className="aio-comm-composer">
        <textarea
          className="aio-textarea"
          rows={3}
          value={reply}
          onChange={(e) => setReply(e.target.value)}
          placeholder="Reply to All In One…"
          aria-label="Reply"
        />
        <button type="button" className="aio-btn aio-btn--gold" onClick={onSend}>Send Message</button>
      </section>
    </div>
  );
}
