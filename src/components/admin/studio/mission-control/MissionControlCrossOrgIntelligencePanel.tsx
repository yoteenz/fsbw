import { useNavigate } from 'react-router-dom';
import { useCrossOrgIntelligenceState } from '../../../../hooks/useCrossOrgIntelligenceState';
import { ExecutiveHealthRing, ExecutiveSecondaryCard, eiaActionBtn, eiaCaption } from '../executive-ia';
import { adminStudioCrossOrgIntelligencePath } from '../../../../utils/adminStudioRoutes';
import { MC_VISUAL } from '../mission-control/missionControlTheme';

/** Mission Control — Cross-Organization Intelligence™ collaboration preview (M111). */
export function MissionControlCrossOrgIntelligencePanel() {
  const navigate = useNavigate();
  const { profile } = useCrossOrgIntelligenceState();

  if (!profile) {
    return (
      <ExecutiveSecondaryCard title="CROSS-ORG INTELLIGENCE™">
        <p style={{ ...eiaCaption, fontSize: '7px' }}>CROSS-ORG INTELLIGENCE™ LOADING…</p>
      </ExecutiveSecondaryCard>
    );
  }

  const topConn = profile.connectionSuggestions[0];

  return (
    <ExecutiveSecondaryCard title="CROSS-ORG INTELLIGENCE™ · TRUSTED CONNECTIONS">
      <div className="flex items-center gap-3 mb-3">
        <ExecutiveHealthRing value={profile.collaborationScore} size={52} label="TRUST" accent="#0284C7" />
        <div>
          <p style={{ ...eiaCaption, color: MC_VISUAL.black, fontFamily: '"Futura PT Medium"', fontSize: '9px' }}>
            {profile.connectionsSuggested} OPPORTUNITIES · {profile.networkMembers} NETWORK
          </p>
          <p style={{ ...eiaCaption, fontSize: '7px' }}>Collaboration, not surveillance</p>
        </div>
      </div>
      {topConn ? (
        <>
          <p style={{ ...eiaCaption, fontSize: '7px', marginBottom: 4, lineHeight: 1.45 }}>
            · {topConn.title} — permission required
          </p>
          <p style={{ ...eiaCaption, fontSize: '7px', color: '#0284C7', marginBottom: 8 }}>
            {topConn.partnerOrganization}
          </p>
        </>
      ) : null}
      <button type="button" onClick={() => navigate(adminStudioCrossOrgIntelligencePath())} style={eiaActionBtn}>
        OPEN CROSS-ORG INTELLIGENCE →
      </button>
    </ExecutiveSecondaryCard>
  );
}
