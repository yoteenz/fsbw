import { useNavigate } from 'react-router-dom';
import { useExecutiveTimelineHistoryState } from '../../../../hooks/useExecutiveTimelineHistoryState';
import { EXECUTIVE_HISTORY_ACCENT } from '../../../../studio-os-core/executive-timeline';
import { adminStudioExecutiveTimelinePath } from '../../../../utils/adminStudioRoutes';
import { ExecutiveHealthRing, ExecutiveSecondaryCard, eiaActionBtn, eiaCaption } from '../executive-ia';

/** Mission Control — Executive Timeline™ permanent history preview (M116). */
export function MissionControlExecutiveTimelinePanel() {
  const navigate = useNavigate();
  const { profile } = useExecutiveTimelineHistoryState();

  if (!profile) {
    return (
      <ExecutiveSecondaryCard title="EXECUTIVE TIMELINE™">
        <p style={{ ...eiaCaption, fontSize: '7px' }}>EXECUTIVE TIMELINE™ LOADING…</p>
      </ExecutiveSecondaryCard>
    );
  }

  const topInsight = profile.timelineInsights[0];

  return (
    <ExecutiveSecondaryCard title="EXECUTIVE TIMELINE™ · PERMANENT HISTORY">
      <div className="flex items-center gap-3 mb-3">
        <ExecutiveHealthRing value={profile.historyDepthScore} size={52} label="HISTORY" accent={EXECUTIVE_HISTORY_ACCENT} />
        <div>
          <p style={{ ...eiaCaption, fontFamily: '"Futura PT Medium"', fontSize: '9px' }}>
            {profile.totalEvents} EVENTS · {profile.yearsSpan} YEARS · {profile.historyDepthScore}% DEPTH
          </p>
          <p style={{ ...eiaCaption, fontSize: '7px' }}>HOW YOU ARRIVED HERE</p>
        </div>
      </div>
      <p style={{ ...eiaCaption, fontSize: '7px', marginBottom: 6, lineHeight: 1.45 }}>
        {(profile.anniversaryContext ?? profile.dockHistoryLine).slice(0, 100)}…
      </p>
      {topInsight ? (
        <p style={{ ...eiaCaption, fontSize: '7px', color: EXECUTIVE_HISTORY_ACCENT, marginBottom: 8 }}>
          {topInsight.headline}: {topInsight.narrative.slice(0, 70)}…
        </p>
      ) : null}
      <button type="button" onClick={() => navigate(adminStudioExecutiveTimelinePath())} style={eiaActionBtn}>
        OPEN EXECUTIVE TIMELINE →
      </button>
    </ExecutiveSecondaryCard>
  );
}
