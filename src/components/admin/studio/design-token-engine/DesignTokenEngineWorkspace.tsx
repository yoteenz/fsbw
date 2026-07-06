import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDesignTokenEngineState } from '../../../../hooks/useDesignTokenEngineState';
import {
  DESIGN_TOKEN_ENGINE_ACCENT,
  DESIGN_TOKEN_ENGINE_PHILOSOPHY,
  queryDesignTokens,
} from '../../../../studio-os-core/design-token-engine';
import { adminStudioComponentRegistryPath, adminStudioMissionControlPath } from '../../../../utils/adminStudioRoutes';
import { ADMIN_STUDIO_THEME } from '../../../../utils/adminStudioTheme';
import {
  ExecutiveFocusPanel,
  ExecutiveHealthRing,
  ExecutiveHeroCard,
  ExecutivePageShell,
  ExecutiveSecondaryCard,
} from '../executive-ia';
import { StudioOsBrandTagline } from '../brand/StudioOsBrandTagline';

type EngineTab = 'overview' | 'tokens' | 'categories' | 'themes' | 'governance' | 'discovery';

const TABS: { id: EngineTab; label: string }[] = [
  { id: 'overview', label: 'ENGINE OVERVIEW' },
  { id: 'tokens', label: 'TOKEN CATALOG' },
  { id: 'categories', label: 'CATEGORIES' },
  { id: 'themes', label: 'THEMES' },
  { id: 'governance', label: 'DESIGN GOVERNANCE' },
  { id: 'discovery', label: 'DISCOVERY' },
];

