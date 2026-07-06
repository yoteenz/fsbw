import { useNavigate } from 'react-router-dom';
import { useQaSimulationEngineState } from '../../../../hooks/useQaSimulationEngineState';
import { QA_SIMULATION_ENGINE_ACCENT } from '../../../../studio-os-core/qa-simulation-engine';
import { adminStudioQaSimulationEnginePath } from '../../../../utils/adminStudioRoutes';
import { ExecutiveHealthRing, ExecutiveSecondaryCard, eiaActionBtn, eiaCaption } from '../executive-ia';

/** Mission Control — QA Simulation Engine™ preview (M144). */
export function MissionControlQaSimulationEnginePanel() {
  const navigate = useNavigate();
  const { profile } = useQaSimulationEngineState();

  if (!profile) {
    return (
      <ExecutiveSecondaryCard title="QA SIMULATION ENGINE™">
        <p style={{ ...eiaCaption, fontSize: '7px' }}>PRACTICE FIELD LOADING…</p>
      </ExecutiveSecondaryCard>
    );
  }

  return (
    <ExecutiveSecondaryCard title="QA SIMULATION ENGINE™ · PRACTICE FIELD">
      <div className="flex items-center gap-3 mb-3">
        <ExecutiveHealthRing value={profile.simulationScore} size={52} label="QS" accent={QA_SIMULATION_ENGINE_ACCENT} />
        <div>
          <p style={{ ...eiaCaption, fontFamily: '"Futura PT Medium"', fontSize: '9px' }}>
            {profile.simulationsPassed}/{profile.simulationsRun} PASSED · GATE {profile.productionGateStatus.toUpperCase()}
          </p>
          <p style={{ ...eiaCaption, fontSize: '7px' }}>
            {profile.averageSuccessRate}% avg success · rehearse before production
          </p>
        </div>
      </div>
      <p style={{ ...eiaCaption, fontSize: '7px', marginBottom: 6, lineHeight: 1.45 }}>
        {profile.dockSimulationLine.slice(0, 100)}…
      </p>
      <button type="button" onClick={() => navigate(adminStudioQaSimulationEnginePath())} style={eiaActionBtn}>
        OPEN QA SIMULATION ENGINE →
      </button>
    </ExecutiveSecondaryCard>
  );
}
