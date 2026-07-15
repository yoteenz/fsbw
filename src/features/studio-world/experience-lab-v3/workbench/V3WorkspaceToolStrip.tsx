import type { V3CoreWorkspaceId, V3WorkbenchToolId } from '../experience-lab-v3.types';
import { resolveV3WorkbenchTools } from '../registry/v3-workbench-registry';
import { useExperienceLabV3Store } from '../store/ExperienceLabV3Store';
import { ExperienceLabIcon } from '../../icons/ExperienceLabIcon';

type Props = {
  workspace: V3CoreWorkspaceId;
};

/** Workspace-specific tool strip — swaps above V2 workbench without modifying V2. */
export function V3WorkspaceToolStrip({ workspace }: Props) {
  const { state, setWorkbenchTool } = useExperienceLabV3Store();
  const tools = resolveV3WorkbenchTools(workspace);
  const activeTool = state.activeWorkbenchTool;

  return (
    <div
      className="elab-v3-ws-toolstrip"
      role="toolbar"
      aria-label={`${workspace} workbench tools`}
      data-elab-v3-workspace-tools={workspace}
    >
      {tools.map((tool) => (
        <button
          key={tool.id}
          type="button"
          className={`elab-founder-wb__tool${activeTool === tool.id ? ' elab-founder-wb__tool--active' : ''}`}
          title={tool.label}
          aria-pressed={activeTool === tool.id}
          onClick={() => setWorkbenchTool(activeTool === tool.id ? null : (tool.id as V3WorkbenchToolId))}
        >
          <span className="elab-founder-wb__tool-icon" aria-hidden>
            <ExperienceLabIcon name={tool.icon} size="md" decorative active={activeTool === tool.id} />
          </span>
          <span className="elab-founder-wb__tool-label">
            <span className="elab-founder-wb__tool-label-line">{tool.label}</span>
          </span>
        </button>
      ))}
    </div>
  );
}
