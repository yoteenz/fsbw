import { Link, useParams } from 'react-router-dom';
import { serviceRequestRepository } from '../repositories/serviceRequestRepository';
import { AIORequestTimeline } from '../components/AIORequestTimeline';
import { aioPaths } from '../utils/paths';

export function RequestDetailPage() {
  const { requestId } = useParams<{ requestId: string }>();
  const request = requestId ? serviceRequestRepository.getById(requestId) : undefined;

  if (!request) {
    return (
      <div className="aio-portal-dashboard">
        <h1>Request Not Found</h1>
        <Link to={aioPaths.portal}>← Back to Dashboard</Link>
      </div>
    );
  }

  return (
    <div className="aio-portal-dashboard">
      <header className="aio-portal-dashboard__header">
        <Link to={aioPaths.portal} className="aio-portal-back">
          ← Dashboard
        </Link>
        <span className="aio-badge aio-badge--progress">DEMO REQUEST</span>
        <h1>{request.services.map((s) => s.title).join(' + ')}</h1>
        <p>{request.requestNumber} · {new Date(request.createdAt).toLocaleDateString()}</p>
      </header>

      <div className="aio-two-col">
        <div className="aio-portal-panel">
          <h2 className="aio-portal-panel__title">Status</h2>
          <span className="aio-badge aio-badge--progress">{request.statusLabel}</span>
          <p style={{ marginTop: '1rem' }}>
            <strong>Next Step:</strong> {request.nextStep}
          </p>
          <p>
            <strong>Division:</strong> {request.services[0]?.division.replace('-', ' ')}
          </p>
        </div>

        <div className="aio-portal-panel">
          <h2 className="aio-portal-panel__title">Timeline</h2>
          <AIORequestTimeline steps={request.timeline} />
        </div>
      </div>

      <div className="aio-portal-panel">
        <h2 className="aio-portal-panel__title">Documents Needed</h2>
        {request.documentsNeeded.length === 0 ? (
          <p className="aio-empty-state__text">No documents needed at this time.</p>
        ) : (
          <ul className="aio-doc-checklist">
            {request.documentsNeeded.map((doc) => (
              <li key={doc}>
                {doc}
                <button type="button" className="aio-btn aio-btn--outline-dark aio-btn--sm" disabled title="Coming in future sprint">
                  Upload — Coming Soon
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {request.relatedRoadmapItems && request.relatedRoadmapItems.length > 0 && (
        <div className="aio-portal-panel">
          <h2 className="aio-portal-panel__title">Related Roadmap Items</h2>
          <ul>
            {request.relatedRoadmapItems.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="aio-portal-panel aio-portal-panel--placeholder">
        <h2 className="aio-portal-panel__title">Messages</h2>
        <p className="aio-empty-state__text">Messaging will be available in a future sprint.</p>
      </div>

      <div className="aio-portal-panel aio-portal-panel--placeholder">
        <h2 className="aio-portal-panel__title">Assigned Specialist</h2>
        <p className="aio-empty-state__text">Specialist assignment coming in a future sprint.</p>
      </div>
    </div>
  );
}
