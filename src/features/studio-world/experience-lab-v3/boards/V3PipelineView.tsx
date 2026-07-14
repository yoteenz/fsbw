import { useExperienceLabV3Store } from '../store/ExperienceLabV3Store';

/** Live pipeline — always know where every asset is. */
export function V3PipelineView() {
  const { state } = useExperienceLabV3Store();

  return (
    <section className="elab-v3-pipeline" data-elab-v3-pipeline aria-label="Production pipeline">
      {state.pipeline.map((stage, i) => (
        <div key={stage.id} className="elab-v3-pipeline__stage-wrap">
          {i > 0 && <span className="elab-v3-pipeline__arrow" aria-hidden>↓</span>}
          <div className={`elab-v3-pipeline__stage elab-v3-pipeline__stage--${stage.status}`}>
            <span className="elab-v3-pipeline__label">{stage.label}</span>
            {stage.workOrderCount > 0 && (
              <span className="elab-v3-pipeline__count">{stage.workOrderCount}</span>
            )}
          </div>
        </div>
      ))}
    </section>
  );
}
