import { useNavigate } from 'react-router-dom';
import { useExecutiveTrustDashboardState } from '../../../../hooks/useExecutiveTrustDashboardState';
import { EXECUTIVE_TRUST_DASHBOARD_ACCENT } from '../../../../studio-os-core/executive-trust-dashboard';
import { adminStudioExecutiveTrustDashboardPath } from '../../../../utils/adminStudioRoutes';
import { ExecutiveHealthRing, ExecutiveSecondaryCard, eiaActionBtn, eiaCaption } from '../executive-ia';

/** Mission Control — Executive Trust Dashboard™ preview (M147). */
export function MissionControlExecutiveTrustDashboardPanel() {
  const navigate = useNavigate();
  const { profile } = useExecutiveTrustDashboardState();

  if (!profile) {
    return (
      <ExecutiveSecondaryCard title="EXECUTIVE TRUST DASHBOARD™">
        <p style={{ ...eiaCaption, fontSize: '7px' }}>ORGANIZATIONAL TRUST LOADING…</p>
      </ExecutiveSecondaryCard>
    );
  }

  return (
    <ExecutiveSecondaryCard title="EXECUTIVE TRUST DASHBOARD™ · FIRST-CLASS METRIC">
      <div className="flex items-center gap-3 mb-3">
        <ExecutiveHealthRing value={profile.overallTrustScore} size={52} label="TR" accent={EXECUTIVE_TRUST_DASHBOARD_ACCENT} />
        <div>
          <p style={{ ...eiaCaption, fontFamily: '"Futura PT Medium"', fontSize: '9px' }}>
            {profile.overallTrustScore}% TRUST · {profile.overallConfidence}% CONFIDENCE
          </p>
          <p style={{ ...eiaCaption, fontSize: '7px' }}>
            {profile.systemsAtRisk} at risk · {profile.totalRecentIssues} issues · {profile.trustTrend}
          </p>
        </div>
      </div>
      <p style={{ ...eiaCaption, fontSize: '7px', marginBottom: 6, lineHeight: 1.45 }}>
        {profile.executiveSummary.studioIntelligenceBriefing.slice(0, 100)}…
      </p>
      <button type="button" onClick={() => navigate(adminStudioExecutiveTrustDashboardPath())} style={eiaActionBtn}>
        OPEN TRUST DASHBOARD →
      </button>
    </ExecutiveSecondaryCard>
  );
}
