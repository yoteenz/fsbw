import { useNavigate } from 'react-router-dom';
import { useReleaseReadinessState } from '../../../../hooks/useReleaseReadinessState';
import { RELEASE_READINESS_ACCENT } from '../../../../studio-os-core/release-readiness';
import { adminStudioReleaseReadinessPath } from '../../../../utils/adminStudioRoutes';
import { ExecutiveHealthRing, ExecutiveSecondaryCard, eiaActionBtn, eiaCaption } from '../executive-ia';

/** Mission Control — Release Readiness™ preview (M161). */
export function MissionControlReleaseReadinessPanel() {
  const navigate = useNavigate();
  const { profile } = useReleaseReadinessState();

  if (!profile) {
    return (
      <ExecutiveSecondaryCard title="RELEASE READINESS™">
        <p style={{ ...eiaCaption, fontSize: '7px' }}>PRODUCTION APPROVAL GATE LOADING…</p>
      </ExecutiveSecondaryCard>
    );
  }

  return (
    <ExecutiveSecondaryCard title="RELEASE READINESS™ · PRODUCTION IS A PRIVILEGE">
      <div className="flex items-center gap-3 mb-3">
        <ExecutiveHealthRing value={profile.overallReadinessScore} size={52} label="RDY" accent={RELEASE_READINESS_ACCENT} />
        <div>
          <p style={{ ...eiaCaption, fontFamily: '"Futura PT Medium"', fontSize: '9px' }}>
            {profile.approvalsGranted}/{profile.approvalsRequired} APPROVALS
          </p>
          <p style={{ ...eiaCaption, fontSize: '7px' }}>
            {profile.releaseGate.replace(/-/g, ' ').toUpperCase()} · {profile.openIssuesCount} open issues
          </p>
        </div>
      </div>
      <p style={{ ...eiaCaption, fontSize: '7px', marginBottom: 6, lineHeight: 1.45 }}>
        {profile.dockReadinessLine.slice(0, 110)}…
      </p>
      <button type="button" onClick={() => navigate(adminStudioReleaseReadinessPath())} style={eiaActionBtn}>
        OPEN RELEASE READINESS →
      </button>
    </ExecutiveSecondaryCard>
  );
}
