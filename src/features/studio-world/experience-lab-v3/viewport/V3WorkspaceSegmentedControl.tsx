import { V3_CORE_WORKSPACES } from '../registry/v3-workspace-registry';
import type { V3CoreWorkspaceId } from '../experience-lab-v3.types';
import { ELAB_V3_COMPOSITION } from '../experience-lab-v3-composition';

type Props = {
  activeWorkspace: V3CoreWorkspaceId;
  onSelect: (id: V3CoreWorkspaceId) => void;
};

/** iOS-style segmented workspace control — syncs with swipe pager. */
export function V3WorkspaceSegmentedControl({ activeWorkspace, onSelect }: Props) {
  return (
    <div
      className="elab-v3-segmented"
      role="tablist"
      aria-label="Viewport workspaces"
      {...{ [ELAB_V3_COMPOSITION.workspacePills]: '' }}
    >
      {V3_CORE_WORKSPACES.map((ws) => {
        const isActive = ws.id === activeWorkspace;
        return (
          <button
            key={ws.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            className={`elab-v3-segmented__item${isActive ? ' is-active' : ''}`}
            onClick={() => onSelect(ws.id)}
          >
            {ws.label}
          </button>
        );
      })}
    </div>
  );
}
