import { useNavigate } from 'react-router-dom';
import { usePromptQaState } from '../../../../hooks/usePromptQaState';
import { PROMPT_QA_ACCENT } from '../../../../studio-os-core/prompt-qa';
import { adminStudioPromptQaPath } from '../../../../utils/adminStudioRoutes';
import { ExecutiveHealthRing, ExecutiveSecondaryCard, eiaActionBtn, eiaCaption } from '../executive-ia';

/** Mission Control — Prompt QA™ preview (M155). */
export function MissionControlPromptQaPanel() {
  const navigate = useNavigate();
  const { profile } = usePromptQaState();

  if (!profile) {
    return (
      <ExecutiveSecondaryCard title="PROMPT QA™">
        <p style={{ ...eiaCaption, fontSize: '7px' }}>PROMPT VALIDATION LOADING…</p>
      </ExecutiveSecondaryCard>
    );
  }

  return (
    <ExecutiveSecondaryCard title="PROMPT QA™ · MISSION-CRITICAL INFRASTRUCTURE">
      <div className="flex items-center gap-3 mb-3">
        <ExecutiveHealthRing value={profile.overallQaScore} size={52} label="PQ" accent={PROMPT_QA_ACCENT} />
        <div>
          <p style={{ ...eiaCaption, fontFamily: '"Futura PT Medium"', fontSize: '9px' }}>
            {profile.promptsAudited} PROMPTS · {profile.findingsOpen} FINDINGS
          </p>
          <p style={{ ...eiaCaption, fontSize: '7px' }}>
            Prompts are infrastructure · not fragile text
          </p>
        </div>
      </div>
      <p style={{ ...eiaCaption, fontSize: '7px', marginBottom: 6, lineHeight: 1.45 }}>
        {profile.dockQaLine.slice(0, 110)}…
      </p>
      <button type="button" onClick={() => navigate(adminStudioPromptQaPath())} style={eiaActionBtn}>
        OPEN PROMPT QA →
      </button>
    </ExecutiveSecondaryCard>
  );
}
