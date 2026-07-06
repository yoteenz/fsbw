import { resolveIndustryForWorkspace } from '../industry-architecture/industries';
import { getOrganizationMemoryProfile } from '../memory-engine/store';
import { getOrganizationProfessionBrainProfile } from '../profession-brain/store';
import { buildSearchableTags } from './wisdom-detector';
import { computeLearningImpacts, computeWisdomDepthScore, defaultSyncedTargets } from './learning-sync';
import type { OrganizationWisdomProfile, WisdomEntry } from './types';

function seedWisdomFromSources(organizationId: string, companyName: string): WisdomEntry[] {
  const seeds: WisdomEntry[] = [];
  const brain = getOrganizationProfessionBrainProfile(organizationId);
  const memory = getOrganizationMemoryProfile(organizationId);
  const now = new Date().toISOString();

  if (brain?.legacyNote) {
    seeds.push({
      id: `wisdom-seed-legacy-${organizationId}`,
      wisdom: brain.legacyNote.slice(0, 200),
      whyItMatters: 'Founder legacy note — wisdom that must survive every transition.',
      category: 'leadership',
      capturedAt: now,
      capturedBy: 'system',
      sourceText: brain.legacyNote,
      triggerPattern: 'system-seed',
      searchableTags: buildSearchableTags(brain.legacyNote, 'leadership'),
      syncedTo: defaultSyncedTargets('leadership'),
    });
  }

  for (const lesson of memory?.records.filter((r) => r.type === 'lesson').slice(0, 3) ?? []) {
    seeds.push({
      id: `wisdom-seed-mem-${lesson.id}`,
      wisdom: lesson.summary.slice(0, 200),
      whyItMatters: 'Imported from Memory Engine — processes prove what happened; wisdom explains why.',
      category: 'lessons-learned',
      capturedAt: lesson.occurredAt,
      capturedBy: 'system',
      sourceText: lesson.summary,
      triggerPattern: 'memory-import',
      searchableTags: buildSearchableTags(lesson.summary, 'lessons-learned'),
      syncedTo: defaultSyncedTargets('lessons-learned'),
    });
  }

  if (seeds.length === 0) {
    seeds.push({
      id: `wisdom-seed-welcome-${organizationId}`,
      wisdom: `${companyName} will compound wisdom every day — small lessons preserved before they fade.`,
      whyItMatters: 'Wisdom Capture begins with the habit of preserving insights before they disappear.',
      category: 'lessons-learned',
      capturedAt: now,
      capturedBy: 'system',
      sourceText: 'Studio OS Wisdom Capture initialization',
      triggerPattern: 'system-seed',
      searchableTags: ['welcome', 'lessons-learned', 'wisdom-capture'],
      syncedTo: defaultSyncedTargets('lessons-learned'),
    });
  }

  return seeds;
}

export function buildOrganizationWisdomProfile(
  organizationId: string,
  existingLibrary: WisdomEntry[] = [],
  existingPending: OrganizationWisdomProfile['pendingDetections'] = []
): OrganizationWisdomProfile {
  const brain = getOrganizationProfessionBrainProfile(organizationId);
  const companyName = brain?.companyName ?? organizationId.replace(/-/g, ' ').toUpperCase();
  const library =
    existingLibrary.length > 0 ? existingLibrary : seedWisdomFromSources(organizationId, companyName);

  return {
    organizationId,
    companyName,
    industryId: brain?.industryId ?? resolveIndustryForWorkspace(organizationId),
    updatedAt: new Date().toISOString(),
    totalWisdomCaptured: library.length,
    wisdomDepthScore: computeWisdomDepthScore(library.length, existingPending.filter((p) => p.status === 'pending').length),
    pendingDetections: existingPending,
    wisdomLibrary: library,
    learningImpacts: computeLearningImpacts(library),
    syncedSources: [
      'profession-brain',
      'memory-engine',
      'organization-genome',
      'executive-council',
      'studio-institute',
      'organization-pulse',
    ],
  };
}
