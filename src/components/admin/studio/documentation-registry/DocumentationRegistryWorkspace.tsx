import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDocumentationRegistryState } from '../../../../hooks/useDocumentationRegistryState';
import {
  DOCUMENTATION_REGISTRY_ACCENT,
  DOCUMENTATION_REGISTRY_PHILOSOPHY,
  queryDocumentationRegistry,
} from '../../../../studio-os-core/documentation-registry';
import { adminStudioKnowledgeHubPath, adminStudioMissionControlPath } from '../../../../utils/adminStudioRoutes';
import { ADMIN_STUDIO_THEME } from '../../../../utils/adminStudioTheme';
import {
  ExecutiveFocusPanel,
  ExecutiveHealthRing,
  ExecutiveHeroCard,
  ExecutivePageShell,
  ExecutiveSecondaryCard,
} from '../executive-ia';
import { StudioOsBrandTagline } from '../brand/StudioOsBrandTagline';

type RegistryTab = 'overview' | 'registry' | 'health' | 'sync' | 'search';

const TABS: { id: RegistryTab; label: string }[] = [
  { id: 'overview', label: 'REGISTRY OVERVIEW' },
  { id: 'registry', label: 'FEATURE REGISTRY' },
  { id: 'health', label: 'DOCUMENTATION HEALTH' },
  { id: 'sync', label: 'AUTO-SYNC' },
  { id: 'search', label: 'SMART SEARCH' },
];

export function DocumentationRegistryWorkspace() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<RegistryTab>('overview');
  const [searchQuery, setSearchQuery] = useState('memory');
  const { profile, refresh } = useDocumentationRegistryState();

  if (!profile) {
    return (
      <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
        DOCUMENTATION REGISTRY™ LOADING — ONE SOURCE · MANY CONSUMERS
      </p>
    );
  }

  const searchHits = queryDocumentationRegistry(searchQuery, 8);

  const renderOverview = () => (
    <ExecutivePageShell>
      <ExecutiveHeroCard
        eyebrow="MILESTONE 126 · DOCUMENTATION REGISTRY™ V1.0"
        title={profile.companyName.toUpperCase()}
        subtitle="Single source of truth — every feature registers once; every documentation system consumes automatically."
        progressPct={profile.registryScore}
        stats={[
          { label: 'REGISTRY', value: `${profile.registryScore}%` },
          { label: 'FEATURES', value: `${profile.totalEntries}` },
          { label: 'SYNC', value: `${profile.autoSyncSurfaces.filter((s) => s.synced).length}` },
          { label: 'ACADEMY', value: `${profile.academyLessonsGenerated}` },
        ]}
      />
      <div className="flex items-center gap-3 mb-2">
        <ExecutiveHealthRing value={profile.registryScore} size={56} label="DR" accent={DOCUMENTATION_REGISTRY_ACCENT} />
        <div>
          {DOCUMENTATION_REGISTRY_PHILOSOPHY.slice(0, 2).map((line) => (
            <p key={line} className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
              {line}
            </p>
          ))}
        </div>
      </div>
      <ExecutiveSecondaryCard title="COMMAND DOCK · REGISTRY STATUS">
        <p className="text-[6px] font-futura" style={{ color: DOCUMENTATION_REGISTRY_ACCENT, fontWeight: 515, lineHeight: 1.5 }}>
          {profile.dockRegistryLine}
        </p>
      </ExecutiveSecondaryCard>
      <button
        type="button"
        onClick={() => navigate(adminStudioKnowledgeHubPath())}
        className="mt-2 mr-2 px-2 py-1 text-[6px] font-futura uppercase border"
        style={{ borderColor: DOCUMENTATION_REGISTRY_ACCENT, color: DOCUMENTATION_REGISTRY_ACCENT }}
      >
        OPEN KNOWLEDGE HUB →
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
        REFRESH REGISTRY
      </button>
    </ExecutivePageShell>
  );

  const renderRegistry = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="DOCUMENTATION REGISTRY™ — EVERY FEATURE REGISTERED ONCE">
        {profile.registryEntries.slice(0, 12).map((entry) => (
          <ExecutiveSecondaryCard key={entry.internalId} title={`${entry.officialName.toUpperCase()} · ${entry.version}`}>
            <p className="text-[6px] font-futura mb-1" style={{ color: DOCUMENTATION_REGISTRY_ACCENT, fontWeight: 515 }}>
              {entry.category.toUpperCase()} · {entry.status.toUpperCase()}
            </p>
            <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
              {entry.purpose}
            </p>
          </ExecutiveSecondaryCard>
        ))}
        <p className="text-[6px] font-futura mt-2" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
          Showing 12 of {profile.totalEntries} registered features
        </p>
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  const renderHealth = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="DOCUMENTATION HEALTH DASHBOARD">
        {profile.healthMetrics.map((m) => (
          <ExecutiveSecondaryCard key={m.id} title={`${m.label.toUpperCase()} · ${m.scorePct}%`}>
            <p className="text-[6px] font-futura mb-1" style={{ color: m.status === 'healthy' ? DOCUMENTATION_REGISTRY_ACCENT : ADMIN_STUDIO_THEME.textSecondary, fontWeight: 515 }}>
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

  const renderSync = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="AUTOMATIC SYNCHRONIZATION — NO MANUAL COPYING">
        {profile.autoSyncSurfaces.map((s) => (
          <ExecutiveSecondaryCard key={s.surface} title={s.label.toUpperCase()}>
            <p className="text-[6px] font-futura" style={{ color: DOCUMENTATION_REGISTRY_ACCENT, fontWeight: 515 }}>
              {s.synced ? 'SYNCED' : 'PENDING'} · {s.entryCount} entries
            </p>
          </ExecutiveSecondaryCard>
        ))}
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  const renderSearch = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="SMART SEARCH — QUERY REGISTRY FIRST">
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Try memory, AI, profession brain..."
          className="w-full mb-2 px-2 py-1 text-[7px] font-futura border"
          style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder }}
        />
        {searchHits.map((hit) => (
          <ExecutiveSecondaryCard key={hit.entry.internalId} title={hit.entry.officialName.toUpperCase()}>
            <p className="text-[6px] font-futura mb-1" style={{ color: DOCUMENTATION_REGISTRY_ACCENT, fontWeight: 515 }}>
              {hit.matchReason} · score {hit.score}
            </p>
            <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
              {hit.entry.purpose}
            </p>
          </ExecutiveSecondaryCard>
        ))}
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  return (
    <div>
      <StudioOsBrandTagline systemId="documentation-registry" className="mb-2" />
      <div className="flex flex-wrap gap-1 mb-3">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className="px-2 py-1 text-[6px] font-futura uppercase border"
            style={{
              borderColor: tab === t.id ? DOCUMENTATION_REGISTRY_ACCENT : ADMIN_STUDIO_THEME.panelBorder,
              color: tab === t.id ? DOCUMENTATION_REGISTRY_ACCENT : ADMIN_STUDIO_THEME.textSecondary,
              fontWeight: tab === t.id ? 515 : 400,
            }}
          >
            {t.label}
          </button>
        ))}
      </div>
      {tab === 'overview' && renderOverview()}
      {tab === 'registry' && renderRegistry()}
      {tab === 'health' && renderHealth()}
      {tab === 'sync' && renderSync()}
      {tab === 'search' && renderSearch()}
    </div>
  );
}
