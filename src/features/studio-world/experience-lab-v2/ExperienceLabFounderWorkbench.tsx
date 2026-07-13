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
import type { ExperienceLabIconName } from '../icons/experience-lab-icon-registry';
import { ExperienceLabIcon } from '../icons/ExperienceLabIcon';

type Props = {
  model: ExperienceLabV2ViewModel;
  activeTab?: ElabWorkbenchTab;
  onTabChange?: (tab: ElabWorkbenchTab) => void;
};

function WorkbenchNavIcon({ name }: { name: ExperienceLabIconName }) {
  return <ExperienceLabIcon name={name} size="sm" decorative />;
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
              <span className="elab-founder-wb__tool-icon" aria-hidden>
                <ExperienceLabIcon name={tool.icon} size="md" decorative active={activeTool === tool.id} />
              </span>
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
                <WorkbenchNavIcon name={item.icon} />
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
                <WorkbenchNavIcon name={item.icon} />
              </span>
              <span className="elab-founder-wb__nav-label">{item.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </section>
  );
}
