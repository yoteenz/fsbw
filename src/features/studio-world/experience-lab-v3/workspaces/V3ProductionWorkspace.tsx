import { useExperienceLabV3Store } from '../store/ExperienceLabV3Store';
import { ELAB_V3_COMPOSITION } from '../experience-lab-v3-composition';

const QUEUE_COLUMNS = ['generating', 'waiting', 'blocked', 'review', 'completed'] as const;

/** Workspace 02 — unified production mission control. */
export function V3ProductionWorkspace() {
  const { state, setActiveWorkOrder } = useExperienceLabV3Store();

  return (
    <section
      className="elab-v3-ws elab-v3-ws--production"
      {...{ [ELAB_V3_COMPOSITION.productionWorkspace]: '' }}
      aria-label="Production workspace"
    >
      <div className="elab-v3-ws__ops-chips">
        {QUEUE_COLUMNS.map((col) => {
          const count = state.workOrders.filter((w) => w.queueColumn === col).length;
          return (
            <span key={col} className="elab-v3-ws__ops-chip">
              {col} <strong>{count}</strong>
            </span>
          );
        })}
      </div>

      <div className="elab-v3-ws__production-grid">
        <div className="elab-v3-ws__queue-board">
          <h3>Production Queue</h3>
          <ul>
            {state.workOrders.map((wo) => (
              <li key={wo.id}>
                <button
                  type="button"
                  className={state.activeWorkOrderId === wo.id ? 'is-active' : ''}
                  onClick={() => setActiveWorkOrder(wo.id)}
                >
                  <span>{wo.title}</span>
                  <span>{wo.status} · {wo.progress}%</span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="elab-v3-ws__pipeline">
          <h3>Production Pipeline</h3>
          {state.pipeline.map((stage) => (
            <div key={stage.id} className={`elab-v3-ws__pipeline-stage is-${stage.status}`}>
              <span>{stage.label}</span>
              <span>{stage.workOrderCount}</span>
            </div>
          ))}
        </div>

        <div className="elab-v3-ws__metrics">
          <h3>Queue Health</h3>
          <dl>
            <div><dt>GPU</dt><dd>{state.operations.gpuUsagePercent}%</dd></div>
            <div><dt>Queue</dt><dd>{state.operations.generationQueueCount}</dd></div>
            <div><dt>Failed</dt><dd>{state.operations.failedJobs}</dd></div>
            <div><dt>Credits</dt><dd>{state.operations.creditsRemaining}</dd></div>
          </dl>
        </div>
      </div>
    </section>
  );
}
