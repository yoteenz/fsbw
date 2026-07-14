import { useExperienceLabV3Store } from '../store/ExperienceLabV3Store';
import { ELAB_V3_COMPOSITION } from '../experience-lab-v3-composition';

/** Workspace 03 — founder review and approval (viewport-contained). */
export function V3ReviewWorkspace() {
  const { state, setActiveReview } = useExperienceLabV3Store();

  return (
    <section
      className="elab-v3-ws-pane elab-v3-ws-pane--review"
      {...{ [ELAB_V3_COMPOSITION.reviewWorkspace]: '' }}
      aria-label="Review workspace"
    >
      <div className="elab-v3-ws-pane__grid elab-v3-ws-pane__grid--review">
        <div className="elab-v3-ws-pane__panel">
          <h3>Founder Review Wall</h3>
          <ul>
            {state.reviewItems.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  className={state.activeReviewId === item.id ? 'is-active' : ''}
                  onClick={() => setActiveReview(item.id)}
                >
                  {item.title} · {item.status}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="elab-v3-ws-pane__panel">
          <h3>Design Brief</h3>
          <p>
            {state.workspace.departmentLabel} R{state.workspace.revision} — {state.workspace.lifecycleStatus}
          </p>
        </div>

        <div className="elab-v3-ws-pane__panel">
          <h3>Revision Timeline</h3>
          <ul>
            {Array.from({ length: 4 }, (_, i) => state.workspace.revision - i).map((rev) => (
              <li key={rev}>R{rev}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
