import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAdminStudioGovernanceState } from '../../../../hooks/useAdminStudioGovernanceState';
import {
  GOVERNANCE_TABS,
  type GovernanceTabId,
} from '../../../../utils/adminStudioGovernanceDemo';
import { ADMIN_STUDIO_THEME } from '../../../../utils/adminStudioTheme';
import {
  CERTIFICATION_TYPE_LABELS,
  POLICY_CATEGORY_LABELS,
  VERIFICATION_TYPE_LABELS,
} from '../../../../studio-os-core/governance/constants';
import {
  adminStudioEcosystemPath,
  adminStudioMarketplacePath,
} from '../../../../utils/adminStudioRoutes';

const panelStyle = {
  background: ADMIN_STUDIO_THEME.panelBg,
  borderColor: ADMIN_STUDIO_THEME.panelBorder,
};

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[7px] font-futura uppercase mb-2" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
      {children}
    </p>
  );
}

function MetricCard({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="p-2 border" style={panelStyle}>
      <p className="text-[6px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
        {label}
      </p>
      <p
        className="text-[14px] leading-none mt-1"
        style={{
          fontFamily: '"Covered By Your Grace", sans-serif',
          color: accent ? ADMIN_STUDIO_THEME.accent : ADMIN_STUDIO_THEME.textPrimary,
        }}
      >
        {value}
      </p>
    </div>
  );
}

