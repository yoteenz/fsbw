import { getMasterSpecBundleSync } from '../manifest-reconciliation';
import { getOrganizationProfessionBrainProfile } from '../profession-brain/store';
import {
  buildAutoSyncSurfaceStatuses,
  computeDocumentationHealthMetrics,
  computeRegistryHealthScore,
} from './health-dashboard';
import { getMasterSpecCoveragePct, getVolumeSummaries, getChapterSummaries } from './registry-builder';
import { getAllRegistryEntries } from './registration';
import { buildAcademyLessonsFromRegistry } from './academy-sync';
import { buildWalkthroughStopsFromRegistry } from './walkthrough-sync';
import type { OrganizationKnowledgeRegistryProfile } from './types';

export function buildDockRegistryLine(profile: OrganizationKnowledgeRegistryProfile): string {
  return `Knowledge Registry™ ${profile.registryScore}% — ${profile.totalEntries} registered · ${profile.masterSpecCoveragePct}% Master Spec coverage · ${profile.volumeSummaries.length} volumes. Single source of truth.`;
}

export function buildOrganizationKnowledgeRegistryProfile(
  organizationId: string
): OrganizationKnowledgeRegistryProfile {
  const brain = getOrganizationProfessionBrainProfile(organizationId);
  const bundle = getMasterSpecBundleSync();
  const companyName = brain?.companyName ?? organizationId.replace(/-/g, ' ').toUpperCase();
  const now = new Date().toISOString();
  const entries = getAllRegistryEntries();
  const healthMetrics = computeDocumentationHealthMetrics();
  const autoSyncSurfaces = buildAutoSyncSurfaceStatuses(now);

  const profile: OrganizationKnowledgeRegistryProfile = {
    organizationId,
    companyName,
    updatedAt: now,
    registryScore: 0,
    totalEntries: entries.length,
    masterSpecCoveragePct: getMasterSpecCoveragePct(),
    volumeSummaries: getVolumeSummaries(bundle),
    chapterSummaries: getChapterSummaries(bundle),
    healthMetrics,
    autoSyncSurfaces,
    registryEntries: entries,
    walkthroughSteps: buildWalkthroughStopsFromRegistry().length,
    academyLessonsGenerated: buildAcademyLessonsFromRegistry().length,
    dockRegistryLine: '',
    singleSourceOfTruth: true,
    syncedSources: [
      'master-spec-manifest',
      'documentation-sync',
      'manifest-reconciliation',
      'knowledge-hub',
      'interactive-manual',
      'studio-institute',
      'command-dock',
      'system-registry',
    ],
    manifestCompiledAt: bundle.compiledAt,
  };

  profile.registryScore = computeRegistryHealthScore(healthMetrics);
  profile.dockRegistryLine = buildDockRegistryLine(profile);
  return profile;
}

/** @deprecated */
export const buildOrganizationDocumentationRegistryProfile = buildOrganizationKnowledgeRegistryProfile;

export function summarizeKnowledgeRegistry(profile: OrganizationKnowledgeRegistryProfile): string {
  return [
    profile.dockRegistryLine,
    `${profile.totalEntries} entries from Master Specification — register once, reference everywhere.`,
    `${profile.volumeSummaries.length} volumes · ${profile.registryEntries.filter((e) => e.implementationStatus === 'planned').length} planned milestones searchable.`,
    `${profile.walkthroughSteps} walkthrough steps · ${profile.academyLessonsGenerated} academy lessons.`,
    'Studio OS Knowledge Registry™ — the architectural brain of Studio OS.',
  ].join(' ');
}

/** @deprecated */
export const summarizeDocumentationRegistry = summarizeKnowledgeRegistry;
