import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQaInspectorState } from '../../../../hooks/useQaInspectorState';
import {
  QA_INSPECTOR_ACCENT,
  QA_INSPECTOR_PHILOSOPHY,
  queryQaInspector,
  runFullInspectorAudit,
  updateFindingStatus,
} from '../../../../studio-os-core/qa-inspector';
import type { InspectorFindingStatus } from '../../../../studio-os-core/qa-inspector';
import { adminStudioQaHeadquartersPath, adminStudioQaSimulationEnginePath, adminStudioMissionControlPath } from '../../../../utils/adminStudioRoutes';
import { ADMIN_STUDIO_THEME } from '../../../../utils/adminStudioTheme';
import {
  ExecutiveFocusPanel,
  ExecutiveHealthRing,
  ExecutiveHeroCard,
  ExecutivePageShell,
  ExecutiveSecondaryCard,
} from '../executive-ia';
import { StudioOsBrandTagline } from '../brand/StudioOsBrandTagline';

type InspectorTab = 'overview' | 'findings' | 'audits';

const TABS: { id: InspectorTab; label: string }[] = [
  { id: 'overview', label: 'INSPECTOR OVERVIEW' },
  { id: 'findings', label: 'FINDINGS' },
  { id: 'audits', label: 'AUDIT HISTORY' },
];

const SEVERITY_COLOR: Record<string, string> = {
  critical: '#EF4444',
  high: '#F97316',
  medium: '#F59E0B',
  low: '#6B7280',
  info: '#10B981',
};

