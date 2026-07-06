import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDesignComplianceEngineState } from '../../../../hooks/useDesignComplianceEngineState';
import {
  DESIGN_COMPLIANCE_ENGINE_ACCENT,
  DESIGN_COMPLIANCE_PHILOSOPHY,
  STUDIO_OS_DESIGN_RULES,
  queryDesignComplianceEngine,
  refreshDesignComplianceEngine,
  selectCompliancePage,
  getSelectedPageReport,
  explainFinding,
} from '../../../../studio-os-core/design-compliance-engine';
import {
  adminStudioDesignTokenEnginePath,
  adminStudioOrganizationalGuardianPath,
  adminStudioPromptQaPath,
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

type ComplianceTab = 'overview' | 'page-reports' | 'findings' | 'categories' | 'design-rules';

const TABS: { id: ComplianceTab; label: string }[] = [
  { id: 'overview', label: 'OVERVIEW' },
  { id: 'page-reports', label: 'PAGE REPORTS' },
  { id: 'findings', label: 'FINDINGS' },
  { id: 'categories', label: 'CATEGORIES' },
  { id: 'design-rules', label: 'DESIGN RULES' },
];

const SEVERITY_COLOR: Record<string, string> = {
  critical: '#EF4444',
  warning: '#F59E0B',
  advisory: '#6366F1',
};

const STATUS_COLOR: Record<string, string> = {
  compliant: '#10B981',
  watch: '#F59E0B',
  'non-compliant': '#EF4444',
};

export function DesignComplianceEngineWorkspace() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<ComplianceTab>('overview');
  const [searchQuery, setSearchQuery] = useState('glass');
  const { profile, refresh } = useDesignComplianceEngineState();

  if (!profile) {
    return (
      <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
        DESIGN COMPLIANCE ENGINE™ LOADING — AUDITING STUDIO OS DESIGN LANGUAGE
      </p>
    );
  }

  const selectedReport = getSelectedPageReport(profile);
  const searchHits = queryDesignComplianceEngine(searchQuery, profile, 8);

  const handleSelectPage = (pageId: string) => {
    selectCompliancePage(profile.organizationId, pageId);
    refresh();
    setTab('page-reports');
  };

  const handleRefresh = () => {
    refreshDesignComplianceEngine(profile.organizationId);
    refresh();
  };

  const renderOverview = () => (
    <ExecutivePageShell>
      <ExecutiveHeroCard
        eyebrow="MILESTONE 154 · DESIGN COMPLIANCE ENGINE™ · CREATIVE DIRECTOR"
        title={profile.companyName.toUpperCase()}
        subtitle="Continuously audits every interface — not whether it merely works, but whether it feels like Studio OS."
        progressPct={profile.creativeDirectorScore}
        stats={[
          { label: 'PAGES', value: `${profile.pagesAudited}` },
          { label: 'FINDINGS', value: `${profile.findingsOpen}` },
          { label: 'NON-COMPLIANT', value: `${profile.pagesNonCompliant}` },
          { label: 'LUXURY AVG', value: `${profile.averageLuxuryScore}%` },
        ]}
      />
      <div className="flex items-center gap-3 mb-2">
        <ExecutiveHealthRing value={profile.creativeDirectorScore} size={56} label="DC" accent={DESIGN_COMPLIANCE_ENGINE_ACCENT} />
        <div>
          {DESIGN_COMPLIANCE_PHILOSOPHY.slice(0, 2).map((line) => (
            <p key={line} className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
              {line}
            </p>
          ))}
        </div>
      </div>
      <ExecutiveSecondaryCard title="THE CREATIVE DIRECTOR QUESTION">
        <p className="text-[6px] font-futura mb-2" style={{ color: DESIGN_COMPLIANCE_ENGINE_ACCENT, fontWeight: 515, lineHeight: 1.5 }}>
          If Apple, Pixar, and the world&apos;s best luxury designers reviewed this organization today… would they recognize it as Studio OS?
        </p>
        <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
          {profile.dockComplianceLine}
        </p>
      </ExecutiveSecondaryCard>
      <ExecutiveFocusPanel title="PAGES NEEDING REFINEMENT">
        {profile.pageReports
          .filter((p) => !p.recognizedAsStudioOs)
          .slice(0, 4)
          .map((p) => (
            <button key={p.id} type="button" onClick={() => handleSelectPage(p.pageId)} className="block w-full text-left mb-2 bg-transparent border-0 cursor-pointer">
              <p className="text-[6px] font-futura" style={{ color: '#EF4444', fontWeight: 515 }}>
                {p.pageLabel} · Design {p.designScore}% · Luxury {p.luxuryScore}%
              </p>
              <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.4 }}>
                {p.creativeDirectorVerdict.slice(0, 120)}…
              </p>
            </button>
          ))}
        {profile.pagesNonCompliant === 0 ? (
          <p className="text-[6px] font-futura" style={{ color: '#10B981' }}>
            All audited pages recognized as Studio OS.
          </p>
        ) : null}
      </ExecutiveFocusPanel>
      <button type="button" onClick={() => setTab('page-reports')} className="mt-2 mr-2 px-2 py-1 text-[6px] font-futura uppercase border" style={{ borderColor: DESIGN_COMPLIANCE_ENGINE_ACCENT, color: DESIGN_COMPLIANCE_ENGINE_ACCENT }}>
        VIEW PAGE REPORTS →
      </button>
      <button type="button" onClick={() => navigate(adminStudioDesignTokenEnginePath())} className="mt-2 mr-2 px-2 py-1 text-[6px] font-futura uppercase border" style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, color: ADMIN_STUDIO_THEME.textSecondary }}>
        DESIGN TOKEN ENGINE →
      </button>
      <button type="button" onClick={() => navigate(adminStudioOrganizationalGuardianPath())} className="mt-2 mr-2 px-2 py-1 text-[6px] font-futura uppercase border" style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, color: ADMIN_STUDIO_THEME.textSecondary }}>
        GUARDIAN →
      </button>
      <button type="button" onClick={() => navigate(adminStudioPromptQaPath())} className="mt-2 mr-2 px-2 py-1 text-[6px] font-futura uppercase border" style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, color: ADMIN_STUDIO_THEME.textSecondary }}>
        PROMPT QA →
      </button>
      <button type="button" onClick={() => navigate(adminStudioVisualDiffEnginePath())} className="mt-2 px-2 py-1 text-[6px] font-futura uppercase border" style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, color: ADMIN_STUDIO_THEME.textSecondary }}>
        VISUAL DIFF →
      </button>
    </ExecutivePageShell>
  );

  const renderPageReports = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="PAGE COMPLIANCE REPORTS — EVERY SURFACE SCORED">
        {(selectedReport
          ? [selectedReport, ...profile.pageReports.filter((p) => p.pageId !== selectedReport.pageId)]
          : profile.pageReports
        ).map((report) => (
          <ExecutiveSecondaryCard
            key={report.id}
            title={`${report.pageLabel.toUpperCase()} · ${report.recognizedAsStudioOs ? 'STUDIO OS ✓' : 'NEEDS REFINEMENT'}`}
          >
            <div className="grid grid-cols-2 gap-2 mb-2">
              {[
                { label: 'DESIGN', value: report.designScore },
                { label: 'CONSISTENCY', value: report.consistencyScore },
                { label: 'LUXURY', value: report.luxuryScore },
                { label: 'ACCESSIBILITY', value: report.accessibilityScore },
                { label: 'COMPLEXITY', value: report.visualComplexity },
                { label: 'HIERARCHY', value: report.hierarchyQuality },
              ].map((metric) => (
                <div key={metric.label}>
                  <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
                    {metric.label}
                  </p>
                  <p className="text-[7px] font-futura" style={{ color: DESIGN_COMPLIANCE_ENGINE_ACCENT, fontWeight: 515 }}>
                    {metric.value}%
                  </p>
                </div>
              ))}
            </div>
            <p className="text-[6px] font-futura mb-2" style={{ color: report.recognizedAsStudioOs ? '#10B981' : '#EF4444', lineHeight: 1.45 }}>
              {report.creativeDirectorVerdict}
            </p>
            <ExecutiveSecondaryCard title="SUGGESTED IMPROVEMENTS">
              {report.suggestedImprovements.map((item) => (
                <p key={item} className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.4 }}>
                  · {item}
                </p>
              ))}
            </ExecutiveSecondaryCard>
            <p className="text-[6px] font-futura mt-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
              {report.findingsCount} findings · {report.route}
            </p>
            <button type="button" onClick={() => handleSelectPage(report.pageId)} className="mt-2 px-2 py-1 text-[6px] font-futura uppercase border" style={{ borderColor: DESIGN_COMPLIANCE_ENGINE_ACCENT, color: DESIGN_COMPLIANCE_ENGINE_ACCENT }}>
              VIEW FINDINGS →
            </button>
          </ExecutiveSecondaryCard>
        ))}
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  const renderFindings = () => {
    const pageFindings = selectedReport
      ? profile.findings.filter((f) => f.pageId === selectedReport.pageId)
      : profile.findings;

    return (
      <ExecutivePageShell>
        <ExecutiveFocusPanel title={selectedReport ? `FINDINGS · ${selectedReport.pageLabel.toUpperCase()}` : 'ALL COMPLIANCE FINDINGS'}>
          {pageFindings.slice(0, 16).map((finding) => (
            <ExecutiveSecondaryCard key={finding.id} title={`${finding.issueLabel.toUpperCase()} · ${finding.categoryLabel.toUpperCase()}`}>
              <p className="text-[6px] font-futura mb-1" style={{ color: SEVERITY_COLOR[finding.severity], fontWeight: 515 }}>
                [{finding.severity.toUpperCase()}] {finding.pageLabel}
              </p>
              <p className="text-[6px] font-futura mb-2" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
                {finding.description}
              </p>
              <ExecutiveSecondaryCard title="WHY NOT STUDIO OS?">
                <p className="text-[6px] font-futura" style={{ color: '#EF4444', lineHeight: 1.45 }}>
                  {finding.whyNotStudioOs}
                </p>
              </ExecutiveSecondaryCard>
              <ExecutiveSecondaryCard title="SUGGESTED IMPROVEMENT">
                <p className="text-[6px] font-futura" style={{ color: DESIGN_COMPLIANCE_ENGINE_ACCENT, lineHeight: 1.45 }}>
                  {finding.suggestedImprovement}
                </p>
              </ExecutiveSecondaryCard>
              {finding.designRuleViolated ? (
                <p className="text-[6px] font-futura mt-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
                  Rule violated: {finding.designRuleViolated}
                </p>
              ) : null}
              <p className="text-[6px] font-futura mt-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.4 }}>
                {explainFinding(finding)}
              </p>
            </ExecutiveSecondaryCard>
          ))}
        </ExecutiveFocusPanel>
      </ExecutivePageShell>
    );
  };

  const renderCategories = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="15 AUDIT CATEGORIES — CONTINUOUS DESIGN SYSTEM REFERENCE">
        {profile.categoryScores.map((category) => (
          <ExecutiveSecondaryCard key={category.category} title={`${category.label.toUpperCase()} · ${category.status.toUpperCase()}`}>
            <p className="text-[8px] font-futura mb-1" style={{ color: STATUS_COLOR[category.status] ?? DESIGN_COMPLIANCE_ENGINE_ACCENT, fontWeight: 515 }}>
              {category.score}%
            </p>
            <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
              {category.summary}
            </p>
          </ExecutiveSecondaryCard>
        ))}
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  const renderDesignRules = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="STUDIO OS DESIGN RULES — OFFICIAL DESIGN SYSTEM">
        <p className="text-[6px] font-futura mb-3" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
          The engine continuously references these rules when auditing typography, spacing, hierarchy, glassmorphism, color, motion, and luxury presentation.
        </p>
        {STUDIO_OS_DESIGN_RULES.map((rule) => (
          <ExecutiveSecondaryCard key={rule} title={rule.toUpperCase()}>
            <p className="text-[6px] font-futura" style={{ color: DESIGN_COMPLIANCE_ENGINE_ACCENT, fontWeight: 515 }}>
              Canonical Studio OS standard — violations flagged in compliance findings.
            </p>
          </ExecutiveSecondaryCard>
        ))}
      </ExecutiveFocusPanel>
      <ExecutiveSecondaryCard title="VALIDATION TARGETS">
        <p className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
          Incorrect spacing · Inconsistent typography · Missing glass effects · Wrong brand colors · Improper animation timing · Component misuse · Visual clutter · Hierarchy conflicts · Competing focal points · Broken responsive layouts · Excessive scrolling
        </p>
      </ExecutiveSecondaryCard>
    </ExecutivePageShell>
  );

  return (
    <div>
      <StudioOsBrandTagline systemId="design-compliance-engine" />
      <div className="flex flex-wrap gap-1 mb-3 mt-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className="px-2 py-1 text-[6px] font-futura uppercase border"
            style={{
              borderColor: tab === t.id ? DESIGN_COMPLIANCE_ENGINE_ACCENT : ADMIN_STUDIO_THEME.panelBorder,
              color: tab === t.id ? DESIGN_COMPLIANCE_ENGINE_ACCENT : ADMIN_STUDIO_THEME.textSecondary,
              fontWeight: tab === t.id ? 515 : 400,
            }}
          >
            {t.label}
          </button>
        ))}
        <button type="button" onClick={handleRefresh} className="px-2 py-1 text-[6px] font-futura uppercase border ml-auto" style={{ borderColor: DESIGN_COMPLIANCE_ENGINE_ACCENT, color: DESIGN_COMPLIANCE_ENGINE_ACCENT }}>
          SYNC AUDIT
        </button>
      </div>
      <div className="flex gap-2 mb-3">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search findings, pages, categories…"
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
                if (h.type === 'page') {
                  const page = profile.pageReports.find((p) => p.id === h.id);
                  if (page) handleSelectPage(page.pageId);
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
      {tab === 'page-reports' && renderPageReports()}
      {tab === 'findings' && renderFindings()}
      {tab === 'categories' && renderCategories()}
      {tab === 'design-rules' && renderDesignRules()}
    </div>
  );
}
