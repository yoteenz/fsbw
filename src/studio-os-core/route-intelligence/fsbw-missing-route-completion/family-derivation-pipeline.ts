import { join } from 'node:path';
import { FSBW_COMPOSER_PAGE_REGISTRY_RELATIVE_PATH, FSBW_FAMILY_DERIVATION_SPRINT, FSBW_OWNED_PROJECT_IDS } from '../constants';
import type {
  FamilyDerivedMissingTargetRecord,
  FamilyDerivedMissingTargetReport,
  FamilySiblingCandidate,
  StudioWorldDesignRouteManifest,
} from '../types';
import { filterFsbwBuildCandidates, collectMissingPageCandidates } from './ownership';
import { loadComposerPageRegistry, saveComposerPageRegistry } from './pipeline';
import {
  buildMissingTargetQueue,
  deriveMissingTargetFromFamily,
  characterLabVoiceLabFixture,
} from './family-derivation';
import { buildSharedShellDependencyGraph } from './shell-graph';
import { classifyMissingDesignTarget } from './target-classifier';

export type RunFamilyDerivationOptions = {
  repoRoot: string;
  manifest: StudioWorldDesignRouteManifest;
  executeBuild?: boolean;
  /** Include synthetic Character Lab Voice Lab fixture when no missing targets */
  includeFixtures?: boolean;
};

function migrateRegistrySchema(
  registry: NonNullable<ReturnType<typeof loadComposerPageRegistry>>,
): NonNullable<ReturnType<typeof loadComposerPageRegistry>> {
  if (registry.schemaVersion === 'fsbw-composer-page-registry@2') return registry;
  return {
    ...registry,
    schemaVersion: 'fsbw-composer-page-registry@2',
    familyDerivedTargets: registry.familyDerivedTargets ?? [],
    sharedShells: registry.sharedShells ?? [],
    shellChanges: registry.shellChanges ?? [],
    shellPropagations: registry.shellPropagations ?? [],
    derivationReceipts: registry.derivationReceipts ?? [],
    recapturePlans: registry.recapturePlans ?? [],
  };
}

export function runFamilyDerivedMissingTargetPipeline(
  options: RunFamilyDerivationOptions,
): FamilyDerivedMissingTargetReport {
  const { manifest, repoRoot } = options;
  const executeBuild = options.executeBuild ?? false;
  const registryPath = join(repoRoot, FSBW_COMPOSER_PAGE_REGISTRY_RELATIVE_PATH);
  const existing = migrateRegistrySchema(
    loadComposerPageRegistry(registryPath) ?? {
      schemaVersion: 'fsbw-composer-page-registry@2',
      generatedAt: new Date().toISOString(),
      sourceCommit: manifest.sourceCommit,
      authorship: [],
      receipts: [],
      snapshots: [],
      reviewSets: [],
      familyDerivedTargets: [],
      sharedShells: [],
      shellChanges: [],
      shellPropagations: [],
      derivationReceipts: [],
      recapturePlans: [],
    },
  );

  let candidates = filterFsbwBuildCandidates(collectMissingPageCandidates(manifest));

  if (!candidates.length && options.includeFixtures !== false) {
    candidates = [characterLabVoiceLabFixture()];
  }

  const targets: FamilyDerivedMissingTargetRecord[] = [];
  const siblingMap = new Map<string, FamilySiblingCandidate>();
  const candidatesMap = new Map<string, FamilySiblingCandidate[]>();
  const newAuthorship = [...existing.authorship];
  const newSnapshots = [...existing.snapshots];
  const derivationReceipts = [...(existing.derivationReceipts ?? [])];

  for (const candidate of candidates) {
    const targetType = classifyMissingDesignTarget({ candidate, manifest });
    if (targetType === 'CONTENT_INSTANCE' || targetType === 'DATA_INSTANCE') {
      const record: FamilyDerivedMissingTargetRecord = {
        targetId: candidate.candidateId,
        projectId: candidate.projectId,
        targetType,
        displayName: candidate.displayName,
        representativeRoute: candidate.representativeRoute,
        sourceComponentIds: [],
        sharedComponentIds: [],
        preservedProperties: [],
        allowedDifferences: ['CONTENT', 'DATA'],
        derivationConfidence: 'HIGH',
        createdBy: FSBW_FAMILY_DERIVATION_SPRINT,
        reviewStatus: 'READY_FOR_DERIVATION',
        lineage: { derivedFromComponents: [] },
      };
      targets.push(record);
      continue;
    }

    const result = deriveMissingTargetFromFamily(candidate, manifest, {
      repoRoot,
      sourceCommit: manifest.sourceCommit,
      executeBuild,
      existingSnapshots: existing.snapshots,
    });

    targets.push(result.target);
    if (result.sibling) siblingMap.set(result.target.targetId, result.sibling);
    if (result.siblingCandidates.length) candidatesMap.set(result.target.targetId, result.siblingCandidates);
    if (result.authorship) {
      newAuthorship.push(result.authorship);
    }
    newSnapshots.push(...result.sourceSnapshots, ...result.draftSnapshots);
    if (result.derivationReceipt) derivationReceipts.push(result.derivationReceipt);
  }

  const shellGraph = (FSBW_OWNED_PROJECT_IDS as readonly string[]).map((projectId) =>
    buildSharedShellDependencyGraph(projectId, manifest),
  );

  const sharedShells = shellGraph.flatMap((g) => g.shells);

  const queue = buildMissingTargetQueue(targets, siblingMap, candidatesMap);

  const projectSummaries = (FSBW_OWNED_PROJECT_IDS as readonly string[]).map((projectId) => {
    const projectTargets = targets.filter((t) => t.projectId === projectId);
    const byType: FamilyDerivedMissingTargetReport['projectSummaries'][0]['byType'] = {};
    for (const t of projectTargets) {
      byType[t.targetType] = (byType[t.targetType] ?? 0) + 1;
    }
    return {
      projectId,
      total: projectTargets.length,
      byType,
      readyForDerivation: queue.filter((q) => q.target.projectId === projectId && q.group === 'READY_FOR_FAMILY_DERIVATION').length,
      sourceCaptureRequired: projectTargets.filter((t) => t.reviewStatus === 'SOURCE_CAPTURE_REQUIRED').length,
      derived: projectTargets.filter((t) => t.reviewStatus === 'COMPOSER_DRAFT' || t.reviewStatus === 'READY_FOR_REVIEW').length,
      trueMissingRoutes: projectTargets.filter((t) => t.trueMissingRoute).length,
    };
  });

  const registry = {
    ...existing,
    schemaVersion: 'fsbw-composer-page-registry@2' as const,
    generatedAt: new Date().toISOString(),
    sourceCommit: manifest.sourceCommit,
    authorship: newAuthorship,
    snapshots: newSnapshots,
    familyDerivedTargets: targets,
    sharedShells,
    derivationReceipts,
  };

  saveComposerPageRegistry(registryPath, registry);

  return {
    sprintId: FSBW_FAMILY_DERIVATION_SPRINT,
    generatedAt: new Date().toISOString(),
    sourceCommit: manifest.sourceCommit,
    projectSummaries,
    targets,
    queue,
    shellGraph,
    registry,
    executeBuild,
  };
}

export function attachFamilyDerivedMissingTargetsToManifest(
  manifest: StudioWorldDesignRouteManifest,
  report: FamilyDerivedMissingTargetReport,
): StudioWorldDesignRouteManifest {
  return { ...manifest, fsbwFamilyDerivedMissingTargets: report };
}
