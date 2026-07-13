import { useState } from 'react';
import { ELAB_V2_COMPOSITION } from './experience-lab-v2-composition';
import {
  EXPERIENCE_LAB_WORKBENCH_EDITING_TOOLS,
  type WorkbenchEditingToolId,
} from './experience-lab-v2-workbench-config';

type Props = {
  onMoreOpen?: () => void;
};

/** Editing tools strip — shared with tiered workbench middle row. */
export function ExperienceLabWorkbenchDock({ onMoreOpen: _onMoreOpen }: Props) {
  const [activeTool, setActiveTool] = useState<WorkbenchEditingToolId>('architectural-tools');

  return (
    <nav className="elab-wb-dock elab-wb-dock--pro" {...{ [ELAB_V2_COMPOSITION.workbenchDock]: '' }} aria-label="Experience Lab tools">
      <div className="elab-wb-dock__bar elab-founder-wb__tools-scroll" role="toolbar">
        {EXPERIENCE_LAB_WORKBENCH_EDITING_TOOLS.map((tool) => (
          <button
            key={tool.id}
            type="button"
            className={`elab-wb-dock__tool elab-founder-wb__tool${activeTool === tool.id ? ' elab-founder-wb__tool--active' : ''}`}
            title={tool.label}
            aria-pressed={activeTool === tool.id}
            onClick={() => setActiveTool(tool.id)}
          >
            <span className="elab-wb-dock__icon elab-founder-wb__tool-icon" aria-hidden>{tool.icon}</span>
            <span className="elab-wb-dock__label elab-founder-wb__tool-label">{tool.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
