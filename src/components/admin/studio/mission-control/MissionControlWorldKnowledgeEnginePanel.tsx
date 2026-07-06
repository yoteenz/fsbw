import { useNavigate } from 'react-router-dom';
import { useWorldKnowledgeEngineState } from '../../../../hooks/useWorldKnowledgeEngineState';
import { WORLD_KNOWLEDGE_ACCENT } from '../../../../studio-os-core/world-knowledge-engine';
import { adminStudioWorldKnowledgeEnginePath } from '../../../../utils/adminStudioRoutes';
import { ExecutiveHealthRing, ExecutiveSecondaryCard, eiaActionBtn, eiaCaption } from '../executive-ia';

/** Mission Control — World Knowledge Engine™ external intelligence preview (M117). */
export function MissionControlWorldKnowledgeEnginePanel() {
  const navigate = useNavigate();
  const { profile } = useWorldKnowledgeEngineState();

  if (!profile) {
    return (
      <ExecutiveSecondaryCard title="WORLD KNOWLEDGE ENGINE™">
        <p style={{ ...eiaCaption, fontSize: '7px' }}>WORLD KNOWLEDGE ENGINE™ LOADING…</p>
      </ExecutiveSecondaryCard>
    );
  }

  const daily = profile.briefings.find((b) => b.type === 'daily');
  const risk = profile.briefings.find((b) => b.type === 'risk-alert');

  return (
    <ExecutiveSecondaryCard title="WORLD KNOWLEDGE ENGINE™ · OUTSIDE WORLD">
      <div className="flex items-center gap-3 mb-3">
        <ExecutiveHealthRing value={profile.worldKnowledgeScore} size={52} label="FILTERED" accent={WORLD_KNOWLEDGE_ACCENT} />
        <div>
          <p style={{ ...eiaCaption, fontFamily: '"Futura PT Medium"', fontSize: '9px' }}>
            {profile.signalsSurfaced}/{profile.signalsMonitored} RELEVANT · {profile.worldKnowledgeScore}% WORLD KNOWLEDGE
          </p>
          <p style={{ ...eiaCaption, fontSize: '7px' }}>INFORMATION FINDS YOU</p>
        </div>
      </div>
      <p style={{ ...eiaCaption, fontSize: '7px', marginBottom: 6, lineHeight: 1.45 }}>
        {(risk?.summary ?? daily?.summary ?? profile.dockWorldLine).slice(0, 100)}…
      </p>
      <p style={{ ...eiaCaption, fontSize: '7px', color: WORLD_KNOWLEDGE_ACCENT, marginBottom: 8 }}>
        {profile.industryFilterSummary.slice(0, 90)}…
      </p>
      <button type="button" onClick={() => navigate(adminStudioWorldKnowledgeEnginePath())} style={eiaActionBtn}>
        OPEN WORLD KNOWLEDGE ENGINE →
      </button>
    </ExecutiveSecondaryCard>
  );
}
