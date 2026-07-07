import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEngineeringExcellenceState } from '../../../../hooks/useEngineeringExcellenceState';
import {
  ENGINEERING_EXCELLENCE_ACCENT,
  ENGINEERING_EXCELLENCE_PHILOSOPHY,
  EXCELLENCE_PERIOD_LABELS,
  EXCELLENCE_PERIODS,
  HEALTH_PILLARS,
  HEALTH_PILLAR_LABELS,
  queryEngineeringExcellence,
  refreshEngineeringExcellence,
  selectExcellencePeriod,
} from '../../../../studio-os-core/engineering-excellence-dashboard';
import {
  adminStudioMissionControlPath,
  adminStudioReleaseReadinessPath,
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

type ExcellenceTab = 'overview' | 'health' | 'kpis' | 'briefing' | 'history' | 'culture' | 'manifest';

const TABS: { id: ExcellenceTab; label: string }[] = [
  { id: 'overview', label: 'OVERVIEW' },
  { id: 'manifest', label: 'MANIFEST RECONCILIATION' },
  { id: 'health', label: 'HEALTH PILLARS' },
  { id: 'kpis', label: 'ENGINEERING KPIs' },
  { id: 'briefing', label: 'EXECUTIVE BRIEFING' },
  { id: 'history', label: 'HISTORICAL EXCELLENCE™' },
  { id: 'culture', label: 'ENGINEERING CULTURE™' },
];

const STATUS_COLOR: Record<string, string> = {
  excellent: '#10B981',
  healthy: '#059669',
  watch: '#F59E0B',
  'at-risk': '#EF4444',
};

const TREND_COLOR: Record<string, string> = {
  improving: '#10B981',
  stable: '#0369A1',
  declining: '#EF4444',
};

export function EngineeringExcellenceDashboardWorkspace() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<ExcellenceTab>('overview');
  const [searchQuery, setSearchQuery] = useState('performance');
  const { profile, refresh } = useEngineeringExcellenceState();

  if (!profile) {
    return (
      <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
        ENGINEERING EXCELLENCE DASHBOARD™ LOADING — AGGREGATING HEALTH, QUALITY, AND READINESS ACROSS STUDIO OS
      </p>
    );
  }

  const searchHits = queryEngineeringExcellence(searchQuery, profile, 8);
  const brief = profile.executiveBrief;

  const handleSelectPeriod = (period: (typeof EXCELLENCE_PERIODS)[number]) => {
    selectExcellencePeriod(profile.organizationId, period);
    refresh();
    setTab('history');
  };

  const handleRefresh = () => {
    refreshEngineeringExcellence(profile.organizationId);
    refresh();
  };

  const renderOverview = () => (
    <ExecutivePageShell>
      <ExecutiveHeroCard
        eyebrow="MILESTONE 162 · ENGINEERING EXCELLENCE DASHBOARD™ · COMMAND CENTER"
        title={profile.companyName.toUpperCase()}
        subtitle="Real-time executive overview of health, quality, and readiness — measuring discipline, consistency, craftsmanship, and long-term health."
        progressPct={profile.overallEngineeringScore}
        stats={[
          { label: 'STABILITY', value: `${profile.productionStabilityScore}%` },
          { label: 'CONFIDENCE', value: `${profile.averageReleaseConfidence}%` },
          { label: 'RISKS', value: `${profile.openRisksCount}` },
          { label: 'CRITICAL', value: `${profile.criticalIssuesCount}` },
        ]}
      />
      <div className="flex items-center gap-3 mb-2">
        <ExecutiveHealthRing value={profile.overallEngineeringScore} size={56} label="ENG" accent={ENGINEERING_EXCELLENCE_ACCENT} />
        <div>
          {ENGINEERING_EXCELLENCE_PHILOSOPHY.slice(0, 2).map((line) => (
            <p key={line} className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
              {line}
            </p>
          ))}
        </div>
      </div>
      <ExecutiveSecondaryCard title="MASTER SPECIFICATION · RECONCILIATION">
        <p className="text-[6px] font-futura mb-1" style={{ color: ENGINEERING_EXCELLENCE_ACCENT, fontWeight: 515, lineHeight: 1.5 }}>
          {profile.manifestReconciliation.summaryLine}
        </p>
        <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
          Live match {profile.manifestReconciliation.liveMatchPct}% · Compiled {new Date(profile.manifestReconciliation.compiledAt).toLocaleString()}
        </p>
      </ExecutiveSecondaryCard>
      <button type="button" onClick={() => setTab('manifest')} className="mt-2 mr-2 px-2 py-1 text-[6px] font-futura uppercase border" style={{ borderColor: ENGINEERING_EXCELLENCE_ACCENT, color: ENGINEERING_EXCELLENCE_ACCENT }}>
        MANIFEST RECONCILIATION™ →
      </button>
      <ExecutiveSecondaryCard title="EXCELLENCE IS A PERMANENT MINDSET">
        <p className="text-[6px] font-futura mb-2" style={{ color: ENGINEERING_EXCELLENCE_ACCENT, fontWeight: 515, lineHeight: 1.5 }}>
          Studio OS rewards engineering excellence rather than speed alone — world-class habits for teams of one.
        </p>
        <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
          {profile.dockExcellenceLine}
        </p>
      </ExecutiveSecondaryCard>
      <ExecutiveFocusPanel title="HEALTH PILLARS AT A GLANCE">
        {profile.healthPillars.slice(0, 6).map((p) => (
          <button key={p.pillar} type="button" onClick={() => setTab('health')} className="block w-full text-left mb-2 bg-transparent border-0 cursor-pointer">
            <p className="text-[6px] font-futura" style={{ color: STATUS_COLOR[p.status], fontWeight: 515 }}>
              {p.label} · {p.score}% · {p.trend}
            </p>
            <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.4 }}>
              {p.summary}
            </p>
          </button>
        ))}
      </ExecutiveFocusPanel>
      <button type="button" onClick={() => setTab('briefing')} className="mt-2 mr-2 px-2 py-1 text-[6px] font-futura uppercase border" style={{ borderColor: ENGINEERING_EXCELLENCE_ACCENT, color: ENGINEERING_EXCELLENCE_ACCENT }}>
        EXECUTIVE BRIEFING →
      </button>
      <button type="button" onClick={() => setTab('culture')} className="mt-2 mr-2 px-2 py-1 text-[6px] font-futura uppercase border" style={{ borderColor: ENGINEERING_EXCELLENCE_ACCENT, color: ENGINEERING_EXCELLENCE_ACCENT }}>
        ENGINEERING CULTURE™ →
      </button>
      <button type="button" onClick={() => navigate(adminStudioMissionControlPath())} className="mt-2 px-2 py-1 text-[6px] font-futura uppercase border" style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, color: ADMIN_STUDIO_THEME.textSecondary }}>
        MISSION CONTROL →
      </button>
    </ExecutivePageShell>
  );

  const renderHealth = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="12 HEALTH PILLARS — REAL-TIME ENGINEERING OVERVIEW">
        {profile.healthPillars.map((p) => (
          <ExecutiveSecondaryCard key={p.pillar} title={`${p.label.toUpperCase()} · ${p.status.toUpperCase()}`}>
            <p className="text-[8px] font-futura mb-1" style={{ color: STATUS_COLOR[p.status], fontWeight: 515 }}>
              {p.score}% · {p.trend}
            </p>
            <p className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
              Source: {p.sourceSystem}
            </p>
            <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
              {p.summary}
            </p>
          </ExecutiveSecondaryCard>
        ))}
      </ExecutiveFocusPanel>
      <ExecutiveSecondaryCard title="12 DISPLAY TARGETS">
        <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
          {HEALTH_PILLARS.map((p) => HEALTH_PILLAR_LABELS[p]).join(' · ')}
        </p>
      </ExecutiveSecondaryCard>
    </ExecutivePageShell>
  );

  const renderKpis = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="10 ENGINEERING KPIs">
        {profile.engineeringKpis.map((k) => (
          <ExecutiveSecondaryCard key={k.kpi} title={`${k.label.toUpperCase()} · ${k.status.toUpperCase()}`}>
            <p className="text-[8px] font-futura mb-1" style={{ color: STATUS_COLOR[k.status], fontWeight: 515 }}>
              {k.value} · {k.trend}
            </p>
            <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
              {k.summary}
            </p>
          </ExecutiveSecondaryCard>
        ))}
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  const renderBriefing = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="EXECUTIVE BRIEFING — STUDIO INTELLIGENCE™">
        <ExecutiveSecondaryCard title="ENGINEERING ACHIEVEMENTS">
          {brief.engineeringAchievements.map((a) => (
            <p key={a} className="text-[6px] font-futura mb-1" style={{ color: '#10B981', lineHeight: 1.4 }}>
              · {a}
            </p>
          ))}
        </ExecutiveSecondaryCard>
        <ExecutiveSecondaryCard title="CURRENT PRIORITIES">
          {brief.currentPriorities.map((p) => (
            <p key={p} className="text-[6px] font-futura mb-1" style={{ color: ENGINEERING_EXCELLENCE_ACCENT, lineHeight: 1.4 }}>
              · {p}
            </p>
          ))}
        </ExecutiveSecondaryCard>
        <ExecutiveSecondaryCard title="GROWING RISKS">
          {brief.growingRisks.map((r) => (
            <p key={r} className="text-[6px] font-futura mb-1" style={{ color: '#EF4444', lineHeight: 1.4 }}>
              · {r}
            </p>
          ))}
        </ExecutiveSecondaryCard>
        <ExecutiveSecondaryCard title="IMPROVING SYSTEMS">
          {brief.improvingSystems.map((s) => (
            <p key={s} className="text-[6px] font-futura mb-1" style={{ color: '#10B981', lineHeight: 1.4 }}>
              · {s}
            </p>
          ))}
        </ExecutiveSecondaryCard>
        <ExecutiveSecondaryCard title="SUGGESTED INVESTMENTS">
          {brief.suggestedInvestments.map((i) => (
            <p key={i} className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.4 }}>
              · {i}
            </p>
          ))}
        </ExecutiveSecondaryCard>
        <ExecutiveSecondaryCard title="UPCOMING RELEASE READINESS">
          <p className="text-[6px] font-futura" style={{ color: ENGINEERING_EXCELLENCE_ACCENT, lineHeight: 1.45 }}>
            {brief.upcomingReleaseReadiness}
          </p>
        </ExecutiveSecondaryCard>
        <ExecutiveSecondaryCard title="STUDIO INTELLIGENCE™ SUMMARY">
          <p className="text-[6px] font-futura" style={{ color: ENGINEERING_EXCELLENCE_ACCENT, lineHeight: 1.45, fontWeight: 515 }}>
            {brief.studioIntelligenceSummary}
          </p>
        </ExecutiveSecondaryCard>
        <button type="button" onClick={() => navigate(adminStudioReleaseReadinessPath())} className="mt-2 px-2 py-1 text-[6px] font-futura uppercase border" style={{ borderColor: ENGINEERING_EXCELLENCE_ACCENT, color: ENGINEERING_EXCELLENCE_ACCENT }}>
          RELEASE READINESS →
        </button>
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  const renderHistory = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title={`HISTORICAL EXCELLENCE™ — ${EXCELLENCE_PERIOD_LABELS[profile.selectedPeriod].toUpperCase()}`}>
        <p className="text-[6px] font-futura mb-3" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
          Track engineering quality improving over time — not just current status.
        </p>
        {profile.historicalExcellence.map((h) => (
          <ExecutiveSecondaryCard
            key={h.id}
            title={`${h.periodLabel.toUpperCase()} · ${h.engineeringScore}%${profile.selectedPeriod === h.period ? ' · SELECTED' : ''}`}
          >
            <p className="text-[6px] font-futura mb-1" style={{ color: TREND_COLOR[h.deltaFromPrior >= 0 ? 'improving' : 'declining'], fontWeight: 515 }}>
              {h.deltaFromPrior >= 0 ? '+' : ''}{h.deltaFromPrior}% vs prior period
            </p>
            <p className="text-[6px] font-futura mb-2" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
              {h.summary}
            </p>
            <button type="button" onClick={() => handleSelectPeriod(h.period)} className="px-2 py-1 text-[6px] font-futura uppercase border" style={{ borderColor: ENGINEERING_EXCELLENCE_ACCENT, color: ENGINEERING_EXCELLENCE_ACCENT }}>
              SELECT PERIOD →
            </button>
          </ExecutiveSecondaryCard>
        ))}
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  const renderManifest = () => {
    const m = profile.manifestReconciliation;
    const volI = m.volumeICoverage;
    return (
      <ExecutivePageShell>
        <ExecutiveFocusPanel title="MANIFEST RECONCILIATION™ · MASTER SPEC COVERAGE">
          <ExecutiveSecondaryCard title="RECONCILIATION SUMMARY">
            <p className="text-[6px] font-futura mb-2" style={{ color: ENGINEERING_EXCELLENCE_ACCENT, fontWeight: 515 }}>
              {m.authoringSummary}
            </p>
            <p className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
              {m.summaryLine}
            </p>
            <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
              Orphaned live modules: {m.orphanedLiveModules} · ID conflicts: {m.idConflictCount}
            </p>
          </ExecutiveSecondaryCard>
          {volI ? (
            <ExecutiveSecondaryCard title="VOLUME I · CORE OPERATING SYSTEM">
              <p className="text-[6px] font-futura mb-1" style={{ color: ENGINEERING_EXCELLENCE_ACCENT, fontWeight: 515 }}>
                {volI.chapterCount} chapters · {volI.milestoneCount} milestones · {volI.completeCount} complete
              </p>
              <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
                Live matched: {volI.matchedLive} · Planned only: {volI.plannedOnly}
              </p>
            </ExecutiveSecondaryCard>
          ) : null}
          <ExecutiveSecondaryCard title="VOLUME COVERAGE">
            {m.volumeCoverage
              .filter((v) => v.milestoneCount > 0)
              .slice(0, 10)
              .map((v) => (
                <p key={v.volumeId} className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
                  {v.volumeId}: {v.milestoneCount} milestones · {v.completeCount} complete · {v.matchedLive} live
                  {v.chapterCount ? ` · ${v.chapterCount} chapters` : ''}
                </p>
              ))}
          </ExecutiveSecondaryCard>
          <ExecutiveSecondaryCard title="MANIFEST AUTHORING™ ISSUES">
            {m.topAuthoringIssues.length ? (
              m.topAuthoringIssues.map((issue) => (
                <p key={issue} className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
                  {issue}
                </p>
              ))
            ) : (
              <p className="text-[6px] font-futura" style={{ color: '#10B981' }}>
                No authoring issues detected.
              </p>
            )}
          </ExecutiveSecondaryCard>
        </ExecutiveFocusPanel>
      </ExecutivePageShell>
    );
  };

  const renderCulture = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="ENGINEERING CULTURE™ — CELEBRATE EXCELLENCE">
        <p className="text-[6px] font-futura mb-3" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
          Zero-regression releases · Accessibility improvements · Performance milestones · Design consistency · Knowledge quality · Automation reliability · Documentation excellence
        </p>
        {profile.cultureCelebrations.map((c) => (
          <ExecutiveSecondaryCard key={c.id} title={`${c.achievementLabel.toUpperCase()} · ${c.title.toUpperCase()}`}>
            <p className="text-[6px] font-futura mb-1" style={{ color: '#10B981', fontWeight: 515 }}>
              Celebrated {new Date(c.celebratedAt).toLocaleDateString()}
            </p>
            <p className="text-[6px] font-futura mb-2" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
              {c.description}
            </p>
            <ExecutiveSecondaryCard title="IMPACT">
              <p className="text-[6px] font-futura" style={{ color: ENGINEERING_EXCELLENCE_ACCENT, lineHeight: 1.45 }}>
                {c.impactSummary}
              </p>
            </ExecutiveSecondaryCard>
          </ExecutiveSecondaryCard>
        ))}
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  return (
    <div>
      <StudioOsBrandTagline systemId="engineering-excellence-dashboard" />
      <div className="flex flex-wrap gap-1 mb-3 mt-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className="px-2 py-1 text-[6px] font-futura uppercase border"
            style={{
              borderColor: tab === t.id ? ENGINEERING_EXCELLENCE_ACCENT : ADMIN_STUDIO_THEME.panelBorder,
              color: tab === t.id ? ENGINEERING_EXCELLENCE_ACCENT : ADMIN_STUDIO_THEME.textSecondary,
              fontWeight: tab === t.id ? 515 : 400,
            }}
          >
            {t.label}
          </button>
        ))}
        <button type="button" onClick={handleRefresh} className="px-2 py-1 text-[6px] font-futura uppercase border ml-auto" style={{ borderColor: ENGINEERING_EXCELLENCE_ACCENT, color: ENGINEERING_EXCELLENCE_ACCENT }}>
          SYNC DASHBOARD
        </button>
      </div>
      <div className="flex gap-2 mb-3">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search health, KPIs, culture, briefing…"
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
                if (h.type === 'pillar') setTab('health');
                if (h.type === 'kpi') setTab('kpis');
                if (h.type === 'brief') setTab('briefing');
                if (h.type === 'history') setTab('history');
                if (h.type === 'culture') setTab('culture');
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
      {tab === 'manifest' && renderManifest()}
      {tab === 'health' && renderHealth()}
      {tab === 'kpis' && renderKpis()}
      {tab === 'briefing' && renderBriefing()}
      {tab === 'history' && renderHistory()}
      {tab === 'culture' && renderCulture()}
    </div>
  );
}
