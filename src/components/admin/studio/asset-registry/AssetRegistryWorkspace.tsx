import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAssetRegistryState } from '../../../../hooks/useAssetRegistryState';
import {
  ASSET_REGISTRY_ACCENT,
  ASSET_REGISTRY_PHILOSOPHY,
  queryAssetRegistry,
  buildVersioningCapabilities,
} from '../../../../studio-os-core/asset-registry';
import { adminStudioMissionControlPath, adminStudioStateEnginePath } from '../../../../utils/adminStudioRoutes';
import { ADMIN_STUDIO_THEME } from '../../../../utils/adminStudioTheme';
import {
  ExecutiveFocusPanel,
  ExecutiveHealthRing,
  ExecutiveHeroCard,
  ExecutivePageShell,
  ExecutiveSecondaryCard,
} from '../executive-ia';
import { StudioOsBrandTagline } from '../brand/StudioOsBrandTagline';

type AssetTab = 'overview' | 'categories' | 'metadata' | 'versioning' | 'health' | 'governance' | 'discovery';

const TABS: { id: AssetTab; label: string }[] = [
  { id: 'overview', label: 'REGISTRY OVERVIEW' },
  { id: 'categories', label: 'ASSET CATEGORIES' },
  { id: 'metadata', label: 'METADATA' },
  { id: 'versioning', label: 'VERSIONING' },
  { id: 'health', label: 'ASSET HEALTH' },
  { id: 'governance', label: 'GOVERNANCE' },
  { id: 'discovery', label: 'DISCOVERY' },
];

