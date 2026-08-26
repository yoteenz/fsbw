import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { registerMissingRoutesAsDesignable, runCrossProjectRouteForensicAudit } from '../forensic-audit';
import { attachPageSetsToManifest } from '../website-page-compiler';
import { attachExperiencePagesToManifest } from '../experience-page-abstraction';
import type {
  CurationActionReceipt,
  CurationActionType,
  CurationReviewSession,
  ExperienceCurationStore,
  PageAbstractionReviewReceiptV2,
  PageAbstractionReviewRecord,
  ProjectCaptureLockReceipt,
  ProjectExperienceCurationBundle,
  StudioWorldDesignRouteManifest,
} from '../types';
import { EXTERNAL_REPO_OWNED_PROJECT_IDS, MANIFEST_ARTIFACT_RELATIVE_PATH } from '../constants';
import { FS_INTERNAL_WORKSPACE_SECTION } from './constants';
import { attachExperienceCurationToManifest } from './pipeline';
import { isHardProtectedCustomerPage } from './fs-internal-audit';
import {
  appendReview,
  getProjectCurationState,
  loadExperienceCurationStore,
  saveExperienceCurationStore,
  upsertOverride,
} from './override-store';
import { bumpCurationVersion, evaluateCurationGates, hasBlockingLockConflict } from './curation-gates';
import { isFsbwCurationProject } from './curation-plans';

export type CurationActionRequest = {
  projectId: string;
  action: CurationActionType;
  targetId?: string;
  targetIds?: string[];
  reviewer: string;
  reason?: string;
  value?: string;
  sessionId?: string;
  notes?: string;
  /** Required for split/merge/instance/material */
  payload?: Record<string, unknown>;
  confirmProtectedDemotion?: boolean;
  /** When false, skips writing store/manifest (tests) */
  persist?: boolean;
  /** In-memory store for tests (skips load from disk) */
  storeOverride?: ExperienceCurationStore;
};

export type CurationActionResult = {
  ok: boolean;
  error?: string;
  receipt?: CurationActionReceipt;
  reviewReceipt?: PageAbstractionReviewReceiptV2;
  lockReceipt?: ProjectCaptureLockReceipt;
  bundle?: ProjectExperienceCurationBundle;
  store: ExperienceCurationStore;
  manifest?: StudioWorldDesignRouteManifest;
};

function uid(prefix: string): string {
  return `${prefix}:${Date.now()}:${Math.random().toString(36).slice(2, 8)}`;
}

function compileManifest(repoRoot: string, store: ExperienceCurationStore): { manifest: StudioWorldDesignRouteManifest; store: ExperienceCurationStore } {
  const { manifest: base } = runCrossProjectRouteForensicAudit({ repoRoot });
  const routesWithMissing = registerMissingRoutesAsDesignable(base.rawImplementationRoutes, base.dependencyGraphs);
  const withRoutes = { ...base, rawImplementationRoutes: routesWithMissing, routes: routesWithMissing };
  const withPageSets = attachPageSetsToManifest(withRoutes);
  const withExperience = attachExperiencePagesToManifest(withPageSets);
  return attachExperienceCurationToManifest(withExperience, store);
}

function saveManifest(repoRoot: string, manifest: StudioWorldDesignRouteManifest): void {
  writeFileSync(join(repoRoot, MANIFEST_ARTIFACT_RELATIVE_PATH), JSON.stringify(manifest, null, 2), 'utf8');
}

function summaryFromBundle(bundle: ProjectExperienceCurationBundle, materialCount: number) {
  return {
    primary: bundle.activePrimaryCount,
    internal: bundle.internalWorkspaceCount,
    supporting: bundle.supportingCount,
    materialScreens: materialCount,
  };
}

