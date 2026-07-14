import { useExperienceLabV3Store } from '../store/ExperienceLabV3Store';
import { ELAB_V3_COMPOSITION } from '../experience-lab-v3-composition';

const QUEUE_COLUMNS = ['generating', 'waiting', 'blocked', 'review', 'completed'] as const;

/** Workspace 02 — Zota-inspired production mission control (viewport-contained). */
export function V3ProductionWorkspace() {
  const { state, activeWorkOrder, setActiveWorkOrder } = useExperienceLabV3Store();

  return (
    <section
      className="elab-v3-ws-pane elab-v3-ws-pane--production"
      {...{ [ELAB_V3_COMPOSITION.productionWorkspace]: '' }}
      aria-label="Production workspace"
    >
      <div className="elab-v3-ws-pane__grid elab-v3-ws-pane__grid--production">
        <div className="elab-v3-ws-pane__ops-row">
          {QUEUE_COLUMNS.map((col) => {
            const count = state.workOrders.filter((w) => w.queueColumn === col).length;
            return (
              <span key={col} className="elab-v3-ws-pane__ops-chip">
                {col} <strong>{count}</strong>
              </span>
            );
          })}
        </div>

        <div className="elab-v3-ws-pane__panel">
          <h3>Active Work Order</h3>
          {activeWorkOrder ? (
            <ul>
              <li>
                <span>{activeWorkOrder.title}</span>
                <span> · {activeWorkOrder.progress}% · ${activeWorkOrder.costUsd.toFixed(2)}</span>
              </li>
            </ul>
          ) : (
            <p>No active work order</p>
          )}
        </div>

        <div className="elab-v3-ws-pane__panel">
          <h3>Production Queue</h3>
          <ul>
            {state.workOrders.slice(0, 5).map((wo) => (
              <li key={wo.id}>
                <button
                  type="button"
                  className={state.activeWorkOrderId === wo.id ? 'is-active' : ''}
                  onClick={() => setActiveWorkOrder(wo.id)}
                >
                  {wo.title} · {wo.status}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="elab-v3-ws-pane__panel">
          <h3>Pipeline</h3>
          <ul>
            {state.pipeline.map((stage) => (
              <li key={stage.id}>
                {stage.label} · {stage.workOrderCount}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
