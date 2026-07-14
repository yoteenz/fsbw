import type { ExperienceLabV2ViewModel } from './experience-lab-v2.types';
import { ELAB_V2_COMPOSITION } from './experience-lab-v2-composition';

type Props = {
  model: ExperienceLabV2ViewModel;
};

const REVISION_POINTS = [13, 14, 15, 16, 17, 18] as const;

const CHART_HEIGHTS = [12, 18, 24, 32, 40, 48];

/** Symmetric founder review row — design brief · review wall · revision timeline. */
export function ExperienceLabFounderReviewConsole({ model }: Props) {
  const fr = model.founderRender;
  const activeRevisionIndex = REVISION_POINTS.findIndex((r) => r === model.revision);

  return (
    <section
      className="elab-founder-review-console"
      {...{ [ELAB_V2_COMPOSITION.founderReviewConsole]: '' }}
      aria-label="Founder review console"
    >
      <div className="elab-founder-review-console__grid">
        <article className="elab-founder-review-console__panel elab-founder-review-console__panel--brief">
          <h3 className="elab-founder-review-console__title">DESIGN BRIEF</h3>
          <p className="elab-founder-review-console__brief">{model.charterSummary}</p>
          <p className="elab-founder-review-console__mood">
            Mood: <strong>Luxury / Power / Innovation</strong>
          </p>
        </article>

        <article className="elab-founder-review-console__panel elab-founder-review-console__panel--review">
          <h3 className="elab-founder-review-console__title">FOUNDER REVIEW WALL</h3>
          <p className="elab-founder-review-console__hint">DRAG TO EXPLORE</p>
          <div className="elab-founder-review-console__player" role="img" aria-label="Founder render preview">
            <button type="button" className="elab-founder-review-console__nav" aria-label="Previous review">
              ‹
            </button>
            <div className="elab-founder-review-console__player-stage">
              {fr?.previewArtifactUrl ? (
                <img src={fr.previewArtifactUrl} alt="" className="elab-founder-review-console__preview" />
              ) : (
                <div className="elab-founder-review-console__player-placeholder">
                  <span className="elab-founder-review-console__play" aria-hidden>
                    ▶
                  </span>
                </div>
              )}
            </div>
            <button type="button" className="elab-founder-review-console__nav" aria-label="Next review">
              ›
            </button>
          </div>
          <div className="elab-founder-review-console__dots" aria-hidden>
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className={`elab-founder-review-console__dot${i === 0 ? ' elab-founder-review-console__dot--active' : ''}`}
              />
            ))}
          </div>
        </article>

        <article className="elab-founder-review-console__panel elab-founder-review-console__panel--timeline">
          <h3 className="elab-founder-review-console__title">REVISION TIMELINE</h3>
          <div className="elab-founder-review-console__chart" aria-hidden>
            <svg viewBox="0 0 260 72" className="elab-founder-review-console__chart-svg" preserveAspectRatio="none">
              {[5, 10, 15, 20].map((tick, i) => (
                <text key={tick} x="4" y={58 - i * 14} className="elab-founder-review-console__chart-axis-y">
                  {tick}
                </text>
              ))}
              <polyline
                fill="none"
                stroke="rgba(197, 160, 89, 0.82)"
                strokeWidth="2"
                points={REVISION_POINTS.map((_, i) => `${36 + i * 38},${60 - CHART_HEIGHTS[i]}`).join(' ')}
              />
              {REVISION_POINTS.map((revision, i) => {
                const isActive = revision === model.revision || (activeRevisionIndex < 0 && i === REVISION_POINTS.length - 1);
                const cy = 60 - CHART_HEIGHTS[i];
                const cx = 36 + i * 38;
                return (
                  <g key={revision}>
                    <circle
                      cx={cx}
                      cy={cy}
                      r={isActive ? 5 : 3}
                      fill={isActive ? 'var(--elab-gold)' : 'rgba(255, 255, 255, 0.32)'}
                    />
                    {isActive ? (
                      <text x={cx} y={cy - 10} textAnchor="middle" className="elab-founder-review-console__chart-rev-label">
                        {revision}
                      </text>
                    ) : null}
                    <text x={cx} y="68" textAnchor="middle" className="elab-founder-review-console__chart-axis-x">
                      {revision}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
          {model.isStale ? <p className="elab-founder-review-console__warn">Stale reference warning</p> : null}
        </article>
      </div>
    </section>
  );
}
