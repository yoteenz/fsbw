import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQaHeadquartersState } from '../../../../hooks/useQaHeadquartersState';
import {
  QA_HEADQUARTERS_ACCENT,
  QA_HEADQUARTERS_PHILOSOPHY,
  queryQaHeadquarters,
  runQaGovernanceAudit,
  triggerContinuousValidation,
} from '../../../../studio-os-core/qa-headquarters';
import { adminStudioExperienceEnginePath, adminStudioQaInspectorPath, adminStudioMissionControlPath } from '../../../../utils/adminStudioRoutes';
import { ADMIN_STUDIO_THEME } from '../../../../utils/adminStudioTheme';
import {
  ExecutiveFocusPanel,
  ExecutiveHealthRing,
  ExecutiveHeroCard,
  ExecutivePageShell,
  ExecutiveSecondaryCard,
} from '../executive-ia';
import { StudioOsBrandTagline } from '../brand/StudioOsBrandTagline';

type QaTab = 'overview' | 'trust-scores' | 'responsibilities' | 'validation' | 'governance';

const TABS: { id: QaTab; label: string }[] = [
  { id: 'overview', label: 'QA OVERVIEW' },
  { id: 'trust-scores', label: 'TRUST SCORES™' },
  { id: 'responsibilities', label: 'RESPONSIBILITIES' },
  { id: 'validation', label: 'CONTINUOUS VALIDATION' },
  { id: 'governance', label: 'GOVERNANCE' },
];

