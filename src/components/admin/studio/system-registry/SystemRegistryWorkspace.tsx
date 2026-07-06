import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSystemRegistryState } from '../../../../hooks/useSystemRegistryState';
import {
  SYSTEM_REGISTRY_ACCENT,
  SYSTEM_REGISTRY_PHILOSOPHY,
  querySystemRegistry,
} from '../../../../studio-os-core/system-registry';
import {
  adminStudioDocumentationRegistryPath,
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

type RegistryTab = 'overview' | 'systems' | 'categories' | 'dependencies' | 'discovery' | 'health';

const TABS: { id: RegistryTab; label: string }[] = [
  { id: 'overview', label: 'REGISTRY OVERVIEW' },
  { id: 'systems', label: 'ALL SYSTEMS' },
  { id: 'categories', label: 'CATEGORIES' },
  { id: 'dependencies', label: 'DEPENDENCIES' },
  { id: 'discovery', label: 'DISCOVERY' },
  { id: 'health', label: 'REGISTRY HEALTH' },
];

export function SystemRegistryWorkspace() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<RegistryTab>('overview');
  const [searchQuery, setSearchQuery] = useState('profession brain');
  const { profile, refresh } = useSystemRegistryState();

  if (!profile) {
    return (
      <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
        SYSTEM REGISTRY™ LOADING — MASTER INDEX OF STUDIO OS
      </p>
    );
  }

  const searchHits = querySystemRegistry(searchQuery, 8);

  const renderOverview = () => (
    <ExecutivePageShell>
      <ExecutiveHeroCard
        eyebrow="MILESTONE 127 · SYSTEM REGISTRY™ V1.0"
        title={profile.companyName.toUpperCase()}
        subtitle="Master registry of every object, service, module, feature, and system inside Studio OS."
        progressPct={profile.registryScore}
        stats={[
          { label: 'REGISTRY', value: `${profile.registryScore}%` },
          { label: 'SYSTEMS', value: `${profile.totalSystems}` },
          { label: 'CATEGORIES', value: `${Object.keys(profile.categoryCounts).length}` },
          { label: 'SURFACES', value: `${profile.discoverySurfaces.length}` },
        ]}
      />
      <div className="flex items-center gap-3 mb-2">
        <ExecutiveHealthRing value={profile.registryScore} size={56} label="SR" accent={SYSTEM_REGISTRY_ACCENT} />
        <div>
          {SYSTEM_REGISTRY_PHILOSOPHY.slice(0, 2).map((line) => (
            <p key={line} className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
              {line}
            </p>
          ))}
        </div>
      </div>
      <ExecutiveSecondaryCard title="COMMAND DOCK · MASTER DIRECTORY">
        <p className="text-[6px] font-futura" style={{ color: SYSTEM_REGISTRY_ACCENT, fontWeight: 515, lineHeight: 1.5 }}>
          {profile.dockRegistryLine}
        </p>
      </ExecutiveSecondaryCard>
      <button type="button" onClick={() => navigate(adminStudioDocumentationRegistryPath())} className="mt-2 mr-2 px-2 py-1 text-[6px] font-futura uppercase border" style={{ borderColor: SYSTEM_REGISTRY_ACCENT, color: SYSTEM_REGISTRY_ACCENT }}>
        DOCUMENTATION REGISTRY →
      </button>
      <button type="button" onClick={() => navigate(adminStudioMissionControlPath())} className="mt-2 mr-2 px-2 py-1 text-[6px] font-futura uppercase border" style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, color: ADMIN_STUDIO_THEME.textSecondary }}>
        MISSION CONTROL →
      </button>
      <button type="button" onClick={refresh} className="mt-2 px-2 py-1 text-[6px] font-futura uppercase border" style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, color: ADMIN_STUDIO_THEME.textSecondary }}>
        REINDEX REGISTRY
      </button>
    </ExecutivePageShell>
  );

  const renderSystems = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="MASTER DIRECTORY — EVERY SYSTEM REGISTERED">
        {profile.systems.slice(0, 14).map((entry) => (
          <ExecutiveSecondaryCard key={entry.uniqueId} title={`${entry.officialName.toUpperCase()} · ${entry.category.toUpperCase()}`}>
            <p className="text-[6px] font-futura mb-1" style={{ color: SYSTEM_REGISTRY_ACCENT, fontWeight: 515 }}>
              {entry.status.toUpperCase()} · v{entry.version} · {entry.uniqueId}
            </p>
            <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
              {entry.description}
            </p>
          </ExecutiveSecondaryCard>
        ))}
        <p className="text-[6px] font-futura mt-2" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
          Showing 14 of {profile.totalSystems} registered systems
        </p>
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  const renderCategories = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="SYSTEM CATEGORIES">
        {Object.entries(profile.categoryCounts)
          .sort((a, b) => b[1] - a[1])
          .map(([category, count]) => (
            <ExecutiveSecondaryCard key={category} title={category.toUpperCase().replace(/-/g, ' ')}>
              <p className="text-[6px] font-futura" style={{ color: SYSTEM_REGISTRY_ACCENT, fontWeight: 515 }}>
                {count} REGISTERED
              </p>
            </ExecutiveSecondaryCard>
          ))}
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  const renderDependencies = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="DEPENDENCY GRAPH">
        {profile.dependencyNodes.filter((n) => n.dependents.length > 0).slice(0, 12).map((node) => (
          <ExecutiveSecondaryCard key={node.uniqueId} title={node.officialName.toUpperCase()}>
            <p className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
              Depends on: {node.dependencies.slice(0, 3).join(', ') || 'none'}
            </p>
            <p className="text-[6px] font-futura" style={{ color: SYSTEM_REGISTRY_ACCENT, fontWeight: 515 }}>
              {node.dependents.length} dependents
            </p>
          </ExecutiveSecondaryCard>
        ))}
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  const renderDiscovery = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="SYSTEM DISCOVERY — SEARCH MASTER DIRECTORY">
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Try profession brain, command dock, documentation…"
          className="w-full mb-2 px-2 py-1 text-[7px] font-futura border"
          style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder }}
        />
        {searchHits.map((hit) => (
          <ExecutiveSecondaryCard key={hit.entry.uniqueId} title={hit.entry.officialName.toUpperCase()}>
            <p className="text-[6px] font-futura mb-1" style={{ color: SYSTEM_REGISTRY_ACCENT, fontWeight: 515 }}>
              {hit.matchReason} · {hit.entry.category} · score {hit.score}
            </p>
            <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
              {hit.entry.description}
            </p>
          </ExecutiveSecondaryCard>
        ))}
        <p className="text-[6px] font-futura mt-2" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
          Discovery surfaces: search · documentation · architecture · developers · Command Dock · dependencies · Studio Intelligence
        </p>
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  const renderHealth = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="REGISTRY HEALTH">
        {profile.healthMetrics.map((m) => (
          <ExecutiveSecondaryCard key={m.id} title={`${m.label.toUpperCase()} · ${m.scorePct}%`}>
            <p className="text-[6px] font-futura mb-1" style={{ color: m.status === 'healthy' ? SYSTEM_REGISTRY_ACCENT : ADMIN_STUDIO_THEME.textSecondary, fontWeight: 515 }}>
              {m.status.toUpperCase()}
            </p>
            <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
              {m.detail}
            </p>
          </ExecutiveSecondaryCard>
        ))}
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  const renderTab = () => {
    switch (tab) {
      case 'systems':
        return renderSystems();
      case 'categories':
        return renderCategories();
      case 'dependencies':
        return renderDependencies();
      case 'discovery':
        return renderDiscovery();
      case 'health':
        return renderHealth();
      default:
        return renderOverview();
    }
  };

  return (
    <div>
      <StudioOsBrandTagline systemId="system-registry" className="mb-2" />
      <div className="flex flex-wrap gap-1 mb-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className="px-2 py-1 text-[6px] font-futura uppercase border"
            style={{
              borderColor: tab === t.id ? SYSTEM_REGISTRY_ACCENT : ADMIN_STUDIO_THEME.panelBorder,
              color: tab === t.id ? SYSTEM_REGISTRY_ACCENT : ADMIN_STUDIO_THEME.textSecondary,
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
