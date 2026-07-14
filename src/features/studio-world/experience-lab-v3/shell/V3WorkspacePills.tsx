import { useExperienceLabV3Store } from '../store/ExperienceLabV3Store';
import { ELAB_V3_COMPOSITION } from '../experience-lab-v3-composition';
import { V3_CORE_WORKSPACES } from '../registry/v3-workspace-registry';
import type { V3CoreWorkspaceId } from '../experience-lab-v3.types';

/** Workspace navigation pills — tap to jump; complements horizontal swipe. */
export function V3WorkspacePills() {
  const { state, setWorkspace } = useExperienceLabV3Store();

  return (
    <nav
      className="elab-v3-workspace-pills"
      {...{ [ELAB_V3_COMPOSITION.workspacePills]: '' }}
      aria-label="Core workspaces"
    >
      {V3_CORE_WORKSPACES.map((ws) => (
        <button
          key={ws.id}
          type="button"
          className={`elab-v3-workspace-pills__pill${state.activeWorkspace === ws.id ? ' is-active' : ''}`}
          aria-current={state.activeWorkspace === ws.id ? 'true' : undefined}
          onClick={() => setWorkspace(ws.id as V3CoreWorkspaceId)}
        >
          <span className="elab-v3-workspace-pills__label">{ws.label}</span>
          <span className="elab-v3-workspace-pills__sub">{ws.subtitle}</span>
        </button>
      ))}
    </nav>
  );
}
