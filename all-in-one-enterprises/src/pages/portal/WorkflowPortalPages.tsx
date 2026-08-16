import { Link, useParams } from 'react-router-dom';
import { useDemoStore } from '../../demo/useDemoStore';
import { getJourneyForOrg, getServiceTrackerView } from '../../demo/workflowActions';
import { resolvePortalContext } from '../../portal/organizationContext';
import { aioPaths } from '../../utils/paths';

export function PortalServiceTrackerPage() {
  const { serviceRequestId } = useParams<{ serviceRequestId: string }>();
  const tracker = serviceRequestId ? getServiceTrackerView(serviceRequestId) : null;

  if (!tracker?.request) {
    return (
      <div className="aio-portal-dashboard">
        <h1>Service not found</h1>
        <Link to={aioPaths.portalRequestsCenter}>← Requests</Link>
      </div>
    );
  }

  const { request } = tracker;

  if (!tracker.hasWorkflow) {
    return (
      <div className="aio-portal-dashboard">
        <header className="aio-portal-dashboard__header">
          <Link to={aioPaths.portalRequestsCenter} className="aio-portal-back">← Requests</Link>
          <h1>{request.services.map((s) => s.title).join(' + ')}</h1>
          <p>{request.requestNumber}</p>
        </header>
        <div className="aio-portal-panel">
          <p>Workflow orchestration has not started for this request yet.</p>
          <Link to={aioPaths.portalRequest(request.id)} className="aio-btn aio-btn--gold">View Request Details</Link>
        </div>
      </div>
    );
  }

  const { phases, statusLabel, progress, customerAction, template } = tracker;

  return (
    <div className="aio-portal-dashboard">
      <header className="aio-portal-dashboard__header">
        <Link to={aioPaths.portalRequestsCenter} className="aio-portal-back">← Requests</Link>
        <span className="aio-badge aio-badge--progress">{statusLabel.toUpperCase()}</span>
        <h1>{template?.name ?? request.services[0]?.title}</h1>
        <p>{request.requestNumber} · {progress}% complete</p>
      </header>

      <div className="aio-portal-panel aio-service-tracker">
        <h2 className="aio-portal-panel__title">Your Progress</h2>
        <ul className="aio-tracker-phases">
          {phases.map((phase) => (
            <li key={phase.id} className={`aio-tracker-phase aio-tracker-phase--${phase.status}`}>
              <span className="aio-tracker-phase__icon">
                {phase.status === 'complete' ? '✓' : phase.status === 'current' ? '●' : '○'}
              </span>
              <span className="aio-tracker-phase__label">{phase.customerLabel}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="aio-two-col">
        <div className="aio-portal-panel">
          <h2 className="aio-portal-panel__title">Your Action</h2>
          {customerAction ? (
            <>
              <p>{customerAction.description}</p>
              <Link to={customerAction.ctaHref} className="aio-btn aio-btn--gold">{customerAction.ctaLabel}</Link>
            </>
          ) : (
            <p className="aio-muted">None right now — All In One is working on your service.</p>
          )}
        </div>
        <div className="aio-portal-panel">
          <h2 className="aio-portal-panel__title">All In One Status</h2>
          <p>
            {tracker.workflow?.status === 'waiting_external'
              ? 'Monitoring the submitted request with the external agency.'
              : tracker.workflow?.status === 'waiting_on_customer'
                ? 'Waiting for information or documents from you.'
                : 'Processing your service according to the approved workflow.'}
          </p>
        </div>
      </div>

      <Link to={aioPaths.portalRequest(request.id)} className="aio-link">View full request details →</Link>
    </div>
  );
}

export function PortalJourneyRoadmapPage() {
  const store = useDemoStore();
  const ctx = resolvePortalContext(store);
  const journeys = getJourneyForOrg(ctx.organizationId, store);

  return (
    <div className="aio-portal-dashboard">
      <header className="aio-portal-dashboard__header">
        <Link to={aioPaths.portal} className="aio-portal-back">← Dashboard</Link>
        <h1>Your Roadmap</h1>
        <p>Service journeys group related workflows — distinct from Road Ready requirements.</p>
      </header>

      {journeys.length === 0 ? (
        <div className="aio-portal-panel">
          <p>No active service journey. Complete intake or request services to begin.</p>
          <Link to={aioPaths.getStarted} className="aio-btn aio-btn--gold">Get Started</Link>
        </div>
      ) : (
        journeys.map((j) => (
          <div key={j.id} className="aio-portal-panel">
            <h2 className="aio-portal-panel__title">{j.name}</h2>
            <p>{j.progress}% overall · {j.status}</p>
            <ul className="aio-journey-workflows">
              {j.workflowInstanceIds.map((wfId) => {
                const wf = store.workflowInstances?.find((w) => w.id === wfId);
                const tmpl = store.workflowTemplates?.find((t) => t.id === wf?.templateId);
                const locked = wf?.status === 'not_started';
                return (
                  <li key={wfId} className={`aio-journey-item ${locked ? 'is-locked' : ''}`}>
                    <span>{tmpl?.name ?? wfId}</span>
                    <span className="aio-badge aio-badge--progress">{wf?.status.replace(/_/g, ' ') ?? 'future'}</span>
                    {wf?.serviceRequestId && (
                      <Link to={aioPaths.portalServiceTracker(wf.serviceRequestId)}>Track</Link>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))
      )}

      <div className="aio-portal-panel">
        <h2 className="aio-portal-panel__title">Road Ready</h2>
        <p>Compliance requirements are tracked separately in Road Ready.</p>
        <Link to={aioPaths.roadReady} className="aio-btn aio-btn--outline">Open Road Ready</Link>
      </div>
    </div>
  );
}