export function QaHeadquartersWorkspace() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<QaTab>('overview');
  const [searchQuery, setSearchQuery] = useState('trust');
  const { profile, refresh } = useQaHeadquartersState();

  if (!profile) {
    return (
      <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
        QA HEADQUARTERS™ LOADING — TRUST INFRASTRUCTURE
      </p>
    );
  }

  const searchHits = queryQaHeadquarters(searchQuery, profile, 8);
  const governance = runQaGovernanceAudit(profile);

  const handleTriggerValidation = () => {
    triggerContinuousValidation(profile.organizationId, 'new-workflow');
    refresh();
  };

  const renderOverview = () => (
    <ExecutivePageShell>
      <ExecutiveHeroCard
        eyebrow="MILESTONE 142 · QA HEADQUARTERS™ · QUALITY ASSURANCE & TRUST INFRASTRUCTURE"
        title={profile.companyName.toUpperCase()}
        subtitle="A permanent operating layer that quietly protects every organization — Studio OS continuously earns trust."
        progressPct={profile.overallTrustScore}
        stats={[
          { label: 'TRUST', value: `${profile.overallTrustScore}%` },
          { label: 'TREND', value: profile.trustTrend.toUpperCase() },
          { label: 'VALIDATIONS', value: `${profile.validationsToday}` },
          { label: 'ISSUES', value: `${profile.activeIssues}` },
        ]}
      />
      <div className="flex items-center gap-3 mb-2">
        <ExecutiveHealthRing value={profile.overallTrustScore} size={56} label="QA" accent={QA_HEADQUARTERS_ACCENT} />
        <div>
          {QA_HEADQUARTERS_PHILOSOPHY.slice(0, 2).map((line) => (
            <p key={line} className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
              {line}
            </p>
          ))}
        </div>
      </div>
      <ExecutiveSecondaryCard title="PERMANENT QA OPERATING LAYER">
        <p className="text-[6px] font-futura mb-1" style={{ color: QA_HEADQUARTERS_ACCENT, fontWeight: 515, lineHeight: 1.5 }}>
          {profile.dockQaLine}
        </p>
        <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
          Users trust Studio OS because Studio OS constantly earns that trust.
        </p>
      </ExecutiveSecondaryCard>
      <button type="button" onClick={() => navigate(adminStudioQaInspectorPath())} className="mt-2 mr-2 px-2 py-1 text-[6px] font-futura uppercase border" style={{ borderColor: QA_HEADQUARTERS_ACCENT, color: QA_HEADQUARTERS_ACCENT }}>
        QA INSPECTOR →
      </button>
      <button type="button" onClick={() => navigate(adminStudioExperienceEnginePath())} className="mt-2 mr-2 px-2 py-1 text-[6px] font-futura uppercase border" style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, color: ADMIN_STUDIO_THEME.textSecondary }}>
        EXPERIENCE ENGINE →
      </button>
      <button type="button" onClick={handleTriggerValidation} className="mt-2 mr-2 px-2 py-1 text-[6px] font-futura uppercase border" style={{ borderColor: QA_HEADQUARTERS_ACCENT, color: QA_HEADQUARTERS_ACCENT }}>
        TRIGGER VALIDATION
      </button>
      <button type="button" onClick={() => navigate(adminStudioMissionControlPath())} className="mt-2 px-2 py-1 text-[6px] font-futura uppercase border" style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, color: ADMIN_STUDIO_THEME.textSecondary }}>
        MISSION CONTROL →
      </button>
    </ExecutivePageShell>
  );

  const renderTrustScores = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="TRUST SCORES™ — EVERY MAJOR SYSTEM">
        {profile.trustScores.map((t) => (
          <ExecutiveSecondaryCard key={t.systemId} title={`${t.label.toUpperCase()} · ${t.scorePct}% · ${t.status.toUpperCase()}`}>
            <p className="text-[6px] font-futura mb-1" style={{ color: QA_HEADQUARTERS_ACCENT, fontWeight: 515 }}>
              Trend: {t.trend} · Last validated {new Date(t.lastValidatedAt).toLocaleDateString()}
            </p>
            <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
              {t.summary}
            </p>
          </ExecutiveSecondaryCard>
        ))}
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  const renderResponsibilities = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="QA RESPONSIBILITIES — ORGANIZATIONAL INTEGRITY">
        {profile.responsibilities.map((r) => (
          <ExecutiveSecondaryCard key={r.responsibilityId} title={`${r.label.toUpperCase()} · ${r.coveragePct}% COVERAGE`}>
            <p className="text-[6px] font-futura" style={{ color: r.issueCount > 0 ? '#EF4444' : QA_HEADQUARTERS_ACCENT, fontWeight: 515 }}>
              {r.issueCount} issues · {r.active ? 'Active' : 'Inactive'}
            </p>
          </ExecutiveSecondaryCard>
        ))}
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  const renderValidation = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="CONTINUOUS VALIDATION — SIGNIFICANT CHANGES TRIGGER QA">
        {profile.recentValidations.map((v) => (
          <ExecutiveSecondaryCard key={v.id} title={`${v.triggerLabel.toUpperCase()} · ${v.status.toUpperCase()}`}>
            <p className="text-[6px] font-futura mb-1" style={{ color: QA_HEADQUARTERS_ACCENT, fontWeight: 515 }}>
              {v.systemsChecked.join(' · ')} · {v.findingsCount} findings
            </p>
            <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
              {v.summary}
            </p>
          </ExecutiveSecondaryCard>
        ))}
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  const renderGovernance = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="QA GOVERNANCE · TRUST PROTECTION">
        {governance.map((f) => (
          <ExecutiveSecondaryCard key={f.id} title={f.severity.toUpperCase()}>
            <p className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
              {f.message}
            </p>
            <p className="text-[6px] font-futura" style={{ color: QA_HEADQUARTERS_ACCENT, fontWeight: 515 }}>
              → {f.recommendation}
            </p>
          </ExecutiveSecondaryCard>
        ))}
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  return (
    <div>
      <StudioOsBrandTagline systemId="qa-headquarters" />
      <div className="flex flex-wrap gap-1 mb-3">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className="px-2 py-1 text-[6px] font-futura uppercase border"
            style={{
              borderColor: tab === t.id ? QA_HEADQUARTERS_ACCENT : ADMIN_STUDIO_THEME.panelBorder,
              color: tab === t.id ? QA_HEADQUARTERS_ACCENT : ADMIN_STUDIO_THEME.textSecondary,
              fontWeight: tab === t.id ? 515 : 400,
            }}
          >
            {t.label}
          </button>
        ))}
      </div>
      {tab === 'overview' ? renderOverview() : null}
      {tab === 'trust-scores' ? renderTrustScores() : null}
      {tab === 'responsibilities' ? renderResponsibilities() : null}
      {tab === 'validation' ? renderValidation() : null}
      {tab === 'governance' ? renderGovernance() : null}
      <div className="mt-3">
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search trust scores, responsibilities, validations…"
          className="w-full px-2 py-1 text-[7px] font-futura border mb-2"
          style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, background: 'transparent', color: ADMIN_STUDIO_THEME.textPrimary }}
        />
        {searchHits.map((h) => (
          <p key={`${h.type}-${h.id}`} className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
            <span style={{ color: QA_HEADQUARTERS_ACCENT }}>{h.label}</span> · {h.matchReason}
          </p>
        ))}
      </div>
      <button type="button" onClick={refresh} className="mt-2 px-2 py-1 text-[6px] font-futura uppercase border" style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, color: ADMIN_STUDIO_THEME.textSecondary }}>
        SYNC QA HEADQUARTERS
      </button>
    </div>
  );
}
