import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRegressionEngineState } from '../../../../hooks/useRegressionEngineState';
import {
  REGRESSION_CATEGORIES,
  REGRESSION_CATEGORY_LABELS,
  REGRESSION_ENGINE_ACCENT,
  REGRESSION_ENGINE_PHILOSOPHY,
  REGRESSION_REPLAY_LABELS,
  REGRESSION_REPLAYS,
  explainBrokenFeature,
  getSelectedBuildReport,
  queryRegressionEngine,
  refreshRegressionEngine,
  selectRegressionBuild,
} from '../../../../studio-os-core/regression-engine';
import {
  adminStudioPerformanceMonitorPath,
  adminStudioQaHeadquartersPath,
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

type RegressionTab = 'overview' | 'reports' | 'replays' | 'broken' | 'memory' | 'categories';

const TABS: { id: RegressionTab; label: string }[] = [
  { id: 'overview', label: 'OVERVIEW' },
  { id: 'reports', label: 'BUILD REPORTS' },
  { id: 'replays', label: 'REPLAYS' },
  { id: 'broken', label: 'BROKEN FEATURES' },
  { id: 'memory', label: 'HISTORICAL MEMORY™' },
  { id: 'categories', label: 'CATEGORIES' },
];

const SEVERITY_COLOR: Record<string, string> = {
  critical: '#EF4444',
  warning: '#F59E0B',
  advisory: '#6366F1',
};

const RISK_COLOR: Record<string, string> = {
  critical: '#EF4444',
  high: '#F97316',
  medium: '#F59E0B',
  low: '#10B981',
};

const CATEGORY_STATUS_COLOR: Record<string, string> = {
  stable: '#10B981',
  watch: '#F59E0B',
  regressed: '#EF4444',
};

const MEMORY_STATUS_COLOR: Record<string, string> = {
  resolved: '#10B981',
  open: '#F59E0B',
  recurring: '#EF4444',
};

export function RegressionEngineWorkspace() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<RegressionTab>('overview');
  const [searchQuery, setSearchQuery] = useState('permission');
  const { profile, refresh } = useRegressionEngineState();

  if (!profile) {
    return (
      <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
        REGRESSION ENGINE™ LOADING — VERIFYING THAT EVERY CHANGE PRESERVES EXISTING FUNCTIONALITY
      </p>
    );
  }

  const selectedReport = getSelectedBuildReport(profile);
  const searchHits = queryRegressionEngine(searchQuery, profile, 8);

  const handleSelectBuild = (buildId: string) => {
    selectRegressionBuild(profile.organizationId, buildId);
    refresh();
    setTab('reports');
  };

  const handleRefresh = () => {
    refreshRegressionEngine(profile.organizationId);
    refresh();
  };

  const renderOverview = () => (
    <ExecutivePageShell>
      <ExecutiveHeroCard
        eyebrow="MILESTONE 160 · REGRESSION ENGINE™ · STUDIO OS REMEMBERS"
        title={profile.companyName.toUpperCase()}
        subtitle="Whenever a feature changes, the Regression Engine™ automatically retests all related systems. Every regression becomes permanent organizational knowledge."
        progressPct={profile.overallRegressionScore}
        stats={[
          { label: 'BUILDS', value: `${profile.buildsTested}` },
          { label: 'BROKEN', value: `${profile.brokenFeaturesOpen}` },
          { label: 'HISTORY', value: `${profile.regressionsInHistory}` },
          { label: 'PATTERNS', value: `${profile.recurringPatterns}` },
        ]}
      />
      <div className="flex items-center gap-3 mb-2">
        <ExecutiveHealthRing value={profile.overallRegressionScore} size={56} label="REG" accent={REGRESSION_ENGINE_ACCENT} />
        <div>
          {REGRESSION_ENGINE_PHILOSOPHY.slice(0, 2).map((line) => (
            <p key={line} className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
              {line}
            </p>
          ))}
        </div>
      </div>
      <ExecutiveSecondaryCard title="NEVER REPEAT THE SAME MISTAKE TWICE">
        <p className="text-[6px] font-futura mb-2" style={{ color: REGRESSION_ENGINE_ACCENT, fontWeight: 515, lineHeight: 1.5 }}>
          The system continuously learns from its own failures — Studio Intelligence™ identifies recurring patterns.
        </p>
        <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
          {profile.dockRegressionLine}
        </p>
      </ExecutiveSecondaryCard>
      <ExecutiveFocusPanel title="HIGH-RISK BUILDS NEEDING ATTENTION">
        {profile.buildReports
          .filter((r) => r.riskLevel === 'critical' || r.riskLevel === 'high')
          .slice(0, 4)
          .map((r) => (
            <button key={r.id} type="button" onClick={() => handleSelectBuild(r.buildId)} className="block w-full text-left mb-2 bg-transparent border-0 cursor-pointer">
              <p className="text-[6px] font-futura" style={{ color: RISK_COLOR[r.riskLevel], fontWeight: 515 }}>
                {r.buildLabel} · {r.regressionScore}% · risk {r.riskLevel} · {r.brokenFeaturesCount} broken
              </p>
              <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.4 }}>
                {r.rollbackRecommendation.slice(0, 100)}…
              </p>
            </button>
          ))}
        {profile.buildReports.filter((r) => r.riskLevel === 'critical' || r.riskLevel === 'high').length === 0 ? (
          <p className="text-[6px] font-futura" style={{ color: '#10B981' }}>
            All builds verified — no critical regressions detected.
          </p>
        ) : null}
      </ExecutiveFocusPanel>
      <button type="button" onClick={() => setTab('reports')} className="mt-2 mr-2 px-2 py-1 text-[6px] font-futura uppercase border" style={{ borderColor: REGRESSION_ENGINE_ACCENT, color: REGRESSION_ENGINE_ACCENT }}>
        VIEW BUILD REPORTS →
      </button>
      <button type="button" onClick={() => setTab('memory')} className="mt-2 mr-2 px-2 py-1 text-[6px] font-futura uppercase border" style={{ borderColor: REGRESSION_ENGINE_ACCENT, color: REGRESSION_ENGINE_ACCENT }}>
        HISTORICAL MEMORY™ →
      </button>
      <button type="button" onClick={() => navigate(adminStudioQaHeadquartersPath())} className="mt-2 px-2 py-1 text-[6px] font-futura uppercase border" style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, color: ADMIN_STUDIO_THEME.textSecondary }}>
        QA HEADQUARTERS →
      </button>
    </ExecutivePageShell>
  );

  const renderReports = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="REGRESSION REPORTS — EVERY BUILD GENERATES">
        {(selectedReport
          ? [selectedReport, ...profile.buildReports.filter((r) => r.buildId !== selectedReport.buildId)]
          : profile.buildReports
        ).map((report) => (
          <ExecutiveSecondaryCard
            key={report.id}
            title={`${report.buildLabel.toUpperCase()} · RISK ${report.riskLevel.toUpperCase()}`}
          >
            <div className="grid grid-cols-2 gap-2 mb-2">
              <div>
                <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>REGRESSION SCORE</p>
                <p className="text-[8px] font-futura" style={{ color: REGRESSION_ENGINE_ACCENT, fontWeight: 515 }}>{report.regressionScore}%</p>
              </div>
              <div>
                <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>RISK LEVEL</p>
                <p className="text-[8px] font-futura" style={{ color: RISK_COLOR[report.riskLevel], fontWeight: 515 }}>{report.riskLevel}</p>
              </div>
              <div>
                <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>BROKEN FEATURES</p>
                <p className="text-[8px] font-futura" style={{ color: report.brokenFeaturesCount > 0 ? '#EF4444' : '#10B981', fontWeight: 515 }}>{report.brokenFeaturesCount}</p>
              </div>
            </div>
            <ExecutiveSecondaryCard title="BROKEN FEATURES">
              {report.brokenFeatures.map((f) => (
                <p key={f} className="text-[6px] font-futura mb-1" style={{ color: '#EF4444', lineHeight: 1.4 }}>
                  · {f}
                </p>
              ))}
            </ExecutiveSecondaryCard>
            <ExecutiveSecondaryCard title="UNEXPECTED CHANGES">
              {report.unexpectedChanges.map((c) => (
                <p key={c} className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.4 }}>
                  · {c}
                </p>
              ))}
            </ExecutiveSecondaryCard>
            <ExecutiveSecondaryCard title="AFFECTED SYSTEMS">
              {report.affectedSystems.map((s) => (
                <p key={s} className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
                  · {s}
                </p>
              ))}
            </ExecutiveSecondaryCard>
            <ExecutiveSecondaryCard title="ROOT CAUSE ANALYSIS">
              <p className="text-[6px] font-futura" style={{ color: REGRESSION_ENGINE_ACCENT, lineHeight: 1.45 }}>
                {report.rootCauseAnalysis}
              </p>
            </ExecutiveSecondaryCard>
            <ExecutiveSecondaryCard title="SUGGESTED FIXES">
              {report.suggestedFixes.map((fix) => (
                <p key={fix} className="text-[6px] font-futura mb-1" style={{ color: REGRESSION_ENGINE_ACCENT, lineHeight: 1.4 }}>
                  · {fix}
                </p>
              ))}
            </ExecutiveSecondaryCard>
            <ExecutiveSecondaryCard title="ROLLBACK RECOMMENDATION">
              <p className="text-[6px] font-futura" style={{ color: report.riskLevel === 'critical' || report.riskLevel === 'high' ? '#EF4444' : ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
                {report.rollbackRecommendation}
              </p>
            </ExecutiveSecondaryCard>
            <p className="text-[6px] font-futura mt-1" style={{ color: report.regressionScore >= 85 ? '#10B981' : '#EF4444', lineHeight: 1.45 }}>
              {report.regressionVerdict}
            </p>
            <button type="button" onClick={() => handleSelectBuild(report.buildId)} className="mt-2 px-2 py-1 text-[6px] font-futura uppercase border" style={{ borderColor: REGRESSION_ENGINE_ACCENT, color: REGRESSION_ENGINE_ACCENT }}>
              VIEW BROKEN FEATURES →
            </button>
          </ExecutiveSecondaryCard>
        ))}
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  const renderReplays = () => {
    const replays = selectedReport
      ? profile.replayResults.slice(0, 20)
      : profile.replayResults.slice(0, 20);

    return (
      <ExecutivePageShell>
        <ExecutiveFocusPanel title={selectedReport ? `REPLAYS · ${selectedReport.buildLabel.toUpperCase()}` : '10 AUTOMATIC JOURNEY REPLAYS'}>
          <p className="text-[6px] font-futura mb-3" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
            Customer journeys · Employee workflows · Expert consultations · Marketplace · Knowledge · Appointments · AI · Automations · Onboarding · Org creation
          </p>
          {REGRESSION_REPLAYS.map((replayType) => {
            const replay = replays.find((r) => r.replay === replayType);
            if (!replay) return null;
            return (
              <ExecutiveSecondaryCard key={replayType} title={`${REGRESSION_REPLAY_LABELS[replayType].toUpperCase()} · ${replay.passed ? 'PASS' : 'REGRESSION'}`}>
                <p className="text-[6px] font-futura mb-1" style={{ color: replay.passed ? '#10B981' : '#EF4444', fontWeight: 515 }}>
                  Score {replay.regressionScore}% · {replay.stepsReplayed} steps replayed
                </p>
                <ExecutiveSecondaryCard title="SYSTEMS TESTED">
                  {replay.systemsTested.map((s) => (
                    <p key={s} className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
                      · {s}
                    </p>
                  ))}
                </ExecutiveSecondaryCard>
                <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
                  {replay.summary}
                </p>
              </ExecutiveSecondaryCard>
            );
          })}
        </ExecutiveFocusPanel>
      </ExecutivePageShell>
    );
  };

  const renderBroken = () => {
    const features = selectedReport
      ? profile.brokenFeatures.filter((f) => selectedReport.brokenFeatures.includes(f.featureLabel))
      : profile.brokenFeatures;

    return (
      <ExecutivePageShell>
        <ExecutiveFocusPanel title={selectedReport ? `BROKEN FEATURES · ${selectedReport.buildLabel.toUpperCase()}` : 'ALL BROKEN FEATURES'}>
          {features.slice(0, 16).map((feature) => (
            <ExecutiveSecondaryCard key={feature.id} title={`${feature.featureLabel.toUpperCase()} · ${feature.categoryLabel.toUpperCase()}`}>
              <p className="text-[6px] font-futura mb-1" style={{ color: SEVERITY_COLOR[feature.severity], fontWeight: 515 }}>
                [{feature.severity.toUpperCase()}]
              </p>
              <p className="text-[6px] font-futura mb-2" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
                {feature.description}
              </p>
              <ExecutiveSecondaryCard title="UNEXPECTED CHANGE">
                <p className="text-[6px] font-futura" style={{ color: '#F59E0B', lineHeight: 1.45 }}>
                  {feature.unexpectedChange}
                </p>
              </ExecutiveSecondaryCard>
              <ExecutiveSecondaryCard title="AFFECTED SYSTEMS">
                {feature.affectedSystems.map((s) => (
                  <p key={s} className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
                    · {s}
                  </p>
                ))}
              </ExecutiveSecondaryCard>
              <ExecutiveSecondaryCard title="ROOT CAUSE">
                <p className="text-[6px] font-futura" style={{ color: REGRESSION_ENGINE_ACCENT, lineHeight: 1.45 }}>
                  {feature.rootCause}
                </p>
              </ExecutiveSecondaryCard>
              <ExecutiveSecondaryCard title="SUGGESTED FIX">
                <p className="text-[6px] font-futura" style={{ color: REGRESSION_ENGINE_ACCENT, lineHeight: 1.45 }}>
                  {feature.suggestedFix}
                </p>
              </ExecutiveSecondaryCard>
              <ExecutiveSecondaryCard title="ROLLBACK RECOMMENDATION">
                <p className="text-[6px] font-futura" style={{ color: '#EF4444', lineHeight: 1.45 }}>
                  {feature.rollbackRecommendation}
                </p>
              </ExecutiveSecondaryCard>
              <p className="text-[6px] font-futura mt-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.4 }}>
                {explainBrokenFeature(feature)}
              </p>
            </ExecutiveSecondaryCard>
          ))}
        </ExecutiveFocusPanel>
      </ExecutivePageShell>
    );
  };

  const renderMemory = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="HISTORICAL MEMORY™ — PERMANENT REGRESSION HISTORY">
        <p className="text-[6px] font-futura mb-3" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
          Studio Intelligence™ identifies recurring patterns — every regression becomes organizational knowledge.
        </p>
        {profile.historicalMemory.map((entry) => (
          <ExecutiveSecondaryCard
            key={entry.id}
            title={`${entry.featureLabel.toUpperCase()} · ${entry.status.toUpperCase()} · ${entry.recurrenceCount}x`}
          >
            <p className="text-[6px] font-futura mb-1" style={{ color: MEMORY_STATUS_COLOR[entry.status], fontWeight: 515 }}>
              {entry.categoryLabel} · discovered {new Date(entry.discoveredAt).toLocaleDateString()}
            </p>
            <p className="text-[6px] font-futura mb-2" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
              {entry.description}
            </p>
            <ExecutiveSecondaryCard title="STUDIO INTELLIGENCE™ PATTERN">
              <p className="text-[6px] font-futura" style={{ color: REGRESSION_ENGINE_ACCENT, lineHeight: 1.45, fontWeight: 515 }}>
                {entry.studioIntelligencePattern}
              </p>
            </ExecutiveSecondaryCard>
            <ExecutiveSecondaryCard title="ROOT CAUSE">
              <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
                {entry.rootCause}
              </p>
            </ExecutiveSecondaryCard>
          </ExecutiveSecondaryCard>
        ))}
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  const renderCategories = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="16 REGRESSION CATEGORIES — AUTO-RETEST ON CHANGE">
        {profile.categoryScores.map((c) => (
          <ExecutiveSecondaryCard key={c.category} title={`${c.label.toUpperCase()} · ${c.status.toUpperCase()}`}>
            <p className="text-[8px] font-futura mb-1" style={{ color: CATEGORY_STATUS_COLOR[c.status] ?? REGRESSION_ENGINE_ACCENT, fontWeight: 515 }}>
              {c.score}% · {c.regressionsCount} regression(s)
            </p>
            <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
              {c.summary}
            </p>
          </ExecutiveSecondaryCard>
        ))}
      </ExecutiveFocusPanel>
      <ExecutiveSecondaryCard title="16 REGRESSION TARGETS">
        <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
          {REGRESSION_CATEGORIES.map((c) => REGRESSION_CATEGORY_LABELS[c]).join(' · ')}
        </p>
      </ExecutiveSecondaryCard>
      <button type="button" onClick={() => navigate(adminStudioPerformanceMonitorPath())} className="mt-2 px-2 py-1 text-[6px] font-futura uppercase border" style={{ borderColor: REGRESSION_ENGINE_ACCENT, color: REGRESSION_ENGINE_ACCENT }}>
        PERFORMANCE MONITOR →
      </button>
    </ExecutivePageShell>
  );

  return (
    <div>
      <StudioOsBrandTagline systemId="regression-engine" />
      <div className="flex flex-wrap gap-1 mb-3 mt-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className="px-2 py-1 text-[6px] font-futura uppercase border"
            style={{
              borderColor: tab === t.id ? REGRESSION_ENGINE_ACCENT : ADMIN_STUDIO_THEME.panelBorder,
              color: tab === t.id ? REGRESSION_ENGINE_ACCENT : ADMIN_STUDIO_THEME.textSecondary,
              fontWeight: tab === t.id ? 515 : 400,
            }}
          >
            {t.label}
          </button>
        ))}
        <button type="button" onClick={handleRefresh} className="px-2 py-1 text-[6px] font-futura uppercase border ml-auto" style={{ borderColor: REGRESSION_ENGINE_ACCENT, color: REGRESSION_ENGINE_ACCENT }}>
          SYNC REGRESSION ENGINE
        </button>
      </div>
      <div className="flex gap-2 mb-3">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search regressions, patterns, rollback…"
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
                  const report = profile.buildReports.find((r) => r.id === h.id);
                  if (report) handleSelectBuild(report.buildId);
                }
                if (h.type === 'broken-feature') setTab('broken');
                if (h.type === 'replay') setTab('replays');
                if (h.type === 'memory') setTab('memory');
                if (h.type === 'category') setTab('categories');
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
      {tab === 'replays' && renderReplays()}
      {tab === 'broken' && renderBroken()}
      {tab === 'memory' && renderMemory()}
      {tab === 'categories' && renderCategories()}
    </div>
  );
}
