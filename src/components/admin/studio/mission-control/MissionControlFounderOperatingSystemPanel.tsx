import { useNavigate } from 'react-router-dom';
import { useFounderOperatingSystemState } from '../../../../hooks/useFounderOperatingSystemState';
import { FOUNDER_OS_ACCENT } from '../../../../studio-os-core/founder-operating-system';
import { adminStudioFounderOperatingSystemPath } from '../../../../utils/adminStudioRoutes';
import { ExecutiveHealthRing, ExecutiveSecondaryCard, eiaActionBtn, eiaCaption } from '../executive-ia';

/** Mission Control — Founder Operating System™ personal leadership preview (M118 · Studio OS V1). */
export function MissionControlFounderOperatingSystemPanel() {
  const navigate = useNavigate();
  const { profile } = useFounderOperatingSystemState();

  if (!profile) {
    return (
      <ExecutiveSecondaryCard title="FOUNDER OPERATING SYSTEM™">
        <p style={{ ...eiaCaption, fontSize: '7px' }}>FOUNDER OPERATING SYSTEM™ LOADING…</p>
      </ExecutiveSecondaryCard>
    );
  }

  const d = profile.personalDashboard;
  const topCoach = profile.coachingInsights[0];

  return (
    <ExecutiveSecondaryCard title="FOUNDER OPERATING SYSTEM™ · OPERATES THE FOUNDER">
      <div className="flex items-center gap-3 mb-3">
        <ExecutiveHealthRing value={profile.founderEffectivenessScore} size={52} label="FOUNDER" accent={FOUNDER_OS_ACCENT} />
        <div>
          <p style={{ ...eiaCaption, fontFamily: '"Futura PT Medium"', fontSize: '9px' }}>
            FOCUS {d.focusScorePct}% · LEADERSHIP {d.leadershipGrowthPct}% · BURNOUT RISK {d.burnoutRiskPct}%
          </p>
          <p style={{ ...eiaCaption, fontSize: '7px' }}>FOUNDERS GROW FIRST</p>
        </div>
      </div>
      <p style={{ ...eiaCaption, fontSize: '7px', marginBottom: 6, lineHeight: 1.45 }}>
        {profile.dockFounderLine.slice(0, 100)}…
      </p>
      {topCoach ? (
        <p style={{ ...eiaCaption, fontSize: '7px', color: FOUNDER_OS_ACCENT, marginBottom: 8 }}>
          {topCoach.recommendation.slice(0, 90)}…
        </p>
      ) : null}
      <button type="button" onClick={() => navigate(adminStudioFounderOperatingSystemPath())} style={eiaActionBtn}>
        OPEN FOUNDER OPERATING SYSTEM →
      </button>
    </ExecutiveSecondaryCard>
  );
}
