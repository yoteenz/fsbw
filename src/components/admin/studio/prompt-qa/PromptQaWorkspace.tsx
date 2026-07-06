import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePromptQaState } from '../../../../hooks/usePromptQaState';
import {
  PROMPT_QA_ACCENT,
  PROMPT_QA_PHILOSOPHY,
  PROMPT_SOURCE_LABELS,
  PROMPT_SOURCES,
  queryPromptQa,
  refreshPromptQa,
  selectPromptAudit,
  getSelectedAuditReport,
  explainPromptFinding,
  explainVersionChange,
} from '../../../../studio-os-core/prompt-qa';
import {
  adminStudioDesignComplianceEnginePath,
  adminStudioExperienceQaPath,
  adminStudioPromptRegistryPath,
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

type PromptQaTab = 'overview' | 'audits' | 'findings' | 'version-history' | 'sources';

const TABS: { id: PromptQaTab; label: string }[] = [
  { id: 'overview', label: 'OVERVIEW' },
  { id: 'audits', label: 'PROMPT AUDITS' },
  { id: 'findings', label: 'FINDINGS' },
  { id: 'version-history', label: 'PROMPT VERSIONING™' },
  { id: 'sources', label: 'SOURCES' },
];

const SEVERITY_COLOR: Record<string, string> = {
  critical: '#EF4444',
  warning: '#F59E0B',
  advisory: '#6366F1',
};

const VERSION_STATUS_COLOR: Record<string, string> = {
  approved: '#10B981',
  'pending-approval': '#F59E0B',
  draft: '#6366F1',
  archived: ADMIN_STUDIO_THEME.textSecondary,
};

export function PromptQaWorkspace() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<PromptQaTab>('overview');
  const [searchQuery, setSearchQuery] = useState('ambiguous');
  const { profile, refresh } = usePromptQaState();

  if (!profile) {
    return (
      <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
        PROMPT QA™ LOADING — VALIDATING MISSION-CRITICAL PROMPT INFRASTRUCTURE
      </p>
    );
  }

  const selectedAudit = getSelectedAuditReport(profile);
  const searchHits = queryPromptQa(searchQuery, profile, 8);

  const handleSelectPrompt = (promptId: string) => {
    selectPromptAudit(profile.organizationId, promptId);
    refresh();
    setTab('audits');
  };

  const handleRefresh = () => {
    refreshPromptQa(profile.organizationId);
    refresh();
  };

  const renderOverview = () => (
    <ExecutivePageShell>
      <ExecutiveHeroCard
        eyebrow="MILESTONE 155 · PROMPT QA™ · MISSION-CRITICAL INFRASTRUCTURE"
        title={profile.companyName.toUpperCase()}
        subtitle="Validates every prompt, Profession Brain™, workflow instruction, and AI reasoning chain before production — protecting Studio OS from ambiguity, inconsistency, and long-term maintenance problems."
        progressPct={profile.overallQaScore}
        stats={[
          { label: 'AUDITED', value: `${profile.promptsAudited}` },
          { label: 'FINDINGS', value: `${profile.findingsOpen}` },
          { label: 'BLOCKED', value: `${profile.promptsNotProductionReady}` },
          { label: 'AI CONF', value: `${profile.averageAiConfidence}%` },
        ]}
      />
      <div className="flex items-center gap-3 mb-2">
        <ExecutiveHealthRing value={profile.overallQaScore} size={56} label="PQ" accent={PROMPT_QA_ACCENT} />
        <div>
          {PROMPT_QA_PHILOSOPHY.slice(0, 2).map((line) => (
            <p key={line} className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
              {line}
            </p>
          ))}
        </div>
      </div>
      <ExecutiveSecondaryCard title="PROFESSION BRAINS™ AS ORGANIZATIONAL ASSETS">
        <p className="text-[6px] font-futura mb-2" style={{ color: PROMPT_QA_ACCENT, fontWeight: 515, lineHeight: 1.5 }}>
          Studio OS treats prompts like mission-critical infrastructure — not fragile collections of hidden text.
        </p>
        <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
          {profile.dockQaLine}
        </p>
      </ExecutiveSecondaryCard>
      <ExecutiveFocusPanel title="NOT PRODUCTION-READY">
        {profile.auditReports
          .filter((r) => !r.productionReady)
          .slice(0, 4)
          .map((r) => (
            <button key={r.id} type="button" onClick={() => handleSelectPrompt(r.promptId)} className="block w-full text-left mb-2 bg-transparent border-0 cursor-pointer">
              <p className="text-[6px] font-futura" style={{ color: '#EF4444', fontWeight: 515 }}>
                {r.promptName} · Quality {r.promptQualityScore}% · Clarity {r.clarityScore}%
              </p>
              <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.4 }}>
                {r.conflictReport.slice(0, 100)}…
              </p>
            </button>
          ))}
        {profile.promptsNotProductionReady === 0 ? (
          <p className="text-[6px] font-futura" style={{ color: '#10B981' }}>
            All audited prompts are production-ready.
          </p>
        ) : null}
      </ExecutiveFocusPanel>
      <button type="button" onClick={() => setTab('audits')} className="mt-2 mr-2 px-2 py-1 text-[6px] font-futura uppercase border" style={{ borderColor: PROMPT_QA_ACCENT, color: PROMPT_QA_ACCENT }}>
        VIEW PROMPT AUDITS →
      </button>
      <button type="button" onClick={() => navigate(adminStudioPromptRegistryPath())} className="mt-2 mr-2 px-2 py-1 text-[6px] font-futura uppercase border" style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, color: ADMIN_STUDIO_THEME.textSecondary }}>
        PROMPT REGISTRY →
      </button>
      <button type="button" onClick={() => navigate(adminStudioDesignComplianceEnginePath())} className="mt-2 mr-2 px-2 py-1 text-[6px] font-futura uppercase border" style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, color: ADMIN_STUDIO_THEME.textSecondary }}>
        DESIGN COMPLIANCE →
      </button>
      <button type="button" onClick={() => navigate(adminStudioExperienceQaPath())} className="mt-2 px-2 py-1 text-[6px] font-futura uppercase border" style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, color: ADMIN_STUDIO_THEME.textSecondary }}>
        EXPERIENCE QA →
      </button>
    </ExecutivePageShell>
  );

  const renderAudits = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="PROMPT AUDITS — QUALITY · MAINTAINABILITY · SCALABILITY · CLARITY">
        {(selectedAudit
          ? [selectedAudit, ...profile.auditReports.filter((r) => r.promptId !== selectedAudit.promptId)]
          : profile.auditReports
        ).map((report) => (
          <ExecutiveSecondaryCard
            key={report.id}
            title={`${report.promptName.toUpperCase()} · ${report.productionReady ? 'PRODUCTION-READY ✓' : 'BLOCKED'}`}
          >
            <p className="text-[6px] font-futura mb-2" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
              {report.sourceLabel} · {report.findingsCount} findings
            </p>
            <div className="grid grid-cols-2 gap-2 mb-2">
              {[
                { label: 'QUALITY', value: report.promptQualityScore },
                { label: 'MAINTAINABILITY', value: report.maintainabilityScore },
                { label: 'SCALABILITY', value: report.scalabilityScore },
                { label: 'CLARITY', value: report.clarityScore },
                { label: 'AI CONFIDENCE', value: report.estimatedAiConfidence },
              ].map((metric) => (
                <div key={metric.label}>
                  <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
                    {metric.label}
                  </p>
                  <p className="text-[7px] font-futura" style={{ color: PROMPT_QA_ACCENT, fontWeight: 515 }}>
                    {metric.value}%
                  </p>
                </div>
              ))}
            </div>
            <ExecutiveSecondaryCard title="CONFLICT REPORT">
              <p className="text-[6px] font-futura" style={{ color: report.productionReady ? '#10B981' : '#EF4444', lineHeight: 1.45 }}>
                {report.conflictReport}
              </p>
            </ExecutiveSecondaryCard>
            <ExecutiveSecondaryCard title="IMPROVEMENT SUGGESTIONS">
              {report.improvementSuggestions.map((item) => (
                <p key={item} className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.4 }}>
                  · {item}
                </p>
              ))}
            </ExecutiveSecondaryCard>
            <p className="text-[6px] font-futura mt-1" style={{ color: PROMPT_QA_ACCENT, lineHeight: 1.45 }}>
              {report.qaVerdict}
            </p>
            <button type="button" onClick={() => handleSelectPrompt(report.promptId)} className="mt-2 px-2 py-1 text-[6px] font-futura uppercase border" style={{ borderColor: PROMPT_QA_ACCENT, color: PROMPT_QA_ACCENT }}>
              VIEW FINDINGS →
            </button>
          </ExecutiveSecondaryCard>
        ))}
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  const renderFindings = () => {
    const promptFindings = selectedAudit
      ? profile.findings.filter((f) => f.promptId === selectedAudit.promptId)
      : profile.findings;

    return (
      <ExecutivePageShell>
        <ExecutiveFocusPanel title={selectedAudit ? `FINDINGS · ${selectedAudit.promptName.toUpperCase()}` : 'ALL PROMPT QA FINDINGS'}>
          {promptFindings.slice(0, 16).map((finding) => (
            <ExecutiveSecondaryCard key={finding.id} title={`${finding.issueLabel.toUpperCase()} · ${finding.sourceLabel.toUpperCase()}`}>
              <p className="text-[6px] font-futura mb-1" style={{ color: SEVERITY_COLOR[finding.severity], fontWeight: 515 }}>
                [{finding.severity.toUpperCase()}] {finding.promptName}
              </p>
              <p className="text-[6px] font-futura mb-2" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
                {finding.description}
              </p>
              <ExecutiveSecondaryCard title="CONFLICT REPORT">
                <p className="text-[6px] font-futura" style={{ color: '#EF4444', lineHeight: 1.45 }}>
                  {finding.conflictReport}
                </p>
              </ExecutiveSecondaryCard>
              <ExecutiveSecondaryCard title="SUGGESTED IMPROVEMENT">
                <p className="text-[6px] font-futura" style={{ color: PROMPT_QA_ACCENT, lineHeight: 1.45 }}>
                  {finding.suggestedImprovement}
                </p>
              </ExecutiveSecondaryCard>
              <p className="text-[6px] font-futura mt-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.4 }}>
                {explainPromptFinding(finding)}
              </p>
            </ExecutiveSecondaryCard>
          ))}
        </ExecutiveFocusPanel>
      </ExecutivePageShell>
    );
  };

  const renderVersionHistory = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="PROMPT VERSIONING™ — PERMANENT VERSION HISTORY">
        <p className="text-[6px] font-futura mb-3" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
          Studio Intelligence™ explains what changed, why it changed, who approved it, expected impact, and rollback options.
        </p>
        {(selectedAudit
          ? profile.versionHistory.filter((v) => v.promptId === selectedAudit.promptId)
          : profile.versionHistory
        ).slice(0, 12).map((entry) => (
          <ExecutiveSecondaryCard key={entry.versionId} title={`${entry.promptName.toUpperCase()} · v${entry.version} · ${entry.status.toUpperCase()}`}>
            <p className="text-[6px] font-futura mb-1" style={{ color: VERSION_STATUS_COLOR[entry.status], fontWeight: 515 }}>
              Changed by {entry.changedBy} · Approved by {entry.approvedBy ?? 'Pending'}
            </p>
            <ExecutiveSecondaryCard title="WHAT CHANGED">
              <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
                {entry.whatChanged}
              </p>
            </ExecutiveSecondaryCard>
            <ExecutiveSecondaryCard title="WHY IT CHANGED">
              <p className="text-[6px] font-futura" style={{ color: PROMPT_QA_ACCENT, lineHeight: 1.45 }}>
                {entry.whyChanged}
              </p>
            </ExecutiveSecondaryCard>
            <ExecutiveSecondaryCard title="EXPECTED IMPACT">
              <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
                {entry.expectedImpact}
              </p>
            </ExecutiveSecondaryCard>
            <ExecutiveSecondaryCard title="ROLLBACK OPTIONS">
              <p className="text-[6px] font-futura" style={{ color: '#10B981', lineHeight: 1.45 }}>
                {entry.rollbackOption}
              </p>
            </ExecutiveSecondaryCard>
            <p className="text-[6px] font-futura mt-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.4 }}>
              {explainVersionChange(entry)}
            </p>
          </ExecutiveSecondaryCard>
        ))}
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  const renderSources = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="PROMPT SOURCES — 9 INTELLIGENCE LAYERS EVALUATED">
        {PROMPT_SOURCES.map((source) => {
          const coverage = profile.sourceCoverage.find((s) => s.source === source);
          return (
            <ExecutiveSecondaryCard key={source} title={PROMPT_SOURCE_LABELS[source].toUpperCase()}>
              <p className="text-[8px] font-futura mb-1" style={{ color: PROMPT_QA_ACCENT, fontWeight: 515 }}>
                {coverage?.promptCount ?? 0} prompts · {coverage?.avgQuality ?? 0}% avg quality
              </p>
              <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
                Prompt QA continuously validates {PROMPT_SOURCE_LABELS[source]} prompts before production deployment.
              </p>
            </ExecutiveSecondaryCard>
          );
        })}
      </ExecutiveFocusPanel>
      <ExecutiveSecondaryCard title="13 ISSUE TYPES DETECTED">
        <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
          Ambiguous instructions · Missing context · Conflicting logic · Contradictory rules · Hallucination risk · Circular dependencies · Duplicate instructions · Incomplete workflows · Missing edge cases · Unsafe assumptions · Overly complex prompts · Maintainability concerns · Scalability concerns
        </p>
      </ExecutiveSecondaryCard>
    </ExecutivePageShell>
  );

  return (
    <div>
      <StudioOsBrandTagline systemId="prompt-qa" />
      <div className="flex flex-wrap gap-1 mb-3 mt-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className="px-2 py-1 text-[6px] font-futura uppercase border"
            style={{
              borderColor: tab === t.id ? PROMPT_QA_ACCENT : ADMIN_STUDIO_THEME.panelBorder,
              color: tab === t.id ? PROMPT_QA_ACCENT : ADMIN_STUDIO_THEME.textSecondary,
              fontWeight: tab === t.id ? 515 : 400,
            }}
          >
            {t.label}
          </button>
        ))}
        <button type="button" onClick={handleRefresh} className="px-2 py-1 text-[6px] font-futura uppercase border ml-auto" style={{ borderColor: PROMPT_QA_ACCENT, color: PROMPT_QA_ACCENT }}>
          SYNC PROMPT QA
        </button>
      </div>
      <div className="flex gap-2 mb-3">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search prompts, findings, versions…"
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
                if (h.type === 'audit') {
                  const audit = profile.auditReports.find((r) => r.id === h.id);
                  if (audit) handleSelectPrompt(audit.promptId);
                }
                if (h.type === 'finding') setTab('findings');
                if (h.type === 'version') setTab('version-history');
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
      {tab === 'audits' && renderAudits()}
      {tab === 'findings' && renderFindings()}
      {tab === 'version-history' && renderVersionHistory()}
      {tab === 'sources' && renderSources()}
    </div>
  );
}
