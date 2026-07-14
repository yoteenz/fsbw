import type { ExperienceLabV2ViewModel } from './experience-lab-v2.types';
import { ELAB_V2_COMPOSITION } from './experience-lab-v2-composition';

const REVISIONS = [13, 14, 15, 16, 17, 18] as const;

type Props = {
  model: ExperienceLabV2ViewModel;
  isCompact?: boolean;
};

function BriefPane({ model }: { model: ExperienceLabV2ViewModel }) {
  return (
    <div className="elab-founder-brief-row__pane">
      <p className="elab-founder-brief-row__brief-text">{model.charterSummary}</p>
      <p className="elab-founder-brief-row__mood">
        Mood: <strong>Luxury / Power / Innovation</strong>
      </p>
    </div>
  );
}

function ReviewPane({ model }: { model: ExperienceLabV2ViewModel }) {
  const fr = model.founderRender;
  return (
    <div className="elab-founder-brief-row__pane">
      <div className="elab-founder-brief-row__player">
        {fr?.previewArtifactUrl ? (
          <img src={fr.previewArtifactUrl} alt="Founder render preview" className="elab-founder-brief-row__preview" />
        ) : (
          <div className="elab-founder-brief-row__player-placeholder">
            <span className="elab-founder-brief-row__play" aria-hidden>
              ▶
            </span>
            <span>DRAG TO EXPLORE</span>
          </div>
        )}
      </div>
      <p className="elab-founder-brief-row__status">
        {fr?.status ?? 'no_preview'} · {fr?.roomDisplayName ?? model.departmentName}
      </p>
    </div>
  );
}

function TimelinePane({ model }: { model: ExperienceLabV2ViewModel }) {
  return (
    <div className="elab-founder-brief-row__pane">
      <div className="elab-founder-brief-row__chart" aria-hidden>
        <svg viewBox="0 0 240 60" className="elab-founder-brief-row__chart-svg">
          <polyline
            fill="none"
            stroke="rgba(201,169,98,0.8)"
            strokeWidth="2"
            points="0,50 40,45 80,38 120,28 160,18 200,10 240,5"
          />
          {REVISIONS.map((r, i) => (
            <circle
              key={r}
              cx={i * 48}
              cy={50 - i * 8}
              r="3"
              fill={r === model.revision ? '#c9a962' : 'rgba(255,255,255,0.3)'}
            />
          ))}
        </svg>
      </div>
      <p className="elab-founder-brief-row__rev-current">Current: r{model.revision}</p>
      {model.isStale ? <p className="elab-founder-brief-row__warn">Stale reference warning</p> : null}
    </div>
  );
}

/** Design Brief / Founder Review / Revision Timeline — overlaid on viewport environment. */
export function ExperienceLabFounderBriefRow({ model, isCompact }: Props) {
  return (
    <section
      className={`elab-founder-brief-row${isCompact ? ' elab-founder-brief-row--compact' : ''}`}
      {...{ [ELAB_V2_COMPOSITION.founderBriefRow]: '' }}
      aria-label="Founder review brief panels"
    >
      <article className="elab-founder-brief-row__zone elab-founder-brief-row__zone--brief">
        <h3 className="elab-founder-brief-row__zone-title">DESIGN BRIEF</h3>
        <BriefPane model={model} />
      </article>
      <article className="elab-founder-brief-row__zone elab-founder-brief-row__zone--review">
        <h3 className="elab-founder-brief-row__zone-title">FOUNDER REVIEW WALL</h3>
        <ReviewPane model={model} />
      </article>
      <article className="elab-founder-brief-row__zone elab-founder-brief-row__zone--timeline">
        <h3 className="elab-founder-brief-row__zone-title">REVISION TIMELINE</h3>
        <TimelinePane model={model} />
      </article>
    </section>
  );
}