export function DesignTokenEngineWorkspace() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<EngineTab>('overview');
  const [searchQuery, setSearchQuery] = useState('accent');
  const { profile, refresh } = useDesignTokenEngineState();

  if (!profile) {
    return (
      <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
        DESIGN TOKEN ENGINE™ LOADING — VISUAL SOURCE OF TRUTH
      </p>
    );
  }

  const searchHits = queryDesignTokens(searchQuery, 8);

  const renderOverview = () => (
    <ExecutivePageShell>
      <ExecutiveHeroCard
        eyebrow="MILESTONE 129 · DESIGN TOKEN ENGINE™ V1.0"
        title={profile.companyName.toUpperCase()}
        subtitle="Visual source of truth — spacing, typography, colors, motion, and elevation centralized for every Studio OS surface."
        progressPct={profile.engineScore}
        stats={[
          { label: 'ENGINE', value: `${profile.engineScore}%` },
          { label: 'TOKENS', value: `${profile.totalTokens}` },
          { label: 'INHERIT', value: `${profile.componentCoveragePct}%` },
          { label: 'THEMES', value: `${profile.themes.filter((t) => t.active).length}` },
        ]}
      />
      <div className="flex items-center gap-3 mb-2">
        <ExecutiveHealthRing value={profile.engineScore} size={56} label="DT" accent={DESIGN_TOKEN_ENGINE_ACCENT} />
        <div>
          {DESIGN_TOKEN_ENGINE_PHILOSOPHY.slice(0, 2).map((line) => (
            <p key={line} className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
              {line}
            </p>
          ))}
        </div>
      </div>
      <ExecutiveSecondaryCard title="DESIGN BIBLE · PROTECTED">
        <p className="text-[6px] font-futura" style={{ color: DESIGN_TOKEN_ENGINE_ACCENT, fontWeight: 515, lineHeight: 1.5 }}>
          {profile.dockEngineLine}
        </p>
      </ExecutiveSecondaryCard>
      <button type="button" onClick={() => navigate(adminStudioComponentRegistryPath())} className="mt-2 mr-2 px-2 py-1 text-[6px] font-futura uppercase border" style={{ borderColor: DESIGN_TOKEN_ENGINE_ACCENT, color: DESIGN_TOKEN_ENGINE_ACCENT }}>
        COMPONENT REGISTRY →
      </button>
      <button type="button" onClick={() => navigate(adminStudioMissionControlPath())} className="mt-2 mr-2 px-2 py-1 text-[6px] font-futura uppercase border" style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, color: ADMIN_STUDIO_THEME.textSecondary }}>
        MISSION CONTROL →
      </button>
      <button type="button" onClick={refresh} className="mt-2 px-2 py-1 text-[6px] font-futura uppercase border" style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, color: ADMIN_STUDIO_THEME.textSecondary }}>
        SYNC TOKENS
      </button>
    </ExecutivePageShell>
  );

  const renderTokens = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="TOKEN CATALOG — CENTRALIZED VISUAL LANGUAGE">
        {profile.tokens.slice(0, 14).map((t) => (
          <ExecutiveSecondaryCard key={t.tokenId} title={`${t.name.toUpperCase()} · ${t.category.toUpperCase()}`}>
            <p className="text-[6px] font-futura mb-1" style={{ color: DESIGN_TOKEN_ENGINE_ACCENT, fontWeight: 515 }}>
              {t.value} · {t.tokenId}
            </p>
            <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
              {t.description}
            </p>
          </ExecutiveSecondaryCard>
        ))}
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  const renderCategories = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="TOKEN CATEGORIES">
        {Object.entries(profile.categoryCounts)
          .sort((a, b) => b[1] - a[1])
          .map(([category, count]) => (
            <ExecutiveSecondaryCard key={category} title={category.toUpperCase().replace(/-/g, ' ')}>
              <p className="text-[6px] font-futura" style={{ color: DESIGN_TOKEN_ENGINE_ACCENT, fontWeight: 515 }}>
                {count} TOKENS
              </p>
            </ExecutiveSecondaryCard>
          ))}
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  const renderThemes = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="THEME SETS — LIGHT · DARK · FUTURE">
        {profile.themes.map((theme) => (
          <ExecutiveSecondaryCard key={theme.themeId} title={theme.label.toUpperCase()}>
            <p className="text-[6px] font-futura mb-1" style={{ color: theme.active ? DESIGN_TOKEN_ENGINE_ACCENT : ADMIN_STUDIO_THEME.textSecondary, fontWeight: 515 }}>
              {theme.active ? 'ACTIVE' : 'PLANNED'} · {theme.tokenCount} tokens
            </p>
            <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
              Accent {theme.accentColor} · Glass {theme.backgroundGlass}
            </p>
          </ExecutiveSecondaryCard>
        ))}
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  const renderGovernance = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="DESIGN GOVERNANCE — COMPONENTS INHERIT TOKENS">
        {profile.governanceFindings.slice(0, 10).map((f) => (
          <ExecutiveSecondaryCard key={f.id} title={f.severity.toUpperCase()}>
            <p className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
              {f.message}
            </p>
            <p className="text-[6px] font-futura" style={{ color: DESIGN_TOKEN_ENGINE_ACCENT, fontWeight: 515 }}>
              → {f.recommendation}
            </p>
          </ExecutiveSecondaryCard>
        ))}
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  const renderDiscovery = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="TOKEN DISCOVERY">
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Try accent, spacing, glass, typography…"
          className="w-full mb-2 px-2 py-1 text-[7px] font-futura border"
          style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder }}
        />
        {searchHits.map((hit) => (
          <ExecutiveSecondaryCard key={hit.entry.tokenId} title={hit.entry.name.toUpperCase()}>
            <p className="text-[6px] font-futura mb-1" style={{ color: DESIGN_TOKEN_ENGINE_ACCENT, fontWeight: 515 }}>
              {hit.entry.value} · {hit.matchReason}
            </p>
            <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
              {hit.entry.source}
            </p>
          </ExecutiveSecondaryCard>
        ))}
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  const renderTab = () => {
    switch (tab) {
      case 'tokens':
        return renderTokens();
      case 'categories':
        return renderCategories();
      case 'themes':
        return renderThemes();
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
      <StudioOsBrandTagline systemId="design-token-engine" className="mb-2" />
      <div className="flex flex-wrap gap-1 mb-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className="px-2 py-1 text-[6px] font-futura uppercase border"
            style={{
              borderColor: tab === t.id ? DESIGN_TOKEN_ENGINE_ACCENT : ADMIN_STUDIO_THEME.panelBorder,
              color: tab === t.id ? DESIGN_TOKEN_ENGINE_ACCENT : ADMIN_STUDIO_THEME.textSecondary,
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
