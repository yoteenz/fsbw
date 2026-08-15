import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useDemoStore } from '../../demo/useDemoStore';
import {
  assignRequest,
  updateRequestStatus,
  requestDocuments,
  addInternalNote,
  sendCustomerMessage,
  markDocumentAccepted,
} from '../../demo/demoActions';
import { aioPaths } from '../../utils/paths';
import { getWorkflowForDivision } from '../workflows/workflowEngine';
import { AIORequestTimeline } from '../../components/AIORequestTimeline';

const DOC_OPTIONS = ['Insurance Certificate', 'Vehicle Registration', 'Rate Confirmation', 'POD', 'Invoice', 'Business Formation Documents'];

export function OfficeRequestDetailPage() {
  const { requestId } = useParams<{ requestId: string }>();
  const store = useDemoStore();
  const [note, setNote] = useState('');
  const [msg, setMsg] = useState('');
  const [docModal, setDocModal] = useState(false);
  const [selectedDocs, setSelectedDocs] = useState<string[]>([]);
  const [docMessage, setDocMessage] = useState('');

  const req = store.requests.find((r) => r.id === requestId);
  if (!req) return <p>Request not found.</p>;

  const client = store.clients.find((c) => c.id === req.clientId);
  const staff = store.staff.find((s) => s.id === req.assignedStaffId);
  const docs = store.documents.filter((d) => req.documentIds.includes(d.id));
  const notes = store.notes.filter((n) => n.requestId === req.id);
  const messages = store.messages.filter((m) => m.requestId === req.id && m.visibility === 'customer');
  const wf = getWorkflowForDivision(req.division);

  return (
    <div className="aio-office-page">
      <header className="aio-office-page__header">
        <Link to={aioPaths.officeRequests} className="aio-office-link">← Requests</Link>
        <h1>{req.requestNumber}</h1>
        <p>{client?.companyName} · {req.services.map((s) => s.title).join(' + ')}</p>
      </header>

      <div className="aio-office-action-bar">
        <select value={req.workflowStep} onChange={(e) => updateRequestStatus(req.id, e.target.value, 'staff-2')} aria-label="Change status">
          {wf.steps.map((s) => (
            <option key={s.id} value={s.id}>{s.label}</option>
          ))}
        </select>
        <select value={req.assignedStaffId ?? ''} onChange={(e) => assignRequest(req.id, e.target.value)} aria-label="Assign staff">
          <option value="">Assign staff…</option>
          {store.staff.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
        <button type="button" className="aio-btn aio-btn--gold aio-btn--sm" onClick={() => setDocModal(true)}>Request Documents</button>
        <button type="button" className="aio-btn aio-btn--outline-dark aio-btn--sm" onClick={() => updateRequestStatus(req.id, 'completed', 'staff-2')}>Mark Complete</button>
      </div>

      <div className="aio-office-two-col">
        <section className="aio-office-panel">
          <h2>Request Details</h2>
          <dl className="aio-office-dl">
            <dt>Status</dt><dd>{req.statusLabel}</dd>
            <dt>Priority</dt><dd>{req.priority}</dd>
            <dt>Assigned</dt><dd>{staff?.name ?? 'Unassigned'}</dd>
            <dt>Submitted</dt><dd>{new Date(req.createdAt).toLocaleString()}</dd>
            <dt>Next Step</dt><dd>{req.nextStep}</dd>
            <dt>Customer Notes</dt><dd>{req.customerNotes ?? '—'}</dd>
          </dl>
        </section>
        <section className="aio-office-panel">
          <h2>Timeline</h2>
          <AIORequestTimeline steps={req.timeline} />
        </section>
      </div>

      <section className="aio-office-panel">
        <h2>Required Documents</h2>
        <ul className="aio-doc-checklist">
          {docs.map((d) => (
            <li key={d.id}>
              {d.title ?? d.name} — <span className="aio-badge aio-badge--progress">{d.status.replace(/_/g, ' ')}</span>
              {['uploaded', 'under_review'].includes(d.status) && (
                <button type="button" className="aio-btn aio-btn--sm aio-btn--gold" onClick={() => markDocumentAccepted(d.id, 'staff-2')}>
                  Verify Document
                </button>
              )}
            </li>
          ))}
        </ul>
      </section>

      <section className="aio-office-panel">
        <h2>Internal Notes</h2>
        {notes.map((n) => (
          <article key={n.id} className="aio-office-note"><header>{n.authorInitials} · {new Date(n.createdAt).toLocaleString()}</header><p>{n.body}</p></article>
        ))}
        <form onSubmit={(e) => { e.preventDefault(); if (note.trim()) { addInternalNote(req.clientId, note, 'staff-2', req.id); setNote(''); } }}>
          <textarea className="aio-intake-textarea aio-intake-input" rows={2} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Internal note (staff only)…" />
          <button type="submit" className="aio-btn aio-btn--sm aio-btn--outline-dark">Add Internal Note</button>
        </form>
      </section>

      <section className="aio-office-panel">
        <h2>Customer Communication</h2>
        {messages.map((m) => (
          <div key={m.id} className={`aio-office-message aio-office-message--${m.from}`}>
            <strong>{m.authorName}</strong>
            <p>{m.body}</p>
            <time>{new Date(m.createdAt).toLocaleString()}</time>
          </div>
        ))}
        <form onSubmit={(e) => { e.preventDefault(); if (msg.trim()) { sendCustomerMessage(req.id, msg, 'staff', staff?.name ?? 'Staff'); setMsg(''); } }}>
          <textarea className="aio-intake-textarea aio-intake-input" rows={2} value={msg} onChange={(e) => setMsg(e.target.value)} placeholder="Message to customer…" />
          <button type="submit" className="aio-btn aio-btn--sm aio-btn--gold">Send Message</button>
        </form>
      </section>

      {docModal && (
        <div className="aio-office-modal" role="dialog" aria-modal="true" aria-labelledby="doc-modal-title">
          <div className="aio-office-modal__content">
            <h2 id="doc-modal-title">Request Documents</h2>
            {DOC_OPTIONS.map((d) => (
              <label key={d} className="aio-intake-checkbox">
                <input type="checkbox" checked={selectedDocs.includes(d)} onChange={() => setSelectedDocs((prev) => prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d])} />
                {d}
              </label>
            ))}
            <textarea className="aio-intake-input aio-intake-textarea" rows={2} value={docMessage} onChange={(e) => setDocMessage(e.target.value)} placeholder="Optional message to customer" />
            <div className="aio-intake__actions">
              <button type="button" className="aio-btn aio-btn--outline-dark" onClick={() => setDocModal(false)}>Cancel</button>
              <button
                type="button"
                className="aio-btn aio-btn--gold"
                onClick={() => {
                  if (selectedDocs.length) {
                    requestDocuments(req.id, selectedDocs, docMessage || undefined, 'staff-2');
                    setDocModal(false);
                    setSelectedDocs([]);
                    setDocMessage('');
                  }
                }}
              >
                Send Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
