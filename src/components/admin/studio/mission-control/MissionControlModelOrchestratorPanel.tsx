import { useNavigate } from 'react-router-dom';
import { useModelOrchestratorState } from '../../../../hooks/useModelOrchestratorState';
import { MODEL_ORCHESTRATOR_ACCENT, ORCHESTRATOR_PROVIDER_LABELS } from '../../../../studio-os-core/model-orchestrator';
import { adminStudioModelOrchestratorPath } from '../../../../utils/adminStudioRoutes';
import { ExecutiveHealthRing, ExecutiveSecondaryCard, eiaActionBtn, eiaCaption } from '../executive-ia';

/** Mission Control — Model Orchestrator™ preview (M123). */
export function MissionControlModelOrchestratorPanel() {
  const navigate = useNavigate();
  const { profile } = useModelOrchestratorState();

  if (!profile) {
    return (
      <ExecutiveSecondaryCard title="MODEL ORCHESTRATOR™">
        <p style={{ ...eiaCaption, fontSize: '7px' }}>ORCHESTRATOR LOADING…</p>
      </ExecutiveSecondaryCard>
    );
  }

  return (
    <ExecutiveSecondaryCard title="MODEL ORCHESTRATOR™ · AI SWAP ENGINE™">
      <div className="flex items-center gap-3 mb-3">
        <ExecutiveHealthRing value={profile.orchestratorScore} size={52} label="ORCH" accent={MODEL_ORCHESTRATOR_ACCENT} />
        <div>
          <p style={{ ...eiaCaption, fontFamily: '"Futura PT Medium"', fontSize: '9px' }}>
            {ORCHESTRATOR_PROVIDER_LABELS[profile.activeProvider].toUpperCase()} · FAILOVER {profile.failoverHealthPct}% · {profile.swapProtectedFeatures.length} PROTECTED
          </p>
          <p style={{ ...eiaCaption, fontSize: '7px' }}>MODELS CHANGE · STUDIO INTELLIGENCE REMAINS</p>
        </div>
      </div>
      <p style={{ ...eiaCaption, fontSize: '7px', marginBottom: 6, lineHeight: 1.45 }}>
        {profile.dockOrchestratorLine.slice(0, 100)}…
      </p>
      <button type="button" onClick={() => navigate(adminStudioModelOrchestratorPath())} style={eiaActionBtn}>
        OPEN MODEL ORCHESTRATOR →
      </button>
    </ExecutiveSecondaryCard>
  );
}