function mapActionToOverrideType(action: CurationActionType): import('../types').ExperiencePageOverrideTypeV2 | null {
  switch (action) {
    case 'MOVE_TO_WORKSPACE':
      return 'FORCE_INTERNAL';
    case 'MOVE_TO_SUPPORTING':
      return 'FORCE_SUPPORTING';
    case 'PROMOTE_TO_PRIMARY':
      return 'FORCE_PRIMARY';
    case 'DEMOTE_TO_MATERIAL_SCREEN':
      return 'FORCE_MATERIAL_SCREEN';
    case 'DEMOTE_TO_STATE':
      return 'FORCE_STATE';
    case 'DEMOTE_TO_INSTANCE':
      return 'FORCE_INSTANCE';
    case 'CHANGE_SECTION':
      return 'FORCE_SECTION';
    case 'CHANGE_REPRESENTATIVE':
      return 'FORCE_REPRESENTATIVE';
    case 'SPLIT_PAGE':
      return 'FORCE_SPLIT';
    case 'MERGE_PAGES':
      return 'FORCE_MERGE';
    default:
      return null;
  }
}

function mapActionToReviewDecision(action: CurationActionType): PageAbstractionReviewRecord['decision'] | null {
  switch (action) {
    case 'KEEP_AS_PAGE':
      return 'APPROVE_AS_PAGE';
    case 'MOVE_TO_WORKSPACE':
      return 'MOVE_TO_INTERNAL_WORKSPACE';
    case 'MOVE_TO_SUPPORTING':
      return 'MOVE_TO_SUPPORTING';
    case 'PROMOTE_TO_PRIMARY':
      return 'PROMOTE_TO_PRIMARY';
    case 'DEMOTE_TO_MATERIAL_SCREEN':
      return 'DEMOTE_TO_MATERIAL_SCREEN';
    case 'DEMOTE_TO_STATE':
      return 'DEMOTE_TO_STATE';
    case 'DEMOTE_TO_INSTANCE':
      return 'DEMOTE_TO_INSTANCE';
    case 'CHANGE_SECTION':
      return 'CHANGE_SECTION';
    case 'CHANGE_REPRESENTATIVE':
      return 'CHANGE_REPRESENTATIVE';
    case 'SPLIT_PAGE':
      return 'SPLIT_PAGE';
    case 'MERGE_PAGES':
      return 'MERGE_WITH_PAGE';
    default:
      return null;
  }
}

