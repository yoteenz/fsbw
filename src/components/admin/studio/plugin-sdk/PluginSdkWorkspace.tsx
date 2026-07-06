import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePluginSdkState } from '../../../../hooks/usePluginSdkState';
import {
  PLUGIN_SDK_ACCENT,
  PLUGIN_SDK_PHILOSOPHY,
  queryPluginSdk,
} from '../../../../studio-os-core/plugin-sdk';
import { adminStudioMissionControlPath, adminStudioWorkspaceRuntimePath } from '../../../../utils/adminStudioRoutes';
import { ADMIN_STUDIO_THEME } from '../../../../utils/adminStudioTheme';
import {
  ExecutiveFocusPanel,
  ExecutiveHealthRing,
  ExecutiveHeroCard,
  ExecutivePageShell,
  ExecutiveSecondaryCard,
} from '../executive-ia';
import { StudioOsBrandTagline } from '../brand/StudioOsBrandTagline';

type PluginTab = 'overview' | 'types' | 'capabilities' | 'sandbox' | 'marketplace' | 'governance' | 'discovery';

const TABS: { id: PluginTab; label: string }[] = [
  { id: 'overview', label: 'PLATFORM OVERVIEW' },
  { id: 'types', label: 'PLUGIN TYPES' },
  { id: 'capabilities', label: 'SDK CAPABILITIES' },
  { id: 'sandbox', label: 'PLUGIN SANDBOX' },
  { id: 'marketplace', label: 'MARKETPLACE' },
  { id: 'governance', label: 'GOVERNANCE' },
  { id: 'discovery', label: 'DISCOVERY' },
];

