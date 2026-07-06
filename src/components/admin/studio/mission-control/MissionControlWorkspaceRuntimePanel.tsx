import { useNavigate } from 'react-router-dom';
import { useWorkspaceRuntimeState } from '../../../../hooks/useWorkspaceRuntimeState';
import { WORKSPACE_RUNTIME_ACCENT } from '../../../../studio-os-core/workspace-runtime';
import { adminStudioWorkspaceRuntimePath } from '../../../../utils/adminStudioRoutes';
import { ExecutiveHealthRing, ExecutiveSecondaryCard, eiaActionBtn, eiaCaption } from '../executive-ia';

/** Mission Control — Workspace Runtime™ preview (M136). */
export function MissionControlWorkspaceRuntimePanel() {
  const navigate = useNavigate();
  const { profile } = useWorkspaceRuntimeState();

  if (!profile) {
    return (
      <ExecutiveSecondaryCard title="WORKSPACE RUNTIME™">
        <p style={{ ...eiaCaption, fontSize: '7px' }}>ISOLATED RUNTIME LOADING…</p>
      </ExecutiveSecondaryCard>
    );
  }

  return (
    <ExecutiveSecondaryCard title="WORKSPACE RUNTIME™ · INDEPENDENT HQ">
      <div className="flex items-center gap-3 mb-3">
        <ExecutiveHealthRing value={profile.runtimeScore} size={52} label="WR" accent={WORKSPACE_RUNTIME_ACCENT} />
        <div>
          <p style={{ ...eiaCaption, fontFamily: '"Futura PT Medium"', fontSize: '9px' }}>
            {profile.components.length} COMPONENTS · {profile.isolationScorePct}% ISOLATED
          </p>
          <p style={{ ...eiaCaption, fontSize: '7px' }}>{profile.healthDashboardScore}% HEALTH · NEVER SHARED</p>
        </div>
      </div>
      <p style={{ ...eiaCaption, fontSize: '7px', marginBottom: 6, lineHeight: 1.45 }}>
        {profile.dockRuntimeLine.slice(0, 100)}…
      </p>
      <button type="button" onClick={() => navigate(adminStudioWorkspaceRuntimePath())} style={eiaActionBtn}>
        OPEN WORKSPACE RUNTIME →
      </button>
    </ExecutiveSecondaryCard>
  );
}