export function executeCurationAction(repoRoot: string, request: CurationActionRequest): CurationActionResult {
  if ((EXTERNAL_REPO_OWNED_PROJECT_IDS as readonly string[]).includes(request.projectId)) {
    return { ok: false, error: 'EXTERNAL_REPO_AUTHORITY: project not curated from FSBW', store: loadExperienceCurationStore(repoRoot) };
  }
  if (!isFsbwCurationProject(request.projectId) && request.projectId !== 'studio-world') {
    return { ok: false, error: 'Project not in FSBW curation scope', store: loadExperienceCurationStore(repoRoot) };
  }

  let store = request.storeOverride ?? loadExperienceCurationStore(repoRoot);
  const { manifest: currentManifest } = compileManifest(repoRoot, store);
  const pageSet = currentManifest.projectPageSets?.find((p) => p.projectId === request.projectId);
  if (!pageSet && request.projectId !== 'studio-world') {
    return { ok: false, error: 'Project page set not found', store };
  }

  const beforeBundle = pageSet?.experienceCuration;
  const beforeSummary = beforeBundle
    ? summaryFromBundle(beforeBundle, pageSet?.materialScreens?.length ?? 0)
    : { primary: 0, internal: 0, supporting: 0, materialScreens: 0 };

  const curationState = getProjectCurationState(store, request.projectId);
  if (curationState.lockedForCapture && !['UNLOCK_FOR_REVIEW', 'UNDO_LAST_ACTION'].includes(request.action)) {
    return { ok: false, error: 'Project is LOCKED_FOR_CAPTURE — unlock before editing', store };
  }

  const targetIds = request.targetIds?.length ? request.targetIds : request.targetId ? [request.targetId] : [];

  if (['SPLIT_PAGE', 'MERGE_PAGES', 'CHANGE_SECTION', 'CHANGE_REPRESENTATIVE', 'DEMOTE_TO_MATERIAL_SCREEN', 'DEMOTE_TO_INSTANCE'].includes(request.action) && !request.targetId) {
    return { ok: false, error: 'targetId required', store };
  }

  const persist = request.persist !== false;

  if (request.action === 'UNDO_LAST_ACTION') {
    const lastId = store.lastActionByProject?.[request.projectId];
    const lastOverride = store.overrides.find((o) => o.overrideId === lastId && o.active);
    if (!lastOverride) return { ok: false, error: 'No undoable action', store };
    store = upsertOverride(store, { ...lastOverride, active: false, status: 'RETIRED' });
    const recompiled = compileManifest(repoRoot, store);
    if (persist) {
      saveExperienceCurationStore(repoRoot, recompiled.store);
      saveManifest(repoRoot, recompiled.manifest);
    }
    const ps = recompiled.manifest.projectPageSets?.find((p) => p.projectId === request.projectId);
    return {
      ok: true,
      store: recompiled.store,
      manifest: recompiled.manifest,
      bundle: ps?.experienceCuration,
      receipt: {
        receiptId: uid('undo'),
        projectId: request.projectId,
        actionType: 'UNDO_LAST_ACTION',
        targetId: lastOverride.targetId,
        before: {},
        after: {},
        result: 'APPLIED',
        reviewer: request.reviewer,
        timestamp: new Date().toISOString(),
      },
    };
  }

  if (request.action === 'LOCK_FOR_CAPTURE') {
    const ps = pageSet!;
    const gates = evaluateCurationGates(ps.experiencePages ?? [], ps.materialScreens ?? [], ps.experienceCuration!, curationState);
    if (!gates.canLockForCapture || hasBlockingLockConflict(ps.experienceCuration!.overrideConflicts)) {
      return { ok: false, error: `Lock blocked: ${gates.blockers.join(', ')}`, store };
    }
    const nextVersion = curationState.curationVersion;
    store = {
      ...store,
      projectCuration: {
        ...store.projectCuration,
        [request.projectId]: {
          ...curationState,
          universeStatus: 'LOCKED_FOR_CAPTURE',
          lockedForCapture: true,
          lastReviewedAt: new Date().toISOString(),
        },
      },
    };
    const recompiled = compileManifest(repoRoot, store);
    if (persist) {
      saveExperienceCurationStore(repoRoot, recompiled.store);
      saveManifest(repoRoot, recompiled.manifest);
    }
    const updated = recompiled.manifest.projectPageSets?.find((p) => p.projectId === request.projectId)!;
    const lockReceipt: ProjectCaptureLockReceipt = {
      receiptId: uid('lock'),
      projectId: request.projectId,
      curationVersion: nextVersion,
      lockedBy: request.reviewer,
      lockedAt: new Date().toISOString(),
      activePageCount: updated.experienceCuration!.activePrimaryCount,
      materialScreenCount: updated.materialScreens?.length ?? 0,
      captureTargetCount: updated.experienceCuration!.normalizedCapturePlan?.actualCaptureTargets ?? 0,
      manifestVersion: recompiled.manifest.manifestVersion,
      sourceCommit: recompiled.manifest.sourceCommit,
    };
    store = { ...recompiled.store, lockReceipts: [...(recompiled.store.lockReceipts ?? []), lockReceipt] };
    if (persist) saveExperienceCurationStore(repoRoot, store);
    return { ok: true, store, manifest: recompiled.manifest, bundle: updated.experienceCuration, lockReceipt };
  }

  if (request.action === 'UNLOCK_FOR_REVIEW') {
    store = {
      ...store,
      projectCuration: {
        ...store.projectCuration,
        [request.projectId]: {
          ...curationState,
          universeStatus: 'REVIEWING',
          lockedForCapture: false,
        },
      },
    };
    const recompiled = compileManifest(repoRoot, store);
    if (persist) {
      saveExperienceCurationStore(repoRoot, recompiled.store);
      saveManifest(repoRoot, recompiled.manifest);
    }
    const ps = recompiled.manifest.projectPageSets?.find((p) => p.projectId === request.projectId);
    return { ok: true, store: recompiled.store, manifest: recompiled.manifest, bundle: ps?.experienceCuration };
  }

  const actionReceipts: CurationActionReceipt[] = [];
  const overrideIds: string[] = [];
  let bumped = false;

  const applyOne = (targetId: string) => {
    const page = pageSet?.experiencePages?.find((p) => p.experiencePageId === targetId);
    if (page && isHardProtectedCustomerPage(page) && request.action === 'MOVE_TO_WORKSPACE' && !request.confirmProtectedDemotion) {
      throw new Error(`Protected customer page requires confirmation: ${page.displayName}`);
    }

    const reviewDecision = mapActionToReviewDecision(request.action);
    if (reviewDecision && targetId) {
      store = appendReview(store, {
        reviewId: uid('review'),
        projectId: request.projectId,
        experiencePageId: targetId,
        decision: reviewDecision,
        reason: request.reason,
        reviewedBy: request.reviewer,
        reviewedAt: new Date().toISOString(),
        sourceManifestVersion: currentManifest.manifestVersion,
        active: true,
      });
    }

    if (request.action === 'KEEP_AS_PAGE') {
      actionReceipts.push({
        receiptId: uid('action'),
        projectId: request.projectId,
        sessionId: request.sessionId,
        actionType: request.action,
        targetId,
        before: { founderPrimary: page?.founderPrimary ?? null },
        after: { approved: true },
        reason: request.reason,
        result: 'APPLIED',
        reviewer: request.reviewer,
        timestamp: new Date().toISOString(),
      });
      return;
    }

    const overrideType = mapActionToOverrideType(request.action);
    if (!overrideType) return;

    let value = request.value ?? '';
    if (request.action === 'MOVE_TO_WORKSPACE') {
      value = request.projectId === 'frontal-slayer' ? FS_INTERNAL_WORKSPACE_SECTION : `${request.projectId}:section:internal-workspace`;
    }
    if (request.action === 'MERGE_PAGES' && request.payload) {
      value = JSON.stringify(request.payload);
    }
    if (request.action === 'SPLIT_PAGE' && request.payload) {
      value = JSON.stringify(request.payload);
    }
    if (request.action === 'DEMOTE_TO_MATERIAL_SCREEN' && request.payload) {
      value = JSON.stringify(request.payload);
    }
    if (request.action === 'DEMOTE_TO_INSTANCE' && request.payload) {
      value = JSON.stringify(request.payload);
    }
    if (request.action === 'CHANGE_REPRESENTATIVE' && request.payload) {
      value = JSON.stringify(request.payload);
    }

    const overrideId = uid(`${request.projectId}:override`);
    store = upsertOverride(store, {
      overrideId,
      projectId: request.projectId,
      targetType: 'EXPERIENCE_PAGE',
      targetId,
      overrideType,
      value,
      reason: request.reason ?? request.action,
      createdBy: request.reviewer,
      createdAt: new Date().toISOString(),
      active: true,
    });
    overrideIds.push(overrideId);
    store = {
      ...store,
      lastActionByProject: { ...store.lastActionByProject, [request.projectId]: overrideId },
    };
    bumped = true;

    actionReceipts.push({
      receiptId: uid('action'),
      projectId: request.projectId,
      sessionId: request.sessionId,
      actionType: request.action,
      targetId,
      before: { founderPrimary: page?.founderPrimary, sectionId: page?.sectionId },
      after: { overrideType, value },
      reason: request.reason,
      result: 'APPLIED',
      overrideId,
      reviewer: request.reviewer,
      timestamp: new Date().toISOString(),
    });
  };

  try {
    if (request.action.startsWith('BATCH_')) {
      for (const tid of targetIds) applyOne(tid);
    } else if (request.targetId) {
      applyOne(request.targetId);
    } else if (targetIds.length) {
      for (const tid of targetIds) applyOne(tid);
    }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err), store };
  }

  if (bumped) {
    const cur = getProjectCurationState(store, request.projectId);
    store = {
      ...store,
      projectCuration: {
        ...store.projectCuration,
        [request.projectId]: {
          ...cur,
          curationVersion: bumpCurationVersion(cur.curationVersion),
          lastReviewedAt: new Date().toISOString(),
        },
      },
    };
  }

  const recompiled = compileManifest(repoRoot, store);
  store = {
    ...recompiled.store,
    actionReceipts: [...(recompiled.store.actionReceipts ?? []), ...actionReceipts],
  };

  if (request.sessionId) {
    const sessions = store.reviewSessions ?? [];
    const idx = sessions.findIndex((s) => s.sessionId === request.sessionId);
    if (idx >= 0) {
      const s = sessions[idx]!;
      sessions[idx] = { ...s, actionReceiptIds: [...s.actionReceiptIds, ...actionReceipts.map((r) => r.receiptId)] };
    } else {
      sessions.push({
        sessionId: request.sessionId,
        projectId: request.projectId,
        reviewer: request.reviewer,
        startedAt: new Date().toISOString(),
        actionReceiptIds: actionReceipts.map((r) => r.receiptId),
        notes: request.notes,
      });
    }
    store = { ...store, reviewSessions: sessions };
  }

  const updatedPs = recompiled.manifest.projectPageSets?.find((p) => p.projectId === request.projectId);
  const afterBundle = updatedPs?.experienceCuration;
  const reviewReceipt: PageAbstractionReviewReceiptV2 = {
    receiptId: uid('review-receipt'),
    projectId: request.projectId,
    curationVersion: getProjectCurationState(store, request.projectId).curationVersion,
    reviewSessionId: request.sessionId,
    reviewer: request.reviewer,
    timestamp: new Date().toISOString(),
    actions: actionReceipts,
    beforeSummary,
    afterSummary: afterBundle ? summaryFromBundle(afterBundle, updatedPs?.materialScreens?.length ?? 0) : beforeSummary,
    affectedPageIds: targetIds,
    overrideIds,
    conflicts: afterBundle?.overrideConflicts.map((c) => c.overrideId) ?? [],
    notes: request.notes,
  };
  store = { ...store, reviewReceipts: [...(store.reviewReceipts ?? []), reviewReceipt] };

  if (persist) {
    saveExperienceCurationStore(repoRoot, store);
    saveManifest(repoRoot, recompiled.manifest);
  }

  return {
    ok: true,
    store,
    manifest: recompiled.manifest,
    bundle: afterBundle,
    receipt: actionReceipts[actionReceipts.length - 1],
    reviewReceipt,
  };
}

export function startCurationReviewSession(
  store: ExperienceCurationStore,
  projectId: string,
  reviewer: string,
): { store: ExperienceCurationStore; session: CurationReviewSession } {
  const session: CurationReviewSession = {
    sessionId: uid(`${projectId}:session`),
    projectId,
    reviewer,
    startedAt: new Date().toISOString(),
    actionReceiptIds: [],
  };
  return {
    store: { ...store, reviewSessions: [...(store.reviewSessions ?? []), session] },
    session,
  };
}

export function loadManifestFromRepo(repoRoot: string): StudioWorldDesignRouteManifest {
  return JSON.parse(readFileSync(join(repoRoot, MANIFEST_ARTIFACT_RELATIVE_PATH), 'utf8')) as StudioWorldDesignRouteManifest;
}
