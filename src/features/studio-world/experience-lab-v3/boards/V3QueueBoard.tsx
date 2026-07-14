import { useExperienceLabV3Store } from '../store/ExperienceLabV3Store';
import type { WorkOrder } from '../experience-lab-v3.types';

const COLUMNS: Array<{ id: WorkOrder['queueColumn']; label: string }> = [
  { id: 'generating', label: 'Generating' },
  { id: 'waiting', label: 'Waiting' },
  { id: 'blocked', label: 'Blocked' },
  { id: 'review', label: 'Review' },
  { id: 'completed', label: 'Completed' },
];

/** Persistent production board — Zota-inspired queue columns. */
export function V3QueueBoard() {
  const { state, setActiveWorkOrder, dispatch } = useExperienceLabV3Store();

  return (
    <section className="elab-v3-queue" data-elab-v3-queue-board aria-label="Production queue">
      {COLUMNS.map((col) => {
        const items = state.workOrders.filter((w) => w.queueColumn === col.id);
        return (
          <div key={col.id} className="elab-v3-queue__col">
            <header className="elab-v3-queue__col-head">
              <span>{col.label}</span>
              <span className="elab-v3-queue__col-count">{items.length}</span>
            </header>
            <ul className="elab-v3-queue__list">
              {items.map((wo) => (
                <li key={wo.id}>
                  <button
                    type="button"
                    className={`elab-v3-queue__card${state.activeWorkOrderId === wo.id ? ' is-active' : ''}`}
                    onClick={() => setActiveWorkOrder(wo.id)}
                    draggable
                    onDragStart={(e) => e.dataTransfer.setData('text/work-order-id', wo.id)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => dispatch({ type: 'MOVE_WORK_ORDER', workOrderId: wo.id, column: col.id })}
                  >
                    <span className="elab-v3-queue__card-title">{wo.title}</span>
                    <span className="elab-v3-queue__card-meta">
                      {wo.progress}% · ${wo.costUsd.toFixed(2)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </section>
  );
}
