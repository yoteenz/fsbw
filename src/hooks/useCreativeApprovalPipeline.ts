import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  addPipelineBranch,
  cachePreparedPrompt,
  dismissPipelineNotification,
  getActiveBranch,
  getCreativeApprovalPipeline,
  getPipelineProgress,
  getPipelineStageRecord,
  getRegenerationImpact,
  invalidateDownstreamStages,
  listPendingReviewNotifications,
  listPipelineStages,
  migrateLegacyGenerationQueue,
  selectPipelineBranch,
  unlockNextStage,
  updatePipelineStage,
} from '../studio-os-core/studio-builder/approval-pipeline-store';
import { compileDepartmentGenerationPrompt } from '../studio-os-core/studio-builder/prompt-compiler';
import { getNextPipelineStage, type PipelineStageId } from '../studio-os-core/studio-builder/pipeline-definition';
import { registerStudioAsset } from '../studio-os-core/studio-builder/registry-store';
import { requireDepartmentPackage } from '../studio-os-core/department-package';
import { requestStudioBuilderGenerate } from '../services/studio/studioBuilder/api';
import type { PipelineStageRecord, RegenerationImpact } from '../studio-os-core/studio-builder/types';

function buildApprovedContext(departmentId: string, projectId: string, stageId: PipelineStageId): string {
  const stages = listPipelineStages(departmentId, projectId);
  const current = stages.find((s) => s.stageId === stageId);
  if (!current) return '';

  const approved = stages
    .filter((s) => s.order < current.order && s.status === 'approved')
    .map((s) => {
      const branch = getActiveBranch(s);
      return `${s.displayName} approved (${branch.label})`;
    });

  return approved.join(' · ');
}

function prepareNextStagePrompt(
  departmentId: string,
  projectId: string,
  workspaceId: string | undefined,
  currentStageId: PipelineStageId
): void {
  const next = getNextPipelineStage(currentStageId);
  if (!next) return;

  const nextRecord = getPipelineStageRecord(departmentId, projectId, next.id);
  if (!nextRecord || nextRecord.preparedPrompt) return;

  const compiled = compileDepartmentGenerationPrompt({
    departmentId,
    productionGroupId: next.productionGroupId,
    workspaceId,
    projectId,
    approvedStageContext: buildApprovedContext(departmentId, projectId, next.id),
  });

  cachePreparedPrompt(departmentId, projectId, next.id, compiled.prompt);
}

