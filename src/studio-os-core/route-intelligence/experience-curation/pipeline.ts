import type {
  CurationReviewQueueItem,
  ExperienceCurationStore,
  ExperiencePageOverrideRecordV2,
  ExperiencePageRecord,
  ExperienceSectionRecord,
  ExperiencePageInstanceRecord,
  ProjectExperienceCurationBundle,
  ProjectWebsitePageSet,
  StudioWorldDesignRouteManifest,
} from '../types';
import { FS_INTERNAL_WORKSPACE_SECTION } from './constants';
import {
  auditFrontalSlayerPrimaryExperience,
  buildCompiledByScreen,
  demotePageToInternalWorkspace,
  isHardProtectedCustomerPage,
} from './fs-internal-audit';
import {
  auditAioServiceConsolidation,
  consolidateAioServicePages,
  demoteAioOfficePages,
} from './aio-service-consolidation';
import { applyExperiencePageOverrides } from './override-applier';
import {
  activeOverridesForProject,
  getProjectCurationState,
  upsertOverride,
} from './override-store';
import {
  buildDesignReferenceGenerationPlan,
  buildImplementationSnapshotCapturePlan,
} from './curation-plans';

function ensureInternalSection(sections: ExperienceSectionRecord[], projectId: string): ExperienceSectionRecord[] {
  const sectionId =
    projectId === 'frontal-slayer'
      ? FS_INTERNAL_WORKSPACE_SECTION
      : `${projectId}:section:internal-workspace`;
  if (sections.some((s) => s.sectionId === sectionId)) return sections;
  return [
    ...sections,
    {
      sectionId,
      projectId,
      displayName: 'INTERNAL / WORKSPACE',
      order: 99,
      experiencePageIds: [],
    },
  ];
}

function rebuildSections(
  sections: ExperienceSectionRecord[],
  pages: ExperiencePageRecord[],
): ExperienceSectionRecord[] {
  const byId = new Map(sections.map((s) => [s.sectionId, { ...s, experiencePageIds: [] as string[] }]));
  for (const page of pages) {
    const sec = byId.get(page.sectionId);
    if (sec) sec.experiencePageIds.push(page.experiencePageId);
    else {
      byId.set(page.sectionId, {
        sectionId: page.sectionId,
        projectId: page.projectId,
        displayName: page.sectionId.split(':').pop()?.toUpperCase() ?? 'OTHER',
        order: byId.size,
        experiencePageIds: [page.experiencePageId],
      });
    }
  }
  return [...byId.values()];
}

export function applyAutoCuration(
  projectId: string,
  compilerPages: ExperiencePageRecord[],
  pageSet: ProjectWebsitePageSet,
  manifest: StudioWorldDesignRouteManifest,
  _store: ExperienceCurationStore,
): { pages: ExperiencePageRecord[]; instances: ExperiencePageInstanceRecord[]; autoOverrides: ExperiencePageOverrideRecordV2[]; changes: ProjectExperienceCurationBundle['changes'] } {
  let pages = compilerPages.map((p) => ({ ...p }));
  let instances = [...(pageSet.pageInstances ?? [])];
  const changes: ProjectExperienceCurationBundle['changes'] = {
    demoted: [],
    promoted: [],
    merged: [],
    split: [],
    instanceConversions: [],
    sectionChanges: [],
  };
  const autoOverrides: ExperiencePageOverrideRecordV2[] = [];

  if (projectId === 'frontal-slayer') {
    const compiledByScreen = buildCompiledByScreen(pageSet.compiledPages, manifest.designScreens.filter((s) => s.projectId === projectId));
    const audit = auditFrontalSlayerPrimaryExperience(pages.filter((p) => p.founderPrimary), compiledByScreen);

    for (const entry of audit) {
      if (entry.classification !== 'INTERNAL_WORKSPACE' || entry.confidence !== 'HIGH') continue;
      const idx = pages.findIndex((p) => p.experiencePageId === entry.experiencePageId);
      if (idx < 0) continue;
      const page = pages[idx]!;
      if (isHardProtectedCustomerPage(page)) continue;
      if (!page.founderPrimary) continue;

      pages[idx] = demotePageToInternalWorkspace(page);
      changes.demoted.push(page.displayName);
      autoOverrides.push({
        overrideId: `${projectId}:auto:${entry.experiencePageId}:internal`,
        projectId,
        targetType: 'EXPERIENCE_PAGE',
        targetId: entry.experiencePageId,
        overrideType: 'FORCE_INTERNAL',
        value: FS_INTERNAL_WORKSPACE_SECTION,
        reason: `SYSTEM_PROPOSED_AUTO_APPLIED: ${entry.signals.join(', ')}`,
        createdBy: 'SYSTEM',
        createdAt: new Date().toISOString(),
        active: true,
        systemProposed: true,
      });
    }
  }

  if (projectId === 'all-in-one-enterprise') {
    pages = demoteAioOfficePages(pages);
    for (const p of pages) {
      if (!p.founderPrimary && p.experienceType === 'WORKSPACE_PAGE' && p.displayName.includes('Office')) {
        changes.demoted.push(p.displayName);
      }
    }

    const families = manifest.designFamilies.filter((f) => f.projectId === projectId);
    const consolidated = consolidateAioServicePages(pages, instances, families);
    pages = consolidated.pages;
    instances = consolidated.instances;
    if (consolidated.mergedPageIds.length) {
      changes.merged.push('Service Detail');
      changes.instanceConversions.push(...consolidated.mergedPageIds);
    }
  }

  if (projectId === 'site00' || projectId === 'ndxbook') {
    // Preserve P0.VR.3G curation — no auto demotion/merge
  }

  return { pages, instances, autoOverrides, changes };
}

