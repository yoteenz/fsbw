import { useNavigate } from 'react-router-dom';
import { useQaHeadquartersState } from '../../../../hooks/useQaHeadquartersState';
import { QA_HEADQUARTERS_ACCENT } from '../../../../studio-os-core/qa-headquarters';
import { adminStudioQaHeadquartersPath } from '../../../../utils/adminStudioRoutes';
import { ExecutiveHealthRing, ExecutiveSecondaryCard, eiaActionBtn, eiaCaption } from '../executive-ia';

/** Mission Control — QA Headquarters™ preview (M142). */
export function MissionControlQaHeadquartersPanel() {
  const navigate = useNavigate();
  const { profile } = useQaHeadquartersState();

  if (!profile) {
    return (
      <ExecutiveSecondaryCard title="QA HEADQUARTERS™">
        <p style={{ ...eiaCaption, fontSize: '7px' }}>TRUST INFRASTRUCTURE LOADING…</p>
      </ExecutiveSecondaryCard>
    );
  }

  return (
    <ExecutiveSecondaryCard title="QA HEADQUARTERS™ · TRUST SCORES™">
      <div className="flex items-center gap-3 mb-3">
        <ExecutiveHealthRing value={profile.overallTrustScore} size={52} label="QA" accent={QA_HEADQUARTERS_ACCENT} />
        <div>
          <p style={{ ...eiaCaption, fontFamily: '"Futura PT Medium"', fontSize: '9px' }}>
            {profile.overallTrustScore}% TRUST · {profile.activeIssues} ISSUES
          </p>
          <p style={{ ...eiaCaption, fontSize: '7px' }}>
            {profile.validationsToday} validations today · {profile.trustTrend.toUpperCase()}
          </p>
        </div>
      </div>
      <p style={{ ...eiaCaption, fontSize: '7px', marginBottom: 6, lineHeight: 1.45 }}>
        {profile.dockQaLine.slice(0, 100)}…
      </p>
      <button type="button" onClick={() => navigate(adminStudioQaHeadquartersPath())} style={eiaActionBtn}>
        OPEN QA HEADQUARTERS →
      </button>
    </ExecutiveSecondaryCard>
  );
}