export function useCreativeApprovalPipeline(
  departmentId: string,
  projectId: string,
  workspaceId?: string
) {
  const [version, setVersion] = useState(0);
  const bump = useCallback(() => setVersion((v) => v + 1), []);

  useEffect(() => {
    migrateLegacyGenerationQueue();
    getCreativeApprovalPipeline(departmentId, projectId);
    bump();
  }, [bump, departmentId, projectId]);

  const stages = useMemo(() => {
    void version;
    return listPipelineStages(departmentId, projectId);
  }, [departmentId, projectId, version]);

  const progress = useMemo(() => {
    void version;
    return getPipelineProgress(departmentId, projectId);
  }, [departmentId, projectId, version]);

  const pendingReviews = useMemo(() => {
    void version;
    return listPendingReviewNotifications(departmentId, projectId);
  }, [departmentId, projectId, version]);

  const history = useMemo(() => {
    void version;
    return getCreativeApprovalPipeline(departmentId, projectId).history;
  }, [departmentId, projectId, version]);

  const runGeneration = useCallback(
    async (stageId: PipelineStageId, directorFeedback?: string, forceInvalidate = false) => {
      const pkg = requireDepartmentPackage(departmentId);
      const stage = getPipelineStageRecord(departmentId, projectId, stageId);
      if (!stage) return;

      if (stage.status === 'approved' && !forceInvalidate) {
        const impact = getRegenerationImpact(departmentId, projectId, stageId);
        if (impact) return { needsConfirmation: true as const, impact };
      }

      if (forceInvalidate) {
        invalidateDownstreamStages(departmentId, projectId, stageId);
      }

      const approvedContext = buildApprovedContext(departmentId, projectId, stageId);
      const compiled = compileDepartmentGenerationPrompt({
        departmentId,
        productionGroupId: stage.productionGroupId,
        workspaceId,
        projectId,
        directorFeedback,
        approvedStageContext: approvedContext,
      });

      const prompt =
        stage.preparedPrompt && !directorFeedback ? stage.preparedPrompt : compiled.prompt;

      updatePipelineStage(
        departmentId,
        projectId,
        stageId,
        { status: 'generating', error: undefined, pendingReview: false },
        { stageId, action: 'generate', detail: stage.displayName }
      );
      bump();

      const result = await requestStudioBuilderGenerate({
        departmentId,
        packageId: pkg.packageId,
        projectId,
        productionGroupId: stage.productionGroupId,
        heroAssetId: stage.heroAssetId,
        prompt,
        aspectRatio: compiled.aspectRatio,
        outputFormat: compiled.outputFormat as 'png' | 'webp',
      });

      if (!result.ok || !result.publicUrl) {
        updatePipelineStage(departmentId, projectId, stageId, {
          status: 'failed',
          error: result.error ?? 'Generation failed',
        });
        bump();
        return { ok: false as const, error: result.error };
      }

      const refreshed = getPipelineStageRecord(departmentId, projectId, stageId);
      if (!refreshed) return { ok: false as const };

      const branches = refreshed.branches.map((b) =>
        b.id === refreshed.activeBranchId
          ? {
              ...b,
              previewUrl: result.publicUrl,
              storagePath: result.storagePath,
              compiledPrompt: prompt,
              directorFeedback,
              model: result.model,
            }
          : b
      );

      updatePipelineStage(departmentId, projectId, stageId, {
        status: 'review',
        branches,
        pendingReview: true,
      });
      bump();

      prepareNextStagePrompt(departmentId, projectId, workspaceId, stageId);

      return { ok: true as const, previewUrl: result.publicUrl };
    },
    [bump, departmentId, projectId, workspaceId]
  );

  const startStage = useCallback(
    async (stageId: PipelineStageId) => {
      const stage = getPipelineStageRecord(departmentId, projectId, stageId);
      if (!stage || (stage.status !== 'ready' && stage.status !== 'failed')) return;

      if (stageId === 'golden-build-review') {
        updatePipelineStage(
          departmentId,
          projectId,
          stageId,
          { status: 'review', pendingReview: true },
          { stageId, action: 'generate', detail: 'Golden Build™ walkthrough ready' }
        );
        bump();
        return { ok: true as const };
      }

      return runGeneration(stageId);
    },
    [bump, departmentId, projectId, runGeneration]
  );

  const approveStage = useCallback(
    (stageId: PipelineStageId) => {
      const stage = getPipelineStageRecord(departmentId, projectId, stageId);
      if (!stage || stage.status !== 'review') return;

      const now = new Date().toISOString();
      const branches = stage.branches.map((b) =>
        b.id === stage.activeBranchId ? { ...b, approvedAt: now } : b
      );

      updatePipelineStage(
        departmentId,
        projectId,
        stageId,
        {
          status: 'approved',
          branches,
          approvedAt: now,
          pendingReview: false,
        },
        { stageId, action: 'approve', detail: `Approved ${getActiveBranch(stage).label}` }
      );

      const pkg = requireDepartmentPackage(departmentId);
      const branch = getActiveBranch(stage);
      const manifestAsset = pkg.assetManifest.assets.find((a) => a.assetId === stage.heroAssetId);
      if (branch.previewUrl) {
        registerStudioAsset({
          departmentId,
          packageId: pkg.packageId,
          projectId,
          assetId: stage.heroAssetId,
          productionGroupId: stage.productionGroupId,
          category: manifestAsset?.category ?? 'environment',
          publicUrl: branch.previewUrl,
          storagePath: branch.storagePath ?? '',
          model: branch.model ?? 'fal-ai/nano-banana-pro/edit',
          promptVersion: 'studio-builder.v1',
          status: 'validated',
        });
      }

      const next = getNextPipelineStage(stageId);
      if (next) {
        const nextDef = requireDepartmentPackage(departmentId).productionGroups.groups[next.productionGroupId];
        if (nextDef && next.id === 'golden-build-review') {
          updatePipelineStage(departmentId, projectId, next.id, { status: 'ready' });
        } else {
          unlockNextStage(departmentId, projectId, stageId);
        }
      }

      bump();
    },
    [bump, departmentId, projectId]
  );

  const regenerateStage = useCallback(
    async (stageId: PipelineStageId, directorFeedback?: string, confirmed = false) => {
      const stage = getPipelineStageRecord(departmentId, projectId, stageId);
      if (!stage) return;

      const impact = getRegenerationImpact(departmentId, projectId, stageId);
      if (impact && !confirmed) {
        return { needsConfirmation: true as const, impact };
      }

      updatePipelineStage(
        departmentId,
        projectId,
        stageId,
        { status: 'ready' },
        { stageId, action: 'regenerate', detail: directorFeedback ?? 'Regenerate' }
      );
      bump();

      return runGeneration(stageId, directorFeedback, Boolean(impact && confirmed));
    },
    [bump, departmentId, projectId, runGeneration]
  );

  const branchStage = useCallback(
    async (stageId: PipelineStageId, directorFeedback?: string) => {
      addPipelineBranch(departmentId, projectId, stageId);
      bump();
      return regenerateStage(stageId, directorFeedback, true);
    },
    [bump, departmentId, projectId, regenerateStage]
  );

  const completeGoldenBuildReview = useCallback(
    (stageId: PipelineStageId) => {
      const stage = getPipelineStageRecord(departmentId, projectId, stageId);
      if (!stage || stageId !== 'golden-build-review') return;

      updatePipelineStage(
        departmentId,
        projectId,
        stageId,
        { status: 'approved', approvedAt: new Date().toISOString(), pendingReview: false },
        { stageId, action: 'approve', detail: 'Golden Build™ walkthrough approved' }
      );
      bump();
    },
    [bump, departmentId, projectId]
  );

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key?.includes('studioOsCreativeApprovalPipeline')) bump();
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [bump]);

  return {
    stages,
    progress,
    pendingReviews,
    history,
    startStage,
    approveStage,
    regenerateStage,
    branchStage,
    completeGoldenBuildReview,
    selectBranch: (stageId: PipelineStageId, branchId: string) => {
      selectPipelineBranch(departmentId, projectId, stageId, branchId);
      bump();
    },
    dismissNotification: (stageId: PipelineStageId) => {
      dismissPipelineNotification(departmentId, projectId, stageId);
      bump();
    },
    getRegenerationImpact: (stageId: PipelineStageId): RegenerationImpact | null =>
      getRegenerationImpact(departmentId, projectId, stageId),
    getActiveBranch: (stage: PipelineStageRecord) => getActiveBranch(stage),
    bump,
  };
}
