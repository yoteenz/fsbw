import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useKnowledgeRegistryState } from '../../../../hooks/useKnowledgeRegistryState';
import {
  KNOWLEDGE_REGISTRY_ACCENT,
  KNOWLEDGE_REGISTRY_PHILOSOPHY,
  queryKnowledgeRegistry,
} from '../../../../studio-os-core/knowledge-registry';
import {
  getReconciliationMatches,
  reconcileMasterSpecWithLive,
  summarizeManifestAuthoring,
  summarizeManifestReconciliation,
  validateMasterSpecManifest,
} from '../../../../studio-os-core/manifest-reconciliation';
import {
  adminStudioKnowledgeHubPath,
  adminStudioMissionControlPath,
  adminStudioSystemRegistryPath,
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

type RegistryTab =
  | 'overview'
  | 'volumes'
  | 'roadmap'
  | 'registry'
  | 'manifest'
  | 'health'
  | 'sync'
  | 'search';

const TABS: { id: RegistryTab; label: string }[] = [
  { id: 'overview', label: 'REGISTRY OVERVIEW' },
  { id: 'volumes', label: 'VOLUMES' },
  { id: 'roadmap', label: 'ROADMAP' },
  { id: 'registry', label: 'KNOWLEDGE INDEX' },
  { id: 'manifest', label: 'MANIFEST' },
  { id: 'health', label: 'KNOWLEDGE HEALTH' },
  { id: 'sync', label: 'AUTO-SYNC' },
  { id: 'search', label: 'UNIFIED SEARCH' },
];

function formatMilestoneLine(entry: {
  canonicalMilestone?: string;
  shippedMilestone?: string | null;
  milestone?: string;
}): string {
  const parts: string[] = [];
  if (entry.canonicalMilestone) parts.push(`Canonical ${entry.canonicalMilestone}`);
  if (entry.shippedMilestone) parts.push(`Shipped ${entry.shippedMilestone}`);
  else if (entry.milestone) parts.push(`Shipped ${entry.milestone}`);
  return parts.join(' · ');
}

export function KnowledgeRegistryWorkspace() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<RegistryTab>('overview');
  const [searchQuery, setSearchQuery] = useState('memory');
  const [roadmapFilter, setRoadmapFilter] = useState<'all' | 'planned' | 'in-progress' | 'complete'>('all');
  const { profile, refresh } = useKnowledgeRegistryState();

  const manifestReport = useMemo(() => reconcileMasterSpecWithLive(), []);
  const manifestIssues = useMemo(() => validateMasterSpecManifest(), []);
  const reconciliationMatches = useMemo(() => getReconciliationMatches(), []);

  if (!profile) {
    return (
      <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
        STUDIO OS KNOWLEDGE REGISTRY™ LOADING — MASTER SPEC · SINGLE SOURCE OF TRUTH
      </p>
    );
  }

  const searchHits = queryKnowledgeRegistry(searchQuery, 12);
  const roadmapEntries = profile.registryEntries
    .filter((e) => e.registryKind === 'milestone' || e.registryKind === 'design-revision')
    .filter((e) => roadmapFilter === 'all' || e.implementationStatus === roadmapFilter)
    .slice(0, 24);

  const renderOverview = () => (
    <ExecutivePageShell>
      <ExecutiveHeroCard
        eyebrow="MILESTONE M126 · STUDIO OS KNOWLEDGE REGISTRY™ V2.0"
        title={profile.companyName.toUpperCase()}
        subtitle="Architectural brain of Studio OS — Constitution, Volumes, milestones, systems, and implementation status from one Master Specification."
        progressPct={profile.registryScore}
        stats={[
          { label: 'REGISTRY', value: `${profile.registryScore}%` },
          { label: 'ENTRIES', value: `${profile.totalEntries}` },
          { label: 'VOLUMES', value: `${profile.volumeSummaries.length}` },
          { label: 'MASTER SPEC', value: `${profile.masterSpecCoveragePct}%` },
        ]}
      />
      <div className="flex items-center gap-3 mb-2">
        <ExecutiveHealthRing value={profile.registryScore} size={56} label="KR" accent={KNOWLEDGE_REGISTRY_ACCENT} />
        <div>
          {KNOWLEDGE_REGISTRY_PHILOSOPHY.slice(0, 2).map((line) => (
            <p key={line} className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
              {line}
            </p>
          ))}
        </div>
      </div>
      <ExecutiveSecondaryCard title="MASTER SPECIFICATION · COMPILED MANIFEST">
        <p className="text-[6px] font-futura mb-1" style={{ color: KNOWLEDGE_REGISTRY_ACCENT, fontWeight: 515 }}>
          Source: docs/studio-os/master-spec/ · Compiled {new Date(profile.manifestCompiledAt).toLocaleString()}
        </p>
        <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.5 }}>
          {summarizeManifestReconciliation()}
        </p>
      </ExecutiveSecondaryCard>
      <ExecutiveSecondaryCard title="COMMAND DOCK · KNOWLEDGE STATUS">
        <p className="text-[6px] font-futura" style={{ color: KNOWLEDGE_REGISTRY_ACCENT, fontWeight: 515, lineHeight: 1.5 }}>
          {profile.dockRegistryLine}
        </p>
      </ExecutiveSecondaryCard>
      <button
        type="button"
        onClick={() => navigate(adminStudioSystemRegistryPath())}
        className="mt-2 mr-2 px-2 py-1 text-[6px] font-futura uppercase border"
        style={{ borderColor: KNOWLEDGE_REGISTRY_ACCENT, color: KNOWLEDGE_REGISTRY_ACCENT }}
      >
        SYSTEM REGISTRY™ →
      </button>
      <button
        type="button"
        onClick={() => navigate(adminStudioKnowledgeHubPath())}
        className="mt-2 mr-2 px-2 py-1 text-[6px] font-futura uppercase border"
        style={{ borderColor: KNOWLEDGE_REGISTRY_ACCENT, color: KNOWLEDGE_REGISTRY_ACCENT }}
      >
        KNOWLEDGE HUB →
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

  const renderVolumes = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="VOLUMES — REGISTERED FROM MASTER SPECIFICATION">
        {profile.volumeSummaries.map((vol) => (
          <ExecutiveSecondaryCard key={vol.volumeId} title={`${vol.title.toUpperCase()} · ${vol.completionPct}%`}>
            <p className="text-[6px] font-futura mb-1" style={{ color: KNOWLEDGE_REGISTRY_ACCENT, fontWeight: 515 }}>
              {vol.volumeId.toUpperCase()} · {vol.status.toUpperCase().replace(/-/g, ' ')} · {vol.completeCount}/{vol.milestoneCount} milestones
            </p>
            <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
              Dependencies: {vol.dependsOn.length ? vol.dependsOn.join(', ') : 'none'}
            </p>
          </ExecutiveSecondaryCard>
        ))}
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  const renderRoadmap = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="ROADMAP™ — IMPLEMENTED AND PLANNED (ENGINEERING VIEW)">
        <div className="flex flex-wrap gap-1 mb-2">
          {(['all', 'planned', 'in-progress', 'complete'] as const).map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setRoadmapFilter(filter)}
              className="px-2 py-1 text-[6px] font-futura uppercase border"
              style={{
                borderColor: roadmapFilter === filter ? KNOWLEDGE_REGISTRY_ACCENT : ADMIN_STUDIO_THEME.panelBorder,
                color: roadmapFilter === filter ? KNOWLEDGE_REGISTRY_ACCENT : ADMIN_STUDIO_THEME.textSecondary,
              }}
            >
              {filter === 'all' ? 'ALL' : filter.replace(/-/g, ' ').toUpperCase()}
            </button>
          ))}
        </div>
        {roadmapEntries.map((entry) => (
          <ExecutiveSecondaryCard key={entry.internalId} title={`${entry.officialName.toUpperCase()} · ${entry.implementationStatusLabel}`}>
            <p className="text-[6px] font-futura mb-1" style={{ color: KNOWLEDGE_REGISTRY_ACCENT, fontWeight: 515 }}>
              {formatMilestoneLine(entry)}
            </p>
            <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
              {entry.purpose}
            </p>
          </ExecutiveSecondaryCard>
        ))}
        <p className="text-[6px] font-futura mt-2" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
          Canonical milestone IDs shown in engineering surfaces only — user experience uses shipped badges.
        </p>
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  const renderRegistry = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="KNOWLEDGE INDEX — EVERY ENTITY REGISTERED ONCE">
        {profile.registryEntries.slice(0, 14).map((entry) => (
          <ExecutiveSecondaryCard key={entry.internalId} title={`${entry.officialName.toUpperCase()} · ${entry.implementationStatusLabel}`}>
            <p className="text-[6px] font-futura mb-1" style={{ color: KNOWLEDGE_REGISTRY_ACCENT, fontWeight: 515 }}>
              {entry.category.toUpperCase()} · {entry.registryKind.toUpperCase()}
              {entry.canonicalMilestone ? ` · ${formatMilestoneLine(entry)}` : ''}
            </p>
            <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>
              {entry.purpose}
            </p>
          </ExecutiveSecondaryCard>
        ))}
        <p className="text-[6px] font-futura mt-2" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
          Showing 14 of {profile.totalEntries} knowledge entries from Master Specification
        </p>
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  const renderManifest = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="MANIFEST AUTHORING™ · MANIFEST RECONCILIATION™">
        <ExecutiveSecondaryCard title="MANIFEST AUTHORING™">
          <p className="text-[6px] font-futura mb-2" style={{ color: KNOWLEDGE_REGISTRY_ACCENT, fontWeight: 515 }}>
            {summarizeManifestAuthoring()}
          </p>
          {manifestIssues.slice(0, 8).map((issue) => (
            <p key={`${issue.code}-${issue.entityId ?? ''}`} className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
              [{issue.severity.toUpperCase()}] {issue.code}: {issue.message}
            </p>
          ))}
        </ExecutiveSecondaryCard>
        <ExecutiveSecondaryCard title="MANIFEST RECONCILIATION™">
          <p className="text-[6px] font-futura mb-2" style={{ color: KNOWLEDGE_REGISTRY_ACCENT, fontWeight: 515 }}>
            {summarizeManifestReconciliation()}
          </p>
          <p className="text-[6px] font-futura mb-2" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
            Matched live: {manifestReport.matchedLive} · Planned only: {manifestReport.plannedOnly} · Orphaned live: {manifestReport.orphanedLiveModules.length}
          </p>
          {manifestReport.idConflicts.slice(0, 6).map((c) => (
            <p key={`${c.canonicalId}-${c.shippedId}`} className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
              ID conflict: {c.canonicalId} ↔ {c.shippedId} ({c.moduleId || 'unmapped'})
            </p>
          ))}
        </ExecutiveSecondaryCard>
        <ExecutiveSecondaryCard title="RECONCILIATION SAMPLE">
          {reconciliationMatches.slice(0, 10).map((match) => (
            <p key={match.internalId} className="text-[6px] font-futura mb-1" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
              {match.canonicalId} · {match.implementationStatus} · {match.matchedLive ? 'LIVE' : 'PLANNED'}
              {match.liveRoute ? ` · ${match.liveRoute}` : ''}
            </p>
          ))}
        </ExecutiveSecondaryCard>
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  const renderHealth = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="KNOWLEDGE HEALTH DASHBOARD">
        {profile.healthMetrics.map((m) => (
          <ExecutiveSecondaryCard key={m.id} title={`${m.label.toUpperCase()} · ${m.scorePct}%`}>
            <p className="text-[6px] font-futura mb-1" style={{ color: m.status === 'healthy' ? KNOWLEDGE_REGISTRY_ACCENT : ADMIN_STUDIO_THEME.textSecondary, fontWeight: 515 }}>
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
      <ExecutiveFocusPanel title="AUTOMATIC SYNCHRONIZATION — NO DUPLICATE DEFINITIONS">
        {profile.autoSyncSurfaces.map((s) => (
          <ExecutiveSecondaryCard key={s.surface} title={s.label.toUpperCase()}>
            <p className="text-[6px] font-futura" style={{ color: KNOWLEDGE_REGISTRY_ACCENT, fontWeight: 515 }}>
              {s.synced ? 'SYNCED' : 'PENDING'} · {s.entryCount} entries
            </p>
          </ExecutiveSecondaryCard>
        ))}
        <p className="text-[6px] font-futura mt-2" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
          Synced sources: {profile.syncedSources.join(' · ')}
        </p>
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  const renderSearch = () => (
    <ExecutivePageShell>
      <ExecutiveFocusPanel title="UNIFIED SEARCH — LIVE AND PLANNED SYSTEMS">
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Try memory, profession brain, volume I, planned…"
          className="w-full mb-2 px-2 py-1 text-[7px] font-futura border"
          style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder }}
        />
        {searchHits.map((hit) => (
          <ExecutiveSecondaryCard key={hit.entry.internalId} title={`${hit.entry.officialName.toUpperCase()} · ${hit.statusLabel}`}>
            <p className="text-[6px] font-futura mb-1" style={{ color: KNOWLEDGE_REGISTRY_ACCENT, fontWeight: 515 }}>
              {hit.matchReason} · score {hit.score}
              {hit.entry.canonicalMilestone ? ` · ${hit.entry.canonicalMilestone}` : ''}
            </p>
            <p className="text-[6px] font-futura" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
              {hit.entry.purpose}
            </p>
          </ExecutiveSecondaryCard>
        ))}
        <p className="text-[6px] font-futura mt-2" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
          Status labels: Planned · In Progress · Complete · Deprecated — one search for implemented and planned systems.
        </p>
      </ExecutiveFocusPanel>
    </ExecutivePageShell>
  );

  const renderTab = () => {
    switch (tab) {
      case 'volumes':
        return renderVolumes();
      case 'roadmap':
        return renderRoadmap();
      case 'registry':
        return renderRegistry();
      case 'manifest':
        return renderManifest();
      case 'health':
        return renderHealth();
      case 'sync':
        return renderSync();
      case 'search':
        return renderSearch();
      default:
        return renderOverview();
    }
  };

  return (
    <div>
      <StudioOsBrandTagline systemId="knowledge-registry" className="mb-2" />
      <div className="flex flex-wrap gap-1 mb-3">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className="px-2 py-1 text-[6px] font-futura uppercase border"
            style={{
              borderColor: tab === t.id ? KNOWLEDGE_REGISTRY_ACCENT : ADMIN_STUDIO_THEME.panelBorder,
              color: tab === t.id ? KNOWLEDGE_REGISTRY_ACCENT : ADMIN_STUDIO_THEME.textSecondary,
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

/** @deprecated Use KnowledgeRegistryWorkspace */
export const DocumentationRegistryWorkspace = KnowledgeRegistryWorkspace;
