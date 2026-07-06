import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useComponentRegistryState } from '../../../../hooks/useComponentRegistryState';
import {
  COMPONENT_REGISTRY_ACCENT,
  COMPONENT_REGISTRY_PHILOSOPHY,
  queryComponentRegistry,
} from '../../../../studio-os-core/component-registry';
import { adminStudioDesignTokenEnginePath, adminStudioMissionControlPath, adminStudioSystemRegistryPath } from '../../../../utils/adminStudioRoutes';
import { ADMIN_STUDIO_THEME } from '../../../../utils/adminStudioTheme';
import {
  ExecutiveFocusPanel,
  ExecutiveHealthRing,
  ExecutiveHeroCard,
  ExecutivePageShell,
  ExecutiveSecondaryCard,
} from '../executive-ia';
import { StudioOsBrandTagline } from '../brand/StudioOsBrandTagline';

type RegistryTab = 'overview' | 'catalog' | 'categories' | 'reuse' | 'discovery' | 'health';

const TABS: { id: RegistryTab; label: string }[] = [
  { id: 'overview', label: 'REGISTRY OVERVIEW' },
  { id: 'catalog', label: 'COMPONENT CATALOG' },
  { id: 'categories', label: 'CATEGORIES' },
  { id: 'reuse', label: 'REUSE SCORES' },
  { id: 'discovery', label: 'DISCOVERY' },
  { id: 'health', label: 'REGISTRY HEALTH' },
];

