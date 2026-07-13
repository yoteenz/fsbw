import type { ExperienceLabV2ViewModel } from './experience-lab-v2.types';
import { ELAB_V2_COMPOSITION } from './experience-lab-v2-composition';

type Props = {
  model: ExperienceLabV2ViewModel;
};

const REVISIONS = [13, 14, 15, 16, 17, 18] as const;

/** Integrated Founder Review Workbench — one connected console, not dashboard cards. */
export function ExperienceLabFounderWorkbench({ model }: Props) {
  const fr = model.founderRender;

  return (
    <section className="elab-founder-wb" {...{ [ELAB_V2_COMPOSITION.founderWorkbench]: '' }} aria-label="Founder review workbench">
      <div className="elab-founder-wb__console">
        <article className="elab-founder-wb__zone elab-founder-wb__zone--brief">
          <h3 className="elab-founder-wb__zone-title">DESIGN BRIEF</h3>
          <p className="elab-founder-wb__brief-text">{model.charterSummary}</p>
          <p className="elab-founder-wb__mood">Mood: <strong>Luxury / Power / Innovation</strong></p>
        </article>

        <article className="elab-founder-wb__zone elab-founder-wb__zone--review">
          <h3 className="elab-founder-wb__zone-title">FOUNDER REVIEW</h3>
          <div className="elab-founder-wb__player">
            {fr?.previewArtifactUrl ? (
              <img src={fr.previewArtifactUrl} alt="Founder render preview" className="elab-founder-wb__preview" />
            ) : (
              <div className="elab-founder-wb__player-placeholder">
                <span className="elab-founder-wb__play">▶</span>
                <span>DRAG TO EXPLORE</span>
              </div>
            )}
          </div>
          <p className="elab-founder-wb__status">{fr?.status ?? 'no_preview'} · {model.departmentName}</p>
        </article>

        <article className="elab-founder-wb__zone elab-founder-wb__zone--timeline">
          <h3 className="elab-founder-wb__zone-title">REVISION TIMELINE</h3>
          <div className="elab-founder-wb__chart" aria-hidden>
            <svg viewBox="0 0 240 60" className="elab-founder-wb__chart-svg">
              <polyline
                fill="none"
                stroke="rgba(201,169,98,0.8)"
                strokeWidth="2"
                points="0,50 40,45 80,38 120,28 160,18 200,10 240,5"
              />
              {REVISIONS.map((r, i) => (
                <circle key={r} cx={i * 48} cy={50 - i * 8} r="3" fill={r === model.revision ? '#c9a962' : 'rgba(255,255,255,0.3)'} />
              ))}
            </svg>
          </div>
          <p className="elab-founder-wb__rev-current">Current: r{model.revision}</p>
          {model.isStale ? <p className="elab-founder-wb__warn">Stale reference warning</p> : null}
        </article>

        <article className="elab-founder-wb__zone elab-founder-wb__zone--diag">
          <h3 className="elab-founder-wb__zone-title">DIAGNOSTICS</h3>
          <p>{model.costEstimate} · {fr?.modelRoute ?? '—'}</p>
          {model.diagnostics.map((d) => (
            <p key={d} className="elab-founder-wb__diag-line">{d}</p>
          ))}
        </article>
      </div>
    </section>
  );
}
