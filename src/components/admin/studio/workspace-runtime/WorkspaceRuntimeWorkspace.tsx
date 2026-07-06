import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorkspaceRuntimeState } from '../../../../hooks/useWorkspaceRuntimeState';
import {
  WORKSPACE_RUNTIME_ACCENT,
  WORKSPACE_RUNTIME_PHILOSOPHY,
  queryWorkspaceRuntime,
} from '../../../../studio-os-core/workspace-runtime';
import { adminStudioMissionControlPath, adminStudioPermissionEnginePath, adminStudioPluginSdkPath } from '../../../../utils/adminStudioRoutes';
import { ADMIN_STUDIO_THEME } from '../../../../utils/adminStudioTheme';
import {
  ExecutiveFocusPanel,
  ExecutiveHealthRing,
  ExecutiveHeroCard,
  ExecutivePageShell,
  ExecutiveSecondaryCard,
} from '../executive-ia';
import { StudioOsBrandTagline } from '../brand/StudioOsBrandTagline';

type RuntimeTab = 'overview' | 'runtime' | 'configuration' | 'sandboxes' | 'health' | 'isolation' | 'discovery';

const TABS: { id: RuntimeTab; label: string }[] = [
  { id: 'overview', label: 'RUNTIME OVERVIEW' },
  { id: 'runtime', label: 'ORG RUNTIME' },
  { id: 'configuration', label: 'CONFIGURATION' },
  { id: 'sandboxes', label: 'SANDBOXES' },
  { id: 'health', label: 'RUNTIME HEALTH' },
  { id: 'isolation', label: 'ISOLATION' },
  { id: 'discovery', label: 'DISCOVERY' },
];

