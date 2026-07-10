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
import {
  beginCompileRun,
  createCompilerInstanceId,
  detectProgressReset,
  endCompileRun,
  isAutoRunDisabled,
  isAutomaticRetryDisabled,
  isShellRegenerationAfterRunStartDisabled,
  logEffectLifecycle,
  logStateWrite,
  recordTap,
  updateActiveShellId,
  getActiveCompileRun,
  getCompileStoppedSnapshot,
} from '../studio-os/diagnostics/world-compiler-investigation';

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
  compileRunId: string | null;
  compilerInstanceId: string | null;
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

  const compileRunIdRef = useRef<string | null>(null);
  const compilerInstanceIdRef = useRef(createCompilerInstanceId());
  const pipelineRunRef = useRef<string | null>(null);
  const frozenRef = useRef(false);

  const shellDiagnostic = useMemo(
    () => diagnoseShellResolution(departmentId, projectId, stationId, { validationMode: true }),
    [departmentId, projectId, stationId, layers, compileReport, shellPipelinePhase]
  );

  const shellReady = useMemo(
    () => shellIsMountReady(departmentId, projectId, stationId, { validationMode: true }),
    [departmentId, projectId, stationId, layers, status, shellPipelinePhase]
  );

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

  const setShellPhaseTraced = useCallback((next: ShellPipelinePhase, caller: string) => {
    setShellPipelinePhase((prev) => {
      logStateWrite('shellPipelinePhase', prev, next, caller);
      return next;
    });
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

  useEffect(() => {
    detectProgressReset({
      stepIndex: renderPipelineProgress.stepIndex,
      currentStepId: renderPipelineProgress.currentStepId,
      layerLabel: pipeline?.currentLayerLabel ?? null,
      shellId: shellDiagnostic.requestedShellId ?? null,
      compilerStatus: shellPipelinePhase,
      caller: 'useCreativeStudioRenderPreview.renderPipelineProgress',
    });
  }, [
    renderPipelineProgress.stepIndex,
    renderPipelineProgress.currentStepId,
    pipeline?.currentLayerLabel,
    shellDiagnostic.requestedShellId,
    shellPipelinePhase,
  ]);

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
    compileRunId: compileRunIdRef.current,
    compilerInstanceId: compilerInstanceIdRef.current,
  };

  useEffect(() => {
    if (!renderPipelineProgress.isRunning) return;
    const id = window.setInterval(() => setClockTick((n) => n + 1), 1000);
    return () => window.clearInterval(id);
  }, [renderPipelineProgress.isRunning]);

  void clockTick;

  useEffect(() => {
    logEffectLifecycle('EFFECT_STARTED', 'validation-mode-session', [previewSessionId]);
    setValidationRenderMode('experience-lab-validation');
    setValidationPreviewSession(previewSessionId);
    return () => {
      logEffectLifecycle('EFFECT_CLEANUP', 'validation-mode-session', [previewSessionId]);
      setValidationPreviewSession(null);
      clearValidationPreviewSession(previewSessionId);
      setValidationRenderMode('production');
    };
  }, [previewSessionId]);

  useEffect(() => {
    logEffectLifecycle('EFFECT_STARTED', 'previewSessionId-reset', [previewSessionId]);
    pipelineRunRef.current = null;
    setShellPipelinePhase('idle');
    setShellPipelineResult(null);
    setShellPipelineStage('compile-preview-spec');
    frozenRef.current = false;
    return () => {
      logEffectLifecycle('EFFECT_CLEANUP', 'previewSessionId-reset', [previewSessionId]);
    };
  }, [previewSessionId]);

  const runFullPipeline = useCallback(
    async (trigger: 'manual' | 'auto' = 'auto') => {
      if (frozenRef.current || getCompileStoppedSnapshot()) {
        return;
      }

      const compileRunId = crypto.randomUUID();
      compileRunIdRef.current = compileRunId;

      const run = beginCompileRun({
        compileRunId,
        compilerInstanceId: compilerInstanceIdRef.current,
        companyId,
        conceptId,
        stationId,
        previewSessionId,
        shellId: shellDiagnostic.requestedShellId ?? null,
        trigger,
        caller: 'useCreativeStudioRenderPreview.runFullPipeline',
      });

      if (!run && isAutoRunDisabled()) {
        return;
      }

      const started = Date.now();
      setRunAttempt((n) => n + 1);
      setRunStartedAt(started);
      bumpStepClock();
      setShellPhaseTraced('compile-spec', 'runFullPipeline');
      setShellPipelineStage('compile-preview-spec');

      const skipForceRegenerate =
        isShellRegenerationAfterRunStartDisabled() && getActiveCompileRun()?.status === 'running';

      const shellResult = await runExperienceLabValidationShellPipeline({
        companyId,
        conceptId,
        projectId,
        previewSessionId,
        workspaceId,
        forceRegenerate: !skipForceRegenerate,
        onStageChange: (stage) => {
          setShellPipelineStage(stage);
          setShellPhaseTraced(mapShellStageToPhase(stage), 'shellPipeline.onStageChange');
          bumpStepClock();
        },
      });

      setShellPipelineResult(shellResult);

      if (!shellResult.ok) {
        setShellPhaseTraced('failed', 'runFullPipeline.shellFailed');
        endCompileRun('failed', {
          failedStage: shellResult.stage,
          error: shellResult.errorDetail ?? shellResult.errorCode,
        });
        frozenRef.current = isAutomaticRetryDisabled();
        return;
      }

      if (shellResult.shell?.shellId) {
        updateActiveShellId(shellResult.shell.shellId, 'runFullPipeline.shellRegistered');
      }

      setShellPhaseTraced('ensure-station', 'runFullPipeline.preEnsureStation');
      bumpStepClock();
      stack.bump();

      await stack.ensureStation(stationId, {
        validationMode: true,
        skipEnvironmentShell: true,
      });

      setShellPhaseTraced('world-compile', 'runFullPipeline.preCompileStation');
      bumpStepClock();

      const investigation = {
        compileRunId,
        compilerInstanceId: compilerInstanceIdRef.current,
        renderId: run?.renderId ?? 0,
      };

      const compiled = await stack.compileStation(stationId, {
        validationMode: true,
        investigation,
      });

      if (!compiled.report.success) {
        stack.bump();
        setShellPhaseTraced('failed', 'runFullPipeline.compileFailed');
        endCompileRun('failed', {
          failedStage: compiled.report.failedStage ?? undefined,
          error: compiled.report.failedStageDetail ?? undefined,
        });
        frozenRef.current = isAutomaticRetryDisabled();
        return;
      }

      setShellPhaseTraced('ready', 'runFullPipeline.success');
      bumpStepClock();
      endCompileRun('success');
    },
    [
      bumpStepClock,
      companyId,
      conceptId,
      mapShellStageToPhase,
      previewSessionId,
      projectId,
      setShellPhaseTraced,
      shellDiagnostic.requestedShellId,
      stack,
      stationId,
      workspaceId,
    ]
  );

  useEffect(() => {
    if (isAutoRunDisabled()) return;

    logEffectLifecycle('EFFECT_STARTED', 'auto-run-pipeline', [
      previewSessionId,
      layerPipelineActive,
      companyId,
      conceptId,
      projectId,
      stationId,
      workspaceId,
    ]);

    if (pipelineRunRef.current === previewSessionId) return;
    if (layerPipelineActive) return;
    if (frozenRef.current) return;

    pipelineRunRef.current = previewSessionId;
    let cancelled = false;

    async function run() {
      await runFullPipeline('auto');
      if (cancelled) {
        pipelineRunRef.current = null;
        logEffectLifecycle('EFFECT_RESTARTED', 'auto-run-pipeline-cleanup', [previewSessionId]);
      }
    }

    void run();

    return () => {
      cancelled = true;
      logEffectLifecycle('EFFECT_CLEANUP', 'auto-run-pipeline', [previewSessionId]);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- one auto-run per previewSessionId
  }, [previewSessionId, layerPipelineActive, companyId, conceptId, projectId, stationId, workspaceId]);

  const startManualCompileRun = useCallback(() => {
    recordTap('useCreativeStudioRenderPreview.startManualCompileRun', {
      companyId,
      conceptId,
      stationId,
    });
    if (isAutomaticRetryDisabled() && frozenRef.current) {
      return;
    }
    pipelineRunRef.current = null;
    frozenRef.current = false;
    pipelineRunRef.current = previewSessionId;
    void runFullPipeline('manual');
  }, [companyId, conceptId, previewSessionId, runFullPipeline, stationId]);

  const retryPipeline = useCallback(() => {
    if (isAutomaticRetryDisabled()) {
      recordTap('useCreativeStudioRenderPreview.retryPipeline-blocked', { reason: 'diagnostic mode' });
      return;
    }
    pipelineRunRef.current = null;
    clearValidationPreviewSession(previewSessionId);
    setShellPipelinePhase('idle');
    setShellPipelineResult(null);
    setShellPipelineStage('compile-preview-spec');
    pipelineRunRef.current = previewSessionId;
    void runFullPipeline('manual');
  }, [previewSessionId, runFullPipeline]);

  const isBuilding =
    renderPipelineProgress.isRunning ||
    layerPipelineActive ||
    status === 'building';

  const compileStopped = getCompileStoppedSnapshot();
  const diagnosticFrozen = Boolean(compileStopped) || frozenRef.current;

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
    startManualCompileRun,
    renderPipelineProgress,
    runMeta,
    isBuilding,
    compileStopped,
    diagnosticFrozen,
    compileRunId: compileRunIdRef.current,
  };
}
