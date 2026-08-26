import {
  EXTERNAL_REPO_OWNED_PROJECT_IDS,
  FSBW_OWNED_PROJECT_IDS,
} from '../constants';
import type { MissingPageCandidateRecord, StudioWorldDesignRouteManifest } from '../types';

export const FSBW_REPO_NAME = 'yoteenz/fsbw';

export function isExternalRepoOwnedProject(projectId: string): boolean {
  return (EXTERNAL_REPO_OWNED_PROJECT_IDS as readonly string[]).includes(projectId);
}

export function isFsbwOwnedProject(projectId: string, sourceRepo?: string): boolean {
  if (isExternalRepoOwnedProject(projectId)) return false;
  if ((FSBW_OWNED_PROJECT_IDS as readonly string[]).includes(projectId)) return true;
  const repo = (sourceRepo ?? '').toLowerCase();
  return repo.includes('fsbw') || repo === 'fsbw';
}

export function resolveProjectOwnership(
  projectId: string,
  sourceRepo?: string,
): MissingPageCandidateRecord['ownership'] {
  if (isExternalRepoOwnedProject(projectId)) return 'EXTERNAL_REPO_OWNED';
  if (isFsbwOwnedProject(projectId, sourceRepo)) return 'FSBW';
  return 'EXTERNAL_REPO_OWNED';
}

export function collectMissingPageCandidates(
  manifest: StudioWorldDesignRouteManifest,
): MissingPageCandidateRecord[] {
  const candidates: MissingPageCandidateRecord[] = [];
  const sourceRepo = manifest.sourceRepo;

  for (const pageSet of manifest.projectPageSets ?? []) {
    const { projectId } = pageSet;
    const ownership = resolveProjectOwnership(projectId, sourceRepo);

    for (const ep of pageSet.experiencePages ?? []) {
      if (ep.implementationStatus !== 'IMPLEMENTATION_MISSING') continue;
      candidates.push({
        candidateId: `${projectId}:missing:${ep.experiencePageId}`,
        projectId,
        experiencePageId: ep.experiencePageId,
        displayName: ep.displayName,
        representativeRoute: ep.representativeRoute,
        sectionId: ep.sectionId,
        designFamilyIds: ep.designFamilyIds ?? [],
        sourceKind: 'EXPERIENCE_PAGE',
        ownership,
        implementationStatus: 'IMPLEMENTATION_MISSING',
      });
    }

    for (const mp of pageSet.missingPages ?? []) {
      if (mp.implementationStatus !== 'IMPLEMENTATION_MISSING') continue;
      const dup = candidates.some(
        (c) => c.projectId === projectId && c.representativeRoute === mp.suggestedRoute,
      );
      if (dup) continue;
      candidates.push({
        candidateId: `${projectId}:missing:${mp.pageId}`,
        projectId,
        experiencePageId: mp.pageId,
        displayName: mp.displayName,
        representativeRoute: mp.suggestedRoute,
        designFamilyIds: [],
        sourceKind: 'MISSING_PAGE_RECORD',
        ownership,
        implementationStatus: 'IMPLEMENTATION_MISSING',
      });
    }
  }

  return candidates;
}

export function filterFsbwBuildCandidates(
  candidates: MissingPageCandidateRecord[],
): MissingPageCandidateRecord[] {
  return candidates.filter((c) => c.ownership === 'FSBW');
}

export function groupExternalRepoOwned(
  candidates: MissingPageCandidateRecord[],
): Array<{ projectId: string; count: number; pageIds: string[] }> {
  const groups = new Map<string, string[]>();
  for (const c of candidates.filter((x) => x.ownership === 'EXTERNAL_REPO_OWNED')) {
    const list = groups.get(c.projectId) ?? [];
    list.push(c.experiencePageId ?? c.candidateId);
    groups.set(c.projectId, list);
  }
  return [...groups.entries()].map(([projectId, pageIds]) => ({
    projectId,
    count: pageIds.length,
    pageIds,
  }));
}
