import { getOrganizationProfessionBrainProfile } from '../profession-brain/store';
import { DOCUMENTATION_SYNC_SYSTEM_COUNT } from './constants';
import { getFaqCount } from './faq-registry';
import { computeGettingStartedProgress } from './getting-started-progression';
import { getSemanticClusterCount } from './semantic-search';
import { DOCUMENTATION_SYSTEM_REGISTRY } from './system-registry';
import type { DocumentationSyncSurface, OrganizationDocumentationSyncProfile } from './types';

export function computeDocumentationSyncScore(
  systemsDocumented: number,
  surfacesSynced: number,
  faqEntries: number,
  searchClusters: number
): number {
  return Math.min(
    99,
    Math.round(
      (systemsDocumented / DOCUMENTATION_SYNC_SYSTEM_COUNT) * 40 +
        surfacesSynced * 7 +
        faqEntries * 1.5 +
        searchClusters * 2
    )
  );
}

export function buildDocumentationSyncSurfaces(now: string): DocumentationSyncSurface[] {
  const systemCount = DOCUMENTATION_SYSTEM_REGISTRY.length;
  return [
    { surface: 'manual', synced: true, systemCount, lastSyncedAt: now },
    { surface: 'search', synced: true, systemCount, lastSyncedAt: now },
    { surface: 'walkthrough', synced: true, systemCount, lastSyncedAt: now },
    { surface: 'help-center', synced: true, systemCount, lastSyncedAt: now },
    { surface: 'faq', synced: true, systemCount, lastSyncedAt: now },
    { surface: 'graph', synced: true, systemCount, lastSyncedAt: now },
    { surface: 'contextual-help', synced: true, systemCount, lastSyncedAt: now },
  ];
}

export function buildDockDocumentationLine(profile: OrganizationDocumentationSyncProfile): string {
  return `Documentation Synchronization™ ${profile.syncScore}% — ${profile.systemsDocumented} systems · ${profile.searchClusters} semantic clusters · ${profile.faqEntries} FAQs. Studio OS teaches the current version of itself.`;
}

export function buildOrganizationDocumentationSyncProfile(
  organizationId: string
): OrganizationDocumentationSyncProfile {
  const brain = getOrganizationProfessionBrainProfile(organizationId);
  const companyName = brain?.companyName ?? organizationId.replace(/-/g, ' ').toUpperCase();
  const now = new Date().toISOString();
  const systemsDocumented = DOCUMENTATION_SYSTEM_REGISTRY.length;
  const faqEntries = getFaqCount();
  const searchClusters = getSemanticClusterCount();
  const surfaces = buildDocumentationSyncSurfaces(now);
  const gettingStartedProgressPct = computeGettingStartedProgress(['organization', 'blueprint', 'headquarters']);

  const profile: OrganizationDocumentationSyncProfile = {
    organizationId,
    companyName,
    updatedAt: now,
    syncScore: 0,
    systemsDocumented,
    surfaces,
    gettingStartedProgressPct,
    searchClusters,
    faqEntries,
    dockDocumentationLine: '',
    selfUpdatingReady: true,
    syncedSources: [
      'studio-foundation-models',
      'model-orchestrator',
      'studio-intelligence-architecture',
      'organization-operating-manual',
      'legacy-network',
      'knowledge-hub',
      'interactive-manual',
      'command-dock',
    ],
  };

  profile.syncScore = computeDocumentationSyncScore(
    systemsDocumented,
    surfaces.filter((s) => s.synced).length,
    faqEntries,
    searchClusters
  );
  profile.dockDocumentationLine = buildDockDocumentationLine(profile);

  return profile;
}

export function summarizeDocumentationSync(profile: OrganizationDocumentationSyncProfile): string {
  return [
    profile.dockDocumentationLine,
    `${profile.systemsDocumented} systems documented across ${profile.surfaces.length} help surfaces.`,
    `${profile.searchClusters} semantic search clusters — "memory" surfaces Memory Engine, Legacy Vault, Knowledge Fabric, and more.`,
    `${profile.faqEntries} FAQ entries synchronized. Getting Started ${profile.gettingStartedProgressPct}% complete.`,
    'Documentation evolves alongside the platform automatically.',
  ].join(' ');
}

export function invalidateDocumentationCaches(): void {
  void import('../../studio-interactive-manual/knowledge-graph/buildGraph').then((m) => {
    m.invalidateKnowledgeGraphCache();
  });
}
