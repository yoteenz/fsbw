import { useExperienceLabLiveWorkspace } from '../../experience-lab-v2/live-workspace';
import { V3_INSPECTOR_COPY } from '../registry/v3-workbench-registry';
import { useExperienceLabV3Store } from '../store/ExperienceLabV3Store';
import { ELAB_V3_COMPOSITION } from '../experience-lab-v3-composition';
import { V3WorkspaceFloatingDisplays, V3WorkspaceStateGate } from '../shared/V3WorkspaceChrome';

/** Workspace 03 — founder review and approval (viewport-contained). */
export function V3ReviewWorkspace() {
  const { state, activeReview, setActiveReview, dispatch } = useExperienceLabV3Store();
  const { liveWorkspace, setHistoricalPreviewRevision } = useExperienceLabLiveWorkspace();
  const comparisonMode = state.workspaceMemory.review.comparisonMode ?? 'side-by-side';
  const inspector = state.activeInspectorMode ? V3_INSPECTOR_COPY[state.activeInspectorMode] : null;

  const interchangeableLabel = inspector?.title ?? 'Comparison';
  const interchangeableBody = inspector ? (
    <p>{inspector.body}</p>
  ) : (
    <div className="elab-v3-ws-pane__compare" data-v3-no-swipe>
      <div className="elab-v3-ws-pane__compare-panes">
        <figure>
          <figcaption>R{state.workspace.revision} current</figcaption>
          <div className="elab-v3-ws-pane__compare-thumb">
            {activeReview?.thumbnailUrl ? (
              <img src={activeReview.thumbnailUrl} alt="" />
            ) : (
              <span>Preview unavailable</span>
            )}
          </div>
        </figure>
        <figure>
          <figcaption>R{Math.max(1, state.workspace.revision - 1)} prior</figcaption>
          <div className="elab-v3-ws-pane__compare-thumb elab-v3-ws-pane__compare-thumb--dim">
            <span>Prior revision</span>
          </div>
        </figure>
      </div>
      <span className="elab-v3-ws-pane__muted">Mode: {comparisonMode}</span>
    </div>
  );

  return (
    <V3WorkspaceStateGate
      workspaceId="review"
      dataState={state.workspaceDataState.review}
      error={state.lastPageError}
      emptyTitle="No revisions available"
      emptyBody="Generate package outputs before founder review can begin."
      emptyAction="Open Production"
    >
      <section
        className="elab-v3-ws-pane elab-v3-ws-pane--review"
        {...{ [ELAB_V3_COMPOSITION.reviewWorkspace]: '' }}
        aria-label="Review workspace"
      >
        <V3WorkspaceFloatingDisplays
          persistentLabel="Active Review Item"
          persistentBody={
            activeReview ? (
              <dl className="elab-v3-ws-pane__dl">
                <div>
                  <dt>Revision</dt>
                  <dd>R{activeReview.revision}</dd>
                </div>
                <div>
                  <dt>Status</dt>
                  <dd>{activeReview.status}</dd>
                </div>
                <div>
                  <dt>Provider</dt>
                  <dd>{activeReview.provider ?? liveWorkspace.provider}</dd>
                </div>
                <div>
                  <dt>Cost</dt>
                  <dd>
                    {activeReview.costUsd != null ? `$${activeReview.costUsd.toFixed(2)}` : 'Cost unavailable'}
                  </dd>
                </div>
              </dl>
            ) : (
              <p>No review item selected.</p>
            )
          }
          interchangeableLabel={interchangeableLabel}
          interchangeableBody={interchangeableBody}
        />

        <div className="elab-v3-ws-pane__layout elab-v3-ws-pane__layout--review">
          <header className="elab-v3-ws-pane__region elab-v3-ws-pane__region--top">
            <h3>Design Brief</h3>
            <p data-v3-no-swipe>{liveWorkspace.designBrief.currentObjective}</p>
            <p className="elab-v3-ws-pane__muted">
              {liveWorkspace.designBrief.environmentLabel} · {liveWorkspace.designBrief.variantName} · R
              {liveWorkspace.designBrief.packageRevision}
            </p>
          </header>

          <div className="elab-v3-ws-pane__region elab-v3-ws-pane__region--center">
            <h3>Founder Review Wall</h3>
            <ul className="elab-v3-ws-pane__review-wall" data-v3-no-swipe>
              {state.reviewItems.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    className={state.activeReviewId === item.id ? 'is-active' : ''}
                    onClick={() => {
                      setActiveReview(item.id);
                      setHistoricalPreviewRevision(item.revision);
                    }}
                  >
                    {item.thumbnailUrl ? <img src={item.thumbnailUrl} alt="" /> : <span className="elab-v3-ws-pane__thumb-fallback" />}
                    <span>{item.title}</span>
                    <span>{item.status}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="elab-v3-ws-pane__region elab-v3-ws-pane__region--lower">
            <h3>Revision Timeline</h3>
            <ul className="elab-v3-ws-pane__timeline" data-v3-no-swipe>
              {liveWorkspace.timelineEvents.slice(0, 8).map((ev) => (
                <li key={ev.id}>
                  <span>{ev.eventType.replace(/-/g, ' ')}</span>
                  <span>R{ev.revision}</span>
                  <span>{ev.status}</span>
                </li>
              ))}
              {liveWorkspace.timelineEvents.length === 0 ? (
                <li className="elab-v3-ws-pane__muted">No timeline events</li>
              ) : null}
            </ul>

            <div className="elab-v3-ws-pane__actions" data-v3-no-swipe>
              <button
                type="button"
                disabled={!liveWorkspace.diagnostics.approvalEligible}
                onClick={() => dispatch({ type: 'SET_WORKBENCH_TOOL', tool: 'approve' })}
              >
                Approve
              </button>
              <button type="button" onClick={() => dispatch({ type: 'SET_WORKBENCH_TOOL', tool: 'reject' })}>
                Reject
              </button>
              <button
                type="button"
                onClick={() => dispatch({ type: 'SET_WORKBENCH_TOOL', tool: 'request-revision' })}
              >
                Request Revision
              </button>
            </div>
          </div>
        </div>
      </section>
    </V3WorkspaceStateGate>
  );
}