export function AssetRegistryWorkspace() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<AssetTab>('overview');
  const [searchQuery, setSearchQuery] = useState('logo');
  const { profile, refresh } = useAssetRegistryState();
  const versioningCaps = buildVersioningCapabilities();

  if (!profile) {
    return (
      <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
        ASSET REGISTRY™ LOADING — MANAGED PLATFORM RESOURCES
      </p>
    );
  }

  const searchHits = queryAssetRegistry(searchQuery, profile.organizationId, 8);

  const renderOverview = () => (
    <ExecutivePageShell>
      <ExecutiveHeroCard
        eyebrow="MILESTONE 140 · ASSET REGISTRY™ V1.0"
        title={profile.companyName.toUpperCase()}
        subtitle="Every organizational asset is a managed platform resource — discoverable, reusable, versioned, connected."
        progressPct={profile.registryScore}
        stats={[
          { label: 'REGISTRY', value: `${profile.registryScore}%` },
          { label: 'COVERAGE', value: `${profile.catalogCoveragePct}%` },
          { label: 'HEALTH', value: `${profile.healthScorePct}%` },
          { label: 'ASSETS', value: String(profile.totalAssetCount) },
        ]}
      />
      <div className="flex items-center gap-3 mb-2">
        <ExecutiveHealthRing value={profile.registryScore} size={56} label="AR" accent={ASSET_REGISTRY_ACCENT} />
        <div>
          {ASSET_REGISTRY_PHILOSOPHY.slice(0, 2).map((line) => (
            <p key={line} className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
              {line}
            </p>
          ))}
        </div>
      </div>
      <ExecutiveSecondaryCard title="MEDIA → ORGANIZATIONAL KNOWLEDGE · NEVER SCATTERED">
        <p className="text-[6px] font-futura" style={{ color: ASSET_REGISTRY_ACCENT, fontWeight: 515, lineHeight: 1.5 }}>
          {profile.dockRegistryLine}
        </p>
      </ExecutiveSecondaryCard>
      <button type="button" onClick={() => navigate(adminStudioStateEnginePath())} className="mt-2 mr-2 px-2 py-1 text-[6px] font-futura uppercase border" style={{ borderColor: ASSET_REGISTRY_ACCENT, color: ASSET_REGISTRY_ACCENT }}>
        STATE ENGINE →
      </button>
      <button type="button" onClick={() => navigate(adminStudioMissionControlPath())} className="mt-2 mr-2 px-2 py-1 text-[6px] font-futura uppercase border" style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, color: ADMIN_STUDIO_THEME.textSecondary }}>
        MISSION CONTROL →
      </button>
      <button type="button" onClick={refresh} className="mt-2 px-2 py-1 text-[6px] font-futura uppercase border" style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, color: ADMIN_STUDIO_THEME.textSecondary }}>
        SYNC REGISTRY
      </button>
    </ExecutivePageShell>
  );

  const renderCategories = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="REGISTER ASSETS — EVERYTHING SEARCHABLE">
        {profile.categories.map((c) => (
          <ExecutiveSecondaryCard key={c.category} title={`${c.label.toUpperCase()} · ${c.registeredCount} REGISTERED`}>
            <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
              {c.description}
            </p>
          </ExecutiveSecondaryCard>
        ))}
      </ExecutiveFocusPanel>
      <ExecutiveFocusPanel title="SAMPLE REGISTERED ASSETS">
        {profile.registeredAssets.map((a) => (
          <ExecutiveSecondaryCard key={a.assetId} title={`${a.name.toUpperCase()} · v${a.version}`}>
            <p className="text-[6px] font-futura mb-1" style={{ color: ASSET_REGISTRY_ACCENT, fontWeight: 515 }}>
              {a.category} · {a.status} · {a.usageCount} uses · {a.owner}
            </p>
            <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
              {a.description}
            </p>
          </ExecutiveSecondaryCard>
        ))}
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  const renderMetadata = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="ASSET METADATA — FULL TRACKING">
        {profile.metadataSchema.map((m) => (
          <ExecutiveSecondaryCard key={m.field} title={m.label.toUpperCase()}>
            <p className="text-[6px] font-futura" style={{ color: ASSET_REGISTRY_ACCENT, fontWeight: 515 }}>
              {m.required ? 'Required' : 'Optional'} · tracked on every asset
            </p>
          </ExecutiveSecondaryCard>
        ))}
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  const renderVersioning = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="VERSIONING — NEVER OVERWRITE">
        {versioningCaps.map((v) => (
          <ExecutiveSecondaryCard key={v.capability} title={v.capability.replace(/-/g, ' ').toUpperCase()}>
            <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
              {v.description}
            </p>
          </ExecutiveSecondaryCard>
        ))}
        <ExecutiveFocusPanel title="VERSION RECORDS">
          {profile.versionRecords.map((v) => (
            <ExecutiveSecondaryCard key={v.versionId} title={`${v.assetId} · v${v.version}`}>
              <p className="text-[6px] font-futura mb-1" style={{ color: ASSET_REGISTRY_ACCENT, fontWeight: 515 }}>
                {v.isCurrent ? 'Current version' : 'Previous version'} · {v.approvedBy ?? 'system'}
              </p>
              <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
                {v.changeSummary}
              </p>
            </ExecutiveSecondaryCard>
          ))}
        </ExecutiveFocusPanel>
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  const renderHealth = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="ASSET HEALTH DASHBOARD">
        {profile.healthMetrics.map((m) => (
          <ExecutiveSecondaryCard key={m.checkId} title={m.label.toUpperCase()}>
            <p className="text-[6px] font-futura mb-1" style={{ color: ASSET_REGISTRY_ACCENT, fontWeight: 515 }}>
              {m.scorePct}% · {m.issueCount} issues · {m.status}
            </p>
            <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
              {m.detail}
            </p>
          </ExecutiveSecondaryCard>
        ))}
        <ExecutiveSecondaryCard title="RECOMMENDATIONS">
          {profile.recommendations.slice(0, 4).map((r) => (
            <p key={r.id} className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
              <span style={{ color: ASSET_REGISTRY_ACCENT, fontWeight: 515 }}>{r.priority.toUpperCase()}:</span> {r.title}
            </p>
          ))}
        </ExecutiveSecondaryCard>
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  const renderGovernance = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="ASSET GOVERNANCE · MANAGED PLATFORM RESOURCES">
        {profile.governanceFindings.map((f) => (
          <ExecutiveSecondaryCard key={f.id} title={f.severity.toUpperCase()}>
            <p className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
              {f.message}
            </p>
            <p className="text-[6px] font-futura" style={{ color: ASSET_REGISTRY_ACCENT, fontWeight: 515 }}>
              → {f.recommendation}
            </p>
          </ExecutiveSecondaryCard>
        ))}
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  const renderDiscovery = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="ASSET DISCOVERY — FULLY SEARCHABLE">
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Try logo, academy, unused, video, brand kit…"
          className="w-full mb-2 px-2 py-1 text-[7px] font-futura border"
          style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder }}
        />
        {searchHits.map((hit) => (
          <ExecutiveSecondaryCard key={`${hit.type}-${hit.id}`} title={hit.label.toUpperCase()}>
            <p className="text-[6px] font-futura mb-1" style={{ color: ASSET_REGISTRY_ACCENT, fontWeight: 515 }}>
              {hit.type} · {hit.matchReason}
            </p>
          </ExecutiveSecondaryCard>
        ))}
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  const renderTab = () => {
    switch (tab) {
      case 'categories':
        return renderCategories();
      case 'metadata':
        return renderMetadata();
      case 'versioning':
        return renderVersioning();
      case 'health':
        return renderHealth();
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
      <StudioOsBrandTagline systemId="asset-registry" className="mb-2" />
      <div className="flex flex-wrap gap-1 mb-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className="px-2 py-1 text-[6px] font-futura uppercase border"
            style={{
              borderColor: tab === t.id ? ASSET_REGISTRY_ACCENT : ADMIN_STUDIO_THEME.panelBorder,
              color: tab === t.id ? ASSET_REGISTRY_ACCENT : ADMIN_STUDIO_THEME.textSecondary,
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
