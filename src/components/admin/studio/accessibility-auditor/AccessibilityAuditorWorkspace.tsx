import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAccessibilityAuditorState } from '../../../../hooks/useAccessibilityAuditorState';
import {
  ACCESSIBILITY_AUDITOR_ACCENT,
  ACCESSIBILITY_AUDITOR_PHILOSOPHY,
  AUDIT_DIMENSION_LABELS,
  AUDIT_DIMENSIONS,
  SIMULATION_USER_LABELS,
  SIMULATION_USER_TYPES,
  queryAccessibilityAuditor,
  refreshAccessibilityAuditor,
  selectAccessibilityPage,
  getSelectedAccessibilityReport,
  explainAccessibilityFinding,
} from '../../../../studio-os-core/accessibility-auditor';
import {
  adminStudioExperienceQaPath,
  adminStudioInteractionEnginePath,
  adminStudioPerformanceMonitorPath,
  adminStudioVisualDiffEnginePath,
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

type AccessibilityTab = 'overview' | 'reports' | 'simulations' | 'findings' | 'dimensions';

const TABS: { id: AccessibilityTab; label: string }[] = [
  { id: 'overview', label: 'OVERVIEW' },
  { id: 'reports', label: 'ACCESSIBILITY REPORTS' },
  { id: 'simulations', label: 'SIMULATIONS' },
  { id: 'findings', label: 'FINDINGS' },
  { id: 'dimensions', label: 'AUDIT DIMENSIONS' },
];

const SEVERITY_COLOR: Record<string, string> = {
  critical: '#EF4444',
  warning: '#F59E0B',
  advisory: '#6366F1',
};

const WCAG_COLOR: Record<string, string> = {
  AAA: '#10B981',
  AA: '#10B981',
  A: '#F59E0B',
  partial: '#F97316',
  'non-compliant': '#EF4444',
};

const STATUS_COLOR: Record<string, string> = {
  excellent: '#10B981',
  watch: '#F59E0B',
  'needs-work': '#EF4444',
};

export function AccessibilityAuditorWorkspace() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<AccessibilityTab>('overview');
  const [searchQuery, setSearchQuery] = useState('contrast');
  const { profile, refresh } = useAccessibilityAuditorState();

  if (!profile) {
    return (
      <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
        ACCESSIBILITY AUDITOR™ LOADING — EVALUATING INCLUSIVE DESIGN ACROSS STUDIO OS
      </p>
    );
  }

  const selectedReport = getSelectedAccessibilityReport(profile);
  const searchHits = queryAccessibilityAuditor(searchQuery, profile, 8);

  const handleSelectPage = (pageId: string) => {
    selectAccessibilityPage(profile.organizationId, pageId);
    refresh();
    setTab('reports');
  };

  const handleRefresh = () => {
    refreshAccessibilityAuditor(profile.organizationId);
    refresh();
  };

  const renderOverview = () => (
    <ExecutivePageShell>
      <ExecutiveHeroCard
        eyebrow="MILESTONE 158 · ACCESSIBILITY AUDITOR™ · INCLUSIVE DESIGN PHILOSOPHY"
        title={profile.companyName.toUpperCase()}
        subtitle="Accessibility should feel invisible. Every organization should confidently use Studio OS regardless of ability, device, or circumstance."
        progressPct={profile.overallAccessibilityScore}
        stats={[
          { label: 'PAGES', value: `${profile.pagesAudited}` },
          { label: 'ISSUES', value: `${profile.issuesOpen}` },
          { label: 'NEED WORK', value: `${profile.pagesNeedingWork}` },
          { label: 'WCAG', value: profile.averageWcagLevel },
        ]}
      />
      <div className="flex items-center gap-3 mb-2">
        <ExecutiveHealthRing value={profile.overallAccessibilityScore} size={56} label="A11Y" accent={ACCESSIBILITY_AUDITOR_ACCENT} />
        <div>
          {ACCESSIBILITY_AUDITOR_PHILOSOPHY.slice(0, 2).map((line) => (
            <p key={line} className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
              {line}
            </p>
          ))}
        </div>
      </div>
      <ExecutiveSecondaryCard title="INCLUSIVE DESIGN IS PREMIUM DESIGN">
        <p className="text-[6px] font-futura mb-2" style={{ color: ACCESSIBILITY_AUDITOR_ACCENT, fontWeight: 515, lineHeight: 1.5 }}>
          The goal is not compliance alone — it is ensuring every experience remains inclusive, understandable, and usable.
        </p>
        <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
          {profile.dockAccessibilityLine}
        </p>
      </ExecutiveSecondaryCard>
      <ExecutiveFocusPanel title="PAGES NEEDING INCLUSIVE REFINEMENT">
        {profile.pageReports
          .filter((p) => !p.inclusivelyUsable)
          .slice(0, 4)
          .map((p) => (
            <button key={p.id} type="button" onClick={() => handleSelectPage(p.pageId)} className="block w-full text-left mb-2 bg-transparent border-0 cursor-pointer">
              <p className="text-[6px] font-futura" style={{ color: WCAG_COLOR[p.wcagComplianceStatus], fontWeight: 515 }}>
                {p.pageLabel} · {p.accessibilityScore}% · WCAG {p.wcagComplianceStatus} · {p.highestSeverity}
              </p>
              <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.4 }}>
                {p.estimatedUserImpact.slice(0, 100)}…
              </p>
            </button>
          ))}
        {profile.pagesNeedingWork === 0 ? (
          <p className="text-[6px] font-futura" style={{ color: '#10B981' }}>
            All audited pages are inclusively usable — accessibility feels invisible.
          </p>
        ) : null}
      </ExecutiveFocusPanel>
      <button type="button" onClick={() => setTab('reports')} className="mt-2 mr-2 px-2 py-1 text-[6px] font-futura uppercase border" style={{ borderColor: ACCESSIBILITY_AUDITOR_ACCENT, color: ACCESSIBILITY_AUDITOR_ACCENT }}>
        VIEW ACCESSIBILITY REPORTS →
      </button>
      <button type="button" onClick={() => navigate(adminStudioInteractionEnginePath())} className="mt-2 mr-2 px-2 py-1 text-[6px] font-futura uppercase border" style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, color: ADMIN_STUDIO_THEME.textSecondary }}>
        INTERACTION ENGINE →
      </button>
      <button type="button" onClick={() => navigate(adminStudioVisualDiffEnginePath())} className="mt-2 mr-2 px-2 py-1 text-[6px] font-futura uppercase border" style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, color: ADMIN_STUDIO_THEME.textSecondary }}>
        VISUAL DIFF →
      </button>
      <button type="button" onClick={() => navigate(adminStudioPerformanceMonitorPath())} className="mt-2 px-2 py-1 text-[6px] font-futura uppercase border" style={{ borderColor: ACCESSIBILITY_AUDITOR_ACCENT, color: ACCESSIBILITY_AUDITOR_ACCENT }}>
        PERFORMANCE MONITOR →
      </button>
    </ExecutivePageShell>
  );

  const renderReports = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="ACCESSIBILITY REPORTS — EVERY PAGE EVALUATED">
        {(selectedReport
          ? [selectedReport, ...profile.pageReports.filter((p) => p.pageId !== selectedReport.pageId)]
          : profile.pageReports
        ).map((report) => (
          <ExecutiveSecondaryCard
            key={report.id}
            title={`${report.pageLabel.toUpperCase()} · ${report.inclusivelyUsable ? 'INCLUSIVE ✓' : 'BARRIERS DETECTED'}`}
          >
            <div className="grid grid-cols-2 gap-2 mb-2">
              <div>
                <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>ACCESSIBILITY SCORE</p>
                <p className="text-[8px] font-futura" style={{ color: ACCESSIBILITY_AUDITOR_ACCENT, fontWeight: 515 }}>{report.accessibilityScore}%</p>
              </div>
              <div>
                <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>WCAG STATUS</p>
                <p className="text-[8px] font-futura" style={{ color: WCAG_COLOR[report.wcagComplianceStatus], fontWeight: 515 }}>{report.wcagComplianceStatus}</p>
              </div>
              <div>
                <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>ISSUES</p>
                <p className="text-[8px] font-futura" style={{ color: SEVERITY_COLOR[report.highestSeverity], fontWeight: 515 }}>{report.issuesFound} · {report.highestSeverity}</p>
              </div>
            </div>
            <ExecutiveSecondaryCard title="AFFECTED COMPONENTS">
              {report.affectedComponents.map((c) => (
                <p key={c} className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
                  · {c}
                </p>
              ))}
            </ExecutiveSecondaryCard>
            <ExecutiveSecondaryCard title="ESTIMATED USER IMPACT">
              <p className="text-[6px] font-futura" style={{ color: '#EF4444', lineHeight: 1.45 }}>
                {report.estimatedUserImpact}
              </p>
            </ExecutiveSecondaryCard>
            <ExecutiveSecondaryCard title="SUGGESTED IMPROVEMENTS">
              {report.suggestedImprovements.map((item) => (
                <p key={item} className="text-[6px] font-futura mb-1" style={{ color: ACCESSIBILITY_AUDITOR_ACCENT, lineHeight: 1.4 }}>
                  · {item}
                </p>
              ))}
            </ExecutiveSecondaryCard>
            <p className="text-[6px] font-futura mt-1" style={{ color: report.inclusivelyUsable ? '#10B981' : '#EF4444', lineHeight: 1.45 }}>
              {report.accessibilityVerdict}
            </p>
            <button type="button" onClick={() => handleSelectPage(report.pageId)} className="mt-2 px-2 py-1 text-[6px] font-futura uppercase border" style={{ borderColor: ACCESSIBILITY_AUDITOR_ACCENT, color: ACCESSIBILITY_AUDITOR_ACCENT }}>
              VIEW FINDINGS →
            </button>
          </ExecutiveSecondaryCard>
        ))}
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  const renderSimulations = () => {
    const sims = selectedReport
      ? profile.simulations.filter((s) => s.pageId === selectedReport.pageId)
      : profile.simulations;

    return (
      <ExecutivePageShell>
        <ExecutiveFocusPanel title={selectedReport ? `SIMULATIONS · ${selectedReport.pageLabel.toUpperCase()}` : '7 USER EXPERIENCE SIMULATIONS'}>
          <p className="text-[6px] font-futura mb-3" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
            Low vision · Blindness · Color blindness · Motor · Hearing · Cognitive · Temporary limitations
          </p>
          {SIMULATION_USER_TYPES.map((userType) => {
            const sim = sims.find((s) => s.userType === userType);
            if (!sim) return null;
            return (
              <ExecutiveSecondaryCard key={userType} title={`${SIMULATION_USER_LABELS[userType].toUpperCase()} · ${sim.passed ? 'INCLUSIVE' : 'BARRIERS'}`}>
                <p className="text-[6px] font-futura mb-1" style={{ color: sim.passed ? '#10B981' : '#EF4444', fontWeight: 515 }}>
                  Score {sim.accessibilityScore}% · {sim.barriersEncountered} barrier(s)
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

  const renderFindings = () => {
    const pageFindings = selectedReport
      ? profile.findings.filter((f) => f.pageId === selectedReport.pageId)
      : profile.findings;

    return (
      <ExecutivePageShell>
        <ExecutiveFocusPanel title={selectedReport ? `FINDINGS · ${selectedReport.pageLabel.toUpperCase()}` : 'ALL ACCESSIBILITY FINDINGS'}>
          {pageFindings.slice(0, 16).map((finding) => (
            <ExecutiveSecondaryCard key={finding.id} title={`${finding.issueLabel.toUpperCase()} · ${finding.dimensionLabel.toUpperCase()}`}>
              <p className="text-[6px] font-futura mb-1" style={{ color: SEVERITY_COLOR[finding.severity], fontWeight: 515 }}>
                [{finding.severity.toUpperCase()}] {finding.pageLabel}
              </p>
              <p className="text-[6px] font-futura mb-2" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
                {finding.description}
              </p>
              <ExecutiveSecondaryCard title="AFFECTED COMPONENTS">
                {finding.affectedComponents.map((c) => (
                  <p key={c} className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
                    · {c}
                  </p>
                ))}
              </ExecutiveSecondaryCard>
              <ExecutiveSecondaryCard title="ESTIMATED USER IMPACT">
                <p className="text-[6px] font-futura" style={{ color: '#EF4444', lineHeight: 1.45 }}>
                  {finding.estimatedUserImpact}
                </p>
              </ExecutiveSecondaryCard>
              <ExecutiveSecondaryCard title="SUGGESTED IMPROVEMENT">
                <p className="text-[6px] font-futura" style={{ color: ACCESSIBILITY_AUDITOR_ACCENT, lineHeight: 1.45 }}>
                  {finding.suggestedImprovement}
                </p>
              </ExecutiveSecondaryCard>
              <p className="text-[6px] font-futura mt-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.4 }}>
                {explainAccessibilityFinding(finding)}
              </p>
            </ExecutiveSecondaryCard>
          ))}
        </ExecutiveFocusPanel>
      </ExecutivePageShell>
    );
  };

  const renderDimensions = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="15 CONTINUOUS AUDIT DIMENSIONS">
        {profile.dimensionScores.map((d) => (
          <ExecutiveSecondaryCard key={d.dimension} title={`${d.label.toUpperCase()} · ${d.status.toUpperCase()}`}>
            <p className="text-[8px] font-futura mb-1" style={{ color: STATUS_COLOR[d.status] ?? ACCESSIBILITY_AUDITOR_ACCENT, fontWeight: 515 }}>
              {d.score}%
            </p>
            <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
              {d.summary}
            </p>
          </ExecutiveSecondaryCard>
        ))}
      </ExecutiveFocusPanel>
      <ExecutiveSecondaryCard title="15 AUDIT TARGETS">
        <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
          {AUDIT_DIMENSIONS.map((d) => AUDIT_DIMENSION_LABELS[d]).join(' · ')}
        </p>
      </ExecutiveSecondaryCard>
      <button type="button" onClick={() => navigate(adminStudioExperienceQaPath())} className="mt-2 px-2 py-1 text-[6px] font-futura uppercase border" style={{ borderColor: ACCESSIBILITY_AUDITOR_ACCENT, color: ACCESSIBILITY_AUDITOR_ACCENT }}>
        EXPERIENCE QA →
      </button>
    </ExecutivePageShell>
  );

  return (
    <div>
      <StudioOsBrandTagline systemId="accessibility-auditor" />
      <div className="flex flex-wrap gap-1 mb-3 mt-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className="px-2 py-1 text-[6px] font-futura uppercase border"
            style={{
              borderColor: tab === t.id ? ACCESSIBILITY_AUDITOR_ACCENT : ADMIN_STUDIO_THEME.panelBorder,
              color: tab === t.id ? ACCESSIBILITY_AUDITOR_ACCENT : ADMIN_STUDIO_THEME.textSecondary,
              fontWeight: tab === t.id ? 515 : 400,
            }}
          >
            {t.label}
          </button>
        ))}
        <button type="button" onClick={handleRefresh} className="px-2 py-1 text-[6px] font-futura uppercase border ml-auto" style={{ borderColor: ACCESSIBILITY_AUDITOR_ACCENT, color: ACCESSIBILITY_AUDITOR_ACCENT }}>
          SYNC AUDITOR
        </button>
      </div>
      <div className="flex gap-2 mb-3">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search findings, WCAG, simulations…"
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
                  const report = profile.pageReports.find((r) => r.id === h.id);
                  if (report) handleSelectPage(report.pageId);
                }
                if (h.type === 'finding') setTab('findings');
                if (h.type === 'simulation') setTab('simulations');
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
      {tab === 'findings' && renderFindings()}
      {tab === 'dimensions' && renderDimensions()}
    </div>
  );
}
