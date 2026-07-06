import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePromptRegistryState } from '../../../../hooks/usePromptRegistryState';
import {
  PROMPT_REGISTRY_ACCENT,
  PROMPT_REGISTRY_PHILOSOPHY,
  queryPromptRegistry,
} from '../../../../studio-os-core/prompt-registry';
import { adminStudioAutomationRegistryPath, adminStudioMissionControlPath, adminStudioPolicyEnginePath } from '../../../../utils/adminStudioRoutes';
import { ADMIN_STUDIO_THEME } from '../../../../utils/adminStudioTheme';
import {
  ExecutiveFocusPanel,
  ExecutiveHealthRing,
  ExecutiveHeroCard,
  ExecutivePageShell,
  ExecutiveSecondaryCard,
} from '../executive-ia';
import { StudioOsBrandTagline } from '../brand/StudioOsBrandTagline';

type RegistryTab = 'overview' | 'catalog' | 'versions' | 'testing' | 'governance' | 'discovery';

const TABS: { id: RegistryTab; label: string }[] = [
  { id: 'overview', label: 'REGISTRY OVERVIEW' },
  { id: 'catalog', label: 'PROMPT CATALOG' },
  { id: 'versions', label: 'VERSION HISTORY' },
  { id: 'testing', label: 'PROMPT TESTING' },
  { id: 'governance', label: 'GOVERNANCE' },
  { id: 'discovery', label: 'DISCOVERY' },
];

