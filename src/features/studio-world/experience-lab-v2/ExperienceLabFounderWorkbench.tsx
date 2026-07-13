import { useState } from 'react';
import type { ExperienceLabV2ViewModel } from './experience-lab-v2.types';
import type { ElabWorkbenchTab } from './experience-lab-v2-layout';
import { ELAB_V2_COMPOSITION } from './experience-lab-v2-composition';
import {
  EXPERIENCE_LAB_WORKBENCH_EDITING_TOOLS,
  EXPERIENCE_LAB_WORKBENCH_WORLD_NAV,
  resolveExperienceLabWorkbenchCenterLogoUrl,
  type WorkbenchEditingToolId,
  type WorkbenchWorldNavId,
} from './experience-lab-v2-workbench-config';

type Props = {
  model: ExperienceLabV2ViewModel;
  activeTab?: ElabWorkbenchTab;
  onTabChange?: (tab: ElabWorkbenchTab) => void;
};

function WorkbenchNavIcon({ kind }: { kind: 'dashboard' | 'globe' | 'marketplace' | 'command' }) {
  if (kind === 'dashboard') {
    return (
      <svg viewBox="0 0 16 16" width="14" height="14" focusable="false" aria-hidden>
        <path
          d="M2 14V6l6-4 6 4v8H9v-4H7v4H2z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.2"
        />
      </svg>
    );
  }
  if (kind === 'globe') {
    return (
      <svg viewBox="0 0 16 16" width="14" height="14" focusable="false" aria-hidden>
        <circle cx="8" cy="8" r="5.5" fill="none" stroke="currentColor" strokeWidth="1.1" />
        <path d="M2.5 8h11M8 2.5c1.8 1.6 2.8 3.8 2.8 5.5S9.8 11.9 8 13.5M8 2.5C6.2 4.1 5.2 6.3 5.2 8s1 3.9 2.8 5.5" fill="none" stroke="currentColor" strokeWidth="1" />
      </svg>
    );
  }
  if (kind === 'marketplace') {
    return (
      <svg viewBox="0 0 16 16" width="14" height="14" focusable="false" aria-hidden>
        <path d="M3 5l1-2h8l1 2v8H3V5z" fill="none" stroke="currentColor" strokeWidth="1.1" />
        <path d="M3 5h10" stroke="currentColor" strokeWidth="1.1" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" focusable="false" aria-hidden>
      <path d="M2 13V4l6-3 6 3v9H9V8H7v5H2z" fill="none" stroke="currentColor" strokeWidth="1.1" />
    </svg>
  );
}

/** Three-row Experience Lab Workbench — title · editing tools · world navigation. */
export function ExperienceLabFounderWorkbench({ model: _model }: Props) {
  const [activeTool, setActiveTool] = useState<WorkbenchEditingToolId>('architectural-tools');
  const [activeNav, setActiveNav] = useState<WorkbenchWorldNavId>('dashboard');
  const leftNav = EXPERIENCE_LAB_WORKBENCH_WORLD_NAV.slice(0, 2);
  const rightNav = EXPERIENCE_LAB_WORKBENCH_WORLD_NAV.slice(2);

  return (
    <section
      className="elab-founder-wb elab-founder-wb--tiered"
      {...{ [ELAB_V2_COMPOSITION.founderWorkbench]: '' }}
      aria-label="Experience Lab workbench"
    >
      <div className="elab-founder-wb__row elab-founder-wb__row--title">
        <h2 className="elab-founder-wb__title">EXPERIENCE LAB WORKBENCH</h2>
      </div>

      <div className="elab-founder-wb__row elab-founder-wb__row--tools">
        <div
          className="elab-founder-wb__tools-scroll"
          {...{ [ELAB_V2_COMPOSITION.workbenchTabs]: '' }}
          role="toolbar"
          aria-label="Editing tools"
        >
          {EXPERIENCE_LAB_WORKBENCH_EDITING_TOOLS.map((tool) => (
            <button
              key={tool.id}
              type="button"
              className={`elab-founder-wb__tool${activeTool === tool.id ? ' elab-founder-wb__tool--active' : ''}`}
              title={tool.label}
              aria-pressed={activeTool === tool.id}
              onClick={() => setActiveTool(tool.id)}
            >
              <span className="elab-founder-wb__tool-icon" aria-hidden>{tool.icon}</span>
              <span className="elab-founder-wb__tool-label">{tool.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="elab-founder-wb__row elab-founder-wb__row--world-nav">
        <nav className="elab-founder-wb__world-nav" aria-label="Studio World navigation">
          {leftNav.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`elab-founder-wb__nav-item${activeNav === item.id ? ' elab-founder-wb__nav-item--active' : ''}`}
              aria-current={activeNav === item.id ? 'page' : undefined}
              onClick={() => setActiveNav(item.id)}
            >
              <span className="elab-founder-wb__nav-icon">
                <WorkbenchNavIcon kind={item.icon} />
              </span>
              <span className="elab-founder-wb__nav-label">{item.label}</span>
            </button>
          ))}

          <div className="elab-founder-wb__nav-logo-wrap">
            <img
              className="elab-founder-wb__nav-logo"
              src={resolveExperienceLabWorkbenchCenterLogoUrl()}
              alt=""
              aria-hidden
              decoding="async"
            />
          </div>

          {rightNav.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`elab-founder-wb__nav-item${activeNav === item.id ? ' elab-founder-wb__nav-item--active' : ''}`}
              aria-current={activeNav === item.id ? 'page' : undefined}
              onClick={() => setActiveNav(item.id)}
            >
              <span className="elab-founder-wb__nav-icon">
                <WorkbenchNavIcon kind={item.icon} />
              </span>
              <span className="elab-founder-wb__nav-label">{item.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </section>
  );
}
