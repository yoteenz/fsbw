import { useNavigate } from 'react-router-dom';
import { useWorkflowEngineState } from '../../../../hooks/useWorkflowEngineState';
import { WORKFLOW_ENGINE_ACCENT } from '../../../../studio-os-core/workflow-engine';
import { adminStudioWorkflowEnginePath } from '../../../../utils/adminStudioRoutes';
import { ExecutiveHealthRing, ExecutiveSecondaryCard, eiaActionBtn, eiaCaption } from '../executive-ia';

/** Mission Control — Workflow Engine™ preview (M138). */
export function MissionControlWorkflowEnginePanel() {
  const navigate = useNavigate();
  const { profile } = useWorkflowEngineState();

  if (!profile) {
    return (
      <ExecutiveSecondaryCard title="WORKFLOW ENGINE™">
        <p style={{ ...eiaCaption, fontSize: '7px' }}>ORGANIZATIONAL CHOREOGRAPHY LOADING…</p>
      </ExecutiveSecondaryCard>
    );
  }

  return (
    <ExecutiveSecondaryCard title="WORKFLOW ENGINE™ · LIVING SYSTEMS">
      <div className="flex items-center gap-3 mb-3">
        <ExecutiveHealthRing value={profile.choreographyScore} size={52} label="WE" accent={WORKFLOW_ENGINE_ACCENT} />
        <div>
          <p style={{ ...eiaCaption, fontFamily: '"Futura PT Medium"', fontSize: '9px' }}>
            {profile.publishedWorkflowCount} PUBLISHED · {profile.nodeCatalog.length} NODES
          </p>
          <p style={{ ...eiaCaption, fontSize: '7px' }}>{profile.analyticsScorePct}% ANALYTICS · VISUAL BUILDER</p>
        </div>
      </div>
      <p style={{ ...eiaCaption, fontSize: '7px', marginBottom: 6, lineHeight: 1.45 }}>
        {profile.dockChoreographyLine.slice(0, 100)}…
      </p>
      <button type="button" onClick={() => navigate(adminStudioWorkflowEnginePath())} style={eiaActionBtn}>
        OPEN WORKFLOW ENGINE →
      </button>
    </ExecutiveSecondaryCard>
  );
}