export function PromptRegistryWorkspace() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<RegistryTab>('overview');
  const [searchQuery, setSearchQuery] = useState('executive council');
  const { profile, refresh } = usePromptRegistryState();

  if (!profile) {
    return (
      <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
        PROMPT REGISTRY™ LOADING — PROMPTS ARE CODE
      </p>
    );
  }

  const searchHits = queryPromptRegistry(searchQuery, 8);

  const renderOverview = () => (
    <ExecutivePageShell>
      <ExecutiveHeroCard
        eyebrow="MILESTONE 133 · PROMPT REGISTRY™ V1.0"
        title={profile.companyName.toUpperCase()}
        subtitle="Every AI prompt registered — versioned, searchable, testable. No hidden prompt text."
        progressPct={profile.registryScore}
        stats={[
          { label: 'REGISTRY', value: `${profile.registryScore}%` },
          { label: 'ACTIVE', value: `${profile.activeCount}` },
          { label: 'TOTAL', value: `${profile.totalPrompts}` },
          { label: 'QUALITY', value: `${profile.avgQualityScorePct}%` },
        ]}
      />
      <div className="flex items-center gap-3 mb-2">
        <ExecutiveHealthRing value={profile.registryScore} size={56} label="PR" accent={PROMPT_REGISTRY_ACCENT} />
        <div>
          {PROMPT_REGISTRY_PHILOSOPHY.slice(0, 2).map((line) => (
            <p key={line} className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
              {line}
            </p>
          ))}
        </div>
      </div>
      <ExecutiveSecondaryCard title="FIRST-CLASS PROMPTS · AI TRANSPARENCY">
        <p className="text-[6px] font-futura" style={{ color: PROMPT_REGISTRY_ACCENT, fontWeight: 515, lineHeight: 1.5 }}>
          {profile.dockRegistryLine}
        </p>
      </ExecutiveSecondaryCard>
      <button type="button" onClick={() => navigate(adminStudioAutomationRegistryPath())} className="mt-2 mr-2 px-2 py-1 text-[6px] font-futura uppercase border" style={{ borderColor: PROMPT_REGISTRY_ACCENT, color: PROMPT_REGISTRY_ACCENT }}>
        AUTOMATION REGISTRY →
      </button>
      <button type="button" onClick={() => navigate(adminStudioPolicyEnginePath())} className="mt-2 mr-2 px-2 py-1 text-[6px] font-futura uppercase border" style={{ borderColor: PROMPT_REGISTRY_ACCENT, color: PROMPT_REGISTRY_ACCENT }}>
        POLICY ENGINE →
      </button>
      <button type="button" onClick={() => navigate(adminStudioMissionControlPath())} className="mt-2 mr-2 px-2 py-1 text-[6px] font-futura uppercase border" style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, color: ADMIN_STUDIO_THEME.textSecondary }}>
        MISSION CONTROL →
      </button>
      <button type="button" onClick={refresh} className="mt-2 px-2 py-1 text-[6px] font-futura uppercase border" style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, color: ADMIN_STUDIO_THEME.textSecondary }}>
        SYNC REGISTRY
      </button>
    </ExecutivePageShell>
  );

  const renderCatalog = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="PROMPT CATALOG — REGISTERED AI ASSETS">
        {profile.prompts.slice(0, 12).map((p) => (
          <ExecutiveSecondaryCard key={p.promptId} title={`${p.name.toUpperCase()} · v${p.version}`}>
            <p className="text-[6px] font-futura mb-1" style={{ color: PROMPT_REGISTRY_ACCENT, fontWeight: 515 }}>
              {p.owner} · {p.promptType} · {p.category} · {p.qualityScorePct}% quality
            </p>
            <p className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
              {p.description}
            </p>
            <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
              Feature: {p.associatedFeature} · Status: {p.status}
            </p>
          </ExecutiveSecondaryCard>
        ))}
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  const renderVersions = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="VERSION HISTORY — NOTHING OVERWRITTEN">
        {profile.versionHistory.slice(0, 12).map((v) => (
          <ExecutiveSecondaryCard key={v.versionId} title={`${v.promptName.toUpperCase()} · v${v.version}`}>
            <p className="text-[6px] font-futura mb-1" style={{ color: PROMPT_REGISTRY_ACCENT, fontWeight: 515 }}>
              {v.status.toUpperCase()} · {v.createdBy} · {v.createdAt.slice(0, 16).replace('T', ' ')}
            </p>
            <p className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
              {v.changeSummary}
            </p>
            <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
              {v.contentPreview.slice(0, 80)}…{v.approvedBy ? ` · Approved: ${v.approvedBy}` : ''}
            </p>
          </ExecutiveSecondaryCard>
        ))}
        {profile.versionComparisons.slice(0, 2).map((c) => (
          <ExecutiveSecondaryCard key={`${c.promptId}-${c.versionA}-${c.versionB}`} title="VERSION COMPARISON">
            <p className="text-[6px] font-futura" style={{ color: PROMPT_REGISTRY_ACCENT, fontWeight: 515 }}>
              {c.promptName}: v{c.versionA} vs v{c.versionB} · Quality Δ {c.qualityDeltaPct}% · Latency Δ {c.latencyDeltaMs}ms
            </p>
          </ExecutiveSecondaryCard>
        ))}
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  const renderTesting = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="PROMPT TESTING — QUALITY · LATENCY · TRUST">
        {profile.testResults.slice(0, 10).map((t) => (
          <ExecutiveSecondaryCard key={t.testId} title={`${t.promptName.toUpperCase()} · v${t.version}`}>
            <p className="text-[6px] font-futura mb-1" style={{ color: t.passed ? PROMPT_REGISTRY_ACCENT : '#DC2626', fontWeight: 515 }}>
              {t.passed ? 'PASSED' : 'FAILED'} · Quality {t.qualityScorePct}% · {t.latencyMs}ms · ${t.costUsd.toFixed(3)} · {t.tokenUsage} tokens
            </p>
            <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
              Consistency {t.consistencyPct}% · Hallucination risk {t.hallucinationRiskPct}% · Trust {t.trustCompliancePct}% · Coverage {t.knowledgeCoveragePct}%
            </p>
          </ExecutiveSecondaryCard>
        ))}
        <ExecutiveSecondaryCard title="RECOMMENDED IMPROVEMENTS">
          {profile.recommendations.slice(0, 4).map((r) => (
            <p key={r.id} className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
              <span style={{ color: PROMPT_REGISTRY_ACCENT, fontWeight: 515 }}>{r.priority.toUpperCase()}:</span> {r.title}
            </p>
          ))}
        </ExecutiveSecondaryCard>
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  const renderGovernance = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="REGISTRY GOVERNANCE — PROMPTS ARE CODE">
        {profile.governanceFindings.slice(0, 10).map((f) => (
          <ExecutiveSecondaryCard key={f.id} title={f.severity.toUpperCase()}>
            <p className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
              {f.message}
            </p>
            <p className="text-[6px] font-futura" style={{ color: PROMPT_REGISTRY_ACCENT, fontWeight: 515 }}>
              → {f.recommendation}
            </p>
          </ExecutiveSecondaryCard>
        ))}
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  const renderDiscovery = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="PROMPT DISCOVERY">
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Try executive council, command dock, summaries…"
          className="w-full mb-2 px-2 py-1 text-[7px] font-futura border"
          style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder }}
        />
        {searchHits.map((hit) => (
          <ExecutiveSecondaryCard key={hit.entry.promptId} title={hit.entry.name.toUpperCase()}>
            <p className="text-[6px] font-futura mb-1" style={{ color: PROMPT_REGISTRY_ACCENT, fontWeight: 515 }}>
              {hit.entry.category} · v{hit.entry.version} · {hit.matchReason}
            </p>
            <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
              {hit.entry.department} · {hit.entry.owner} · {hit.entry.promptType}
            </p>
          </ExecutiveSecondaryCard>
        ))}
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  const renderTab = () => {
    switch (tab) {
      case 'catalog':
        return renderCatalog();
      case 'versions':
        return renderVersions();
      case 'testing':
        return renderTesting();
      case 'governance':
        return renderGovernance();
      case 'discovery':
        return renderDiscovery();
      default:
        return renderOverview();
    }
  };

  return (
    <div>
      <StudioOsBrandTagline systemId="prompt-registry" className="mb-2" />
      <div className="flex flex-wrap gap-1 mb-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className="px-2 py-1 text-[6px] font-futura uppercase border"
            style={{
              borderColor: tab === t.id ? PROMPT_REGISTRY_ACCENT : ADMIN_STUDIO_THEME.panelBorder,
              color: tab === t.id ? PROMPT_REGISTRY_ACCENT : ADMIN_STUDIO_THEME.textSecondary,
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
