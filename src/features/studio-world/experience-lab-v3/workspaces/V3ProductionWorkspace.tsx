import { useMemo } from 'react';
import { useExperienceLabLiveWorkspace } from '../../experience-lab-v2/live-workspace';
import { V3_INSPECTOR_COPY } from '../registry/v3-workbench-registry';
import { useExperienceLabV3Store } from '../store/ExperienceLabV3Store';
import { ELAB_V3_COMPOSITION } from '../experience-lab-v3-composition';
import { V3WorkspaceFloatingDisplays, V3WorkspaceStateGate } from '../shared/V3WorkspaceChrome';

const TURN_LANES = [
  { id: 'now-running', label: 'NOW RUNNING' },
  { id: 'up-next', label: 'UP NEXT' },
  { id: 'waiting', label: 'WAITING' },
  { id: 'blocked', label: 'BLOCKED' },
] as const;

function laneForWorkOrder(status: string, queueColumn: string): (typeof TURN_LANES)[number]['id'] {
  if (status === 'generating') return 'now-running';
  if (queueColumn === 'blocked') return 'blocked';
  if (queueColumn === 'waiting') return 'waiting';
  if (queueColumn === 'generating') return 'now-running';
  return 'up-next';
}

function formatEta(ms: number | null): string {
  if (ms == null) return '—';
  const sec = Math.round(ms / 1000);
  if (sec < 60) return `${sec}s`;
  return `${Math.round(sec / 60)}m`;
}

