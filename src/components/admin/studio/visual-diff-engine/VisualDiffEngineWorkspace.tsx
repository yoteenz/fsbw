import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVisualDiffEngineState } from '../../../../hooks/useVisualDiffEngineState';
import {
  COMPARE_BASE_LABELS,
  COMPARE_BASES,
  VISUAL_DIFF_ENGINE_ACCENT,
  VISUAL_DIFF_PHILOSOPHY,
  queryVisualDiffEngine,
  refreshVisualDiffEngine,
  selectVisualDiffScreen,
  getSelectedVisualReport,
  explainVisualDiffFinding,
} from '../../../../studio-os-core/visual-diff-engine';
import {
  adminStudioDesignComplianceEnginePath,
  adminStudioDesignTokenEnginePath,
  adminStudioExperienceQaPath,
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

type VisualDiffTab = 'overview' | 'reports' | 'golden' | 'findings' | 'compare';

const TABS: { id: VisualDiffTab; label: string }[] = [
  { id: 'overview', label: 'OVERVIEW' },
  { id: 'reports', label: 'VISUAL QA REPORTS' },
  { id: 'golden', label: 'GOLDEN REFERENCE™' },
  { id: 'findings', label: 'DIFF FINDINGS' },
  { id: 'compare', label: 'COMPARE BASES' },
];

const SEVERITY_COLOR: Record<string, string> = {
  critical: '#EF4444',
  warning: '#F59E0B',
  advisory: '#6366F1',
};

const GOLDEN_STATUS_COLOR: Record<string, string> = {
  active: '#10B981',
  'pending-review': '#F59E0B',
  superseded: ADMIN_STUDIO_THEME.textSecondary,
};

export function VisualDiffEngineWorkspace() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<VisualDiffTab>('overview');
  const [searchQuery, setSearchQuery] = useState('spacing');
  const { profile, refresh } = useVisualDiffEngineState();

  if (!profile) {
    return (
      <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
        VISUAL DIFF ENGINE™ LOADING — GUARDIAN OF STUDIO OS VISUAL IDENTITY
      </p>
    );
  }

  const selectedReport = getSelectedVisualReport(profile);
  const searchHits = queryVisualDiffEngine(searchQuery, profile, 8);

  const handleSelectScreen = (screenId: string) => {
    selectVisualDiffScreen(profile.organizationId, screenId);
    refresh();
    setTab('reports');
  };

  const handleRefresh = () => {
    refreshVisualDiffEngine(profile.organizationId);
    refresh();
  };

  const renderOverview = () => (
    <ExecutivePageShell>
      <ExecutiveHeroCard
        eyebrow="MILESTONE 157 · VISUAL DIFF ENGINE™ · STUDIO OS VISUAL MEMORY"
        title={profile.companyName.toUpperCase()}
        subtitle="Continuously compares every interface against the approved Design System. Visual regressions should never surprise the team."
        progressPct={profile.visualMemoryScore}
        stats={[
          { label: 'SCREENS', value: `${profile.screensCompared}` },
          { label: 'DIFFS', value: `${profile.diffsDetected}` },
          { label: 'REGRESSIONS', value: `${profile.screensWithRegressions}` },
          { label: 'GOLDEN', value: `${profile.goldenReferencesActive}` },
        ]}
      />
      <div className="flex items-center gap-3 mb-2">
        <ExecutiveHealthRing value={profile.visualMemoryScore} size={56} label="VD" accent={VISUAL_DIFF_ENGINE_ACCENT} />
        <div>
          {VISUAL_DIFF_PHILOSOPHY.slice(0, 2).map((line) => (
            <p key={line} className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
              {line}
            </p>
          ))}
        </div>
      </div>
      <ExecutiveSecondaryCard title="GUARDIAN OF STUDIO OS VISUAL IDENTITY">
        <p className="text-[6px] font-futura mb-2" style={{ color: VISUAL_DIFF_ENGINE_ACCENT, fontWeight: 515, lineHeight: 1.5 }}>
          When something no longer looks like Studio OS — the Visual Diff Engine™ immediately identifies why.
        </p>
        <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
          {profile.dockVisualDiffLine}
        </p>
      </ExecutiveSecondaryCard>
      <ExecutiveFocusPanel title="VISUAL REGRESSIONS DETECTED">
        {profile.visualReports
          .filter((r) => !r.matchesGoldenReference)
          .slice(0, 4)
          .map((r) => (
            <button key={r.id} type="button" onClick={() => handleSelectScreen(r.screenId)} className="block w-full text-left mb-2 bg-transparent border-0 cursor-pointer">
              <p className="text-[6px] font-futura" style={{ color: '#EF4444', fontWeight: 515 }}>
                {r.screenLabel} · Consistency {r.visualConsistencyScore}% · Brand {r.brandComplianceScore}%
              </p>
              <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.4 }}>
                {r.visualIdentityVerdict.slice(0, 100)}…
              </p>
            </button>
          ))}
        {profile.screensWithRegressions === 0 ? (
          <p className="text-[6px] font-futura" style={{ color: '#10B981' }}>
            All screens match Golden Reference™ baselines.
          </p>
        ) : null}
      </ExecutiveFocusPanel>
      <button type="button" onClick={() => setTab('reports')} className="mt-2 mr-2 px-2 py-1 text-[6px] font-futura uppercase border" style={{ borderColor: VISUAL_DIFF_ENGINE_ACCENT, color: VISUAL_DIFF_ENGINE_ACCENT }}>
        VIEW VISUAL QA REPORTS →
      </button>
      <button type="button" onClick={() => navigate(adminStudioDesignComplianceEnginePath())} className="mt-2 mr-2 px-2 py-1 text-[6px] font-futura uppercase border" style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, color: ADMIN_STUDIO_THEME.textSecondary }}>
        DESIGN COMPLIANCE →
      </button>
      <button type="button" onClick={() => navigate(adminStudioExperienceQaPath())} className="mt-2 px-2 py-1 text-[6px] font-futura uppercase border" style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, color: ADMIN_STUDIO_THEME.textSecondary }}>
        EXPERIENCE QA →
      </button>
    </ExecutivePageShell>
  );

  const renderReports = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="VISUAL QA REPORTS — EVERY SCREEN SCORED">
        {(selectedReport
          ? [selectedReport, ...profile.visualReports.filter((r) => r.screenId !== selectedReport.screenId)]
          : profile.visualReports
        ).map((report) => (
          <ExecutiveSecondaryCard
            key={report.id}
            title={`${report.screenLabel.toUpperCase()} · ${report.matchesGoldenReference ? 'MATCHES GOLDEN ✓' : 'REGRESSION'}`}
          >
            <div className="grid grid-cols-2 gap-2 mb-2">
              {[
                { label: 'CONSISTENCY', value: report.visualConsistencyScore },
                { label: 'BRAND', value: report.brandComplianceScore },
                { label: 'RESPONSIVE', value: report.responsiveScore },
                { label: 'COMPONENTS', value: report.componentIntegrity },
                { label: 'ANIMATION', value: report.animationIntegrity },
                { label: 'LUXURY', value: report.luxuryScore },
              ].map((metric) => (
                <div key={metric.label}>
                  <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
                    {metric.label}
                  </p>
                  <p className="text-[7px] font-futura" style={{ color: VISUAL_DIFF_ENGINE_ACCENT, fontWeight: 515 }}>
                    {metric.value}%
                  </p>
                </div>
              ))}
            </div>
            <ExecutiveSecondaryCard title="SCREENSHOT COMPARISONS">
              {report.screenshotComparisons.map((c) => (
                <p key={c.id} className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.4 }}>
                  · {c.baselineLabel} vs {c.currentLabel} — {c.pixelDiffPct}% pixel diff · {c.summary.slice(0, 80)}…
                </p>
              ))}
            </ExecutiveSecondaryCard>
            <ExecutiveSecondaryCard title="SUGGESTED CORRECTIONS">
              {report.suggestedCorrections.map((item) => (
                <p key={item} className="text-[6px] font-futura mb-1" style={{ color: VISUAL_DIFF_ENGINE_ACCENT, lineHeight: 1.4 }}>
                  · {item}
                </p>
              ))}
            </ExecutiveSecondaryCard>
            <p className="text-[6px] font-futura mt-1" style={{ color: report.matchesGoldenReference ? '#10B981' : '#EF4444', lineHeight: 1.45 }}>
              {report.visualIdentityVerdict}
            </p>
            <button type="button" onClick={() => handleSelectScreen(report.screenId)} className="mt-2 px-2 py-1 text-[6px] font-futura uppercase border" style={{ borderColor: VISUAL_DIFF_ENGINE_ACCENT, color: VISUAL_DIFF_ENGINE_ACCENT }}>
              VIEW DIFF FINDINGS →
            </button>
          </ExecutiveSecondaryCard>
        ))}
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  const renderGolden = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="GOLDEN REFERENCE™ — APPROVED VISUAL BASELINES">
        <p className="text-[6px] font-futura mb-3" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
          Every approved screen becomes a Golden Reference™. Future builds are compared against these references before deployment.
        </p>
        {profile.goldenReferences.map((golden) => (
          <ExecutiveSecondaryCard key={golden.id} title={`${golden.screenLabel.toUpperCase()} · ${golden.referenceVersion}`}>
            <p className="text-[6px] font-futura mb-1" style={{ color: GOLDEN_STATUS_COLOR[golden.status], fontWeight: 515 }}>
              {golden.status.toUpperCase()} · Approved by {golden.approvedBy} · {golden.pixelDiffPct}% current drift
            </p>
            <p className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
              {golden.description}
            </p>
            <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
              {golden.route} · Approved {new Date(golden.approvedAt).toLocaleDateString()}
            </p>
            <button type="button" onClick={() => handleSelectScreen(golden.screenId)} className="mt-2 px-2 py-1 text-[6px] font-futura uppercase border" style={{ borderColor: VISUAL_DIFF_ENGINE_ACCENT, color: VISUAL_DIFF_ENGINE_ACCENT }}>
              COMPARE CURRENT BUILD →
            </button>
          </ExecutiveSecondaryCard>
        ))}
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  const renderFindings = () => {
    const screenFindings = selectedReport
      ? profile.findings.filter((f) => f.screenId === selectedReport.screenId)
      : profile.findings;

    return (
      <ExecutivePageShell>
        <ExecutiveFocusPanel title={selectedReport ? `DIFF FINDINGS · ${selectedReport.screenLabel.toUpperCase()}` : 'ALL VISUAL DIFF FINDINGS'}>
          {screenFindings.slice(0, 16).map((finding) => (
            <ExecutiveSecondaryCard key={finding.id} title={`${finding.issueLabel.toUpperCase()} · VS ${finding.compareBaseLabel.toUpperCase()}`}>
              <p className="text-[6px] font-futura mb-1" style={{ color: SEVERITY_COLOR[finding.severity], fontWeight: 515 }}>
                [{finding.severity.toUpperCase()}] {finding.screenLabel}
              </p>
              <p className="text-[6px] font-futura mb-2" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
                {finding.description}
              </p>
              <ExecutiveSecondaryCard title="VISUAL DELTA">
                <p className="text-[6px] font-futura" style={{ color: '#EF4444', lineHeight: 1.45 }}>
                  {finding.visualDelta}
                </p>
              </ExecutiveSecondaryCard>
              <ExecutiveSecondaryCard title="SUGGESTED CORRECTION">
                <p className="text-[6px] font-futura" style={{ color: VISUAL_DIFF_ENGINE_ACCENT, lineHeight: 1.45 }}>
                  {finding.suggestedCorrection}
                </p>
              </ExecutiveSecondaryCard>
              <p className="text-[6px] font-futura mt-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.4 }}>
                {explainVisualDiffFinding(finding)}
              </p>
            </ExecutiveSecondaryCard>
          ))}
        </ExecutiveFocusPanel>
      </ExecutivePageShell>
    );
  };

  const renderCompare = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="5 COMPARE BASES — CONTINUOUS VISUAL DIFF">
        {COMPARE_BASES.map((base) => (
          <ExecutiveSecondaryCard key={base} title={COMPARE_BASE_LABELS[base].toUpperCase()}>
            <p className="text-[6px] font-futura" style={{ color: VISUAL_DIFF_ENGINE_ACCENT, fontWeight: 515, lineHeight: 1.45 }}>
              Current Build compared against {COMPARE_BASE_LABELS[base]} for every audited screen.
            </p>
            <p className="text-[6px] font-futura mt-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
              {profile.findings.filter((f) => f.compareBase === base).length} diffs detected vs {COMPARE_BASE_LABELS[base]}.
            </p>
          </ExecutiveSecondaryCard>
        ))}
      </ExecutiveFocusPanel>
      <ExecutiveSecondaryCard title="14 DETECTION TARGETS">
        <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
          Spacing shifts · Typography changes · Glass inconsistencies · Color drift · Border radius · Shadows · Animation · Missing components · Component movement · Alignment · Responsive drift · Dark mode · Environmental storytelling · Brand inconsistencies
        </p>
      </ExecutiveSecondaryCard>
      <button type="button" onClick={() => navigate(adminStudioDesignTokenEnginePath())} className="mt-2 px-2 py-1 text-[6px] font-futura uppercase border" style={{ borderColor: VISUAL_DIFF_ENGINE_ACCENT, color: VISUAL_DIFF_ENGINE_ACCENT }}>
        DESIGN TOKEN ENGINE →
      </button>
    </ExecutivePageShell>
  );

  return (
    <div>
      <StudioOsBrandTagline systemId="visual-diff-engine" />
      <div className="flex flex-wrap gap-1 mb-3 mt-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className="px-2 py-1 text-[6px] font-futura uppercase border"
            style={{
              borderColor: tab === t.id ? VISUAL_DIFF_ENGINE_ACCENT : ADMIN_STUDIO_THEME.panelBorder,
              color: tab === t.id ? VISUAL_DIFF_ENGINE_ACCENT : ADMIN_STUDIO_THEME.textSecondary,
              fontWeight: tab === t.id ? 515 : 400,
            }}
          >
            {t.label}
          </button>
        ))}
        <button type="button" onClick={handleRefresh} className="px-2 py-1 text-[6px] font-futura uppercase border ml-auto" style={{ borderColor: VISUAL_DIFF_ENGINE_ACCENT, color: VISUAL_DIFF_ENGINE_ACCENT }}>
          SYNC VISUAL DIFF
        </button>
      </div>
      <div className="flex gap-2 mb-3">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search diffs, golden references, screens…"
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
                if (h.type === 'report' || h.type === 'golden') {
                  const report = profile.visualReports.find((r) => r.id === h.id || r.screenId === h.id.replace('golden-', ''));
                  const golden = profile.goldenReferences.find((g) => g.id === h.id);
                  const screenId = report?.screenId ?? golden?.screenId;
                  if (screenId) handleSelectScreen(screenId);
                }
                if (h.type === 'finding') setTab('findings');
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
      {tab === 'golden' && renderGolden()}
      {tab === 'findings' && renderFindings()}
      {tab === 'compare' && renderCompare()}
    </div>
  );
}
