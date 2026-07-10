import { useCallback, useEffect, useMemo, useState } from 'react';
import { useWorkspace } from '../studio-os-core/context/WorkspaceProvider';
import {
  computeRenderPipelineProgress,
  resolveCreativePreviewRenderBinding,
  type CreativePreviewCompanyId,
} from '../studio-os-core/creative-studio-preview';
import { buildSceneGraph, diagnoseShellResolution, resolveMasterSceneBlueprint } from '../studio-os-core/scene-stack';
import {
  requestRuntimeRegenerateLayer,
  requestRuntimeRetry,
  subscribeCompilerSession,
  type ExperienceLabRuntimeSnapshot,
  type ExperienceLabSessionKey,
  type RenderPipelineRunMeta,
  type ShellPipelinePhase,
} from '../studio-os-core/experience-lab-runtime';
import {
  getCompileStoppedSnapshot,
  getLayer1ForensicSnapshot,
  formatLayer1DiagnosticsMarkdown,
  isAutomaticRetryDisabled,
  isWorldCompilerDiagnosticMode,
  recordTap,
} from '../studio-os/diagnostics/world-compiler-investigation';
import { useDepartmentVerticalSlice } from './useDepartmentVerticalSlice';

export type { ShellPipelinePhase };

export type CreativeStudioRenderRunMeta = RenderPipelineRunMeta & {
  compileRunId: string | null;
  compilerInstanceId: string | null;
};

/**
 * World Compiler visualization hook — read-only subscriber to Experience Lab runtime.
 * Does NOT own execution, heartbeat, timers, or session lifecycle.
 */
export function useCreativeStudioRenderPreview(
  companyId: CreativePreviewCompanyId,
  conceptId: 'a' | 'b' | 'c'
) {
  const { workspaceId } = useWorkspace();
  const binding = useMemo(
    () => resolveCreativePreviewRenderBinding(companyId, conceptId),
    [companyId, conceptId]
  );

  const slice = useDepartmentVerticalSlice(binding.departmentId);
  const stationId = binding.stationId;
  const projectId = slice.project.projectId;
  const departmentId = binding.departmentId;
  const previewSessionId = `${companyId}:${conceptId}:${departmentId}:${stationId}:${projectId}`;

  const sessionKey: ExperienceLabSessionKey = useMemo(
    () => ({
      companyId,
      conceptId,
      departmentId,
      stationId,
      projectId,
      workspaceId,
    }),
    [companyId, conceptId, departmentId, stationId, projectId, workspaceId]
  );

  const [snapshot, setSnapshot] = useState<ExperienceLabRuntimeSnapshot | null>(null);

  useEffect(() => {
    return subscribeCompilerSession(sessionKey, setSnapshot);
  }, [sessionKey]);

  const retryPipeline = useCallback(() => {
    if (isAutomaticRetryDisabled() && snapshot?.renderStatus === 'failed') {
      recordTap('useCreativeStudioRenderPreview.retryPipeline-blocked', { reason: 'diagnostic mode' });
      return;
    }
    requestRuntimeRetry(sessionKey);
  }, [sessionKey, snapshot?.renderStatus]);

  const startManualCompileRun = useCallback(() => {
    recordTap('useCreativeStudioRenderPreview.startManualCompileRun', {
      companyId,
      conceptId,
      stationId,
    });
    requestRuntimeRetry(sessionKey);
  }, [companyId, conceptId, sessionKey, stationId]);

  const stack = useMemo(
    () => ({
      regenerateLayer: (sid: string, layerId: import('../studio-os-core/scene-stack').SceneStackLayerId) => {
        if (sid !== stationId) return;
        requestRuntimeRegenerateLayer(sessionKey, layerId);
      },
      bump: () => {
        /* runtime-owned */
      },
    }),
    [sessionKey, stationId]
  );

  const s = snapshot;

  const defaultBlueprint = useMemo(
    () =>
      resolveMasterSceneBlueprint({
        departmentId,
        projectId,
        stationId,
        workspaceId,
      }),
    [departmentId, projectId, stationId, workspaceId]
  );

  const defaultSceneGraph = useMemo(
    () =>
      buildSceneGraph({
        blueprint: defaultBlueprint,
        departmentId,
        projectId,
        stationId,
        compositionMode: 'world-compiler',
      }),
    [defaultBlueprint, departmentId, projectId, stationId]
  );

  const defaultShellDiagnostic = useMemo(
    () => diagnoseShellResolution(departmentId, projectId, stationId, { validationMode: true }),
    [departmentId, projectId, stationId]
  );

  const defaultRenderPipelineProgress = useMemo(
    () =>
      computeRenderPipelineProgress({
        shellPhase: 'idle',
      }),
    []
  );

  const compileStopped = getCompileStoppedSnapshot();
  const layer1Forensic = getLayer1ForensicSnapshot();
  const diagnosticFrozen =
    Boolean(compileStopped) ||
    Boolean(layer1Forensic) ||
    (isWorldCompilerDiagnosticMode() && s?.renderStatus === 'failed');

  const runMeta: CreativeStudioRenderRunMeta = {
    ...(s?.runMeta ?? {
      runAttempt: 0,
      runStartedAt: null,
      elapsedMs: 0,
      lastStepChangeAt: null,
      stepStallMs: 0,
      isStalled: false,
    }),
    compileRunId: s?.compileRunId ?? null,
    compilerInstanceId: null,
  };

  return {
    binding,
    stack,
    stationId,
    layers: s?.layers ?? [],
    status: s?.status ?? 'idle',
    pipeline: s?.pipeline ?? {
      stationId,
      layersComplete: 0,
      layersTotal: 0,
      currentLayerId: null,
      currentLayerLabel: null,
      phase: 'idle' as const,
    },
    sceneGraph: s?.sceneGraph ?? defaultSceneGraph,
    compileReport: s?.compileReport ?? null,
    shellDiagnostic: s?.shellDiagnostic ?? defaultShellDiagnostic,
    shellReady: s?.shellReady ?? false,
    shellPipelinePhase: s?.shellPipelinePhase ?? 'idle',
    shellPipelineStage: s?.shellPipelineStage ?? 'compile-preview-spec',
    shellPipelineResult: s?.shellPipelineResult ?? null,
    previewSessionId,
    retryPipeline,
    startManualCompileRun,
    renderPipelineProgress: s?.renderPipelineProgress ?? defaultRenderPipelineProgress,
    runMeta,
    isBuilding: s?.isBuilding ?? false,
    runtimeHeartbeat: s?.heartbeat ?? 0,
    compileStopped,
    diagnosticFrozen,
    compileRunId: s?.compileRunId ?? null,
    layer1Forensic,
    copyLayer1Diagnostics: layer1Forensic
      ? () => {
          void navigator.clipboard?.writeText(formatLayer1DiagnosticsMarkdown(layer1Forensic));
        }
      : undefined,
  };
}
