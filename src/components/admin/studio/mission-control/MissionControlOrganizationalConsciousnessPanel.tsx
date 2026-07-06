import { useNavigate } from 'react-router-dom';
import { useOrganizationalConsciousnessState } from '../../../../hooks/useOrganizationalConsciousnessState';
import { ExecutiveHealthRing, ExecutiveSecondaryCard, eiaActionBtn, eiaCaption } from '../executive-ia';
import { adminStudioOrganizationalConsciousnessPath } from '../../../../utils/adminStudioRoutes';
import { MC_VISUAL } from '../mission-control/missionControlTheme';

/** Mission Control — Organizational Consciousness™ unified intelligence preview (M115). */
export function MissionControlOrganizationalConsciousnessPanel() {
  const navigate = useNavigate();
  const { profile } = useOrganizationalConsciousnessState();

  if (!profile) {
    return (
      <ExecutiveSecondaryCard title="ORGANIZATIONAL CONSCIOUSNESS™">
        <p style={{ ...eiaCaption, fontSize: '7px' }}>ORGANIZATIONAL CONSCIOUSNESS™ LOADING…</p>
      </ExecutiveSecondaryCard>
    );
  }

  const topRec = profile.holisticRecommendations[0];

  return (
    <ExecutiveSecondaryCard title="ORGANIZATIONAL CONSCIOUSNESS™ · ONE INTELLIGENCE">
      <div className="flex items-center gap-3 mb-3">
        <ExecutiveHealthRing value={profile.consciousnessScore} size={52} label="UNIFIED" accent="#6366F1" />
        <div>
          <p style={{ ...eiaCaption, color: MC_VISUAL.black, fontFamily: '"Futura PT Medium"', fontSize: '9px' }}>
            {profile.systemsConnected}/{profile.systemsTotal} SYSTEMS · {profile.consciousnessScore}% CONSCIOUSNESS
          </p>
          <p style={{ ...eiaCaption, fontSize: '7px' }}>PRESERVE EXPERTISE. BUILD LEGACY.</p>
        </div>
      </div>
      <p style={{ ...eiaCaption, fontSize: '7px', marginBottom: 6, lineHeight: 1.45 }}>
        {profile.executiveIdentityLine.slice(0, 100)}…
      </p>
      {topRec ? (
        <p style={{ ...eiaCaption, fontSize: '7px', color: '#6366F1', marginBottom: 8 }}>
          {topRec.recommendation.slice(0, 90)}…
        </p>
      ) : null}
      <button type="button" onClick={() => navigate(adminStudioOrganizationalConsciousnessPath())} style={eiaActionBtn}>
        OPEN ORGANIZATIONAL CONSCIOUSNESS →
      </button>
    </ExecutiveSecondaryCard>
  );
}
