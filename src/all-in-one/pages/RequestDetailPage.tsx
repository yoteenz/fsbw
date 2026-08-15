import { Link, useParams } from 'react-router-dom';
import { useState } from 'react';
import { useDemoStore } from '../demo/useDemoStore';
import { getClientMessages, simulateCustomerUpload, sendCustomerMessage } from '../demo/demoActions';
import { AIORequestTimeline } from '../components/AIORequestTimeline';
import { aioPaths } from '../utils/paths';

export function RequestDetailPage() {
  const { requestId } = useParams<{ requestId: string }>();
  const store = useDemoStore();
  const [reply, setReply] = useState('');
  const request = store.requests.find((r) => r.id === requestId);

  if (!request) {
    return (
      <div className="aio-portal-dashboard">
        <h1>Request Not Found</h1>
        <Link to={aioPaths.portal}>← Back to Dashboard</Link>
      </div>
    );
  }

  const docs = store.documents.filter((d) => request.documentIds.includes(d.id) && d.visibility === 'customer');
  const messages = getClientMessages(request.clientId, request.id);
  const staff = store.staff.find((s) => s.id === request.assignedStaffId);

  return (
    <div className="aio-portal-dashboard">
      <header className="aio-portal-dashboard__header">
        <Link to={aioPaths.portal} className="aio-portal-back">← Dashboard</Link>
        <span className="aio-badge aio-badge--progress">DEMO REQUEST</span>
        <h1>{request.services.map((s) => s.title).join(' + ')}</h1>
        <p>{request.requestNumber} · {new Date(request.createdAt).toLocaleDateString()}</p>
      </header>

      <div className="aio-two-col">
        <div className="aio-portal-panel">
          <h2 className="aio-portal-panel__title">Status</h2>
          <span className="aio-badge aio-badge--progress">{request.statusLabel}</span>
          <p style={{ marginTop: '1rem' }}><strong>Next Step:</strong> {request.nextStep}</p>
          {staff && <p><strong>Specialist:</strong> {staff.name}</p>}
        </div>
        <div className="aio-portal-panel">
          <h2 className="aio-portal-panel__title">Timeline</h2>
          <AIORequestTimeline steps={request.timeline} />
        </div>
      </div>

      <div className="aio-portal-panel">
        <h2 className="aio-portal-panel__title">Documents Needed</h2>
        {docs.length === 0 ? (
          <p className="aio-empty-state__text">No documents needed at this time.</p>
        ) : (
          <ul className="aio-doc-checklist">
            {docs.map((doc) => (
              <li key={doc.id}>
                {doc.title ?? doc.name} — <span className="aio-badge aio-badge--progress">{doc.status.replace(/_/g, ' ')}</span>
                {doc.status === 'requested' && (
                  <>
                    <button type="button" className="aio-btn aio-btn--gold aio-btn--sm" onClick={() => simulateCustomerUpload(doc.id)}>
                      Simulate Upload (Demo)
                    </button>
                    <Link to={aioPaths.portalVault} className="aio-btn aio-btn--outline aio-btn--sm">Upload in Vault</Link>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="aio-portal-panel">
        <h2 className="aio-portal-panel__title">Messages</h2>
        {messages.map((m) => (
          <div key={m.id} className={`aio-portal-message aio-portal-message--${m.from}`}>
            <strong>{m.authorName}</strong>
            <p>{m.body}</p>
            <small>{new Date(m.createdAt).toLocaleString()}</small>
          </div>
        ))}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (reply.trim()) {
              sendCustomerMessage(request.id, reply, 'customer', request.contactName ?? 'Customer');
              setReply('');
            }
          }}
          style={{ marginTop: '1rem' }}
        >
          <textarea className="aio-intake-input aio-intake-textarea" rows={2} value={reply} onChange={(e) => setReply(e.target.value)} placeholder="Reply to All In One…" />
          <button type="submit" className="aio-btn aio-btn--gold aio-btn--sm">Send</button>
        </form>
      </div>
    </div>
  );
}
