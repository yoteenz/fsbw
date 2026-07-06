import { useNavigate } from 'react-router-dom';
import { useIdentityGraphState } from '../../../../hooks/useIdentityGraphState';
import { IDENTITY_GRAPH_ACCENT } from '../../../../studio-os-core/identity-graph';
import { adminStudioIdentityGraphPath } from '../../../../utils/adminStudioRoutes';
import { ExecutiveHealthRing, ExecutiveSecondaryCard, eiaActionBtn, eiaCaption } from '../executive-ia';

/** Mission Control — Identity Graph™ preview (M163). */
export function MissionControlIdentityGraphPanel() {
  const navigate = useNavigate();
  const { profile } = useIdentityGraphState();

  if (!profile) {
    return (
      <ExecutiveSecondaryCard title="IDENTITY GRAPH™">
        <p style={{ ...eiaCaption, fontSize: '7px' }}>PEOPLE INTELLIGENCE LOADING…</p>
      </ExecutiveSecondaryCard>
    );
  }

  return (
    <ExecutiveSecondaryCard title="IDENTITY GRAPH™ · PEOPLE FIRST">
      <div className="flex items-center gap-3 mb-3">
        <ExecutiveHealthRing value={profile.graphScore} size={52} label="IG" accent={IDENTITY_GRAPH_ACCENT} />
        <div>
          <p style={{ ...eiaCaption, fontFamily: '"Futura PT Medium"', fontSize: '9px' }}>
            {profile.peopleCount} PEOPLE · {profile.relationshipCount} RELATIONSHIPS
          </p>
          <p style={{ ...eiaCaption, fontSize: '7px' }}>
            {profile.identityTypesRepresented} identity types · living profiles
          </p>
        </div>
      </div>
      <p style={{ ...eiaCaption, fontSize: '7px', marginBottom: 6, lineHeight: 1.45 }}>
        {profile.dockIdentityLine.slice(0, 110)}…
      </p>
      <button type="button" onClick={() => navigate(adminStudioIdentityGraphPath())} style={eiaActionBtn}>
        OPEN IDENTITY GRAPH →
      </button>
    </ExecutiveSecondaryCard>
  );
}
