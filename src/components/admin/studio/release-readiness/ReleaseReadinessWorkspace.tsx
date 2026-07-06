import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useReleaseReadinessState } from '../../../../hooks/useReleaseReadinessState';
import {
  RELEASE_DISCIPLINES,
  RELEASE_DISCIPLINE_LABELS,
  RELEASE_GATE_LABELS,
  RELEASE_GATES,
  RELEASE_READINESS_ACCENT,
  RELEASE_READINESS_PHILOSOPHY,
  describeReleaseGate,
  explainOpenIssue,
  getExecutiveBriefForSelectedRelease,
  getSelectedProductionReport,
  queryReleaseReadiness,
  refreshReleaseReadiness,
  selectReleaseCandidate,
  summarizeRiskLevel,
} from '../../../../studio-os-core/release-readiness';
import {
  adminStudioQaHeadquartersPath,
  adminStudioRegressionEnginePath,
  adminStudioEngineeringExcellenceDashboardPath,
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

type ReadinessTab = 'overview' | 'report' | 'approvals' | 'gates' | 'executive' | 'issues';

const TABS: { id: ReadinessTab; label: string }[] = [
  { id: 'overview', label: 'OVERVIEW' },
  { id: 'report', label: 'PRODUCTION REPORT' },
  { id: 'approvals', label: 'DISCIPLINE APPROVALS' },
  { id: 'gates', label: 'RELEASE GATES' },
  { id: 'executive', label: 'EXECUTIVE APPROVAL' },
  { id: 'issues', label: 'OPEN ISSUES' },
];

const APPROVAL_COLOR: Record<string, string> = {
  approved: '#10B981',
  conditional: '#F59E0B',
  blocked: '#EF4444',
};

const GATE_COLOR: Record<string, string> = {
  'not-ready': '#EF4444',
  'needs-review': '#F97316',
  'ready-for-qa': '#F59E0B',
  'ready-for-executive-review': '#0891B2',
  'production-ready': '#059669',
};

const RISK_COLOR: Record<string, string> = {
  critical: '#EF4444',
  high: '#F97316',
  medium: '#F59E0B',
  low: '#10B981',
};

const SEVERITY_COLOR: Record<string, string> = {
  critical: '#EF4444',
  warning: '#F59E0B',
  advisory: '#6366F1',
};

export function ReleaseReadinessWorkspace() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<ReadinessTab>('overview');
  const [searchQuery, setSearchQuery] = useState('approval');
  const { profile, refresh } = useReleaseReadinessState();

  if (!profile) {
    return (
      <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
        RELEASE READINESS™ LOADING — VERIFYING ALL DISCIPLINES BEFORE PRODUCTION
      </p>
    );
  }

  const selectedReport = getSelectedProductionReport(profile);
  const executiveBrief = getExecutiveBriefForSelectedRelease(profile);
  const searchHits = queryReleaseReadiness(searchQuery, profile, 8);

  const handleSelectRelease = (releaseId: string) => {
    selectReleaseCandidate(profile.organizationId, releaseId);
    refresh();
    setTab('report');
  };

  const handleRefresh = () => {
    refreshReleaseReadiness(profile.organizationId);
    refresh();
  };

  const renderOverview = () => (
    <ExecutivePageShell>
      <ExecutiveHeroCard
        eyebrow="MILESTONE 161 · RELEASE READINESS™ · PRODUCTION IS A PRIVILEGE"
        title={profile.companyName.toUpperCase()}
        subtitle="No feature should ship simply because it functions. It should ship because every major discipline has approved it."
        progressPct={profile.overallReadinessScore}
        stats={[
          { label: 'APPROVALS', value: `${profile.approvalsGranted}/${profile.approvalsRequired}` },
          { label: 'CONFIDENCE', value: `${profile.confidence}%` },
          { label: 'ISSUES', value: `${profile.openIssuesCount}` },
          { label: 'GATE', value: RELEASE_GATE_LABELS[profile.releaseGate].split(' ')[0] ?? profile.releaseGate },
        ]}
      />
      <div className="flex items-center gap-3 mb-2">
        <ExecutiveHealthRing value={profile.overallReadinessScore} size={56} label="RDY" accent={RELEASE_READINESS_ACCENT} />
        <div>
          {RELEASE_READINESS_PHILOSOPHY.slice(0, 2).map((line) => (
            <p key={line} className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
              {line}
            </p>
          ))}
        </div>
      </div>
      <ExecutiveSecondaryCard title={RELEASE_GATE_LABELS[profile.releaseGate].toUpperCase()}>
        <p className="text-[6px] font-futura mb-2" style={{ color: GATE_COLOR[profile.releaseGate], fontWeight: 515, lineHeight: 1.5 }}>
          {describeReleaseGate(profile.releaseGate)}
        </p>
        <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
          {profile.dockReadinessLine}
        </p>
      </ExecutiveSecondaryCard>
      <ExecutiveFocusPanel title="DISCIPLINES AWAITING APPROVAL">
        {profile.disciplineApprovals
          .filter((a) => a.status !== 'approved')
          .slice(0, 4)
          .map((a) => (
            <button key={a.id} type="button" onClick={() => setTab('approvals')} className="block w-full text-left mb-2 bg-transparent border-0 cursor-pointer">
              <p className="text-[6px] font-futura" style={{ color: APPROVAL_COLOR[a.status], fontWeight: 515 }}>
                {a.disciplineLabel} · {a.score}% · {a.status}
              </p>
              <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.4 }}>
                {a.summary}
              </p>
            </button>
          ))}
        {profile.disciplineApprovals.filter((a) => a.status !== 'approved').length === 0 ? (
          <p className="text-[6px] font-futura" style={{ color: '#10B981' }}>
            All 12 disciplines approved — release has earned production privilege.
          </p>
        ) : null}
      </ExecutiveFocusPanel>
      <button type="button" onClick={() => setTab('report')} className="mt-2 mr-2 px-2 py-1 text-[6px] font-futura uppercase border" style={{ borderColor: RELEASE_READINESS_ACCENT, color: RELEASE_READINESS_ACCENT }}>
        PRODUCTION REPORT →
      </button>
      <button type="button" onClick={() => setTab('executive')} className="mt-2 mr-2 px-2 py-1 text-[6px] font-futura uppercase border" style={{ borderColor: RELEASE_READINESS_ACCENT, color: RELEASE_READINESS_ACCENT }}>
        EXECUTIVE APPROVAL →
      </button>
      <button type="button" onClick={() => navigate(adminStudioRegressionEnginePath())} className="mt-2 mr-2 px-2 py-1 text-[6px] font-futura uppercase border" style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, color: ADMIN_STUDIO_THEME.textSecondary }}>
        REGRESSION ENGINE →
      </button>
      <button type="button" onClick={() => navigate(adminStudioEngineeringExcellenceDashboardPath())} className="mt-2 px-2 py-1 text-[6px] font-futura uppercase border" style={{ borderColor: RELEASE_READINESS_ACCENT, color: RELEASE_READINESS_ACCENT }}>
        ENGINEERING EXCELLENCE →
      </button>
    </ExecutivePageShell>
  );

  const renderReport = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="PRODUCTION READINESS REPORTS">
        {(selectedReport
          ? [selectedReport, ...profile.productionReports.filter((r) => r.releaseId !== selectedReport.releaseId)]
          : profile.productionReports
        ).map((report) => (
          <ExecutiveSecondaryCard
            key={report.id}
            title={`${report.releaseLabel.toUpperCase()} · ${RELEASE_GATE_LABELS[report.releaseGate].toUpperCase()}`}
          >
            <div className="grid grid-cols-2 gap-2 mb-2">
              <div>
                <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>READINESS SCORE</p>
                <p className="text-[8px] font-futura" style={{ color: RELEASE_READINESS_ACCENT, fontWeight: 515 }}>{report.overallReadinessScore}%</p>
              </div>
              <div>
                <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>RISK LEVEL</p>
                <p className="text-[8px] font-futura" style={{ color: RISK_COLOR[report.riskLevel], fontWeight: 515 }}>{report.riskLevel}</p>
              </div>
              <div>
                <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>CONFIDENCE</p>
                <p className="text-[8px] font-futura" style={{ color: RELEASE_READINESS_ACCENT, fontWeight: 515 }}>{report.confidence}%</p>
              </div>
              <div>
                <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>APPROVALS</p>
                <p className="text-[8px] font-futura" style={{ color: report.approvalsGranted === report.approvalsRequired ? '#10B981' : '#F59E0B', fontWeight: 515 }}>
                  {report.approvalsGranted}/{report.approvalsRequired}
                </p>
              </div>
            </div>
            <ExecutiveSecondaryCard title="OPEN ISSUES">
              {report.openIssues.map((issue) => (
                <p key={issue} className="text-[6px] font-futura mb-1" style={{ color: '#EF4444', lineHeight: 1.4 }}>
                  · {issue}
                </p>
              ))}
            </ExecutiveSecondaryCard>
            <ExecutiveSecondaryCard title="BLOCKED SYSTEMS">
              {report.blockedSystems.map((s) => (
                <p key={s} className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
                  · {s}
                </p>
              ))}
            </ExecutiveSecondaryCard>
            <ExecutiveSecondaryCard title="REQUIRED APPROVALS">
              {report.requiredApprovals.map((a) => (
                <p key={a} className="text-[6px] font-futura mb-1" style={{ color: '#F59E0B', lineHeight: 1.4 }}>
                  · {a}
                </p>
              ))}
            </ExecutiveSecondaryCard>
            <ExecutiveSecondaryCard title="ROLLBACK PREPAREDNESS">
              <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
                {report.rollbackPreparedness}
              </p>
            </ExecutiveSecondaryCard>
            <ExecutiveSecondaryCard title="PERFORMANCE SUMMARY">
              <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
                {report.performanceSummary}
              </p>
            </ExecutiveSecondaryCard>
            <ExecutiveSecondaryCard title="DESIGN SUMMARY">
              <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
                {report.designSummary}
              </p>
            </ExecutiveSecondaryCard>
            <ExecutiveSecondaryCard title="EXPERIENCE SUMMARY">
              <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
                {report.experienceSummary}
              </p>
            </ExecutiveSecondaryCard>
            <ExecutiveSecondaryCard title="SECURITY SUMMARY">
              <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
                {report.securitySummary}
              </p>
            </ExecutiveSecondaryCard>
            <p className="text-[6px] font-futura mt-1" style={{ color: report.releaseGate === 'production-ready' ? '#10B981' : '#EF4444', lineHeight: 1.45 }}>
              {report.readinessVerdict}
            </p>
            <p className="text-[6px] font-futura mt-1" style={{ color: RISK_COLOR[report.riskLevel], lineHeight: 1.4 }}>
              {summarizeRiskLevel(report.riskLevel)}
            </p>
            <button type="button" onClick={() => handleSelectRelease(report.releaseId)} className="mt-2 px-2 py-1 text-[6px] font-futura uppercase border" style={{ borderColor: RELEASE_READINESS_ACCENT, color: RELEASE_READINESS_ACCENT }}>
              EXECUTIVE BRIEF →
            </button>
          </ExecutiveSecondaryCard>
        ))}
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  const renderApprovals = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="12 DISCIPLINE APPROVALS — EVERY RELEASE MUST PASS">
        {profile.disciplineApprovals.map((a) => (
          <ExecutiveSecondaryCard key={a.id} title={`${a.disciplineLabel.toUpperCase()} · ${a.status.toUpperCase()}`}>
            <p className="text-[8px] font-futura mb-1" style={{ color: APPROVAL_COLOR[a.status], fontWeight: 515 }}>
              {a.score}% · {a.openIssues} open issue(s)
            </p>
            <p className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
              Approver: {a.approverSystem}
            </p>
            <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
              {a.summary}
            </p>
          </ExecutiveSecondaryCard>
        ))}
      </ExecutiveFocusPanel>
      <ExecutiveSecondaryCard title="12 REQUIRED DISCIPLINES">
        <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
          {RELEASE_DISCIPLINES.map((d) => RELEASE_DISCIPLINE_LABELS[d]).join(' · ')}
        </p>
      </ExecutiveSecondaryCard>
    </ExecutivePageShell>
  );

  const renderGates = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title={`RELEASE GATES — CURRENT: ${RELEASE_GATE_LABELS[profile.releaseGate].toUpperCase()}`}>
        {RELEASE_GATES.map((gate) => (
          <ExecutiveSecondaryCard
            key={gate}
            title={`${RELEASE_GATE_LABELS[gate].toUpperCase()}${profile.releaseGate === gate ? ' · CURRENT' : ''}`}
          >
            <p className="text-[6px] font-futura" style={{ color: GATE_COLOR[gate], lineHeight: 1.45, fontWeight: profile.releaseGate === gate ? 515 : 400 }}>
              {describeReleaseGate(gate)}
            </p>
          </ExecutiveSecondaryCard>
        ))}
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  const renderExecutive = () => {
    const brief = executiveBrief ?? profile.executiveBriefs[0];
    if (!brief) return null;

    return (
      <ExecutivePageShell>
        <ExecutiveFocusPanel title="EXECUTIVE APPROVAL — STUDIO INTELLIGENCE™ BRIEFING">
          <ExecutiveSecondaryCard title="WHAT CHANGED">
            <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
              {brief.whatChanged}
            </p>
          </ExecutiveSecondaryCard>
          <ExecutiveSecondaryCard title="WHY IT CHANGED">
            <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
              {brief.whyItChanged}
            </p>
          </ExecutiveSecondaryCard>
          <ExecutiveSecondaryCard title="EXPECTED IMPACT">
            <p className="text-[6px] font-futura" style={{ color: '#10B981', lineHeight: 1.45 }}>
              {brief.expectedImpact}
            </p>
          </ExecutiveSecondaryCard>
          <ExecutiveSecondaryCard title="POTENTIAL RISKS">
            <p className="text-[6px] font-futura" style={{ color: '#EF4444', lineHeight: 1.45 }}>
              {brief.potentialRisks}
            </p>
          </ExecutiveSecondaryCard>
          <ExecutiveSecondaryCard title="ROLLBACK PLAN">
            <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
              {brief.rollbackPlan}
            </p>
          </ExecutiveSecondaryCard>
          <ExecutiveSecondaryCard title="RECOMMENDED DEPLOYMENT STRATEGY">
            <p className="text-[6px] font-futura" style={{ color: RELEASE_READINESS_ACCENT, lineHeight: 1.45 }}>
              {brief.recommendedDeploymentStrategy}
            </p>
          </ExecutiveSecondaryCard>
          <ExecutiveSecondaryCard title="STUDIO INTELLIGENCE™ SUMMARY">
            <p className="text-[6px] font-futura" style={{ color: RELEASE_READINESS_ACCENT, lineHeight: 1.45, fontWeight: 515 }}>
              {brief.studioIntelligenceSummary}
            </p>
          </ExecutiveSecondaryCard>
          <p className="text-[6px] font-futura mt-2" style={{ color: profile.releaseGate === 'production-ready' ? '#10B981' : '#F59E0B', lineHeight: 1.45 }}>
            {brief.executiveVerdict}
          </p>
        </ExecutiveFocusPanel>
      </ExecutivePageShell>
    );
  };

  const renderIssues = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="OPEN ISSUES BLOCKING PRODUCTION">
        {profile.openIssues.map((issue) => (
          <ExecutiveSecondaryCard key={issue.id} title={`${issue.title.toUpperCase()} · ${issue.disciplineLabel.toUpperCase()}`}>
            <p className="text-[6px] font-futura mb-1" style={{ color: SEVERITY_COLOR[issue.severity], fontWeight: 515 }}>
              [{issue.severity.toUpperCase()}]
            </p>
            <p className="text-[6px] font-futura mb-2" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
              {issue.description}
            </p>
            <ExecutiveSecondaryCard title="BLOCKED SYSTEMS">
              {issue.blockedSystems.map((s) => (
                <p key={s} className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
                  · {s}
                </p>
              ))}
            </ExecutiveSecondaryCard>
            <ExecutiveSecondaryCard title="SUGGESTED FIX">
              <p className="text-[6px] font-futura" style={{ color: RELEASE_READINESS_ACCENT, lineHeight: 1.45 }}>
                {issue.suggestedFix}
              </p>
            </ExecutiveSecondaryCard>
            <p className="text-[6px] font-futura mt-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.4 }}>
              {explainOpenIssue(issue)}
            </p>
          </ExecutiveSecondaryCard>
        ))}
      </ExecutiveFocusPanel>
      <button type="button" onClick={() => navigate(adminStudioQaHeadquartersPath())} className="mt-2 px-2 py-1 text-[6px] font-futura uppercase border" style={{ borderColor: RELEASE_READINESS_ACCENT, color: RELEASE_READINESS_ACCENT }}>
        QA HEADQUARTERS →
      </button>
    </ExecutivePageShell>
  );

  return (
    <div>
      <StudioOsBrandTagline systemId="release-readiness" />
      <div className="flex flex-wrap gap-1 mb-3 mt-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className="px-2 py-1 text-[6px] font-futura uppercase border"
            style={{
              borderColor: tab === t.id ? RELEASE_READINESS_ACCENT : ADMIN_STUDIO_THEME.panelBorder,
              color: tab === t.id ? RELEASE_READINESS_ACCENT : ADMIN_STUDIO_THEME.textSecondary,
              fontWeight: tab === t.id ? 515 : 400,
            }}
          >
            {t.label}
          </button>
        ))}
        <button type="button" onClick={handleRefresh} className="px-2 py-1 text-[6px] font-futura uppercase border ml-auto" style={{ borderColor: RELEASE_READINESS_ACCENT, color: RELEASE_READINESS_ACCENT }}>
          SYNC READINESS
        </button>
      </div>
      <div className="flex gap-2 mb-3">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search approvals, gates, executive brief…"
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
                  const report = profile.productionReports.find((r) => r.id === h.id);
                  if (report) handleSelectRelease(report.releaseId);
                }
                if (h.type === 'approval') setTab('approvals');
                if (h.type === 'issue') setTab('issues');
                if (h.type === 'executive') setTab('executive');
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
      {tab === 'report' && renderReport()}
      {tab === 'approvals' && renderApprovals()}
      {tab === 'gates' && renderGates()}
      {tab === 'executive' && renderExecutive()}
      {tab === 'issues' && renderIssues()}
    </div>
  );
}