export function QaInspectorWorkspace() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<InspectorTab>('overview');
  const [searchQuery, setSearchQuery] = useState('automation');
  const { profile, refresh } = useQaInspectorState();

  if (!profile) {
    return (
      <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
        QA INSPECTOR™ LOADING — CONTINUOUS AUDIT
      </p>
    );
  }

  const searchHits = queryQaInspector(searchQuery, profile, 8);

  const handleRunAudit = () => {
    runFullInspectorAudit(profile.organizationId);
    refresh();
  };

  const handleStatusChange = (findingId: string, status: InspectorFindingStatus) => {
    updateFindingStatus(profile.organizationId, findingId, status);
    refresh();
  };

  const renderOverview = () => (
    <ExecutivePageShell>
      <ExecutiveHeroCard
        eyebrow="MILESTONE 143 · QA INSPECTOR™ · INTELLIGENT CONTINUOUS AUDIT"
        title={profile.companyName.toUpperCase()}
        subtitle="Continuously audits every organization without human intervention — recommends only, never silently modifies."
        progressPct={profile.inspectorScore}
        stats={[
          { label: 'SCORE', value: `${profile.inspectorScore}%` },
          { label: 'OPEN', value: `${profile.openFindings}` },
          { label: 'CRITICAL', value: `${profile.criticalFindings}` },
          { label: 'AUDITS', value: `${profile.recentAudits.length}` },
        ]}
      />
      <div className="flex items-center gap-3 mb-2">
        <ExecutiveHealthRing value={profile.inspectorScore} size={56} label="QI" accent={QA_INSPECTOR_ACCENT} />
        <div>
          {QA_INSPECTOR_PHILOSOPHY.slice(0, 2).map((line) => (
            <p key={line} className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
              {line}
            </p>
          ))}
        </div>
      </div>
      <ExecutiveSecondaryCard title="RECOMMENDS ONLY · ORGANIZATION DECIDES">
        <p className="text-[6px] font-futura mb-1" style={{ color: QA_INSPECTOR_ACCENT, fontWeight: 515, lineHeight: 1.5 }}>
          {profile.dockInspectorLine}
        </p>
      </ExecutiveSecondaryCard>
      <button type="button" onClick={handleRunAudit} className="mt-2 mr-2 px-2 py-1 text-[6px] font-futura uppercase border" style={{ borderColor: QA_INSPECTOR_ACCENT, color: QA_INSPECTOR_ACCENT }}>
        RUN FULL AUDIT
      </button>
      <button type="button" onClick={() => navigate(adminStudioQaSimulationEnginePath())} className="mt-2 mr-2 px-2 py-1 text-[6px] font-futura uppercase border" style={{ borderColor: QA_INSPECTOR_ACCENT, color: QA_INSPECTOR_ACCENT }}>
        QA SIMULATION ENGINE →
      </button>
      <button type="button" onClick={() => navigate(adminStudioQaHeadquartersPath())} className="mt-2 mr-2 px-2 py-1 text-[6px] font-futura uppercase border" style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, color: ADMIN_STUDIO_THEME.textSecondary }}>
        QA HEADQUARTERS →
      </button>
      <button type="button" onClick={() => navigate(adminStudioMissionControlPath())} className="mt-2 px-2 py-1 text-[6px] font-futura uppercase border" style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, color: ADMIN_STUDIO_THEME.textSecondary }}>
        MISSION CONTROL →
      </button>
    </ExecutivePageShell>
  );

  const renderFindings = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="INSPECTOR FINDINGS — SEVERITY · CONFIDENCE · ROOT CAUSE · SOLUTION">
        {profile.findings.map((f) => (
          <ExecutiveSecondaryCard key={f.id} title={`${f.issueLabel.toUpperCase()} · ${f.severity.toUpperCase()} · ${f.confidencePct}% CONFIDENCE`}>
            <p className="text-[6px] font-futura mb-1" style={{ color: SEVERITY_COLOR[f.severity] ?? QA_INSPECTOR_ACCENT, fontWeight: 515 }}>
              {f.domainLabel} · {f.status.toUpperCase()}
            </p>
            <p className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
              <strong>Root cause:</strong> {f.rootCause}
            </p>
            <p className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
              <strong>Impact:</strong> {f.estimatedImpact}
            </p>
            <p className="text-[6px] font-futura mb-1" style={{ color: QA_INSPECTOR_ACCENT, fontWeight: 515, lineHeight: 1.45 }}>
              → {f.recommendedSolution}
            </p>
            <p className="text-[6px] font-futura mb-2" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
              Affected: {f.affectedSystems.join(' · ')}
            </p>
            {f.status === 'open' ? (
              <div className="flex gap-1">
                <button type="button" onClick={() => handleStatusChange(f.id, 'acknowledged')} className="px-2 py-1 text-[6px] font-futura uppercase border" style={{ borderColor: QA_INSPECTOR_ACCENT, color: QA_INSPECTOR_ACCENT }}>
                  ACKNOWLEDGE
                </button>
                <button type="button" onClick={() => handleStatusChange(f.id, 'dismissed')} className="px-2 py-1 text-[6px] font-futura uppercase border" style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, color: ADMIN_STUDIO_THEME.textSecondary }}>
                  DISMISS
                </button>
              </div>
            ) : null}
          </ExecutiveSecondaryCard>
        ))}
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  const renderAudits = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="AUDIT HISTORY — 10 DOMAINS SCANNED">
        {profile.recentAudits.map((a) => (
          <ExecutiveSecondaryCard key={a.id} title={`AUDIT · ${a.domainsScanned} DOMAINS · ${a.findingsCount} FINDINGS`}>
            <p className="text-[6px] font-futura mb-1" style={{ color: QA_INSPECTOR_ACCENT, fontWeight: 515 }}>
              {a.criticalCount} critical · {new Date(a.completedAt).toLocaleString()}
            </p>
            <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
              {a.summary}
            </p>
          </ExecutiveSecondaryCard>
        ))}
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  return (
    <div>
      <StudioOsBrandTagline systemId="qa-inspector" />
      <div className="flex flex-wrap gap-1 mb-3">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className="px-2 py-1 text-[6px] font-futura uppercase border"
            style={{
              borderColor: tab === t.id ? QA_INSPECTOR_ACCENT : ADMIN_STUDIO_THEME.panelBorder,
              color: tab === t.id ? QA_INSPECTOR_ACCENT : ADMIN_STUDIO_THEME.textSecondary,
              fontWeight: tab === t.id ? 515 : 400,
            }}
          >
            {t.label}
          </button>
        ))}
      </div>
      {tab === 'overview' ? renderOverview() : null}
      {tab === 'findings' ? renderFindings() : null}
      {tab === 'audits' ? renderAudits() : null}
      <div className="mt-3">
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search findings…"
          className="w-full px-2 py-1 text-[7px] font-futura border mb-2"
          style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, background: 'transparent', color: ADMIN_STUDIO_THEME.textPrimary }}
        />
        {searchHits.map((h) => (
          <p key={h.id} className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
            <span style={{ color: QA_INSPECTOR_ACCENT }}>{h.label}</span> · {h.matchReason}
          </p>
        ))}
      </div>
      <button type="button" onClick={refresh} className="mt-2 px-2 py-1 text-[6px] font-futura uppercase border" style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, color: ADMIN_STUDIO_THEME.textSecondary }}>
        SYNC QA INSPECTOR
      </button>
    </div>
  );
}