export function applyExperienceCurationToPageSet(
  manifest: StudioWorldDesignRouteManifest,
  pageSet: ProjectWebsitePageSet,
  store: ExperienceCurationStore,
): { pageSet: ProjectWebsitePageSet; store: ExperienceCurationStore; bundle: ProjectExperienceCurationBundle } {
  const projectId = pageSet.projectId;
  const compilerPages = [...(pageSet.experiencePages ?? [])];
  const compilerProposed = compilerPages.filter((p) => p.founderPrimary);

  let storeNext = store;
  const { pages: autoCurated, instances, autoOverrides, changes } = applyAutoCuration(
    projectId,
    compilerPages,
    pageSet,
    manifest,
    store,
  );

  for (const ov of autoOverrides) {
    storeNext = upsertOverride(storeNext, ov);
  }

  const founderOverrides = activeOverridesForProject(storeNext, projectId);
  const overrideResult = applyExperiencePageOverrides(
    autoCurated,
    pageSet.experienceSections ?? [],
    pageSet.materialScreens ?? [],
    instances,
    founderOverrides,
  );

  let activePages = overrideResult.pages;
  let activeSections = ensureInternalSection(rebuildSections(pageSet.experienceSections ?? [], activePages), projectId);

  const curationState = getProjectCurationState(storeNext, projectId);
  const primaryCount = activePages.filter((p) => p.founderPrimary).length;
  const internalCount = activePages.filter((p) => !p.founderPrimary && p.experienceType === 'WORKSPACE_PAGE').length;

  const internalLeakAudit =
    projectId === 'frontal-slayer'
      ? auditFrontalSlayerPrimaryExperience(
          activePages.filter((p) => p.founderPrimary),
          buildCompiledByScreen(pageSet.compiledPages, manifest.designScreens.filter((s) => s.projectId === projectId)),
        )
          .filter((e) => e.classification === 'INTERNAL_WORKSPACE')
          .map((e) => ({
            projectId,
            experiencePageId: e.experiencePageId,
            displayName: e.displayName,
            route: e.route,
            signals: e.signals,
            recommendedAction: 'DEMOTE_TO_INTERNAL' as const,
            confidence: e.confidence,
          }))
      : [];

  const reviewQueue: CurationReviewQueueItem[] = [];
  for (const p of activePages.filter((p) => p.abstractionConfidence === 'LOW' || p.abstractionConfidence === 'MEDIUM')) {
    reviewQueue.push({
      category: 'LOW_CONFIDENCE',
      experiencePageId: p.experiencePageId,
      displayName: p.displayName,
      detail: `Abstraction confidence ${p.abstractionConfidence}`,
      severity: p.abstractionConfidence === 'LOW' ? 'WARNING' : 'INFO',
    });
  }
  for (const leak of internalLeakAudit) {
    reviewQueue.push({
      category: 'POSSIBLE_INTERNAL_LEAK',
      experiencePageId: leak.experiencePageId,
      displayName: leak.displayName,
      detail: leak.signals.join(', '),
      severity: leak.confidence === 'HIGH' ? 'CRITICAL' : 'WARNING',
    });
  }
  for (const conflict of overrideResult.conflicts) {
    reviewQueue.push({
      category: 'OVERRIDE_CONFLICT',
      experiencePageId: conflict.targetId,
      displayName: conflict.targetId,
      detail: `Override ${conflict.overrideType} could not apply`,
      severity: 'CRITICAL',
    });
  }

  const aioServiceConsolidation =
    projectId === 'all-in-one-enterprise'
      ? auditAioServiceConsolidation(activePages, manifest.designFamilies.filter((f) => f.projectId === projectId))
      : undefined;

  const capturePlan = buildImplementationSnapshotCapturePlan(projectId, curationState, activePages, pageSet.materialScreens ?? []);
  const referencePlan = buildDesignReferenceGenerationPlan(projectId, curationState, activePages, pageSet.materialScreens ?? []);

  const bundle: ProjectExperienceCurationBundle = {
    projectId,
    curationVersion: curationState.curationVersion,
    universeStatus:
      curationState.lockedForCapture ? 'LOCKED_FOR_CAPTURE' : reviewQueue.length ? 'REVIEWING' : 'CURATED',
    compilerProposedPrimaryCount: compilerProposed.length,
    activePrimaryCount: primaryCount,
    internalWorkspaceCount: internalCount,
    supportingCount: activePages.filter((p) => !p.founderPrimary && p.experienceType !== 'WORKSPACE_PAGE').length,
    reviewQueue,
    internalLeakAudit,
    duplicateAudit: [],
    aioServiceConsolidation,
    capturePlan,
    referencePlan,
    overrideConflicts: overrideResult.conflicts,
    changes,
  };

  const updatedPageSet: ProjectWebsitePageSet = {
    ...pageSet,
    experiencePages: activePages,
    experienceSections: activeSections,
    pageInstances: instances,
    compilerProposedPages: compilerPages,
    founderCuratedPages: autoCurated,
    activeExperiencePages: activePages.filter((p) => p.founderPrimary),
    experienceCuration: bundle,
    experienceMetrics: pageSet.experienceMetrics
      ? {
          ...pageSet.experienceMetrics,
          afterExperiencePages: primaryCount,
          workspacePages: internalCount,
        }
      : pageSet.experienceMetrics,
    summary: {
      ...pageSet.summary,
      experiencePages: primaryCount,
      workspacePages: internalCount,
    },
  };

  storeNext = {
    ...storeNext,
    projectCuration: {
      ...storeNext.projectCuration,
      [projectId]: {
        ...curationState,
        universeStatus: bundle.universeStatus,
        lastCompiledAt: new Date().toISOString(),
      },
    },
  };

  return { pageSet: updatedPageSet, store: storeNext, bundle };
}

export function attachExperienceCurationToManifest(
  manifest: StudioWorldDesignRouteManifest,
  store: ExperienceCurationStore,
): { manifest: StudioWorldDesignRouteManifest; store: ExperienceCurationStore } {
  let storeNext = { ...store, sourceCommit: manifest.sourceCommit };
  const projectPageSets = manifest.projectPageSets.map((ps) => {
    const { pageSet, store: s } = applyExperienceCurationToPageSet(manifest, ps, storeNext);
    storeNext = s;
    return pageSet;
  });

  return {
    manifest: {
      ...manifest,
      manifestVersion: '3.3.0',
      schemaVersion: 'studio-world-design-route-manifest@3.3',
      projectPageSets,
      experienceCurationCompilation: {
        curationSchemaVersion: 'studio-world-experience-curation@1',
        generatedAt: new Date().toISOString(),
        sourceManifestVersion: '3.3.0',
        sourceCommit: manifest.sourceCommit,
      },
    },
    store: storeNext,
  };
}
