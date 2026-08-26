import { join } from 'node:path';
import {
  DEFAULT_SHELL_PROPAGATION_SCOPE,
  FSBW_COMPOSER_PAGE_REGISTRY_RELATIVE_PATH,
  FSBW_VOICE_LAB_EXECUTION_SPRINT,
  VOICE_LAB_TARGET_ID,
} from '../constants';
import type {
  ComposerDraftSnapshotRecord,
  FamilyDerivationReceipt,
  VoiceLabExecutionResult,
} from '../types';
import {
  markImplementationSnapshotCaptured,
  planImplementationSnapshot,
} from '../implementation-snapshots/storage';
import { createPageAuthorshipRecord } from './authorship';
import {
  resolveCharacterLabParent,
  selectCharacterLabSourceSibling,
  voiceLabMissingTargetCandidate,
} from './character-lab-registry';
import {
  runFamilyDerivedTargetVisualQa,
  snapshotsReadyForReview,
} from './family-derived-visual-qa';
import {
  defaultAllowedDifferences,
  defaultPreservedProperties,
} from './family-fidelity-qa';
import { loadComposerPageRegistry, saveComposerPageRegistry } from './pipeline';
import { classifyMissingDesignTarget, targetTypePromotesToPage } from './target-classifier';

export type ExecuteVoiceLabDerivationOptions = {
  repoRoot: string;
  sourceCommit: string;
  manifest: import('../types').StudioWorldDesignRouteManifest;
  founderOverrideSiblingId?: string;
  /** Mark snapshots captured (e.g. after browser capture script). */
  markSnapshotsCaptured?: boolean;
  existingSnapshots?: ComposerDraftSnapshotRecord[];
};

function planSourceSnapshots(
  authorshipId: string,
  sourceCommit: string,
  sibling: import('../types').FamilySiblingCandidate,
): ComposerDraftSnapshotRecord[] {
  return (['MOBILE', 'TABLET', 'DESKTOP'] as const).map((viewport) =>
    planImplementationSnapshot({
      snapshotId: `${authorshipId}:source:${sibling.siblingId}:${viewport.toLowerCase()}`,
      authorshipId,
      projectId: 'studio-world',
      route: sibling.route,
      viewport,
      kind: 'SOURCE_SIBLING',
      sourceCommit,
      isSourceSibling: true,
      sourceSiblingId: sibling.siblingId,
    }),
  );
}

function planTargetSnapshots(
  authorshipId: string,
  sourceCommit: string,
  route: string,
): ComposerDraftSnapshotRecord[] {
  return (['MOBILE', 'TABLET', 'DESKTOP'] as const).map((viewport) =>
    planImplementationSnapshot({
      snapshotId: `${authorshipId}:derived:${viewport.toLowerCase()}`,
      authorshipId,
      projectId: 'studio-world',
      route,
      viewport,
      kind: 'DERIVED_DRAFT',
      sourceCommit,
      targetId: VOICE_LAB_TARGET_ID,
    }),
  );
}