export function PluginSdkWorkspace() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<PluginTab>('overview');
  const [searchQuery, setSearchQuery] = useState('contractor');
  const { profile, refresh } = usePluginSdkState();

  if (!profile) {
    return (
      <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
        PLUGIN SDK™ LOADING — EXTENSIBLE PLATFORM
      </p>
    );
  }

  const searchHits = queryPluginSdk(searchQuery, profile.organizationId, 8);

  const renderOverview = () => (
    <ExecutivePageShell>
      <ExecutiveHeroCard
        eyebrow="MILESTONE 137 · PLUGIN SDK™ V1.0"
        title={profile.companyName.toUpperCase()}
        subtitle="Studio OS becomes an extensible platform — organizations, developers, and partners build custom capabilities."
        progressPct={profile.platformScore}
        stats={[
          { label: 'PLATFORM', value: `${profile.platformScore}%` },
          { label: 'EXTENSIBLE', value: `${profile.extensibilityScorePct}%` },
          { label: 'SANDBOX', value: `${profile.sandboxScorePct}%` },
          { label: 'PLUGINS', value: String(profile.activePluginCount) },
        ]}
      />
      <div className="flex items-center gap-3 mb-2">
        <ExecutiveHealthRing value={profile.platformScore} size={56} label="PS" accent={PLUGIN_SDK_ACCENT} />
        <div>
          {PLUGIN_SDK_PHILOSOPHY.slice(0, 2).map((line) => (
            <p key={line} className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
              {line}
            </p>
          ))}
        </div>
      </div>
      <ExecutiveSecondaryCard title="ECOSYSTEM PLATFORM · FIRST-CLASS CITIZENS">
        <p className="text-[6px] font-futura" style={{ color: PLUGIN_SDK_ACCENT, fontWeight: 515, lineHeight: 1.5 }}>
          {profile.dockPlatformLine}
        </p>
      </ExecutiveSecondaryCard>
      <button type="button" onClick={() => navigate(adminStudioWorkspaceRuntimePath())} className="mt-2 mr-2 px-2 py-1 text-[6px] font-futura uppercase border" style={{ borderColor: PLUGIN_SDK_ACCENT, color: PLUGIN_SDK_ACCENT }}>
        WORKSPACE RUNTIME →
      </button>
      <button type="button" onClick={() => navigate(adminStudioMissionControlPath())} className="mt-2 mr-2 px-2 py-1 text-[6px] font-futura uppercase border" style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, color: ADMIN_STUDIO_THEME.textSecondary }}>
        MISSION CONTROL →
      </button>
      <button type="button" onClick={refresh} className="mt-2 px-2 py-1 text-[6px] font-futura uppercase border" style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, color: ADMIN_STUDIO_THEME.textSecondary }}>
        SYNC PLUGIN SDK
      </button>
    </ExecutivePageShell>
  );

  const renderTypes = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="PLUGIN TYPES — EXTEND STUDIO OS">
        {profile.pluginTypes.map((t) => (
          <ExecutiveSecondaryCard key={t.typeId} title={`${t.name.toUpperCase()} · ${t.status.toUpperCase()}`}>
            <p className="text-[6px] font-futura mb-1" style={{ color: PLUGIN_SDK_ACCENT, fontWeight: 515 }}>
              {t.extensible ? 'Extensible' : 'Fixed'} · example: {t.exampleUse}
            </p>
            <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
              {t.description}
            </p>
          </ExecutiveSecondaryCard>
        ))}
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  const renderCapabilities = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="SDK CAPABILITIES — FIRST-CLASS REGISTRATION">
        {profile.sdkCapabilities.map((c) => (
          <ExecutiveSecondaryCard key={c.capabilityId} title={c.label.toUpperCase()}>
            <p className="text-[6px] font-futura mb-1" style={{ color: PLUGIN_SDK_ACCENT, fontWeight: 515 }}>
              {c.registeredCount} demo registrations · first-class citizen
            </p>
            <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
              {c.description}
            </p>
          </ExecutiveSecondaryCard>
        ))}
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  const renderSandbox = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="PLUGIN SANDBOX — ISOLATED EXECUTION">
        {profile.sandboxFindings.map((f) => (
          <ExecutiveSecondaryCard key={f.id} title={f.violation.replace(/-/g, ' ').toUpperCase()}>
            <p className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
              {f.message}
            </p>
            <p className="text-[6px] font-futura" style={{ color: PLUGIN_SDK_ACCENT, fontWeight: 515 }}>
              → {f.recommendation} · blocked: {f.blocked ? 'yes' : 'no'}
            </p>
          </ExecutiveSecondaryCard>
        ))}
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  const renderMarketplace = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="PLUGIN MARKETPLACE — ORGANIZATIONS CHOOSE">
        {profile.marketplaceTiers.map((m) => (
          <ExecutiveSecondaryCard key={m.tier} title={m.label.toUpperCase()}>
            <p className="text-[6px] font-futura mb-1" style={{ color: PLUGIN_SDK_ACCENT, fontWeight: 515 }}>
              {m.pluginCount} available · {m.installable ? 'installable' : 'restricted'}
            </p>
            <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
              {m.description}
            </p>
          </ExecutiveSecondaryCard>
        ))}
        <ExecutiveFocusPanel title="INSTALLED PLUGINS">
          {profile.installedPlugins.map((p) => (
            <ExecutiveSecondaryCard key={p.pluginId} title={`${p.name.toUpperCase()} · ${p.status.toUpperCase()}`}>
              <p className="text-[6px] font-futura mb-1" style={{ color: PLUGIN_SDK_ACCENT, fontWeight: 515 }}>
                v{p.version} · {p.tier} · sandboxed · org-scoped
              </p>
            </ExecutiveSecondaryCard>
          ))}
        </ExecutiveFocusPanel>
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  const renderGovernance = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="PLUGIN GOVERNANCE · POLICY & PERMISSION ENFORCED">
        {profile.governanceFindings.map((f) => (
          <ExecutiveSecondaryCard key={f.id} title={f.severity.toUpperCase()}>
            <p className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
              {f.message}
            </p>
            <p className="text-[6px] font-futura" style={{ color: PLUGIN_SDK_ACCENT, fontWeight: 515 }}>
              → {f.recommendation}
            </p>
          </ExecutiveSecondaryCard>
        ))}
        <ExecutiveSecondaryCard title="RECOMMENDATIONS">
          {profile.recommendations.slice(0, 4).map((r) => (
            <p key={r.id} className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
              <span style={{ color: PLUGIN_SDK_ACCENT, fontWeight: 515 }}>{r.priority.toUpperCase()}:</span> {r.title}
            </p>
          ))}
        </ExecutiveSecondaryCard>
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  const renderDiscovery = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="PLUGIN DISCOVERY">
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Try contractor, marketplace, register commands, sandbox…"
          className="w-full mb-2 px-2 py-1 text-[7px] font-futura border"
          style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder }}
        />
        {searchHits.map((hit) => (
          <ExecutiveSecondaryCard key={`${hit.type}-${hit.id}`} title={hit.label.toUpperCase()}>
            <p className="text-[6px] font-futura mb-1" style={{ color: PLUGIN_SDK_ACCENT, fontWeight: 515 }}>
              {hit.type} · {hit.matchReason}
            </p>
          </ExecutiveSecondaryCard>
        ))}
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  const renderTab = () => {
    switch (tab) {
      case 'types':
        return renderTypes();
      case 'capabilities':
        return renderCapabilities();
      case 'sandbox':
        return renderSandbox();
      case 'marketplace':
        return renderMarketplace();
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
      <StudioOsBrandTagline systemId="plugin-sdk" className="mb-2" />
      <div className="flex flex-wrap gap-1 mb-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className="px-2 py-1 text-[6px] font-futura uppercase border"
            style={{
              borderColor: tab === t.id ? PLUGIN_SDK_ACCENT : ADMIN_STUDIO_THEME.panelBorder,
              color: tab === t.id ? PLUGIN_SDK_ACCENT : ADMIN_STUDIO_THEME.textSecondary,
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
