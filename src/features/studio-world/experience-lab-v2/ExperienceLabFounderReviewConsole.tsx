import { useCallback, useMemo, useState } from 'react';
import type { ExperienceLabV2ViewModel } from './experience-lab-v2.types';
import { ELAB_V2_COMPOSITION } from './experience-lab-v2-composition';
import type { LiveWorkspaceReviewEntry } from './live-workspace/ExperienceLabLiveWorkspaceViewModel';

type Props = {
  model: ExperienceLabV2ViewModel;
};

function reviewEntryLabel(entry: LiveWorkspaceReviewEntry): string {
  return `r${entry.revision} · ${entry.outputType.toUpperCase()}`;
}

/** Symmetric founder review row — design brief · review wall · revision timeline. */
export function ExperienceLabFounderReviewConsole({ model }: Props) {
  const live = model.liveWorkspace;
  const fr = model.founderRender;
  const brief = live?.designBrief;
  const reviewEntries = live?.founderReviewEntries ?? [];
  const timelineEvents = live?.timelineEvents ?? [];

  const [activeReviewIndex, setActiveReviewIndex] = useState(0);

  const activeEntry = reviewEntries[activeReviewIndex] ?? null;
  const previewUrl = activeEntry?.previewThumbnailUrl ?? fr?.previewArtifactUrl ?? null;

  const chartPoints = useMemo(() => {
    if (timelineEvents.length === 0) {
      return [{ revision: model.revision, height: 24, timestamp: model.revision }];
    }
    const revisions = [...new Set(timelineEvents.map((e) => e.revision))].sort((a, b) => a - b);
    return revisions.map((revision) => {
      const events = timelineEvents.filter((e) => e.revision === revision);
      const height = Math.min(48, 12 + events.length * 8);
      return { revision, height, timestamp: events[0]?.timestamp ?? '' };
    });
  }, [timelineEvents, model.revision]);

  const handlePrev = useCallback(() => {
    setActiveReviewIndex((i) => (reviewEntries.length ? (i - 1 + reviewEntries.length) % reviewEntries.length : 0));
  }, [reviewEntries.length]);

  const handleNext = useCallback(() => {
    setActiveReviewIndex((i) => (reviewEntries.length ? (i + 1) % reviewEntries.length : 0));
  }, [reviewEntries.length]);

  return (
    <section
      className="elab-founder-review-console"
      {...{ [ELAB_V2_COMPOSITION.founderReviewConsole]: '' }}
      aria-label="Founder review console"
    >
      <div className="elab-founder-review-console__grid">
        <article className="elab-founder-review-console__panel elab-founder-review-console__panel--brief">
          <h3 className="elab-founder-review-console__title">DESIGN BRIEF</h3>
          <p className="elab-founder-review-console__brief">{brief?.currentObjective ?? model.charterSummary}</p>
          {brief ? (
            <p className="elab-founder-review-console__mood">
              {brief.programLabel} · {brief.variantName} · r{brief.packageRevision} · {brief.packageStatus.toUpperCase()}
            </p>
          ) : null}
          {brief && brief.blockers.length > 0 ? (
            <p className="elab-founder-review-console__warn">{brief.blockers[0]}</p>
          ) : null}
        </article>

        <article className="elab-founder-review-console__panel elab-founder-review-console__panel--review">
          <h3 className="elab-founder-review-console__title">FOUNDER REVIEW WALL</h3>
          <p className="elab-founder-review-console__hint">
            {live?.isHistoricalPreviewMode ? 'HISTORICAL PREVIEW' : `${reviewEntries.length} REVISION${reviewEntries.length === 1 ? '' : 'S'}`}
          </p>
          <div className="elab-founder-review-console__player" role="img" aria-label="Founder render preview">
            <button type="button" className="elab-founder-review-console__nav" aria-label="Previous review" onClick={handlePrev} disabled={reviewEntries.length < 2}>
              ‹
            </button>
            <div className="elab-founder-review-console__player-stage">
              {previewUrl ? (
                <img src={previewUrl} alt="" className="elab-founder-review-console__preview" />
              ) : (
                <div className="elab-founder-review-console__player-placeholder">
                  <span className="elab-founder-review-console__play" aria-hidden>
                    ▶
                  </span>
                </div>
              )}
            </div>
            <button type="button" className="elab-founder-review-console__nav" aria-label="Next review" onClick={handleNext} disabled={reviewEntries.length < 2}>
              ›
            </button>
          </div>
          <div className="elab-founder-review-console__dots" aria-hidden>
            {reviewEntries.length > 0
              ? reviewEntries.map((entry, i) => (
                  <span
                    key={entry.id}
                    className={`elab-founder-review-console__dot${i === activeReviewIndex ? ' elab-founder-review-console__dot--active' : ''}`}
                  />
                ))
              : [0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className={`elab-founder-review-console__dot${i === 0 ? ' elab-founder-review-console__dot--active' : ''}`}
                  />
                ))}
          </div>
          {activeEntry ? (
            <p className="elab-founder-review-console__hint">{reviewEntryLabel(activeEntry)} · {activeEntry.approvalState.toUpperCase()}</p>
          ) : null}
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
                points={chartPoints.map((p, i) => `${36 + i * (220 / Math.max(chartPoints.length - 1, 1))},${60 - p.height}`).join(' ')}
              />
              {chartPoints.map((point, i) => {
                const isActive = point.revision === model.revision || (i === chartPoints.length - 1 && model.revision === 0);
                const cy = 60 - point.height;
                const cx = 36 + i * (220 / Math.max(chartPoints.length - 1, 1));
                return (
                  <g key={`${point.revision}-${i}`}>
                    <circle
                      cx={cx}
                      cy={cy}
                      r={isActive ? 5 : 3}
                      fill={isActive ? 'var(--elab-gold)' : 'rgba(255, 255, 255, 0.32)'}
                    />
                    {isActive ? (
                      <text x={cx} y={cy - 10} textAnchor="middle" className="elab-founder-review-console__chart-rev-label">
                        {point.revision}
                      </text>
                    ) : null}
                    <text x={cx} y="68" textAnchor="middle" className="elab-founder-review-console__chart-axis-x">
                      {point.revision}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
          {model.isStale ? <p className="elab-founder-review-console__warn">Stale reference warning</p> : null}
          {timelineEvents.length === 0 ? (
            <p className="elab-founder-review-console__hint">No lifecycle events yet</p>
          ) : null}
        </article>
      </div>
    </section>
  );
}
