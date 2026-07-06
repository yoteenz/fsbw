import { useNavigate } from 'react-router-dom';
import { useAiRedTeamState } from '../../../../hooks/useAiRedTeamState';
import { AI_RED_TEAM_ACCENT } from '../../../../studio-os-core/ai-red-team';
import { adminStudioAiRedTeamPath } from '../../../../utils/adminStudioRoutes';
import { ExecutiveHealthRing, ExecutiveSecondaryCard, eiaActionBtn, eiaCaption } from '../executive-ia';

/** Mission Control — AI Red Team™ preview (M146). */
export function MissionControlAiRedTeamPanel() {
  const navigate = useNavigate();
  const { profile } = useAiRedTeamState();

  if (!profile) {
    return (
      <ExecutiveSecondaryCard title="AI RED TEAM™">
        <p style={{ ...eiaCaption, fontSize: '7px' }}>ADVERSARIAL STRESS TEST LOADING…</p>
      </ExecutiveSecondaryCard>
    );
  }

  return (
    <ExecutiveSecondaryCard title="AI RED TEAM™ · ASSUME WRONG UNTIL PROVEN">
      <div className="flex items-center gap-3 mb-3">
        <ExecutiveHealthRing value={profile.redTeamScore} size={52} label="RT" accent={AI_RED_TEAM_ACCENT} />
        <div>
          <p style={{ ...eiaCaption, fontFamily: '"Futura PT Medium"', fontSize: '9px' }}>
            {profile.openFindings} WEAKNESSES · {profile.criticalFindings} CRITICAL
          </p>
          <p style={{ ...eiaCaption, fontSize: '7px' }}>
            {profile.challengesRun} challenges · question everything
          </p>
        </div>
      </div>
      <p style={{ ...eiaCaption, fontSize: '7px', marginBottom: 6, lineHeight: 1.45 }}>
        {profile.dockRedTeamLine.slice(0, 100)}…
      </p>
      <button type="button" onClick={() => navigate(adminStudioAiRedTeamPath())} style={eiaActionBtn}>
        OPEN AI RED TEAM →
      </button>
    </ExecutiveSecondaryCard>
  );
}
