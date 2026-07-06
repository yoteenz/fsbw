import { useNavigate } from 'react-router-dom';
import { useEngineeringExcellenceState } from '../../../../hooks/useEngineeringExcellenceState';
import { ENGINEERING_EXCELLENCE_ACCENT } from '../../../../studio-os-core/engineering-excellence-dashboard';
import { adminStudioEngineeringExcellenceDashboardPath } from '../../../../utils/adminStudioRoutes';
import { ExecutiveHealthRing, ExecutiveSecondaryCard, eiaActionBtn, eiaCaption } from '../executive-ia';

/** Mission Control — Engineering Excellence Dashboard™ preview (M162). */
export function MissionControlEngineeringExcellencePanel() {
  const navigate = useNavigate();
  const { profile } = useEngineeringExcellenceState();

  if (!profile) {
    return (
      <ExecutiveSecondaryCard title="ENGINEERING EXCELLENCE DASHBOARD™">
        <p style={{ ...eiaCaption, fontSize: '7px' }}>EXECUTIVE ENGINEERING OVERVIEW LOADING…</p>
      </ExecutiveSecondaryCard>
    );
  }

  return (
    <ExecutiveSecondaryCard title="ENGINEERING EXCELLENCE™ · COMMAND CENTER">
      <div className="flex items-center gap-3 mb-3">
        <ExecutiveHealthRing value={profile.overallEngineeringScore} size={52} label="ENG" accent={ENGINEERING_EXCELLENCE_ACCENT} />
        <div>
          <p style={{ ...eiaCaption, fontFamily: '"Futura PT Medium"', fontSize: '9px' }}>
            STABILITY {profile.productionStabilityScore}% · CONFIDENCE {profile.averageReleaseConfidence}%
          </p>
          <p style={{ ...eiaCaption, fontSize: '7px' }}>
            {profile.openRisksCount} risks · {profile.cultureCelebrations.length} celebration(s)
          </p>
        </div>
      </div>
      <p style={{ ...eiaCaption, fontSize: '7px', marginBottom: 6, lineHeight: 1.45 }}>
        {profile.dockExcellenceLine.slice(0, 110)}…
      </p>
      <button type="button" onClick={() => navigate(adminStudioEngineeringExcellenceDashboardPath())} style={eiaActionBtn}>
        OPEN ENGINEERING EXCELLENCE →
      </button>
    </ExecutiveSecondaryCard>
  );
}
