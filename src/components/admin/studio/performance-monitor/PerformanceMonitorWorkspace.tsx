import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePerformanceMonitorState } from '../../../../hooks/usePerformanceMonitorState';
import {
  MONITOR_METRICS,
  MONITOR_METRIC_LABELS,
  PERFORMANCE_MONITOR_ACCENT,
  PERFORMANCE_MONITOR_PHILOSOPHY,
  SIMULATION_SCENARIO_LABELS,
  SIMULATION_SCENARIOS,
  explainPerformanceBottleneck,
  getSelectedModuleReport,
  queryPerformanceMonitor,
  refreshPerformanceMonitor,
  selectPerformanceModule,
} from '../../../../studio-os-core/performance-monitor';
import {
  adminStudioAccessibilityAuditorPath,
  adminStudioInteractionEnginePath,
  adminStudioRegressionEnginePath,
} from '../../../../utils/adminStudioRoutes';
import { ADMIN_STUDIO_THEME } from '../../../../utils/adminStudioTheme';
import {
  ExecutiveFocusPanel,
  ExecutiveHealthRing,
  ExecutiveHeroCard,
  ExecutivePageShell,
  ExecutiveSecondaryCard,
} from '../executive-ia';
import { StudioOsBrandTagline } from '../brand/StudioOsBrandTagline';

type PerformanceTab = 'overview' | 'reports' | 'simulations' | 'bottlenecks' | 'budgets' | 'metrics';

const TABS: { id: PerformanceTab; label: string }[] = [
  { id: 'overview', label: 'OVERVIEW' },
  { id: 'reports', label: 'MODULE REPORTS' },
  { id: 'simulations', label: 'SIMULATIONS' },
  { id: 'bottlenecks', label: 'BOTTLENECKS' },
  { id: 'budgets', label: 'PERFORMANCE BUDGET™' },
  { id: 'metrics', label: 'METRICS' },
];

const SEVERITY_COLOR: Record<string, string> = {
  critical: '#EF4444',
  warning: '#F59E0B',
  advisory: '#6366F1',
};

const TREND_COLOR: Record<string, string> = {
  improving: '#10B981',
  stable: '#0891B2',
  declining: '#EF4444',
};

const BUDGET_COLOR: Record<string, string> = {
  'within-budget': '#10B981',
  'approaching-limit': '#F59E0B',
  exceeded: '#EF4444',
};

const METRIC_STATUS_COLOR: Record<string, string> = {
  excellent: '#10B981',
  watch: '#F59E0B',
  degraded: '#EF4444',
};