export function GovernanceWorkspace() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = (searchParams.get('tab') as GovernanceTabId | null) ?? 'overview';
  const [tab, setTab] = useState<GovernanceTabId>(
    GOVERNANCE_TABS.some((t) => t.id === initialTab) ? initialTab : 'overview'
  );

  const {
    trustScores,
    verificationRequests,
    qualityReviews,
    certifications,
    moderationCases,
    policies,
    appeals,
    fraudAlerts,
    reputations,
    ecosystemHealth,
    aiGovernance,
    auditEvents,
    enterpriseRules,
    dashboard,
  } = useAdminStudioGovernanceState();

  const selectTab = (id: GovernanceTabId) => {
    setTab(id);
    setSearchParams({ tab: id }, { replace: true });
  };

  if (trustScores.length === 0) {
    return (
      <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
        GOVERNANCE LOADING — BOOTSTRAP IN PROGRESS
      </p>
    );
  }

  const renderTab = () => {
    switch (tab) {
      case 'overview':
        return (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <MetricCard label="ECOSYSTEM HEALTH" value={`${dashboard.ecosystemHealthScore}`} accent />
              <MetricCard label="PLATFORM TRUST" value={`${dashboard.platformTrustScore}`} accent />
              <MetricCard label="VERIFICATION QUEUE" value={`${dashboard.verificationQueue}`} />
              <MetricCard label="MODERATION QUEUE" value={`${dashboard.moderationQueue}`} />
              <MetricCard label="QUALITY REVIEW" value={`${dashboard.qualityReviewQueue}`} />
              <MetricCard label="CERTIFICATIONS" value={`${dashboard.activeCertifications}`} />
              <MetricCard label="POLICY VIOLATIONS" value={`${dashboard.policyViolations}`} />
              <MetricCard label="OPEN APPEALS" value={`${dashboard.openAppeals}`} />
              <MetricCard label="SECURITY ALERTS" value={`${dashboard.securityAlerts}`} />
              <MetricCard label="FRAUD FLAGS" value={`${dashboard.fraudFlags}`} />
              <MetricCard label="COMPLIANCE" value={`${dashboard.complianceScore}`} />
              <MetricCard label="PLATFORM HEALTH" value={`${dashboard.platformHealthScore}`} />
              <MetricCard label="AI GOVERNANCE" value={`${dashboard.aiGovernanceRecords}`} />
              <MetricCard label="AUDIT TODAY" value={`${dashboard.auditEventsToday}`} />
            </div>
            <SectionLabel>PLATFORM CONSTITUTION · GROW RESPONSIBLY</SectionLabel>
            <p className="text-[6px] font-futura px-2 py-1 border normal-case" style={{ ...panelStyle, fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.4 }}>
              Governance is not punishment — it creates a trustworthy ecosystem where businesses build long-term relationships. Every decision should improve ecosystem health.
            </p>
          </div>
        );

      case 'trust':
        return (
          <div className="space-y-3">
            <SectionLabel>DYNAMIC TRUST SCORES · ALL PARTICIPANTS</SectionLabel>
            {trustScores.map((t) => (
              <div key={t.id} className="p-2 border" style={panelStyle}>
                <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.accent }}>
                  {t.participantName} · {t.score} · {t.participantType.replace(/-/g, ' ').toUpperCase()}
                </p>
                <p className="text-[6px] font-futura mt-1" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
                  Verification {t.factors.verification} · Quality {t.factors.quality} · Compliance {t.factors.policyCompliance} · Satisfaction {t.factors.customerSatisfaction}
                </p>
                <p className="text-[6px] font-futura mt-1" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
                  Payments {t.factors.paymentHistory} · Disputes {t.factors.disputes} · Contributions {t.factors.communityContributions}
                </p>
              </div>
            ))}
          </div>
        );

      case 'verification':
        return (
          <div className="space-y-3">
            <SectionLabel>VERIFICATION CENTER · OFFICIAL BADGES</SectionLabel>
            {(Object.keys(VERIFICATION_TYPE_LABELS) as Array<keyof typeof VERIFICATION_TYPE_LABELS>).map((type) => {
              const count = verificationRequests.filter((v) => v.type === type).length;
              return (
                <p key={type} className="text-[6px] font-futura px-2 py-1 border" style={{ ...panelStyle, fontWeight: 515, color: count > 0 ? ADMIN_STUDIO_THEME.accent : ADMIN_STUDIO_THEME.textSecondary }}>
                  {VERIFICATION_TYPE_LABELS[type]} · {count} requests
                </p>
              );
            })}
            <SectionLabel>REQUESTS</SectionLabel>
            {verificationRequests.map((v) => (
              <div key={v.id} className="p-2 border" style={panelStyle}>
                <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.accent }}>
                  {v.participantName} · {VERIFICATION_TYPE_LABELS[v.type]} · {v.status.toUpperCase()}
                </p>
                <p className="text-[6px] font-futura mt-1" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
                  Badge: {v.badgeIssued ? 'ISSUED ✓' : 'PENDING'} · Submitted {v.submittedAt.slice(0, 10)}
                </p>
              </div>
            ))}
          </div>
        );

      case 'quality':
        return (
          <div className="space-y-3">
            <SectionLabel>QUALITY ASSURANCE · ECOSYSTEM ASSETS</SectionLabel>
            {qualityReviews.map((q) => (
              <div key={q.id} className="p-2 border" style={panelStyle}>
                <p className="text-[7px] font-futura uppercase mb-2" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.accent }}>
                  {q.assetTitle}
                </p>
                <p className="text-[6px] font-futura" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
                  Docs {q.documentation} · Compat {q.compatibility} · Security {q.security} · Deps {q.dependencies} · Perf {q.performance} · Brand {q.branding} · UX {q.userExperience}
                </p>
                <p className="text-[6px] font-futura mt-1 normal-case" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.4 }}>
                  {q.reviewerNotes}
                </p>
              </div>
            ))}
          </div>
        );

      case 'certifications':
        return (
          <div className="space-y-3">
            <SectionLabel>CERTIFICATION ENGINE · EXAMS · RENEWALS · BADGES</SectionLabel>
            {certifications.map((c) => (
              <div key={c.id} className="p-2 border" style={panelStyle}>
                <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.accent }}>
                  {CERTIFICATION_TYPE_LABELS[c.type]} · {c.holderName}
                </p>
                <p className="text-[6px] font-futura mt-1" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
                  Status {c.status.toUpperCase()} · Expires {c.expiresAt.slice(0, 10)} · CE {c.continuingEducationHours}h
                </p>
                <p className="text-[6px] font-futura mt-1" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
                  Exams: {c.examHistory.join(' · ')}
                </p>
              </div>
            ))}
          </div>
        );

      case 'moderation':
        return (
          <div className="space-y-3">
            <SectionLabel>MODERATION CENTER · WARN · SUSPEND · REMOVE · RESTORE · ESCALATE</SectionLabel>
            {moderationCases.map((m) => (
              <div key={m.id} className="p-2 border" style={panelStyle}>
                <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.accent }}>
                  {m.subjectName} · {m.category.replace(/-/g, ' ').toUpperCase()} · {m.status.toUpperCase()}
                </p>
                <p className="text-[6px] font-futura mt-1" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
                  Policy: {m.policyRef} · Reporter: {m.reporterId}
                </p>
                <p className="text-[6px] font-futura mt-1 normal-case" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.4 }}>
                  {m.actionLog.join(' → ')}
                </p>
              </div>
            ))}
          </div>
        );

      case 'policy':
        return (
          <div className="space-y-3">
            <SectionLabel>POLICY ENGINE · EVERY ACTION REFERENCES A POLICY</SectionLabel>
            {(Object.keys(POLICY_CATEGORY_LABELS) as Array<keyof typeof POLICY_CATEGORY_LABELS>).map((cat) => {
              const catPolicies = policies.filter((p) => p.category === cat);
              return (
                <div key={cat}>
                  <p className="text-[6px] font-futura px-2 py-1 border mb-1" style={{ ...panelStyle, fontWeight: 515, color: ADMIN_STUDIO_THEME.accent }}>
                    {POLICY_CATEGORY_LABELS[cat]} · {catPolicies.length} policies
                  </p>
                  {catPolicies.map((p) => (
                    <p key={p.id} className="text-[6px] font-futura px-2 py-1 border ml-2 mb-1 normal-case" style={{ ...panelStyle, fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.4 }}>
                      {p.title} v{p.version} · {p.summary}
                    </p>
                  ))}
                </div>
              );
            })}
          </div>
        );

      case 'appeals':
        return (
          <div className="space-y-3">
            <SectionLabel>APPEALS SYSTEM · REASON · STATUS · RESOLUTION</SectionLabel>
            {appeals.map((a) => (
              <div key={a.id} className="p-2 border" style={panelStyle}>
                <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.accent }}>
                  {a.participantName} · {a.type.replace(/-/g, ' ').toUpperCase()} · {a.status.replace(/-/g, ' ').toUpperCase()}
                </p>
                <p className="text-[6px] font-futura mt-1 normal-case" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.4 }}>
                  {a.reason}
                </p>
                {a.resolution ? (
                  <p className="text-[6px] font-futura mt-1" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
                    Resolution: {a.resolution}
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        );

      case 'fraud':
        return (
          <div className="space-y-3">
            <SectionLabel>FRAUD DETECTION · FLAG UNUSUAL ACTIVITY</SectionLabel>
            {fraudAlerts.map((f) => (
              <div key={f.id} className="p-2 border" style={panelStyle}>
                <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.accent }}>
                  {f.subjectName} · {f.alertType.replace(/-/g, ' ').toUpperCase()} · {f.severity.toUpperCase()}
                </p>
                <p className="text-[6px] font-futura mt-1" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
                  Status {f.status.toUpperCase()} · Flagged {f.flaggedAt.slice(0, 10)}
                </p>
              </div>
            ))}
          </div>
        );

      case 'reputation':
        return (
          <div className="space-y-3">
            <SectionLabel>REPUTATION ENGINE · OVERALL · INDUSTRY · WORKSPACE</SectionLabel>
            {reputations.map((r) => (
              <div key={r.id} className="p-2 border" style={panelStyle}>
                <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.accent }}>
                  {r.participantName} · Overall {r.overall}
                </p>
                <p className="text-[6px] font-futura mt-1" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
                  Professionalism {r.professionalism} · Communication {r.communication} · Quality {r.quality} · Reliability {r.reliability}
                </p>
                <p className="text-[6px] font-futura mt-1" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
                  Industry {r.industryReputation} · Workspace {r.workspaceReputation} · Repeat {r.repeatBusiness} · Contributions {r.platformContributions}
                </p>
              </div>
            ))}
          </div>
        );

      case 'ecosystem-health':
        return (
          <div className="space-y-3">
            <SectionLabel>ECOSYSTEM HEALTH · HEALTHY OVER RAPID</SectionLabel>
            <div className="grid grid-cols-2 gap-2">
              <MetricCard label="OVERALL HEALTH" value={`${ecosystemHealth.overallHealthScore}`} accent />
              <MetricCard label="TRUST INDEX" value={`${ecosystemHealth.trustIndex}`} />
              <MetricCard label="CREATOR SUCCESS" value={`${ecosystemHealth.creatorSuccessPct}%`} />
              <MetricCard label="BUSINESS SUCCESS" value={`${ecosystemHealth.businessSuccessPct}%`} />
              <MetricCard label="MARKETPLACE LIQUIDITY" value={`${ecosystemHealth.marketplaceLiquidity}`} />
              <MetricCard label="RETENTION" value={`${ecosystemHealth.retentionPct}%`} />
              <MetricCard label="NETWORK GROWTH" value={`${ecosystemHealth.networkGrowthPct}%`} />
              <MetricCard label="QUALITY INDEX" value={`${ecosystemHealth.qualityIndex}`} />
              <MetricCard label="COLLABORATION" value={`${ecosystemHealth.collaborationIndex}`} />
              <MetricCard label="INDUSTRY DIVERSITY" value={`${ecosystemHealth.industryDiversity}`} />
            </div>
            <p className="text-[6px] font-futura px-2 py-1 border normal-case" style={{ ...panelStyle, fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.4 }}>
              Customer satisfaction {ecosystemHealth.customerSatisfaction}/5.0 — prioritize ecosystem health over rapid growth.
            </p>
          </div>
        );

      case 'ai-governance':
        return (
          <div className="space-y-3">
            <SectionLabel>AI GOVERNANCE · TRANSPARENT · AUDITABLE</SectionLabel>
            {aiGovernance.map((a) => (
              <div key={a.id} className="p-2 border" style={panelStyle}>
                <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.accent }}>
                  {a.executiveName} · v{a.version} · Confidence {a.confidenceLevel.toUpperCase()}
                </p>
                <p className="text-[6px] font-futura mt-1" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
                  Decisions {a.decisionLogCount} · Prompts {a.promptHistoryCount} · Human approval: {a.humanApprovalRequired ? 'REQUIRED' : 'OPTIONAL'}
                </p>
                <p className="text-[6px] font-futura mt-1" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
                  Sources: {a.knowledgeSources.join(', ')}
                </p>
                <p className="text-[6px] font-futura mt-1" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
                  Allowed: {a.allowedActions.join(' · ')}
                </p>
                <p className="text-[6px] font-futura mt-1" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
                  Restricted: {a.restrictedActions.join(' · ')}
                </p>
              </div>
            ))}
          </div>
        );

      case 'audit':
        return (
          <div className="space-y-3">
            <SectionLabel>AUDIT CENTER · PERMANENT HISTORY</SectionLabel>
            {auditEvents.map((e) => (
              <div key={e.id} className="p-2 border" style={panelStyle}>
                <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.accent }}>
                  {e.type.replace(/-/g, ' ').toUpperCase()} · {e.subjectName}
                </p>
                <p className="text-[6px] font-futura mt-1 normal-case" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.4 }}>
                  {e.summary}
                </p>
                <p className="text-[6px] font-futura mt-1" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
                  {e.actorName} · {e.timestamp.slice(0, 10)} {e.policyRef ? `· ${e.policyRef}` : ''} · KG {e.knowledgeGraphNodeId}
                </p>
              </div>
            ))}
          </div>
        );

      case 'enterprise':
        return (
          <div className="space-y-3">
            <SectionLabel>ENTERPRISE GOVERNANCE · PRIVATE RULES · AUDIT EXPORTS</SectionLabel>
            {enterpriseRules.map((e) => (
              <div key={e.id} className="p-2 border" style={panelStyle}>
                <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.accent }}>
                  {e.orgName} · Audit export {e.auditExportEnabled ? 'ENABLED' : 'DISABLED'}
                </p>
                <p className="text-[6px] font-futura mt-1" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
                  Departments: {e.departmentPolicies.join(' · ')}
                </p>
                <p className="text-[6px] font-futura mt-1" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
                  Approval chains: {e.approvalChains.join(' · ')}
                </p>
                <p className="text-[6px] font-futura mt-1" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
                  Compliance: {e.complianceReports.join(' · ')}
                </p>
                <p className="text-[6px] font-futura mt-1" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
                  Private: {e.privateRules.join(' · ')}
                </p>
              </div>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div>
      <div className="flex flex-wrap gap-1 mb-3">
        {GOVERNANCE_TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => selectTab(t.id)}
            className="px-2 py-1 text-[6px] font-futura uppercase border"
            style={{
              fontWeight: 515,
              color: tab === t.id ? ADMIN_STUDIO_THEME.accent : ADMIN_STUDIO_THEME.textSecondary,
              background: tab === t.id ? ADMIN_STUDIO_THEME.selectedBg : 'rgba(255,255,255,0.6)',
              borderColor: ADMIN_STUDIO_THEME.panelBorder,
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {renderTab()}

      <div className="flex gap-2 mt-4">
        <button
          type="button"
          onClick={() => navigate(adminStudioEcosystemPath())}
          className="flex-1 py-2 text-[7px] font-futura uppercase border"
          style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, borderColor: ADMIN_STUDIO_THEME.panelBorder }}
        >
          ← ECOSYSTEM
        </button>
        <button
          type="button"
          onClick={() => navigate(adminStudioMarketplacePath())}
          className="flex-1 py-2 text-[7px] font-futura uppercase border"
          style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, borderColor: ADMIN_STUDIO_THEME.panelBorder }}
        >
          MARKETPLACE →
        </button>
      </div>
    </div>
  );
}
