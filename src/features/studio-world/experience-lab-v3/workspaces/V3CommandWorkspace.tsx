import { useExperienceLabLiveWorkspace } from '../../experience-lab-v2/live-workspace';
import { V3_INSPECTOR_COPY } from '../registry/v3-workbench-registry';
import { useExperienceLabV3Store } from '../store/ExperienceLabV3Store';
import { ELAB_V3_COMPOSITION } from '../experience-lab-v3-composition';
import { V3WorkspaceFloatingDisplays, V3WorkspaceStateGate } from '../shared/V3WorkspaceChrome';

const HEALTH_TILES = [
  { key: 'systemHealthPercent', label: 'Overall' },
  { key: 'storageHealthPercent', label: 'Storage' },
  { key: 'gpuUsagePercent', label: 'Scheduler' },
] as const;

/** Workspace 05 — Command / mission control diagnostics (viewport-contained). */
export function V3CommandWorkspace() {
  const { state } = useExperienceLabV3Store();
  const { liveWorkspace, eventSync, exportDiagnostics } = useExperienceLabLiveWorkspace();
  const module = state.workspaceMemory.command.module ?? 'jobs';
  const inspector = state.activeInspectorMode ? V3_INSPECTOR_COPY[state.activeInspectorMode] : null;
  const ops = state.operations;

  const interchangeableLabel =
    module === 'workers'
      ? 'Workers'
      : module === 'failures'
        ? 'Failures'
        : module === 'logs'
          ? 'Logs'
          : module === 'recovery'
            ? 'Recovery'
            : 'Jobs';

  const interchangeableBody = inspector ? (
    <p>{inspector.body}</p>
  ) : module === 'workers' ? (
    <ul>
      {liveWorkspace.workbenchModules.workforce.generationWorkers.map((w) => (
        <li key={w}>{w}</li>
      ))}
      {liveWorkspace.workbenchModules.workforce.generationWorkers.length === 0 ? (
        <li>No workers assigned</li>
      ) : null}
    </ul>
  ) : module === 'failures' ? (
    <ul>
      {liveWorkspace.failedOutputs.length === 0 ? (
        <li>No failures</li>
      ) : (
        liveWorkspace.failedOutputs.map((f) => <li key={f}>{f}</li>)
      )}
    </ul>
  ) : (
    <ul>
      {state.workOrders.slice(0, 5).map((wo) => (
        <li key={wo.id}>
          {wo.title} · {wo.status} · {wo.progress}%
        </li>
      ))}
      {state.workOrders.length === 0 ? <li>No active jobs</li> : null}
    </ul>
  );

  return (
    <V3WorkspaceStateGate
      workspaceId="command"
      dataState={state.workspaceDataState.command}
      error={state.lastPageError}
      emptyTitle="No operational data"
      emptyBody="Command workspace activates when a package is loaded."
      emptyAction="Select Environment Package"
    >
      <section
        className="elab-v3-ws-pane elab-v3-ws-pane--command"
        {...{ [ELAB_V3_COMPOSITION.commandWorkspace]: '' }}
        aria-label="Command workspace"
      >
        <V3WorkspaceFloatingDisplays
          persistentLabel="System Health"
          persistentBody={
            <div className="elab-v3-ws-pane__health-row">
              {HEALTH_TILES.map((t) => {
                const val = ops[t.key as keyof typeof ops];
                return (
                  <span key={t.key} className="elab-v3-ws-pane__health-chip">
                    {t.label} <strong>{typeof val === 'number' ? `${val}%` : String(val)}</strong>
                  </span>
                );
              })}
              <span className="elab-v3-ws-pane__health-chip">
                Provider <strong>{ops.providerStatus ?? liveWorkspace.provider}</strong>
              </span>
              <span className="elab-v3-ws-pane__health-chip">
                Realtime <strong>{eventSync.cursor.connectionState}</strong>
              </span>
            </div>
          }
          interchangeableLabel={interchangeableLabel}
          interchangeableBody={interchangeableBody}
        />

        <div className="elab-v3-ws-pane__layout elab-v3-ws-pane__layout--command">
          <div className="elab-v3-ws-pane__metric-grid" data-v3-no-swipe>
            <div className="elab-v3-ws-pane__tile">
              <span className="elab-v3-ws-pane__tile-label">Today's Spend</span>
              <span className="elab-v3-ws-pane__tile-value">${ops.todaySpendUsd.toFixed(2)}</span>
            </div>
            <div className="elab-v3-ws-pane__tile">
              <span className="elab-v3-ws-pane__tile-label">Credits</span>
              <span className="elab-v3-ws-pane__tile-value">{ops.creditsRemaining}</span>
            </div>
            <div className="elab-v3-ws-pane__tile">
              <span className="elab-v3-ws-pane__tile-label">Queue</span>
              <span className="elab-v3-ws-pane__tile-value">{ops.generationQueueCount}</span>
            </div>
            <div className="elab-v3-ws-pane__tile">
              <span className="elab-v3-ws-pane__tile-label">Failed Jobs</span>
              <span className="elab-v3-ws-pane__tile-value">{ops.failedJobs}</span>
            </div>
          </div>

          <div className="elab-v3-ws-pane__region elab-v3-ws-pane__region--lower">
            <h3>Attention</h3>
            <ul>
              {state.attentionItems.length === 0 ? (
                <li className="elab-v3-ws-pane__muted">No attention required</li>
              ) : (
                state.attentionItems.map((a) => (
                  <li key={a.id} className={`elab-v3-ws-pane__attention--${a.severity}`}>
                    {a.label}
                  </li>
                ))
              )}
            </ul>
            <button
              type="button"
              className="elab-v3-ws-pane__diag-export"
              data-v3-no-swipe
              onClick={() => {
                const json = exportDiagnostics();
                void navigator.clipboard?.writeText(json);
              }}
            >
              Export diagnostic JSON
            </button>
          </div>
        </div>
      </section>
    </V3WorkspaceStateGate>
  );
}