export function PerformanceMonitorWorkspace() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<PerformanceTab>('overview');
  const [searchQuery, setSearchQuery] = useState('latency');
  const { profile, refresh } = usePerformanceMonitorState();

  if (!profile) {
    return (
      <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
        PERFORMANCE MONITOR™ LOADING — MEASURING SPEED, RESPONSIVENESS, AND EFFICIENCY ACROSS STUDIO OS
      </p>
    );
  }

  const selectedReport = getSelectedModuleReport(profile);
  const searchHits = queryPerformanceMonitor(searchQuery, profile, 8);

  const handleSelectModule = (moduleId: string) => {
    selectPerformanceModule(profile.organizationId, moduleId);
    refresh();
    setTab('reports');
  };

  const handleRefresh = () => {
    refreshPerformanceMonitor(profile.organizationId);
    refresh();
  };

  const renderOverview = () => (
    <ExecutivePageShell>
      <ExecutiveHeroCard
        eyebrow="MILESTONE 159 · PERFORMANCE MONITOR™ · PERFORMANCE IS A FEATURE"
        title={profile.companyName.toUpperCase()}
        subtitle="Performance is a living metric — not something measured only before releases. Studio OS should never become slower simply because it becomes more capable."
        progressPct={profile.overallPerformanceScore}
        stats={[
          { label: 'MODULES', value: `${profile.modulesMonitored}` },
          { label: 'BOTTLENECKS', value: `${profile.bottlenecksOpen}` },
          { label: 'BUDGET FLAGS', value: `${profile.budgetsExceeded}` },
          { label: 'TREND', value: profile.averageSpeedTrend },
        ]}
      />
      <div className="flex items-center gap-3 mb-2">
        <ExecutiveHealthRing value={profile.overallPerformanceScore} size={56} label="PERF" accent={PERFORMANCE_MONITOR_ACCENT} />
        <div>
          {PERFORMANCE_MONITOR_PHILOSOPHY.slice(0, 2).map((line) => (
            <p key={line} className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
              {line}
            </p>
          ))}
        </div>
      </div>
      <ExecutiveSecondaryCard title="NEVER SLOWER BECAUSE WE'RE MORE CAPABLE">
        <p className="text-[6px] font-futura mb-2" style={{ color: PERFORMANCE_MONITOR_ACCENT, fontWeight: 515, lineHeight: 1.5 }}>
          Every new feature must preserve the fast, premium, responsive experience users expect.
        </p>
        <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
          {profile.dockPerformanceLine}
        </p>
      </ExecutiveSecondaryCard>
      <ExecutiveFocusPanel title="MODULES NEEDING PERFORMANCE ATTENTION">
        {profile.moduleReports
          .filter((r) => !r.withinPerformanceBudget)
          .slice(0, 4)
          .map((r) => (
            <button key={r.id} type="button" onClick={() => handleSelectModule(r.moduleId)} className="block w-full text-left mb-2 bg-transparent border-0 cursor-pointer">
              <p className="text-[6px] font-futura" style={{ color: TREND_COLOR[r.speedTrend], fontWeight: 515 }}>
                {r.moduleLabel} · {r.performanceScore}% · {r.speedTrend} · {r.bottlenecksCount} bottleneck(s)
              </p>
              <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.4 }}>
                {r.estimatedUserImpact.slice(0, 100)}…
              </p>
            </button>
          ))}
        {profile.moduleReports.filter((r) => !r.withinPerformanceBudget).length === 0 ? (
          <p className="text-[6px] font-futura" style={{ color: '#10B981' }}>
            All modules within Performance Budget™ — premium responsiveness preserved.
          </p>
        ) : null}
      </ExecutiveFocusPanel>
      <button type="button" onClick={() => setTab('reports')} className="mt-2 mr-2 px-2 py-1 text-[6px] font-futura uppercase border" style={{ borderColor: PERFORMANCE_MONITOR_ACCENT, color: PERFORMANCE_MONITOR_ACCENT }}>
        VIEW MODULE REPORTS →
      </button>
      <button type="button" onClick={() => setTab('budgets')} className="mt-2 mr-2 px-2 py-1 text-[6px] font-futura uppercase border" style={{ borderColor: PERFORMANCE_MONITOR_ACCENT, color: PERFORMANCE_MONITOR_ACCENT }}>
        PERFORMANCE BUDGET™ →
      </button>
      <button type="button" onClick={() => navigate(adminStudioInteractionEnginePath())} className="mt-2 px-2 py-1 text-[6px] font-futura uppercase border" style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, color: ADMIN_STUDIO_THEME.textSecondary }}>
        INTERACTION ENGINE →
      </button>
    </ExecutivePageShell>
  );

  const renderReports = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="MODULE PERFORMANCE REPORTS — EVERY FEATURE MEASURED">
        {(selectedReport
          ? [selectedReport, ...profile.moduleReports.filter((r) => r.moduleId !== selectedReport.moduleId)]
          : profile.moduleReports
        ).map((report) => (
          <ExecutiveSecondaryCard
            key={report.id}
            title={`${report.moduleLabel.toUpperCase()} · ${report.withinPerformanceBudget ? 'WITHIN BUDGET ✓' : 'BUDGET ATTENTION'}`}
          >
            <div className="grid grid-cols-2 gap-2 mb-2">
              <div>
                <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>PERFORMANCE SCORE</p>
                <p className="text-[8px] font-futura" style={{ color: PERFORMANCE_MONITOR_ACCENT, fontWeight: 515 }}>{report.performanceScore}%</p>
              </div>
              <div>
                <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>SPEED TREND</p>
                <p className="text-[8px] font-futura" style={{ color: TREND_COLOR[report.speedTrend], fontWeight: 515 }}>{report.speedTrend}</p>
              </div>
              <div>
                <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>BOTTLENECKS</p>
                <p className="text-[8px] font-futura" style={{ color: report.bottlenecksCount > 0 ? '#EF4444' : '#10B981', fontWeight: 515 }}>{report.bottlenecksCount}</p>
              </div>
            </div>
            <ExecutiveSecondaryCard title="OPTIMIZATION OPPORTUNITIES">
              {report.optimizationOpportunities.map((item) => (
                <p key={item} className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.4 }}>
                  · {item}
                </p>
              ))}
            </ExecutiveSecondaryCard>
            <ExecutiveSecondaryCard title="LARGEST BOTTLENECKS">
              {report.largestBottlenecks.map((item) => (
                <p key={item} className="text-[6px] font-futura mb-1" style={{ color: '#EF4444', lineHeight: 1.4 }}>
                  · {item}
                </p>
              ))}
            </ExecutiveSecondaryCard>
            <ExecutiveSecondaryCard title="HISTORICAL PERFORMANCE">
              <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
                {report.historicalPerformance}
              </p>
            </ExecutiveSecondaryCard>
            <ExecutiveSecondaryCard title="RECOMMENDED IMPROVEMENTS">
              {report.recommendedImprovements.map((item) => (
                <p key={item} className="text-[6px] font-futura mb-1" style={{ color: PERFORMANCE_MONITOR_ACCENT, lineHeight: 1.4 }}>
                  · {item}
                </p>
              ))}
            </ExecutiveSecondaryCard>
            <ExecutiveSecondaryCard title="ESTIMATED USER IMPACT">
              <p className="text-[6px] font-futura" style={{ color: '#EF4444', lineHeight: 1.45 }}>
                {report.estimatedUserImpact}
              </p>
            </ExecutiveSecondaryCard>
            <p className="text-[6px] font-futura mt-1" style={{ color: report.withinPerformanceBudget ? '#10B981' : '#EF4444', lineHeight: 1.45 }}>
              {report.performanceVerdict}
            </p>
            <button type="button" onClick={() => handleSelectModule(report.moduleId)} className="mt-2 px-2 py-1 text-[6px] font-futura uppercase border" style={{ borderColor: PERFORMANCE_MONITOR_ACCENT, color: PERFORMANCE_MONITOR_ACCENT }}>
              VIEW BOTTLENECKS →
            </button>
          </ExecutiveSecondaryCard>
        ))}
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  const renderSimulations = () => {
    const sims = selectedReport
      ? profile.simulations.filter((s) => s.moduleId === selectedReport.moduleId)
      : profile.simulations;

    return (
      <ExecutivePageShell>
        <ExecutiveFocusPanel title={selectedReport ? `SIMULATIONS · ${selectedReport.moduleLabel.toUpperCase()}` : '8 PERFORMANCE SCENARIOS'}>
          <p className="text-[6px] font-futura mb-3" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
            Mobile · Tablets · Desktop · Low bandwidth · High latency · Older hardware · Large organizations · Heavy AI workloads
          </p>
          {SIMULATION_SCENARIOS.map((scenario) => {
            const sim = sims.find((s) => s.scenario === scenario);
            if (!sim) return null;
            return (
              <ExecutiveSecondaryCard key={scenario} title={`${SIMULATION_SCENARIO_LABELS[scenario].toUpperCase()} · ${sim.passed ? 'PASS' : 'DEGRADED'}`}>
                <p className="text-[6px] font-futura mb-1" style={{ color: sim.passed ? '#10B981' : '#EF4444', fontWeight: 515 }}>
                  {sim.moduleLabel} · Score {sim.performanceScore}% · {sim.latencyMs}ms
                </p>
                <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
                  {sim.summary}
                </p>
              </ExecutiveSecondaryCard>
            );
          })}
        </ExecutiveFocusPanel>
      </ExecutivePageShell>
    );
  };

  const renderBottlenecks = () => {
    const moduleBottlenecks = selectedReport
      ? profile.bottlenecks.filter((b) => b.moduleId === selectedReport.moduleId)
      : profile.bottlenecks;

    return (
      <ExecutivePageShell>
        <ExecutiveFocusPanel title={selectedReport ? `BOTTLENECKS · ${selectedReport.moduleLabel.toUpperCase()}` : 'ALL PERFORMANCE BOTTLENECKS'}>
          {moduleBottlenecks.slice(0, 16).map((bottleneck) => (
            <ExecutiveSecondaryCard key={bottleneck.id} title={`${bottleneck.bottleneckLabel.toUpperCase()} · ${bottleneck.metricLabel.toUpperCase()}`}>
              <p className="text-[6px] font-futura mb-1" style={{ color: SEVERITY_COLOR[bottleneck.severity], fontWeight: 515 }}>
                [{bottleneck.severity.toUpperCase()}] {bottleneck.moduleLabel}
              </p>
              <p className="text-[6px] font-futura mb-2" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
                {bottleneck.description}
              </p>
              <ExecutiveSecondaryCard title="MEASURED VS BUDGET">
                <p className="text-[6px] font-futura" style={{ color: PERFORMANCE_MONITOR_ACCENT, lineHeight: 1.45 }}>
                  {bottleneck.measuredValue} vs budget {bottleneck.budgetLimit}
                </p>
              </ExecutiveSecondaryCard>
              <ExecutiveSecondaryCard title="ESTIMATED USER IMPACT">
                <p className="text-[6px] font-futura" style={{ color: '#EF4444', lineHeight: 1.45 }}>
                  {bottleneck.estimatedUserImpact}
                </p>
              </ExecutiveSecondaryCard>
              <ExecutiveSecondaryCard title="RECOMMENDED IMPROVEMENT">
                <p className="text-[6px] font-futura" style={{ color: PERFORMANCE_MONITOR_ACCENT, lineHeight: 1.45 }}>
                  {bottleneck.recommendedImprovement}
                </p>
              </ExecutiveSecondaryCard>
              <p className="text-[6px] font-futura mt-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.4 }}>
                {explainPerformanceBottleneck(bottleneck)}
              </p>
            </ExecutiveSecondaryCard>
          ))}
        </ExecutiveFocusPanel>
      </ExecutivePageShell>
    );
  };

  const renderBudgets = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="PERFORMANCE BUDGET™ — FLAGS BEFORE PRODUCTION">
        <p className="text-[6px] font-futura mb-3" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
          Each Studio OS feature has a defined performance budget. Studio Intelligence™ flags features that exceed acceptable limits before production.
        </p>
        {profile.performanceBudgets.map((budget) => (
          <ExecutiveSecondaryCard
            key={budget.id}
            title={`${budget.featureLabel.toUpperCase()} · ${budget.metricLabel.toUpperCase()} · ${budget.status.toUpperCase()}`}
          >
            <p className="text-[8px] font-futura mb-1" style={{ color: BUDGET_COLOR[budget.status], fontWeight: 515 }}>
              {budget.utilizationPct}% utilized · {budget.currentValue} / {budget.budgetLimit}
            </p>
            {budget.flaggedBeforeProduction ? (
              <p className="text-[6px] font-futura mb-2" style={{ color: '#EF4444', fontWeight: 515 }}>
                STUDIO INTELLIGENCE™ FLAG — EXCEEDS PRODUCTION LIMIT
              </p>
            ) : null}
            <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
              {budget.studioIntelligenceNote}
            </p>
          </ExecutiveSecondaryCard>
        ))}
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  const renderMetrics = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="15 CONTINUOUS PERFORMANCE METRICS">
        {profile.metricScores.map((m) => (
          <ExecutiveSecondaryCard key={m.metric} title={`${m.label.toUpperCase()} · ${m.status.toUpperCase()}`}>
            <p className="text-[8px] font-futura mb-1" style={{ color: METRIC_STATUS_COLOR[m.status] ?? PERFORMANCE_MONITOR_ACCENT, fontWeight: 515 }}>
              {m.score}%
            </p>
            <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
              {m.summary}
            </p>
          </ExecutiveSecondaryCard>
        ))}
      </ExecutiveFocusPanel>
      <ExecutiveSecondaryCard title="15 MONITOR TARGETS">
        <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
          {MONITOR_METRICS.map((m) => MONITOR_METRIC_LABELS[m]).join(' · ')}
        </p>
      </ExecutiveSecondaryCard>
      <button type="button" onClick={() => navigate(adminStudioAccessibilityAuditorPath())} className="mt-2 mr-2 px-2 py-1 text-[6px] font-futura uppercase border" style={{ borderColor: PERFORMANCE_MONITOR_ACCENT, color: PERFORMANCE_MONITOR_ACCENT }}>
        ACCESSIBILITY AUDITOR →
      </button>
      <button type="button" onClick={() => navigate(adminStudioRegressionEnginePath())} className="mt-2 px-2 py-1 text-[6px] font-futura uppercase border" style={{ borderColor: PERFORMANCE_MONITOR_ACCENT, color: PERFORMANCE_MONITOR_ACCENT }}>
        REGRESSION ENGINE →
      </button>
    </ExecutivePageShell>
  );

  return (
    <div>
      <StudioOsBrandTagline systemId="performance-monitor" />
      <div className="flex flex-wrap gap-1 mb-3 mt-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className="px-2 py-1 text-[6px] font-futura uppercase border"
            style={{
              borderColor: tab === t.id ? PERFORMANCE_MONITOR_ACCENT : ADMIN_STUDIO_THEME.panelBorder,
              color: tab === t.id ? PERFORMANCE_MONITOR_ACCENT : ADMIN_STUDIO_THEME.textSecondary,
              fontWeight: tab === t.id ? 515 : 400,
            }}
          >
            {t.label}
          </button>
        ))}
        <button type="button" onClick={handleRefresh} className="px-2 py-1 text-[6px] font-futura uppercase border ml-auto" style={{ borderColor: PERFORMANCE_MONITOR_ACCENT, color: PERFORMANCE_MONITOR_ACCENT }}>
          SYNC MONITOR
        </button>
      </div>
      <div className="flex gap-2 mb-3">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search bottlenecks, budgets, latency…"
          className="flex-1 px-2 py-1 text-[6px] font-futura border bg-transparent"
          style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, color: ADMIN_STUDIO_THEME.textPrimary }}
        />
      </div>
      {searchHits.length > 0 && searchQuery.trim() ? (
        <ExecutiveSecondaryCard title="SEARCH RESULTS">
          {searchHits.map((h) => (
            <button
              key={`${h.type}-${h.id}`}
              type="button"
              onClick={() => {
                if (h.type === 'report') {
                  const report = profile.moduleReports.find((r) => r.id === h.id);
                  if (report) handleSelectModule(report.moduleId);
                }
                if (h.type === 'bottleneck') setTab('bottlenecks');
                if (h.type === 'budget') setTab('budgets');
                if (h.type === 'simulation') setTab('simulations');
                if (h.type === 'metric') setTab('metrics');
              }}
              className="block w-full text-left mb-1 bg-transparent border-0 cursor-pointer"
            >
              <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
                · [{h.type.toUpperCase()}] {h.label} — {h.matchReason}
              </p>
            </button>
          ))}
        </ExecutiveSecondaryCard>
      ) : null}
      {tab === 'overview' && renderOverview()}
      {tab === 'reports' && renderReports()}
      {tab === 'simulations' && renderSimulations()}
      {tab === 'bottlenecks' && renderBottlenecks()}
      {tab === 'budgets' && renderBudgets()}
      {tab === 'metrics' && renderMetrics()}
    </div>
  );
}
