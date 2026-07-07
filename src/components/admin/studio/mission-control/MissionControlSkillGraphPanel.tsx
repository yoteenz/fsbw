import { useNavigate } from 'react-router-dom';
import { useSkillGraphState } from '../../../../hooks/useSkillGraphState';
import { SKILL_GRAPH_ACCENT } from '../../../../studio-os-core/skill-graph';
import { adminStudioSkillGraphPath } from '../../../../utils/adminStudioRoutes';
import { ExecutiveHealthRing, ExecutiveSecondaryCard, eiaActionBtn, eiaCaption } from '../executive-ia';

/** Mission Control — Skill Graph™ preview (M165). */
export function MissionControlSkillGraphPanel() {
  const navigate = useNavigate();
  const { profile } = useSkillGraphState();

  if (!profile) {
    return (
      <ExecutiveSecondaryCard title="SKILL GRAPH™">
        <p style={{ ...eiaCaption, fontSize: '7px' }}>CAPABILITY MAPPING LOADING…</p>
      </ExecutiveSecondaryCard>
    );
  }

  return (
    <ExecutiveSecondaryCard title="SKILL GRAPH™ · CAPABILITY MAP">
      <div className="flex items-center gap-3 mb-3">
        <ExecutiveHealthRing value={profile.graphScore} size={52} label="SG" accent={SKILL_GRAPH_ACCENT} />
        <div>
          <p style={{ ...eiaCaption, fontFamily: '"Futura PT Medium"', fontSize: '9px' }}>
            {profile.skillsTracked} SKILLS · {profile.mentorsAvailable} MENTORS
          </p>
          <p style={{ ...eiaCaption, fontSize: '7px' }}>
            {profile.gapsDetected} gaps · searchable assets
          </p>
        </div>
      </div>
      <p style={{ ...eiaCaption, fontSize: '7px', marginBottom: 6, lineHeight: 1.45 }}>
        {profile.insights[0]?.insight.slice(0, 100) ?? profile.dockSkillLine.slice(0, 100)}…
      </p>
      <button type="button" onClick={() => navigate(adminStudioSkillGraphPath())} style={eiaActionBtn}>
        OPEN SKILL GRAPH →
      </button>
    </ExecutiveSecondaryCard>
  );
}
