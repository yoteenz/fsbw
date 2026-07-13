import { useState } from 'react';
import type { ExperienceLabV2ViewModel } from './experience-lab-v2.types';
import type { ElabWorkbenchTab } from './experience-lab-v2-layout';
import { ELAB_V2_COMPOSITION } from './experience-lab-v2-composition';

const REVISIONS = [13, 14, 15, 16, 17, 18] as const;
const TABS: { id: ElabWorkbenchTab; label: string }[] = [
  { id: 'review', label: 'Review' },
  { id: 'timeline', label: 'Timeline' },
  { id: 'diagnostics', label: 'Diagnostics' },
  { id: 'brief', label: 'Brief' },
];

type Props = {
  model: ExperienceLabV2ViewModel;
  activeTab?: ElabWorkbenchTab;
  onTabChange?: (tab: ElabWorkbenchTab) => void;
};

function BriefPane({ model }: { model: ExperienceLabV2ViewModel }) {
  return (
    <div className="elab-founder-wb__pane elab-founder-wb__pane--scroll">
      <p className="elab-founder-wb__brief-text">{model.charterSummary}</p>
      <p className="elab-founder-wb__mood">Mood: <strong>Luxury / Power / Innovation</strong></p>
    </div>
  );
}

function ReviewPane({ model }: { model: ExperienceLabV2ViewModel }) {
  const fr = model.founderRender;
  return (
    <div className="elab-founder-wb__pane">
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
    </div>
  );
}

function TimelinePane({ model }: { model: ExperienceLabV2ViewModel }) {
  return (
    <div className="elab-founder-wb__pane elab-founder-wb__pane--scroll">
      <div className="elab-founder-wb__chart" aria-hidden>
        <svg viewBox="0 0 240 60" className="elab-founder-wb__chart-svg">
          <polyline fill="none" stroke="rgba(201,169,98,0.8)" strokeWidth="2" points="0,50 40,45 80,38 120,28 160,18 200,10 240,5" />
          {REVISIONS.map((r, i) => (
            <circle key={r} cx={i * 48} cy={50 - i * 8} r="3" fill={r === model.revision ? '#c9a962' : 'rgba(255,255,255,0.3)'} />
          ))}
        </svg>
      </div>
      <p className="elab-founder-wb__rev-current">Current: r{model.revision}</p>
      {model.isStale ? <p className="elab-founder-wb__warn">Stale reference warning</p> : null}
    </div>
  );
}

function DiagnosticsPane({ model }: { model: ExperienceLabV2ViewModel }) {
  const fr = model.founderRender;
  return (
    <div className="elab-founder-wb__pane elab-founder-wb__pane--scroll">
      <p>{model.costEstimate} · {fr?.modelRoute ?? '—'}</p>
      {model.diagnostics.map((d) => (
        <p key={d} className="elab-founder-wb__diag-line">{d}</p>
      ))}
    </div>
  );
}

/** Founder Review Workbench — single tabbed surface (desktop + mobile parity). */
export function ExperienceLabFounderWorkbench({ model, activeTab: controlledTab, onTabChange }: Props) {
  const [internalTab, setInternalTab] = useState<ElabWorkbenchTab>('review');
  const tab = controlledTab ?? internalTab;
  const setTab = onTabChange ?? setInternalTab;

  return (
    <section
      className="elab-founder-wb elab-founder-wb--tabbed"
      {...{ [ELAB_V2_COMPOSITION.founderWorkbench]: '' }}
      aria-label="Founder review workbench"
    >
      <div className="elab-founder-wb__tabs" {...{ [ELAB_V2_COMPOSITION.workbenchTabs]: '' }} role="tablist">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            className={`elab-founder-wb__tab${tab === t.id ? ' elab-founder-wb__tab--active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="elab-founder-wb__tab-panel" role="tabpanel">
        {tab === 'brief' ? <BriefPane model={model} /> : null}
        {tab === 'review' ? <ReviewPane model={model} /> : null}
        {tab === 'timeline' ? <TimelinePane model={model} /> : null}
        {tab === 'diagnostics' ? <DiagnosticsPane model={model} /> : null}
      </div>
    </section>
  );
}