/** Workspace 02 — Zota-inspired production mission control (viewport-contained). */
export function V3ProductionWorkspace() {
  const { state, activeWorkOrder, setActiveWorkOrder } = useExperienceLabV3Store();
  const { liveWorkspace } = useExperienceLabLiveWorkspace();
  const module = state.workspaceMemory.production.module ?? 'queue';
  const inspector = state.activeInspectorMode ? V3_INSPECTOR_COPY[state.activeInspectorMode] : null;

  const laneGroups = useMemo(() => {
    const groups: Record<string, typeof state.workOrders> = {
      'now-running': [],
      'up-next': [],
      waiting: [],
      blocked: [],
    };
    for (const wo of state.workOrders) {
      const lane = laneForWorkOrder(wo.status, wo.queueColumn);
      groups[lane].push(wo);
    }
    return groups;
  }, [state.workOrders]);

  const interchangeableLabel =
    module === 'pipeline'
      ? 'Pipeline'
      : module === 'dependencies'
        ? 'Dependencies'
        : module === 'outputs'
          ? 'Outputs'
          : module === 'logs'
            ? 'Logs'
            : 'Queue';

  const interchangeableBody =
    module === 'pipeline' ? (
      <ul className="elab-v3-ws-pane__pipeline">
        {state.pipeline.map((stage) => (
          <li key={stage.id} className={stage.status === 'active' ? 'is-active' : ''}>
            <span>{stage.label}</span>
            <strong>{stage.workOrderCount}</strong>
          </li>
        ))}
      </ul>
    ) : module === 'dependencies' ? (
      <ul>
        {liveWorkspace.workbenchModules.architectural.dependencies.map((d) => (
          <li key={d}>{d}</li>
        ))}
        {liveWorkspace.workbenchModules.architectural.dependencies.length === 0 ? (
          <li>No dependencies</li>
        ) : null}
      </ul>
    ) : (
      <ul>
        {state.workOrders.slice(0, 6).map((wo) => (
          <li key={wo.id}>
            <button
              type="button"
              className={state.activeWorkOrderId === wo.id ? 'is-active' : ''}
              onClick={() => setActiveWorkOrder(wo.id)}
              data-v3-no-swipe
            >
              {wo.title} · {wo.progress}%
            </button>
          </li>
        ))}
      </ul>
    );

  return (
    <V3WorkspaceStateGate
      workspaceId="production"
      dataState={state.workspaceDataState.production}
      error={state.lastPageError}
      emptyTitle="No active Work Order"
      emptyBody="Select an Environment Package with generation jobs to populate Production."
      emptyAction="Return to Environment"
    >
      <section
        className="elab-v3-ws-pane elab-v3-ws-pane--production"
        {...{ [ELAB_V3_COMPOSITION.productionWorkspace]: '' }}
        aria-label="Production workspace"
      >
        <V3WorkspaceFloatingDisplays
          persistentLabel="Active Work Order"
          persistentBody={
            activeWorkOrder ? (
              <dl className="elab-v3-ws-pane__dl">
                <div>
                  <dt>WO</dt>
                  <dd>{activeWorkOrder.id}</dd>
                </div>
                <div>
                  <dt>Title</dt>
                  <dd>{activeWorkOrder.title}</dd>
                </div>
                <div>
                  <dt>Env / Variant</dt>
                  <dd>
                    {state.workspace.environmentLabel} · {state.workspace.variantLabel}
                  </dd>
                </div>
                <div>
                  <dt>Progress</dt>
                  <dd>
                    {activeWorkOrder.progress}% · ETA {formatEta(activeWorkOrder.etaMs)}
                  </dd>
                </div>
                <div>
                  <dt>Cost</dt>
                  <dd>${activeWorkOrder.costUsd.toFixed(2)}</dd>
                </div>
                <div>
                  <dt>Priority</dt>
                  <dd>{activeWorkOrder.priority}</dd>
                </div>
              </dl>
            ) : (
              <p>No active work order for this package.</p>
            )
          }
          interchangeableLabel={interchangeableLabel}
          interchangeableBody={inspector ? <p>{inspector.body}</p> : interchangeableBody}
        />

        <div className="elab-v3-ws-pane__layout elab-v3-ws-pane__layout--production">
          <header className="elab-v3-ws-pane__region elab-v3-ws-pane__region--top">
            <h3>Active Work Order</h3>
            {activeWorkOrder ? (
              <div className="elab-v3-ws-pane__hero-card" data-v3-no-swipe>
                <span className="elab-v3-ws-pane__hero-title">{activeWorkOrder.title}</span>
                <span className="elab-v3-ws-pane__hero-meta">
                  R{activeWorkOrder.revision} · {activeWorkOrder.status} · {activeWorkOrder.owner}
                </span>
                <div className="elab-v3-ws-pane__progress-bar">
                  <div className="elab-v3-ws-pane__progress-fill" style={{ width: `${activeWorkOrder.progress}%` }} />
                </div>
              </div>
            ) : (
              <p className="elab-v3-ws-pane__muted">No active work order</p>
            )}
          </header>

          <div className="elab-v3-ws-pane__region elab-v3-ws-pane__region--primary">
            <h3>AI Turn Board</h3>
            <div className="elab-v3-ws-pane__turn-board" data-v3-no-swipe>
              {TURN_LANES.map((lane) => (
                <div key={lane.id} className="elab-v3-ws-pane__turn-lane">
                  <span className="elab-v3-ws-pane__turn-lane-label">{lane.label}</span>
                  <ul>
                    {laneGroups[lane.id].map((wo) => (
                      <li key={wo.id}>
                        <button
                          type="button"
                          onClick={() => setActiveWorkOrder(wo.id)}
                          className={state.activeWorkOrderId === wo.id ? 'is-active' : ''}
                        >
                          <span>{wo.title}</span>
                          <span>
                            {wo.progress}% · ${wo.costUsd.toFixed(2)}
                          </span>
                        </button>
                      </li>
                    ))}
                    {laneGroups[lane.id].length === 0 ? <li className="elab-v3-ws-pane__muted">—</li> : null}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <div className="elab-v3-ws-pane__region elab-v3-ws-pane__region--lower">
            <div className="elab-v3-ws-pane__split">
              <div>
                <h3>Costs</h3>
                <p>
                  Est ${state.operations.todaySpendUsd.toFixed(2)} · Cache $
                  {(state.operations.cacheSavingsUsd ?? 0).toFixed(2)}
                </p>
              </div>
              <div>
                <h3>Required Attention</h3>
                <ul>
                  {state.attentionItems.length === 0 ? (
                    <li className="elab-v3-ws-pane__muted">None</li>
                  ) : (
                    state.attentionItems.map((a) => (
                      <li key={a.id} className={`elab-v3-ws-pane__attention--${a.severity}`}>
                        {a.label}
                      </li>
                    ))
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </V3WorkspaceStateGate>
  );
}
