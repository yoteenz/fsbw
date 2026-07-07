import { useNavigate } from 'react-router-dom';
import { useRoleIntelligenceState } from '../../../../hooks/useRoleIntelligenceState';
import { ROLE_INTELLIGENCE_ACCENT } from '../../../../studio-os-core/role-intelligence';
import { adminStudioRoleIntelligencePath } from '../../../../utils/adminStudioRoutes';
import { ExecutiveHealthRing, ExecutiveSecondaryCard, eiaActionBtn, eiaCaption } from '../executive-ia';

/** Mission Control — Role Intelligence™ preview (M166). */
export function MissionControlRoleIntelligencePanel() {
  const navigate = useNavigate();
  const { profile } = useRoleIntelligenceState();

  if (!profile) {
    return (
      <ExecutiveSecondaryCard title="ROLE INTELLIGENCE™">
        <p style={{ ...eiaCaption, fontSize: '7px' }}>ROLE MAPPING LOADING…</p>
      </ExecutiveSecondaryCard>
    );
  }

  return (
    <ExecutiveSecondaryCard title="ROLE INTELLIGENCE™ · WORK NOT TITLES">
      <div className="flex items-center gap-3 mb-3">
        <ExecutiveHealthRing value={profile.intelligenceScore} size={52} label="RI" accent={ROLE_INTELLIGENCE_ACCENT} />
        <div>
          <p style={{ ...eiaCaption, fontFamily: '"Futura PT Medium"', fontSize: '9px' }}>
            {profile.rolesDefined} ROLES · {profile.peopleMapped} PEOPLE
          </p>
          <p style={{ ...eiaCaption, fontSize: '7px' }}>
            {profile.titleWorkGaps} title gaps · Role Evolution™ active
          </p>
        </div>
      </div>
      <p style={{ ...eiaCaption, fontSize: '7px', marginBottom: 6, lineHeight: 1.45 }}>
        {profile.insights[0]?.insight.slice(0, 100) ?? profile.dockRoleLine.slice(0, 100)}…
      </p>
      <button type="button" onClick={() => navigate(adminStudioRoleIntelligencePath())} style={eiaActionBtn}>
        OPEN ROLE INTELLIGENCE →
      </button>
    </ExecutiveSecondaryCard>
  );
}
