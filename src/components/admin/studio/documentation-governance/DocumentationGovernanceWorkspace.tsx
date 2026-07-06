import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDocumentationGovernanceState } from '../../../../hooks/useDocumentationGovernanceState';
import {
  DOCUMENTATION_GOVERNANCE_ACCENT,
  DOCUMENTATION_GOVERNANCE_PHILOSOPHY,
} from '../../../../studio-os-core/documentation-governance';
import {
  adminStudioDocumentationRegistryPath,
  adminStudioKnowledgeHubPath,
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

type GovernanceTab =
  | 'overview'
  | 'audits'
  | 'coverage'
  | 'consistency'
  | 'health'
  | 'pre-deploy'
  | 'improvement';

const TABS: { id: GovernanceTab; label: string }[] = [
  { id: 'overview', label: 'GOVERNANCE OVERVIEW' },
  { id: 'audits', label: 'CONTINUOUS AUDITS' },
  { id: 'coverage', label: 'COVERAGE VALIDATION' },
  { id: 'consistency', label: 'CONSISTENCY ENGINE' },
  { id: 'health', label: 'HEALTH SCORE' },
  { id: 'pre-deploy', label: 'PRE-DEPLOY' },
  { id: 'improvement', label: 'SELF-IMPROVEMENT' },
];

export function DocumentationGovernanceWorkspace() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<GovernanceTab>('overview');
  const { profile, refresh } = useDocumentationGovernanceState();

  if (!profile) {
    return (
      <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
        DOCUMENTATION GOVERNANCE™ LOADING — CONTINUOUS AUDITS · LIVING ORGANIZATIONAL KNOWLEDGE
      </p>
    );
  }

  const renderOverview = () => (
    <ExecutivePageShell>
      <ExecutiveHeroCard
        eyebrow="MILESTONE 126.5 · DOCUMENTATION GOVERNANCE™ V1.0"
        title={profile.companyName.toUpperCase()}
        subtitle="Continuously monitor, validate, audit, and improve every piece of documentation across Studio OS."
        progressPct={profile.governanceScore}
        stats={[
          { label: 'GOVERNANCE', value: `${profile.governanceScore}%` },
          { label: 'AUDITS', value: `${profile.auditFindings.length}` },
          { label: 'BELOW STD', value: `${profile.featuresBelowStandard}` },
          { label: 'DEPLOY', value: profile.preDeployValidation.ready ? 'READY' : 'REVIEW' },
        ]}
      />
      <div className="flex items-center gap-3 mb-2">
        <ExecutiveHealthRing value={profile.governanceScore} size={56} label="DG" accent={DOCUMENTATION_GOVERNANCE_ACCENT} />
        <div>
          {DOCUMENTATION_GOVERNANCE_PHILOSOPHY.slice(0, 2).map((line) => (
            <p key={line} className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
              {line}
            </p>
          ))}
        </div>
      </div>
      <ExecutiveSecondaryCard title="COMMAND DOCK · GOVERNANCE STATUS">
        <p className="text-[6px] font-futura" style={{ color: DOCUMENTATION_GOVERNANCE_ACCENT, fontWeight: 515, lineHeight: 1.5 }}>
          {profile.dockGovernanceLine}
        </p>
      </ExecutiveSecondaryCard>
      <button
        type="button"
        onClick={() => navigate(adminStudioDocumentationRegistryPath())}
        className="mt-2 mr-2 px-2 py-1 text-[6px] font-futura uppercase border"
        style={{ borderColor: DOCUMENTATION_GOVERNANCE_ACCENT, color: DOCUMENTATION_GOVERNANCE_ACCENT }}
      >
        OPEN DOCUMENTATION REGISTRY →
      </button>
      <button
        type="button"
        onClick={() => navigate(adminStudioKnowledgeHubPath())}
        className="mt-2 mr-2 px-2 py-1 text-[6px] font-futura uppercase border"
        style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, color: ADMIN_STUDIO_THEME.textSecondary }}
      >
        KNOWLEDGE HUB →
      </button>
      <button
        type="button"
        onClick={() => navigate(adminStudioMissionControlPath())}
        className="mt-2 mr-2 px-2 py-1 text-[6px] font-futura uppercase border"
        style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, color: ADMIN_STUDIO_THEME.textSecondary }}
      >
        MISSION CONTROL →
      </button>
      <button type="button" onClick={refresh} className="mt-2 px-2 py-1 text-[6px] font-futura uppercase border" style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, color: ADMIN_STUDIO_THEME.textSecondary }}>
        RUN AUDITS
      </button>
    </ExecutivePageShell>
  );

  const renderAudits = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="CONTINUOUS DOCUMENTATION AUDITS">
        {profile.auditFindings.slice(0, 12).map((f) => (
          <ExecutiveSecondaryCard key={f.id} title={`${f.issueType.toUpperCase()} · ${f.featureName.toUpperCase()}`}>
            <p className="text-[6px] font-futura mb-1" style={{ color: f.severity === 'critical' ? '#DC2626' : DOCUMENTATION_GOVERNANCE_ACCENT, fontWeight: 515 }}>
              {f.severity.toUpperCase()}
            </p>
            <p className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
              {f.message}
            </p>
            <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
              → {f.recommendation}
            </p>
          </ExecutiveSecondaryCard>
        ))}
        <p className="text-[6px] font-futura mt-2" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
          Showing 12 of {profile.auditFindings.length} findings · last audit {new Date(profile.lastAuditAt).toLocaleString()}
        </p>
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  const renderCoverage = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title={`COVERAGE VALIDATION · ${profile.coverageStandardPct}% ORGANIZATIONAL STANDARD`}>
        {profile.featureCoverage.filter((c) => !c.complete).slice(0, 10).map((c) => (
          <ExecutiveSecondaryCard key={c.featureId} title={`${c.featureName.toUpperCase()} · ${c.coveragePct}%`}>
            <p className="text-[6px] font-futura mb-1" style={{ color: c.complete ? DOCUMENTATION_GOVERNANCE_ACCENT : '#DC2626', fontWeight: 515 }}>
              {c.complete ? 'COMPLETE' : 'INCOMPLETE'}
            </p>
            <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
              Gaps: {c.gaps.length > 0 ? c.gaps.join(', ') : 'none'}
            </p>
          </ExecutiveSecondaryCard>
        ))}
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  const renderConsistency = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="CONSISTENCY ENGINE · OFFICIAL TERMINOLOGY">
        {profile.terminologyIssues.length === 0 ? (
          <ExecutiveSecondaryCard title="NO INCONSISTENCIES DETECTED">
            <p className="text-[6px] font-futura" style={{ color: DOCUMENTATION_GOVERNANCE_ACCENT }}>
              All scanned surfaces use official Studio OS terminology.
            </p>
          </ExecutiveSecondaryCard>
        ) : (
          profile.terminologyIssues.slice(0, 10).map((t) => (
            <ExecutiveSecondaryCard key={t.id} title={`${t.foundVariant} → ${t.officialTerm}`}>
              <p className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
                {t.location}
              </p>
              <p className="text-[6px] font-futura" style={{ color: DOCUMENTATION_GOVERNANCE_ACCENT }}>
                {t.recommendation}
              </p>
            </ExecutiveSecondaryCard>
          ))
        )}
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  const renderHealth = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="DOCUMENTATION HEALTH SCORE">
        {profile.healthDimensions.map((d) => (
          <ExecutiveSecondaryCard key={d.id} title={`${d.label.toUpperCase()} · ${d.scorePct}%`}>
            <p className="text-[6px] font-futura mb-1" style={{ color: d.status === 'healthy' ? DOCUMENTATION_GOVERNANCE_ACCENT : ADMIN_STUDIO_THEME.textSecondary, fontWeight: 515 }}>
              {d.status.toUpperCase()}
            </p>
            <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
              {d.detail}
            </p>
          </ExecutiveSecondaryCard>
        ))}
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  const renderPreDeploy = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="PRE-DEPLOYMENT VALIDATION">
        <ExecutiveSecondaryCard title={profile.preDeployValidation.ready ? 'RELEASE READY' : 'FLAGGED FOR REVIEW'}>
          <p className="text-[6px] font-futura mb-2" style={{ color: profile.preDeployValidation.ready ? DOCUMENTATION_GOVERNANCE_ACCENT : '#DC2626', fontWeight: 515 }}>
            {profile.preDeployValidation.summary}
          </p>
        </ExecutiveSecondaryCard>
        {profile.preDeployValidation.checks.map((c) => (
          <ExecutiveSecondaryCard key={c.id} title={c.label.toUpperCase()}>
            <p className="text-[6px] font-futura mb-1" style={{ color: c.passed ? DOCUMENTATION_GOVERNANCE_ACCENT : '#DC2626', fontWeight: 515 }}>
              {c.passed ? 'PASSED' : 'FAILED'}{c.blocking ? ' · BLOCKING' : ''}
            </p>
            <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
              {c.detail}
            </p>
          </ExecutiveSecondaryCard>
        ))}
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  const renderImprovement = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="SELF-IMPROVEMENT RECOMMENDATIONS">
        {profile.selfImprovement.map((r) => (
          <ExecutiveSecondaryCard key={r.id} title={`${r.title.toUpperCase()} · ${r.priority.toUpperCase()}`}>
            <p className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
              {r.detail}
            </p>
            <p className="text-[6px] font-futura" style={{ color: DOCUMENTATION_GOVERNANCE_ACCENT, fontWeight: 515 }}>
              → {r.action}
            </p>
          </ExecutiveSecondaryCard>
        ))}
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  const renderTab = () => {
    switch (tab) {
      case 'audits':
        return renderAudits();
      case 'coverage':
        return renderCoverage();
      case 'consistency':
        return renderConsistency();
      case 'health':
        return renderHealth();
      case 'pre-deploy':
        return renderPreDeploy();
      case 'improvement':
        return renderImprovement();
      default:
        return renderOverview();
    }
  };

  return (
    <div>
      <StudioOsBrandTagline systemId="documentation-governance" className="mb-2" />
      <div className="flex flex-wrap gap-1 mb-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className="px-2 py-1 text-[6px] font-futura uppercase border"
            style={{
              borderColor: tab === t.id ? DOCUMENTATION_GOVERNANCE_ACCENT : ADMIN_STUDIO_THEME.panelBorder,
              color: tab === t.id ? DOCUMENTATION_GOVERNANCE_ACCENT : ADMIN_STUDIO_THEME.textSecondary,
              fontWeight: tab === t.id ? 515 : 400,
            }}
          >
            {t.label}
          </button>
        ))}
      </div>
      {renderTab()}
    </div>
  );
}
