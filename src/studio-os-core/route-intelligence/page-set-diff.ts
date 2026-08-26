import type {
  ProjectWebsitePageSet,
  ProjectWebsitePageSetDiff,
  ProjectWebsitePageSetDiffEntry,
} from './types';
import { PROJECT_PAGE_SET_SCHEMA_VERSION } from './constants';

export function diffProjectWebsitePageSets(
  previous: ProjectWebsitePageSet[] | undefined,
  current: ProjectWebsitePageSet[],
  meta: { previousGeneratedAt: string; currentGeneratedAt: string; sourceManifestVersion: string },
): ProjectWebsitePageSetDiff {
  const entries: ProjectWebsitePageSetDiffEntry[] = [];
  const prevByProject = new Map((previous ?? []).map((p) => [p.projectId, p]));

  for (const curr of current) {
    const prev = prevByProject.get(curr.projectId);
    if (!prev) {
      entries.push({
        type: 'PAGE_ADDED',
        projectId: curr.projectId,
        detail: `Project page set compiled: ${curr.primaryPageIds.length} primary pages`,
      });
      continue;
    }

    const prevPrimary = new Set(prev.primaryPageIds);
    const currPrimary = new Set(curr.primaryPageIds);
    for (const id of curr.primaryPageIds) {
      if (!prevPrimary.has(id)) {
        entries.push({ type: 'PAGE_ADDED', projectId: curr.projectId, pageId: id, detail: `Primary page added: ${id}` });
      }
    }
    for (const id of prev.primaryPageIds) {
      if (!currPrimary.has(id)) {
        entries.push({ type: 'PAGE_REMOVED', projectId: curr.projectId, pageId: id, detail: `Primary page removed: ${id}` });
      }
    }

    const prevMissing = new Set(prev.missingRequiredPageIds);
    for (const id of curr.missingRequiredPageIds) {
      if (!prevMissing.has(id)) {
        entries.push({ type: 'MISSING_PAGE_ADDED', projectId: curr.projectId, pageId: id, detail: `Missing page flagged: ${id}` });
      }
    }
    for (const id of prev.missingRequiredPageIds) {
      if (!curr.missingRequiredPageIds.includes(id)) {
        entries.push({ type: 'MISSING_PAGE_RESOLVED', projectId: curr.projectId, pageId: id, detail: `Missing page resolved: ${id}` });
      }
    }

    for (const page of curr.compiledPages) {
      const prevPage = prev.compiledPages.find((p) => p.pageId === page.pageId);
      if (prevPage && prevPage.experienceClassification !== page.experienceClassification) {
        entries.push({
          type: 'PAGE_RECLASSIFIED',
          projectId: curr.projectId,
          pageId: page.pageId,
          previous: prevPage.experienceClassification,
          current: page.experienceClassification,
          detail: `Reclassified ${page.displayName}`,
        });
      }
      if (prevPage && prevPage.designFamilyId !== page.designFamilyId) {
        entries.push({
          type: 'FAMILY_CHANGED',
          projectId: curr.projectId,
          pageId: page.pageId,
          previous: prevPage.designFamilyId,
          current: page.designFamilyId,
          detail: `Family changed for ${page.displayName}`,
        });
      }
    }
  }

  return {
    pageSetSchemaVersion: PROJECT_PAGE_SET_SCHEMA_VERSION,
    previousGeneratedAt: meta.previousGeneratedAt,
    currentGeneratedAt: meta.currentGeneratedAt,
    sourceManifestVersion: meta.sourceManifestVersion,
    entries,
  };
}