export function ComponentRegistryWorkspace() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<RegistryTab>('overview');
  const [searchQuery, setSearchQuery] = useState('card');
  const { profile, refresh } = useComponentRegistryState();

  if (!profile) {
    return (
      <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
        COMPONENT REGISTRY™ LOADING — REUSABLE UI ASSETS
      </p>
    );
  }

  const searchHits = queryComponentRegistry(searchQuery, 8);

  const renderOverview = () => (
    <ExecutivePageShell>
      <ExecutiveHeroCard
        eyebrow="MILESTONE 128 · COMPONENT REGISTRY™ V1.0"
        title={profile.companyName.toUpperCase()}
        subtitle="Every reusable UI component registered as a managed platform asset — assemble interfaces, never recreate."
        progressPct={profile.registryScore}
        stats={[
          { label: 'REGISTRY', value: `${profile.registryScore}%` },
          { label: 'COMPONENTS', value: `${profile.totalComponents}` },
          { label: 'REUSE', value: `${profile.totalReuseScore}%` },
          { label: 'CATEGORIES', value: `${Object.keys(profile.categoryCounts).length}` },
        ]}
      />
      <div className="flex items-center gap-3 mb-2">
        <ExecutiveHealthRing value={profile.registryScore} size={56} label="CR" accent={COMPONENT_REGISTRY_ACCENT} />
        <div>
          {COMPONENT_REGISTRY_PHILOSOPHY.slice(0, 2).map((line) => (
            <p key={line} className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
              {line}
            </p>
          ))}
        </div>
      </div>
      <ExecutiveSecondaryCard title="COMMAND DOCK · COMPONENT STATUS">
        <p className="text-[6px] font-futura" style={{ color: COMPONENT_REGISTRY_ACCENT, fontWeight: 515, lineHeight: 1.5 }}>
          {profile.dockRegistryLine}
        </p>
      </ExecutiveSecondaryCard>
      <button type="button" onClick={() => navigate(adminStudioDesignTokenEnginePath())} className="mt-2 mr-2 px-2 py-1 text-[6px] font-futura uppercase border" style={{ borderColor: COMPONENT_REGISTRY_ACCENT, color: COMPONENT_REGISTRY_ACCENT }}>
        DESIGN TOKEN ENGINE →
      </button>
      <button type="button" onClick={() => navigate(adminStudioSystemRegistryPath())} className="mt-2 mr-2 px-2 py-1 text-[6px] font-futura uppercase border" style={{ borderColor: COMPONENT_REGISTRY_ACCENT, color: COMPONENT_REGISTRY_ACCENT }}>
        SYSTEM REGISTRY →
      </button>
      <button type="button" onClick={() => navigate(adminStudioMissionControlPath())} className="mt-2 mr-2 px-2 py-1 text-[6px] font-futura uppercase border" style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, color: ADMIN_STUDIO_THEME.textSecondary }}>
        MISSION CONTROL →
      </button>
      <button type="button" onClick={refresh} className="mt-2 px-2 py-1 text-[6px] font-futura uppercase border" style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, color: ADMIN_STUDIO_THEME.textSecondary }}>
        REINDEX COMPONENTS
      </button>
    </ExecutivePageShell>
  );

  const renderCatalog = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="COMPONENT CATALOG — REGISTERED UI ASSETS">
        {profile.components.slice(0, 14).map((c) => (
          <ExecutiveSecondaryCard key={c.componentId} title={`${c.officialName.toUpperCase()} · ${c.category.toUpperCase()}`}>
            <p className="text-[6px] font-futura mb-1" style={{ color: COMPONENT_REGISTRY_ACCENT, fontWeight: 515 }}>
              REUSE {c.reuseScore}% · v{c.version} · {c.componentId}
            </p>
            <p className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
              Variants: {c.variants.join(', ')}
            </p>
            <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
              {c.description}
            </p>
          </ExecutiveSecondaryCard>
        ))}
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  const renderCategories = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="COMPONENT CATEGORIES">
        {Object.entries(profile.categoryCounts)
          .sort((a, b) => b[1] - a[1])
          .map(([category, count]) => (
            <ExecutiveSecondaryCard key={category} title={category.toUpperCase().replace(/-/g, ' ')}>
              <p className="text-[6px] font-futura" style={{ color: COMPONENT_REGISTRY_ACCENT, fontWeight: 515 }}>
                {count} REGISTERED
              </p>
            </ExecutiveSecondaryCard>
          ))}
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  const renderReuse = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="REUSE SCORES — HIGHEST VALUE COMPONENTS">
        {[...profile.components].sort((a, b) => b.reuseScore - a.reuseScore).slice(0, 12).map((c) => (
          <ExecutiveSecondaryCard key={c.componentId} title={c.officialName.toUpperCase()}>
            <p className="text-[6px] font-futura mb-1" style={{ color: COMPONENT_REGISTRY_ACCENT, fontWeight: 515 }}>
              REUSE {c.reuseScore}% · {c.category}
            </p>
            <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
              Used on: {c.usageSurfaces.join(', ')}
            </p>
          </ExecutiveSecondaryCard>
        ))}
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  const renderDiscovery = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="COMPONENT DISCOVERY">
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Try card, panel, mission control, glass…"
          className="w-full mb-2 px-2 py-1 text-[7px] font-futura border"
          style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder }}
        />
        {searchHits.map((hit) => (
          <ExecutiveSecondaryCard key={hit.entry.componentId} title={hit.entry.officialName.toUpperCase()}>
            <p className="text-[6px] font-futura mb-1" style={{ color: COMPONENT_REGISTRY_ACCENT, fontWeight: 515 }}>
              {hit.matchReason} · {hit.entry.category} · reuse {hit.entry.reuseScore}%
            </p>
            <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
              {hit.entry.componentPath}
            </p>
          </ExecutiveSecondaryCard>
        ))}
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  const renderHealth = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="COMPONENT REGISTRY HEALTH">
        {profile.healthMetrics.map((m) => (
          <ExecutiveSecondaryCard key={m.id} title={`${m.label.toUpperCase()} · ${m.scorePct}%`}>
            <p className="text-[6px] font-futura mb-1" style={{ color: m.status === 'healthy' ? COMPONENT_REGISTRY_ACCENT : ADMIN_STUDIO_THEME.textSecondary, fontWeight: 515 }}>
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
      case 'catalog':
        return renderCatalog();
      case 'categories':
        return renderCategories();
      case 'reuse':
        return renderReuse();
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
      <StudioOsBrandTagline systemId="component-registry" className="mb-2" />
      <div className="flex flex-wrap gap-1 mb-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className="px-2 py-1 text-[6px] font-futura uppercase border"
            style={{
              borderColor: tab === t.id ? COMPONENT_REGISTRY_ACCENT : ADMIN_STUDIO_THEME.panelBorder,
              color: tab === t.id ? COMPONENT_REGISTRY_ACCENT : ADMIN_STUDIO_THEME.textSecondary,
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
