import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useExecutiveTrustDashboardState } from '../../../../hooks/useExecutiveTrustDashboardState';
import {
  EXECUTIVE_TRUST_DASHBOARD_ACCENT,
  EXECUTIVE_TRUST_DASHBOARD_PHILOSOPHY,
  TRUST_HISTORY_PERIOD_LABELS,
  queryExecutiveTrustDashboard,
  refreshTrustDashboard,
} from '../../../../studio-os-core/executive-trust-dashboard';
import type { TrustHistoryPeriod } from '../../../../studio-os-core/executive-trust-dashboard';
import {
  adminStudioAiRedTeamPath,
  adminStudioQaHeadquartersPath,
  adminStudioMissionControlPath,
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

type TrustTab = 'overview' | 'systems' | 'history' | 'priorities';

const TABS: { id: TrustTab; label: string }[] = [
  { id: 'overview', label: 'EXECUTIVE SUMMARY' },
  { id: 'systems', label: 'SYSTEM TRUST' },
  { id: 'history', label: 'HISTORICAL TRUST' },
  { id: 'priorities', label: 'PRIORITIES' },
];

const RISK_COLOR: Record<string, string> = {
  low: '#10B981',
  medium: '#F59E0B',
  high: '#F97316',
  critical: '#EF4444',
};

const TREND_ICON: Record<string, string> = {
  rising: '↑',
  stable: '→',
  declining: '↓',
};

export function ExecutiveTrustDashboardWorkspace() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<TrustTab>('overview');
  const [historyPeriod, setHistoryPeriod] = useState<TrustHistoryPeriod>('monthly');
  const [searchQuery, setSearchQuery] = useState('automation');
  const { profile, refresh } = useExecutiveTrustDashboardState();

  if (!profile) {
    return (
      <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
        EXECUTIVE TRUST DASHBOARD™ LOADING — MEASURING ORGANIZATIONAL CONFIDENCE
      </p>
    );
  }

  const searchHits = queryExecutiveTrustDashboard(searchQuery, profile, 8);
  const summary = profile.executiveSummary;
  const historyPoint = profile.trustHistory.find((h) => h.period === historyPeriod) ?? profile.trustHistory[2];

  const handleRefresh = () => {
    refreshTrustDashboard(profile.organizationId);
    refresh();
  };

  const renderOverview = () => (
    <ExecutivePageShell>
      <ExecutiveHeroCard
        eyebrow="MILESTONE 147 · EXECUTIVE TRUST DASHBOARD™ · TRUST AS FIRST-CLASS METRIC"
        title={profile.companyName.toUpperCase()}
        subtitle="How much confidence do you have in your entire organization today? Studio OS answers before you ask."
        progressPct={profile.overallTrustScore}
        stats={[
          { label: 'TRUST', value: `${profile.overallTrustScore}%` },
          { label: 'HEALTH', value: `${profile.overallHealthScore}%` },
          { label: 'CONFIDENCE', value: `${profile.overallConfidence}%` },
          { label: 'AT RISK', value: `${profile.systemsAtRisk}` },
        ]}
      />
      <div className="flex items-center gap-3 mb-2">
        <ExecutiveHealthRing value={profile.overallTrustScore} size={56} label="TRUST" accent={EXECUTIVE_TRUST_DASHBOARD_ACCENT} />
        <ExecutiveHealthRing value={profile.overallConfidence} size={56} label="CONF" accent="#6366F1" />
        <div>
          {EXECUTIVE_TRUST_DASHBOARD_PHILOSOPHY.slice(0, 2).map((line) => (
            <p key={line} className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
              {line}
            </p>
          ))}
        </div>
      </div>
      <ExecutiveSecondaryCard title="STUDIO INTELLIGENCE™ EXECUTIVE BRIEFING">
        <p className="text-[6px] font-futura mb-2" style={{ color: EXECUTIVE_TRUST_DASHBOARD_ACCENT, fontWeight: 515, lineHeight: 1.55 }}>
          {summary.studioIntelligenceBriefing}
        </p>
        <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
          Confidence trend: {TREND_ICON[summary.confidenceTrend]} {summary.confidenceTrend.toUpperCase()}
        </p>
      </ExecutiveSecondaryCard>
      <ExecutiveFocusPanel title="SYSTEMS REQUIRING ATTENTION">
        {summary.systemsRequiringAttention.length === 0 ? (
          <p className="text-[6px] font-futura" style={{ color: '#10B981' }}>All systems within trust threshold.</p>
        ) : (
          summary.systemsRequiringAttention.map((s) => (
            <p key={s} className="text-[6px] font-futura mb-1" style={{ color: '#F59E0B' }}>· {s}</p>
          ))
        )}
      </ExecutiveFocusPanel>
      <ExecutiveFocusPanel title="RECENT IMPROVEMENTS">
        {summary.recentImprovements.map((imp) => (
          <p key={imp} className="text-[6px] font-futura mb-1" style={{ color: '#10B981' }}>· {imp}</p>
        ))}
      </ExecutiveFocusPanel>
      <button type="button" onClick={() => navigate(adminStudioQaHeadquartersPath())} className="mt-2 mr-2 px-2 py-1 text-[6px] font-futura uppercase border" style={{ borderColor: EXECUTIVE_TRUST_DASHBOARD_ACCENT, color: EXECUTIVE_TRUST_DASHBOARD_ACCENT }}>
        QA HEADQUARTERS →
      </button>
      <button type="button" onClick={() => navigate(adminStudioAiRedTeamPath())} className="mt-2 mr-2 px-2 py-1 text-[6px] font-futura uppercase border" style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, color: ADMIN_STUDIO_THEME.textSecondary }}>
        AI RED TEAM →
      </button>
      <button type="button" onClick={() => navigate(adminStudioMissionControlPath())} className="mt-2 px-2 py-1 text-[6px] font-futura uppercase border" style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, color: ADMIN_STUDIO_THEME.textSecondary }}>
        MISSION CONTROL →
      </button>
    </ExecutivePageShell>
  );

  const renderSystems = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="13 EXECUTIVE TRUST INDICATORS">
        {profile.systemIndicators.map((ind) => (
          <ExecutiveSecondaryCard key={ind.systemId} title={`${ind.label.toUpperCase()} · ${ind.trustScore}% TRUST · ${ind.status.toUpperCase()}`}>
            <div className="grid grid-cols-2 gap-1 mb-2">
              <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>Health: {ind.healthScore}%</p>
              <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>Confidence: {ind.confidence}%</p>
              <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>Trend: {TREND_ICON[ind.trend]} {ind.trend}</p>
              <p className="text-[6px] font-futura" style={{ color: RISK_COLOR[ind.riskLevel] }}>Risk: {ind.riskLevel.toUpperCase()}</p>
              <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>Issues: {ind.recentIssues}</p>
              <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>Validated: {new Date(ind.lastValidation).toLocaleDateString()}</p>
            </div>
            <p className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
              Last simulation: {new Date(ind.lastSimulation).toLocaleDateString()}
            </p>
            <p className="text-[6px] font-futura" style={{ color: EXECUTIVE_TRUST_DASHBOARD_ACCENT, fontWeight: 515, lineHeight: 1.45 }}>
              → {ind.recommendedAction}
            </p>
          </ExecutiveSecondaryCard>
        ))}
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  const renderHistory = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="HISTORICAL TRUST — MEASURABLE, NOT ASSUMED">
        <div className="flex flex-wrap gap-1 mb-3">
          {(Object.keys(TRUST_HISTORY_PERIOD_LABELS) as TrustHistoryPeriod[]).map((period) => (
            <button
              key={period}
              type="button"
              onClick={() => setHistoryPeriod(period)}
              className="px-2 py-1 text-[6px] font-futura uppercase border"
              style={{
                borderColor: historyPeriod === period ? EXECUTIVE_TRUST_DASHBOARD_ACCENT : ADMIN_STUDIO_THEME.panelBorder,
                color: historyPeriod === period ? EXECUTIVE_TRUST_DASHBOARD_ACCENT : ADMIN_STUDIO_THEME.textSecondary,
              }}
            >
              {TRUST_HISTORY_PERIOD_LABELS[period]}
            </button>
          ))}
        </div>
        {historyPoint ? (
          <ExecutiveSecondaryCard title={`${historyPoint.label.toUpperCase()} · ${historyPoint.trustScore}%`}>
            <p className="text-[6px] font-futura mb-1" style={{ color: EXECUTIVE_TRUST_DASHBOARD_ACCENT, fontWeight: 515 }}>
              Delta from prior: {historyPoint.deltaFromPrior >= 0 ? '+' : ''}{historyPoint.deltaFromPrior}%
            </p>
            <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
              Recorded {new Date(historyPoint.recordedAt).toLocaleString()}
            </p>
          </ExecutiveSecondaryCard>
        ) : null}
        {profile.trustHistory.map((h) => (
          <ExecutiveSecondaryCard key={h.period} title={`${h.label.toUpperCase()} · ${h.trustScore}%`}>
            <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
              {h.deltaFromPrior >= 0 ? '+' : ''}{h.deltaFromPrior}% from prior period
            </p>
          </ExecutiveSecondaryCard>
        ))}
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  const renderPriorities = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="HIGHEST OPERATIONAL RISKS">
        {summary.highestOperationalRisks.length === 0 ? (
          <p className="text-[6px] font-futura" style={{ color: '#10B981' }}>No critical operational risks.</p>
        ) : (
          summary.highestOperationalRisks.map((r) => (
            <ExecutiveSecondaryCard key={r} title="OPERATIONAL RISK">
              <p className="text-[6px] font-futura" style={{ color: '#F97316', lineHeight: 1.45 }}>{r}</p>
            </ExecutiveSecondaryCard>
          ))
        )}
      </ExecutiveFocusPanel>
      <ExecutiveFocusPanel title="SUGGESTED PRIORITIES">
        {summary.suggestedPriorities.map((p, idx) => (
          <ExecutiveSecondaryCard key={p} title={`PRIORITY ${idx + 1}`}>
            <p className="text-[6px] font-futura" style={{ color: EXECUTIVE_TRUST_DASHBOARD_ACCENT, fontWeight: 515, lineHeight: 1.45 }}>
              → {p}
            </p>
          </ExecutiveSecondaryCard>
        ))}
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  return (
    <div>
      <StudioOsBrandTagline systemId="executive-trust-dashboard" />
      <div className="flex flex-wrap gap-1 mb-3">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className="px-2 py-1 text-[6px] font-futura uppercase border"
            style={{
              borderColor: tab === t.id ? EXECUTIVE_TRUST_DASHBOARD_ACCENT : ADMIN_STUDIO_THEME.panelBorder,
              color: tab === t.id ? EXECUTIVE_TRUST_DASHBOARD_ACCENT : ADMIN_STUDIO_THEME.textSecondary,
              fontWeight: tab === t.id ? 515 : 400,
            }}
          >
            {t.label}
          </button>
        ))}
      </div>
      {tab === 'overview' ? renderOverview() : null}
      {tab === 'systems' ? renderSystems() : null}
      {tab === 'history' ? renderHistory() : null}
      {tab === 'priorities' ? renderPriorities() : null}
      <div className="mt-3">
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search systems, risks…"
          className="w-full px-2 py-1 text-[7px] font-futura border mb-2"
          style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, background: 'transparent', color: ADMIN_STUDIO_THEME.textPrimary }}
        />
        {searchHits.map((h) => (
          <p key={`${h.type}-${h.id}`} className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
            <span style={{ color: EXECUTIVE_TRUST_DASHBOARD_ACCENT }}>{h.label}</span> · {h.matchReason}
          </p>
        ))}
      </div>
      <button type="button" onClick={handleRefresh} className="mt-2 px-2 py-1 text-[6px] font-futura uppercase border" style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, color: ADMIN_STUDIO_THEME.textSecondary }}>
        REFRESH TRUST DASHBOARD
      </button>
    </div>
  );
}
