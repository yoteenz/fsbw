import { useNavigate } from 'react-router-dom';
import { usePerformanceMonitorState } from '../../../../hooks/usePerformanceMonitorState';
import { PERFORMANCE_MONITOR_ACCENT } from '../../../../studio-os-core/performance-monitor';
import { adminStudioPerformanceMonitorPath } from '../../../../utils/adminStudioRoutes';
import { ExecutiveHealthRing, ExecutiveSecondaryCard, eiaActionBtn, eiaCaption } from '../executive-ia';

/** Mission Control — Performance Monitor™ preview (M159). */
export function MissionControlPerformanceMonitorPanel() {
  const navigate = useNavigate();
  const { profile } = usePerformanceMonitorState();

  if (!profile) {
    return (
      <ExecutiveSecondaryCard title="PERFORMANCE MONITOR™">
        <p style={{ ...eiaCaption, fontSize: '7px' }}>LIVING PERFORMANCE METRICS LOADING…</p>
      </ExecutiveSecondaryCard>
    );
  }

  return (
    <ExecutiveSecondaryCard title="PERFORMANCE MONITOR™ · PERFORMANCE IS A FEATURE">
      <div className="flex items-center gap-3 mb-3">
        <ExecutiveHealthRing value={profile.overallPerformanceScore} size={52} label="PERF" accent={PERFORMANCE_MONITOR_ACCENT} />
        <div>
          <p style={{ ...eiaCaption, fontFamily: '"Futura PT Medium"', fontSize: '9px' }}>
            {profile.modulesMonitored} MODULES · {profile.bottlenecksOpen} BOTTLENECKS
          </p>
          <p style={{ ...eiaCaption, fontSize: '7px' }}>
            Trend {profile.averageSpeedTrend} · {profile.budgetsExceeded} budget flag(s)
          </p>
        </div>
      </div>
      <p style={{ ...eiaCaption, fontSize: '7px', marginBottom: 6, lineHeight: 1.45 }}>
        {profile.dockPerformanceLine.slice(0, 110)}…
      </p>
      <button type="button" onClick={() => navigate(adminStudioPerformanceMonitorPath())} style={eiaActionBtn}>
        OPEN PERFORMANCE MONITOR →
      </button>
    </ExecutiveSecondaryCard>
  );
}
