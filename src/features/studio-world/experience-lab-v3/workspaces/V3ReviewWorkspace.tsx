import { useExperienceLabV3Store } from '../store/ExperienceLabV3Store';
import { ELAB_V3_COMPOSITION } from '../experience-lab-v3-composition';

/** Workspace 03 — unified founder review and approval. */
export function V3ReviewWorkspace() {
  const { state, setActiveReview } = useExperienceLabV3Store();

  return (
    <section
      className="elab-v3-ws elab-v3-ws--review"
      {...{ [ELAB_V3_COMPOSITION.reviewWorkspace]: '' }}
      aria-label="Review workspace"
    >
      <div className="elab-v3-ws__review-grid">
        <div className="elab-v3-ws__review-wall">
          <h3>Founder Review Wall</h3>
          <ul>
            {state.reviewItems.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  className={state.activeReviewId === item.id ? 'is-active' : ''}
                  onClick={() => setActiveReview(item.id)}
                >
                  <span>{item.title}</span>
                  <span>{item.status} · R{item.revision}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="elab-v3-ws__design-brief">
          <h3>Design Brief</h3>
          <p>
            {state.workspace.departmentLabel} environment package R{state.workspace.revision} awaits founder
            decision. Compare variants, request revision, or promote to canonical.
          </p>
        </div>

        <div className="elab-v3-ws__revision-timeline">
          <h3>Revision Timeline</h3>
          {Array.from({ length: 4 }, (_, i) => state.workspace.revision - i).map((rev) => (
            <div key={rev} className={`elab-v3-ws__timeline-node${rev === state.workspace.revision ? ' is-active' : ''}`}>
              R{rev}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