export function executeVoiceLabDerivation(
  options: ExecuteVoiceLabDerivationOptions,
): VoiceLabExecutionResult {
  const parent = resolveCharacterLabParent();
  const candidate = voiceLabMissingTargetCandidate();
  const targetType = classifyMissingDesignTarget({ candidate, manifest: options.manifest });

  if (targetTypePromotesToPage(targetType)) {
    throw new Error('FAIL_TAB_TARGET_PROMOTED_TO_PAGE');
  }

  const { sibling, candidates } = selectCharacterLabSourceSibling(options.founderOverrideSiblingId);

  if (sibling.confidence === 'LOW' && !options.founderOverrideSiblingId) {
    throw new Error('FOUNDER_SELECTION_REQUIRED — source sibling confidence LOW');
  }

  const authorship = createPageAuthorshipRecord({
    projectId: 'studio-world',
    experiencePageId: parent.experiencePageId,
    route: candidate.representativeRoute,
    displayName: candidate.displayName,
    completionMode: 'FAMILY_DERIVED_SIMPLE',
    sourceCommit: options.sourceCommit,
    creativeDirectionRequired: false,
    functionalReviewRequired: false,
  });
  authorship.createdBySprint = FSBW_VOICE_LAB_EXECUTION_SPRINT;
  authorship.authorType = 'COMPOSER';
  authorship.reviewStatus = 'UNREVIEWED';
  authorship.publishStatus = 'PREVIEW_ONLY';

  const existing = options.existingSnapshots ?? [];
  let sourceSnapshots = planSourceSnapshots(authorship.authorshipId, options.sourceCommit, sibling);
  const existingSource = existing.filter(
    (s) => s.isSourceSibling && s.route === sibling.route && s.status === 'CAPTURED',
  );
  if (existingSource.length >= 3) {
    sourceSnapshots = existingSource.slice(0, 3);
  } else if (options.markSnapshotsCaptured) {
    sourceSnapshots = sourceSnapshots.map((s) =>
      markImplementationSnapshotCaptured(s as import('../implementation-snapshots/storage').ImplementationSnapshotRecord),
    );
  }

  let targetSnapshots = planTargetSnapshots(
    authorship.authorshipId,
    options.sourceCommit,
    candidate.representativeRoute,
  );
  const existingTarget = existing.filter(
    (s) => s.route === candidate.representativeRoute && !s.isSourceSibling && s.status === 'CAPTURED',
  );
  if (existingTarget.length >= 3) {
    targetSnapshots = existingTarget.slice(0, 3);
  } else if (options.markSnapshotsCaptured) {
    targetSnapshots = targetSnapshots.map((s) =>
      markImplementationSnapshotCaptured(s as import('../implementation-snapshots/storage').ImplementationSnapshotRecord),
    );
  }

  const target: import('../types').FamilyDerivedMissingTargetRecord = {
    targetId: VOICE_LAB_TARGET_ID,
    projectId: 'studio-world',
    targetType: 'TAB_STATE',
    displayName: 'Voice Lab',
    representativeRoute: candidate.representativeRoute,
    experiencePageId: parent.experiencePageId,
    parentExperiencePageId: parent.sectionId,
    sourceFamilyId: parent.designFamilyId,
    sourceSiblingId: sibling.siblingId,
    sourceRoute: sibling.route,
    sourceSnapshotId: sourceSnapshots[0]?.snapshotId,
    sourceComponentIds: [...parent.sharedComponentPaths],
    shellId: parent.sharedShellId,
    sharedComponentIds: [...parent.sharedComponentPaths],
    preservedProperties: defaultPreservedProperties('TAB_STATE'),
    allowedDifferences: defaultAllowedDifferences('TAB_STATE', 'Voice Lab'),
    derivationConfidence: sibling.confidence,
    createdBy: FSBW_VOICE_LAB_EXECUTION_SPRINT,
    reviewStatus: 'DERIVING',
    lineage: {
      derivedFromFamily: parent.designFamilyId,
      derivedFromSibling: sibling.siblingId,
      derivedFromShell: parent.sharedShellId,
      derivedFromSnapshot: sourceSnapshots[0]?.snapshotId,
      derivedFromComponents: [...parent.sharedComponentPaths],
    },
    trueMissingRoute: false,
  };

  const visualQa = runFamilyDerivedTargetVisualQa(target);
  const snapshotsOk = snapshotsReadyForReview(sourceSnapshots, targetSnapshots);

  const readyForFounderReview =
    visualQa.passed && !visualQa.unexplainedDrift && snapshotsOk && sibling.confidence !== 'LOW';

  target.reviewStatus = readyForFounderReview ? 'READY_FOR_REVIEW' : visualQa.unexplainedDrift ? 'NEEDS_REVISION' : 'COMPOSER_DRAFT';

  const derivationReceipt: FamilyDerivationReceipt = {
    receiptId: `${VOICE_LAB_TARGET_ID}:execution:${Date.now()}`,
    targetId: target.targetId,
    projectId: target.projectId,
    targetType: 'TAB_STATE',
    sourceSiblingId: sibling.siblingId,
    sourceSnapshotId: sourceSnapshots[0]?.snapshotId,
    draftSnapshotIds: targetSnapshots.map((s) => s.snapshotId),
    fidelityIssues: visualQa.blockingIssues,
    unexplainedDrift: visualQa.unexplainedDrift,
    createdAt: new Date().toISOString(),
    createdBy: FSBW_VOICE_LAB_EXECUTION_SPRINT,
  };

  return {
    sprintId: FSBW_VOICE_LAB_EXECUTION_SPRINT,
    target,
    parent,
    sourceSibling: sibling,
    siblingCandidates: candidates,
    sourceSnapshots,
    targetSnapshots,
    visualQa,
    authorship,
    derivationReceipt,
    readyForFounderReview,
    propagationDefaultScope: DEFAULT_SHELL_PROPAGATION_SCOPE,
  };
}

export function persistVoiceLabExecution(
  repoRoot: string,
  result: VoiceLabExecutionResult,
  sourceCommit: string,
): void {
  const registryPath = join(repoRoot, FSBW_COMPOSER_PAGE_REGISTRY_RELATIVE_PATH);
  const existing = loadComposerPageRegistry(registryPath) ?? {
    schemaVersion: 'fsbw-composer-page-registry@2' as const,
    generatedAt: new Date().toISOString(),
    sourceCommit,
    authorship: [],
    receipts: [],
    snapshots: [],
    reviewSets: [],
    familyDerivedTargets: [],
    sharedShells: [],
    derivationReceipts: [],
  };

  const dedupeAuthorship = existing.authorship.filter(
    (a) => a.authorshipId !== result.authorship.authorshipId,
  );
  const dedupeSnapshots = existing.snapshots.filter(
    (s) =>
      !result.sourceSnapshots.some((x) => x.snapshotId === s.snapshotId) &&
      !result.targetSnapshots.some((x) => x.snapshotId === s.snapshotId),
  );
  const dedupeTargets = (existing.familyDerivedTargets ?? []).filter(
    (t) => t.targetId !== result.target.targetId,
  );

  saveComposerPageRegistry(registryPath, {
    ...existing,
    generatedAt: new Date().toISOString(),
    sourceCommit,
    authorship: [...dedupeAuthorship, result.authorship],
    snapshots: [...dedupeSnapshots, ...result.sourceSnapshots, ...result.targetSnapshots],
    familyDerivedTargets: [...dedupeTargets, result.target],
    sharedShells: [
      ...(existing.sharedShells ?? []).filter((s) => s.shellId !== result.parent.sharedShellId),
      {
        shellId: result.parent.sharedShellId,
        projectId: 'studio-world',
        displayName: 'Character Lab Workspace Shell',
        componentPaths: result.parent.sharedComponentPaths,
        consumerPageIds: [result.parent.experiencePageId],
        consumerFamilyIds: [result.parent.designFamilyId],
        responsiveAuthority: 'CharacterLabShell',
        version: 'character-lab-shell@v1',
      },
    ],
    derivationReceipts: [...(existing.derivationReceipts ?? []), result.derivationReceipt],
  });
}
