import { useExperienceLabV3Store } from '../store/ExperienceLabV3Store';

/** ONE active work order panel — contents change, panel never duplicates. */
export function V3ActiveWorkOrderPanel() {
  const { activeWorkOrder } = useExperienceLabV3Store();

  if (!activeWorkOrder) {
    return (
      <section className="elab-v3-active-wo elab-v3-active-wo--empty" data-elab-v3-active-work-order>
        <p>Select a work order from the queue</p>
      </section>
    );
  }

  return (
    <section className="elab-v3-active-wo" data-elab-v3-active-work-order>
      <header className="elab-v3-active-wo__head">
        <h2>{activeWorkOrder.title}</h2>
        <span className={`elab-v3-active-wo__status elab-v3-active-wo__status--${activeWorkOrder.status}`}>
          {activeWorkOrder.status}
        </span>
      </header>
      <dl className="elab-v3-active-wo__grid">
        <div><dt>Progress</dt><dd>{activeWorkOrder.progress}%</dd></div>
        <div><dt>ETA</dt><dd>{activeWorkOrder.etaMs ? `${Math.round(activeWorkOrder.etaMs / 1000)}s` : '—'}</dd></div>
        <div><dt>Priority</dt><dd>{activeWorkOrder.priority}</dd></div>
        <div><dt>Cost</dt><dd>${activeWorkOrder.costUsd.toFixed(2)}</dd></div>
        <div><dt>Owner</dt><dd>{activeWorkOrder.owner}</dd></div>
        <div><dt>Provider</dt><dd>{activeWorkOrder.provider}</dd></div>
        <div><dt>Revision</dt><dd>R{activeWorkOrder.revision}</dd></div>
        <div><dt>Dependencies</dt><dd>{activeWorkOrder.dependencies.length ? activeWorkOrder.dependencies.join(', ') : 'None'}</dd></div>
      </dl>
      <div className="elab-v3-active-wo__progress" role="progressbar" aria-valuenow={activeWorkOrder.progress} aria-valuemin={0} aria-valuemax={100}>
        <div className="elab-v3-active-wo__progress-fill" style={{ width: `${activeWorkOrder.progress}%` }} />
      </div>
    </section>
  );
}