export function WorkspaceRuntimeWorkspace() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<RuntimeTab>('overview');
  const [searchQuery, setSearchQuery] = useState('headquarters');
  const { profile, refresh } = useWorkspaceRuntimeState();

  if (!profile) {
    return (
      <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
        WORKSPACE RUNTIME™ LOADING — ISOLATED HEADQUARTERS
      </p>
    );
  }

  const searchHits = queryWorkspaceRuntime(searchQuery, 8);

  const renderOverview = () => (
    <ExecutivePageShell>
      <ExecutiveHeroCard
        eyebrow="MILESTONE 136 · WORKSPACE RUNTIME™ V1.0"
        title={profile.companyName.toUpperCase()}
        subtitle="Every organization owns its own digital headquarters — Studio OS provides the platform, Workspace Runtime provides the organization."
        progressPct={profile.runtimeScore}
        stats={[
          { label: 'RUNTIME', value: `${profile.runtimeScore}%` },
          { label: 'HEALTH', value: `${profile.healthDashboardScore}%` },
          { label: 'ISOLATION', value: `${profile.isolationScorePct}%` },
          { label: 'SANDBOX', value: profile.activeSandbox.toUpperCase() },
        ]}
      />
      <div className="flex items-center gap-3 mb-2">
        <ExecutiveHealthRing value={profile.runtimeScore} size={56} label="WR" accent={WORKSPACE_RUNTIME_ACCENT} />
        <div>
          {WORKSPACE_RUNTIME_PHILOSOPHY.slice(0, 2).map((line) => (
            <p key={line} className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
              {line}
            </p>
          ))}
        </div>
      </div>
      <ExecutiveSecondaryCard title="INDEPENDENT HEADQUARTERS · NEVER SHARED">
        <p className="text-[6px] font-futura" style={{ color: WORKSPACE_RUNTIME_ACCENT, fontWeight: 515, lineHeight: 1.5 }}>
          {profile.dockRuntimeLine}
        </p>
      </ExecutiveSecondaryCard>
      <button type="button" onClick={() => navigate(adminStudioPluginSdkPath())} className="mt-2 mr-2 px-2 py-1 text-[6px] font-futura uppercase border" style={{ borderColor: WORKSPACE_RUNTIME_ACCENT, color: WORKSPACE_RUNTIME_ACCENT }}>
        PLUGIN SDK →
      </button>
      <button type="button" onClick={() => navigate(adminStudioPermissionEnginePath())} className="mt-2 mr-2 px-2 py-1 text-[6px] font-futura uppercase border" style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, color: ADMIN_STUDIO_THEME.textSecondary }}>
        PERMISSION ENGINE →
      </button>
      <button type="button" onClick={() => navigate(adminStudioMissionControlPath())} className="mt-2 mr-2 px-2 py-1 text-[6px] font-futura uppercase border" style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, color: ADMIN_STUDIO_THEME.textSecondary }}>
        MISSION CONTROL →
      </button>
      <button type="button" onClick={refresh} className="mt-2 px-2 py-1 text-[6px] font-futura uppercase border" style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, color: ADMIN_STUDIO_THEME.textSecondary }}>
        SYNC RUNTIME
      </button>
    </ExecutivePageShell>
  );

  const renderRuntime = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="ISOLATED ORGANIZATION RUNTIME">
        {profile.components.map((c) => (
          <ExecutiveSecondaryCard key={c.componentId} title={`${c.name.toUpperCase()} · ${c.status.toUpperCase()}`}>
            <p className="text-[6px] font-futura mb-1" style={{ color: WORKSPACE_RUNTIME_ACCENT, fontWeight: 515 }}>
              v{c.version} · isolated · never leaks
            </p>
            <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
              {c.description}
            </p>
          </ExecutiveSecondaryCard>
        ))}
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  const renderConfiguration = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="RUNTIME CONFIGURATION — ORG-SCOPED ONLY">
        {profile.configuration.map((cfg) => (
          <ExecutiveSecondaryCard key={cfg.configId} title={cfg.label.toUpperCase()}>
            <p className="text-[6px] font-futura mb-1" style={{ color: WORKSPACE_RUNTIME_ACCENT, fontWeight: 515 }}>
              {cfg.category} · does not affect other organizations
            </p>
            <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
              {cfg.value}
            </p>
          </ExecutiveSecondaryCard>
        ))}
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  const renderSandboxes = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="SANDBOX ENVIRONMENTS — SAFE TESTING">
        {profile.sandboxes.map((s) => (
          <ExecutiveSecondaryCard key={s.environment} title={`${s.label.toUpperCase()} · ${s.status.toUpperCase()}`}>
            <p className="text-[6px] font-futura mb-1" style={{ color: WORKSPACE_RUNTIME_ACCENT, fontWeight: 515 }}>
              {s.safeForTesting ? 'Safe for testing' : 'Production only'} · {s.environment}
            </p>
            <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
              {s.description}
            </p>
          </ExecutiveSecondaryCard>
        ))}
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  const renderHealth = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="RUNTIME HEALTH DASHBOARD">
        {profile.healthMetrics.map((m) => (
          <ExecutiveSecondaryCard key={m.metricId} title={m.label.toUpperCase()}>
            <p className="text-[6px] font-futura mb-1" style={{ color: WORKSPACE_RUNTIME_ACCENT, fontWeight: 515 }}>
              {m.scorePct}% · {m.status.toUpperCase()} · trend {m.trend}
            </p>
            <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
              {m.detail}
            </p>
          </ExecutiveSecondaryCard>
        ))}
        <ExecutiveSecondaryCard title="RECOMMENDATIONS">
          {profile.recommendations.slice(0, 4).map((r) => (
            <p key={r.id} className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
              <span style={{ color: WORKSPACE_RUNTIME_ACCENT, fontWeight: 515 }}>{r.priority.toUpperCase()}:</span> {r.title}
            </p>
          ))}
        </ExecutiveSecondaryCard>
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  const renderIsolation = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="RUNTIME ISOLATION — ORGANIZATIONS NEVER INTERFERE">
        {profile.isolationFindings.map((f) => (
          <ExecutiveSecondaryCard key={f.id} title={f.severity.toUpperCase()}>
            <p className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
              {f.message}
            </p>
            <p className="text-[6px] font-futura" style={{ color: WORKSPACE_RUNTIME_ACCENT, fontWeight: 515 }}>
              → {f.recommendation}
            </p>
          </ExecutiveSecondaryCard>
        ))}
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  const renderDiscovery = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="RUNTIME DISCOVERY">
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Try headquarters, sandbox, automation, configuration…"
          className="w-full mb-2 px-2 py-1 text-[7px] font-futura border"
          style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder }}
        />
        {searchHits.map((hit) => (
          <ExecutiveSecondaryCard key={hit.id} title={hit.label.toUpperCase()}>
            <p className="text-[6px] font-futura mb-1" style={{ color: WORKSPACE_RUNTIME_ACCENT, fontWeight: 515 }}>
              {hit.type} · {hit.matchReason}
            </p>
          </ExecutiveSecondaryCard>
        ))}
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  const renderTab = () => {
    switch (tab) {
      case 'runtime':
        return renderRuntime();
      case 'configuration':
        return renderConfiguration();
      case 'sandboxes':
        return renderSandboxes();
      case 'health':
        return renderHealth();
      case 'isolation':
        return renderIsolation();
      case 'discovery':
        return renderDiscovery();
      default:
        return renderOverview();
    }
  };

  return (
    <div>
      <StudioOsBrandTagline systemId="workspace-runtime" className="mb-2" />
      <div className="flex flex-wrap gap-1 mb-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className="px-2 py-1 text-[6px] font-futura uppercase border"
            style={{
              borderColor: tab === t.id ? WORKSPACE_RUNTIME_ACCENT : ADMIN_STUDIO_THEME.panelBorder,
              color: tab === t.id ? WORKSPACE_RUNTIME_ACCENT : ADMIN_STUDIO_THEME.textSecondary,
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
