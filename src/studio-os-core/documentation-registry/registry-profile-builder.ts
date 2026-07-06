import { getOrganizationProfessionBrainProfile } from '../profession-brain/store';
import {
  buildAutoSyncSurfaceStatuses,
  computeDocumentationHealthMetrics,
  computeRegistryHealthScore,
} from './health-dashboard';
import { getAllRegistryEntries } from './registration';
import { buildAcademyLessonsFromRegistry } from './academy-sync';
import { buildWalkthroughStopsFromRegistry } from './walkthrough-sync';
import type { OrganizationDocumentationRegistryProfile } from './types';

export function buildDockRegistryLine(profile: OrganizationDocumentationRegistryProfile): string {
  return `Documentation Registry™ ${profile.registryScore}% — ${profile.totalEntries} features registered · ${profile.autoSyncSurfaces.filter((s) => s.synced).length} surfaces auto-synced. One source. Infinite knowledge.`;
}

export function buildOrganizationDocumentationRegistryProfile(
  organizationId: string
): OrganizationDocumentationRegistryProfile {
  const brain = getOrganizationProfessionBrainProfile(organizationId);
  const companyName = brain?.companyName ?? organizationId.replace(/-/g, ' ').toUpperCase();
  const now = new Date().toISOString();
  const entries = getAllRegistryEntries();
  const healthMetrics = computeDocumentationHealthMetrics();
  const autoSyncSurfaces = buildAutoSyncSurfaceStatuses(now);

  const profile: OrganizationDocumentationRegistryProfile = {
    organizationId,
    companyName,
    updatedAt: now,
    registryScore: 0,
    totalEntries: entries.length,
    healthMetrics,
    autoSyncSurfaces,
    registryEntries: entries,
    walkthroughSteps: buildWalkthroughStopsFromRegistry().length,
    academyLessonsGenerated: buildAcademyLessonsFromRegistry().length,
    dockRegistryLine: '',
    oneSourceManyConsumers: true,
    syncedSources: [
      'documentation-sync',
      'knowledge-hub',
      'interactive-manual',
      'studio-institute',
      'command-dock',
      'organization-inauguration',
    ],
  };

  profile.registryScore = computeRegistryHealthScore(healthMetrics);
  profile.dockRegistryLine = buildDockRegistryLine(profile);

  return profile;
}

export function summarizeDocumentationRegistry(profile: OrganizationDocumentationRegistryProfile): string {
  return [
    profile.dockRegistryLine,
    `${profile.totalEntries} features in Documentation Registry™ — register once, sync everywhere.`,
    `${profile.walkthroughSteps} walkthrough steps · ${profile.academyLessonsGenerated} academy lessons from registry.`,
    `${profile.autoSyncSurfaces.length} auto-sync surfaces · health score ${profile.registryScore}%.`,
    'Never conflicting documentation. Never outdated walkthroughs. Never duplicate help articles.',
  ].join(' ');
}
