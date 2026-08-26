import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import {
  FSBW_COMPOSER_PAGE_REGISTRY_RELATIVE_PATH,
  FSBW_MISSING_ROUTE_COMPLETION_SPRINT,
  FSBW_OWNED_PROJECT_IDS,
} from '../constants';
import type {
  FsbwComposerPageRegistry,
  FsbwMissingRouteCompletionProjectSummary,
  FsbwMissingRouteCompletionReport,
  StudioWorldDesignRouteManifest,
} from '../types';
import { FSBW_REPO_NAME } from './ownership';
import {
  collectMissingPageCandidates,
  filterFsbwBuildCandidates,
  groupExternalRepoOwned,
} from './ownership';
import {
  buildMissingPageRequirementsBrief,
  classifyMissingPageCompletionMode,
  isComplexCompletionMode,
  isSimpleCompletionMode,
} from './classifier';
import { buildMissingPageImplementation } from './page-builder';
import { buildPageReviewSets } from './review-sets';
import { planComposerDraftSnapshots } from './screenshot-capture';

export type RunFsbwMissingRouteCompletionOptions = {
  repoRoot: string;
  manifest: StudioWorldDesignRouteManifest;
  executeBuild?: boolean;
  registryPath?: string;
};

function emptyRegistry(sourceCommit: string): FsbwComposerPageRegistry {
  return {
    schemaVersion: 'fsbw-composer-page-registry@2',
    generatedAt: new Date().toISOString(),
    sourceCommit,
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
  };
}

export function loadComposerPageRegistry(registryPath: string): FsbwComposerPageRegistry | undefined {
  if (!existsSync(registryPath)) return undefined;
  try {
    return JSON.parse(readFileSync(registryPath, 'utf8')) as FsbwComposerPageRegistry;
  } catch {
    return undefined;
  }
}

export function saveComposerPageRegistry(registryPath: string, registry: FsbwComposerPageRegistry): void {
  mkdirSync(dirname(registryPath), { recursive: true });
  writeFileSync(registryPath, JSON.stringify(registry, null, 2), 'utf8');
}

function summarizeProject(
  projectId: string,
  briefs: ReturnType<typeof buildMissingPageRequirementsBrief>[],
  buildResults: ReturnType<typeof buildMissingPageImplementation>[],
): FsbwMissingRouteCompletionProjectSummary {
  const projectBriefs = briefs.filter((b) => b.projectId === projectId);
  const projectBuilds = buildResults.filter((r) => r.receipt.projectId === projectId);
  return {
    projectId,
    missing: projectBriefs.length,
    simple: projectBriefs.filter((b) => isSimpleCompletionMode(b.completionMode)).length,
    complex: projectBriefs.filter((b) => isComplexCompletionMode(b.completionMode)).length,
    built: projectBuilds.filter((r) => r.receipt.filesCreated.length > 0).length,
    shellOnly: projectBuilds.filter(
      (r) => isComplexCompletionMode(r.receipt.completionMode) && r.receipt.filesCreated.length > 0,
    ).length,
    blocked: projectBuilds.filter((r) => r.skippedReason === 'EXISTING_PAGE_UNTOUCHED').length,
    externalSkipped: 0,
  };
}

export function runFsbwMissingRouteCompletion(
  options: RunFsbwMissingRouteCompletionOptions,
): FsbwMissingRouteCompletionReport {
  const { manifest, repoRoot } = options;
  const executeBuild = options.executeBuild ?? false;
  const registryPath = options.registryPath ?? join(repoRoot, FSBW_COMPOSER_PAGE_REGISTRY_RELATIVE_PATH);
  const existingRegistry = loadComposerPageRegistry(registryPath) ?? emptyRegistry(manifest.sourceCommit);

  const allCandidates = collectMissingPageCandidates(manifest);
  const fsbwCandidates = filterFsbwBuildCandidates(allCandidates);
  const externalRepoOwned = groupExternalRepoOwned(allCandidates);

  const briefs = fsbwCandidates.map((c) => {
    const mode = classifyMissingPageCompletionMode(c, manifest);
    return buildMissingPageRequirementsBrief(c, mode, manifest);
  });

  const buildResults = briefs.map((brief) =>
    buildMissingPageImplementation(brief, manifest, {
      repoRoot,
      sourceCommit: manifest.sourceCommit,
      executeBuild,
    }),
  );

  const newAuthorship = buildResults.map((r) => r.authorship);
  const newReceipts = buildResults.map((r) => r.receipt);
  const newSnapshots = newAuthorship.flatMap((a) => planComposerDraftSnapshots(a));

  const mergedAuthorship = [
    ...existingRegistry.authorship.filter(
      (a) => !newAuthorship.some((n) => n.authorshipId === a.authorshipId),
    ),
    ...newAuthorship,
  ];
  const mergedReceipts = [
    ...existingRegistry.receipts.filter((r) => !newReceipts.some((n) => n.receiptId.startsWith(r.experiencePageId))),
    ...newReceipts,
  ];
  const mergedSnapshots = [
    ...existingRegistry.snapshots.filter((s) => !newSnapshots.some((n) => n.snapshotId === s.snapshotId)),
    ...newSnapshots,
  ];

  const reviewSets = buildPageReviewSets(
    mergedAuthorship,
    mergedReceipts.map((r) => ({
      authorshipId: `${r.projectId}:auth:${r.experiencePageId}`,
      familyUsed: r.familyUsed,
      completionMode: r.completionMode,
      projectId: r.projectId,
    })),
  );

  const registry: FsbwComposerPageRegistry = {
    schemaVersion: 'fsbw-composer-page-registry@2',
    generatedAt: new Date().toISOString(),
    sourceCommit: manifest.sourceCommit,
    authorship: mergedAuthorship,
    receipts: mergedReceipts,
    snapshots: mergedSnapshots,
    reviewSets,
  };

  saveComposerPageRegistry(registryPath, registry);

  const projectSummaries = (FSBW_OWNED_PROJECT_IDS as readonly string[]).map((projectId) =>
    summarizeProject(projectId, briefs, buildResults),
  );

  for (const ext of externalRepoOwned) {
    const summary = projectSummaries.find((s) => s.projectId === ext.projectId);
    if (summary) summary.externalSkipped = ext.count;
  }

  return {
    sprintId: FSBW_MISSING_ROUTE_COMPLETION_SPRINT,
    generatedAt: new Date().toISOString(),
    sourceCommit: manifest.sourceCommit,
    sourceManifestVersion: manifest.manifestVersion,
    repo: FSBW_REPO_NAME,
    ownedProjects: [...FSBW_OWNED_PROJECT_IDS],
    projectSummaries,
    externalRepoOwned,
    candidates: allCandidates,
    briefs,
    registry,
    executeBuild,
  };
}

export function attachFsbwMissingRouteCompletionToManifest(
  manifest: StudioWorldDesignRouteManifest,
  report: FsbwMissingRouteCompletionReport,
): StudioWorldDesignRouteManifest {
  return {
    ...manifest,
    fsbwMissingRouteCompletion: report,
  };
}
