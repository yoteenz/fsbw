import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useWorkspace } from '../studio-os-core/context/WorkspaceProvider';
import {
  resolveCreativePreviewRenderBinding,
  runExperienceLabValidationShellPipeline,
  computeRenderPipelineProgress,
  RENDER_PIPELINE_STALL_MS,
  type CreativePreviewCompanyId,
  type RenderPipelineProgress,
  type ValidationShellPipelineResult,
} from '../studio-os-core/creative-studio-preview';
import {
  setValidationRenderMode,
  setValidationPreviewSession,
  clearValidationPreviewSession,
  shellIsMountReady,
  diagnoseShellResolution,
} from '../studio-os-core/scene-stack';
import { useDepartmentVerticalSlice } from './useDepartmentVerticalSlice';
import { useSceneStack } from './useSceneStack';

export type ShellPipelinePhase =
  | 'idle'
  | 'compile-spec'
  | 'generate-shell'
  | 'register'
  | 'ensure-station'
  | 'world-compile'
  | 'ready'
  | 'failed';

export type RenderPipelineRunMeta = {
  runAttempt: number;
  runStartedAt: number | null;
  elapsedMs: number;
  lastStepChangeAt: number | null;
  stepStallMs: number;
  isStalled: boolean;
};

/** Experience Lab — invoke Creative Studio World Compiler™ for a company preview. */
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
  const stack = useSceneStack(binding.departmentId, slice.project.projectId, workspaceId);

  const stationId = binding.stationId;
  const projectId = slice.project.projectId;
  const departmentId = binding.departmentId;

  const previewSessionId = `${companyId}:${conceptId}:${departmentId}:${stationId}:${projectId}`;

  const layers = stack.getLayerViews(stationId);
  const status = stack.getCompositeStatus(stationId);
  const pipeline = stack.getStationPipelineProgress(stationId);
  const sceneGraph = stack.getStationSceneGraph(stationId);
  const compileReport = stack.getStationCompileReport(stationId);

  const [shellPipelinePhase, setShellPipelinePhase] = useState<ShellPipelinePhase>('idle');
  const [shellPipelineStage, setShellPipelineStage] =
    useState<ValidationShellPipelineResult['stage']>('compile-preview-spec');
  const [shellPipelineResult, setShellPipelineResult] = useState<ValidationShellPipelineResult | null>(null);
  const [runAttempt, setRunAttempt] = useState(0);
  const [runStartedAt, setRunStartedAt] = useState<number | null>(null);
  const [lastStepChangeAt, setLastStepChangeAt] = useState<number | null>(null);
  const [clockTick, setClockTick] = useState(0);

  const shellDiagnostic = useMemo(
    () => diagnoseShellResolution(departmentId, projectId, stationId, { validationMode: true }),
    [departmentId, projectId, stationId, layers, compileReport, shellPipelinePhase]
  );

  const shellReady = useMemo(
    () => shellIsMountReady(departmentId, projectId, stationId, { validationMode: true }),
    [departmentId, projectId, stationId, layers, status, shellPipelinePhase]
  );

  const pipelineRunRef = useRef<string | null>(null);
  const layerPipelineActive = stack.isStationPipelineActive(stationId);
  const ensureStationActive =
    shellPipelinePhase === 'ensure-station' || (shellPipelinePhase === 'ready' && status === 'building');

  const mapShellStageToPhase = useCallback((stage: ValidationShellPipelineResult['stage']): ShellPipelinePhase => {
    if (stage === 'compile-preview-spec') return 'compile-spec';
    if (stage === 'generate-shell') return 'generate-shell';
    if (stage === 'register-ephemeral') return 'register';
    return 'world-compile';
  }, []);

  const bumpStepClock = useCallback(() => {
    const now = Date.now();
    setLastStepChangeAt(now);
  }, []);

  const renderPipelineProgress: RenderPipelineProgress = useMemo(
    () =>
      computeRenderPipelineProgress({
        shellPhase:
          shellPipelinePhase === 'ensure-station' || shellPipelinePhase === 'world-compile'
            ? 'ready'
            : shellPipelinePhase === 'compile-spec'
              ? 'compile-spec'
              : shellPipelinePhase === 'generate-shell'
                ? 'generate-shell'
                : shellPipelinePhase === 'register'
                  ? 'register'
                  : shellPipelinePhase,
        shellStage: shellPipelineStage,
        ensureStationActive,
        layerPipelineActive,
        compileStages: compileReport?.stages,
        compileSuccess: compileReport?.success,
        compileFailedStage: compileReport?.failedStage ?? null,
        shellFailed: shellPipelinePhase === 'failed' || shellPipelineResult?.ok === false,
      }),
    [
      shellPipelinePhase,
      shellPipelineStage,
      ensureStationActive,
      layerPipelineActive,
      compileReport,
      shellPipelineResult,
    ]
  );

  const elapsedMs = runStartedAt ? Date.now() - runStartedAt : 0;
  const stepStallMs = lastStepChangeAt ? Date.now() - lastStepChangeAt : 0;
  const isStalled =
    renderPipelineProgress.isRunning &&
    stepStallMs >= RENDER_PIPELINE_STALL_MS &&
    !renderPipelineProgress.isComplete;

  const runMeta: RenderPipelineRunMeta = {
    runAttempt,
    runStartedAt,
    elapsedMs,
    lastStepChangeAt,
    stepStallMs,
    isStalled,
  };

  useEffect(() => {
    if (!renderPipelineProgress.isRunning) return;
    const id = window.setInterval(() => setClockTick((n) => n + 1), 1000);
    return () => window.clearInterval(id);
  }, [renderPipelineProgress.isRunning]);

  void clockTick;

  useEffect(() => {
    setValidationRenderMode('experience-lab-validation');
    setValidationPreviewSession(previewSessionId);
    return () => {
      setValidationPreviewSession(null);
      clearValidationPreviewSession(previewSessionId);
      setValidationRenderMode('production');
    };
  }, [previewSessionId]);

  useEffect(() => {
    pipelineRunRef.current = null;
    setShellPipelinePhase('idle');
    setShellPipelineResult(null);
    setShellPipelineStage('compile-preview-spec');
  }, [previewSessionId]);

  const runFullPipeline = useCallback(async () => {
    const started = Date.now();
    setRunAttempt((n) => n + 1);
    setRunStartedAt(started);
    bumpStepClock();
    setShellPipelinePhase('compile-spec');
    setShellPipelineStage('compile-preview-spec');

    const shellResult = await runExperienceLabValidationShellPipeline({
      companyId,
      conceptId,
      projectId,
      previewSessionId,
      workspaceId,
      forceRegenerate: true,
      onStageChange: (stage) => {
        setShellPipelineStage(stage);
        setShellPipelinePhase(mapShellStageToPhase(stage));
        bumpStepClock();
      },
    });

    setShellPipelineResult(shellResult);

    if (!shellResult.ok) {
      setShellPipelinePhase('failed');
      return;
    }

    setShellPipelinePhase('ensure-station');
    bumpStepClock();
    stack.bump();

    await stack.ensureStation(stationId, {
      validationMode: true,
      skipEnvironmentShell: true,
    });

    setShellPipelinePhase('world-compile');
    bumpStepClock();

    const compiled = await stack.compileStation(stationId, { validationMode: true });
    if (!compiled.report.success) {
      stack.bump();
      setShellPipelinePhase('failed');
      return;
    }

    setShellPipelinePhase('ready');
    bumpStepClock();
  }, [
    bumpStepClock,
    companyId,
    conceptId,
    mapShellStageToPhase,
    previewSessionId,
    projectId,
    stack,
    stationId,
    workspaceId,
  ]);

  useEffect(() => {
    if (pipelineRunRef.current === previewSessionId) return;
    if (layerPipelineActive) return;

    pipelineRunRef.current = previewSessionId;
    let cancelled = false;

    async function run() {
      await runFullPipeline();
      if (cancelled) pipelineRunRef.current = null;
    }

    void run();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- one auto-run per previewSessionId
  }, [previewSessionId, layerPipelineActive, companyId, conceptId, projectId, stationId, workspaceId]);

  const retryPipeline = useCallback(() => {
    pipelineRunRef.current = null;
    clearValidationPreviewSession(previewSessionId);
    setShellPipelinePhase('idle');
    setShellPipelineResult(null);
    setShellPipelineStage('compile-preview-spec');
    pipelineRunRef.current = previewSessionId;
    void runFullPipeline();
  }, [previewSessionId, runFullPipeline]);

  const isBuilding =
    renderPipelineProgress.isRunning ||
    layerPipelineActive ||
    status === 'building';

  return {
    binding,
    stack,
    stationId,
    layers,
    status,
    pipeline,
    sceneGraph,
    compileReport,
    shellDiagnostic,
    shellReady,
    shellPipelinePhase,
    shellPipelineStage,
    shellPipelineResult,
    previewSessionId,
    retryPipeline,
    renderPipelineProgress,
    runMeta,
    isBuilding,
  };
}
