/**
 * Experience Lab Render Runtime — owns execution, lifecycle, session, heartbeat.
 * World Compiler subscribes via RuntimeEventBus; never owns execution.
 */

import {
  computeRenderPipelineProgress,
  RENDER_PIPELINE_STALL_MS,
  resolveCreativePreviewRenderBinding,
  runExperienceLabValidationShellPipeline,
  type ValidationShellPipelineResult,
} from '../creative-studio-preview';
import {
  buildSceneGraph,
  buildPreviewCompileContext,
  diagnoseShellResolution,
  resolveMasterSceneBlueprint,
  shellIsMountReady,
  setValidationPreviewSession,
  setValidationRenderMode,
} from '../scene-stack';
import type { WorldCompilerStage } from '../scene-stack/world-compiler/constants';
import type { RuntimeEventType } from './runtime-events';
import { runtimeEventBus } from './runtime-event-bus';
import {
  getExperienceLabHeartbeatTick,
  startExperienceLabHeartbeat,
  stopExperienceLabHeartbeat,
  subscribeExperienceLabHeartbeat,
} from './runtime-heartbeat';
import { getSceneStackDriver } from './scene-stack-driver';
import type {
  ExperienceLabRuntimeSnapshot,
  ExperienceLabSessionKey,
  RenderPipelineRunMeta,
  RuntimeRenderStatus,
  ShellPipelinePhase,
} from './runtime-types';
import {
  beginCompileRun,
  createCompilerInstanceId,
  endCompileRun,
  isAutoRunDisabled,
  isLayer1Frozen,
  setLayer1RunContext,
  updateActiveShellId,
} from '../../studio-os/diagnostics/world-compiler-investigation';
import {
  clearActiveEphemeralCompileAuthorization,
} from '../creative-production/ephemeral-compile-auth-session';
import {
  beginAsyncBoundary,
  captureUiCompilerSyncSnapshot,
  endAsyncBoundary,
  logPipelineLifecycle,
  logPipelineOwnership,
  logStallThresholdReached,
  type StallEvidenceContext,
} from '../../studio-os/diagnostics/world-compiler-investigation/stall-evidence';

const WORLD_STAGE_EVENTS: Partial<Record<WorldCompilerStage, RuntimeEventType>> = {
  'load-shell': 'ShellLoaded',
  'mount-landmark': 'LandmarkGenerated',
  'mount-furniture': 'FurnitureGenerated',
  'apply-materials': 'MaterialsApplied',
  'calculate-lighting': 'LightingCalculated',
  'apply-atmosphere': 'AtmosphereApplied',
  'apply-motion': 'MotionApplied',
  'bake-reflections': 'ReflectionsBaked',
  'render-final-scene': 'RenderCompleted',
};

type SessionState = {
  key: ExperienceLabSessionKey;
  previewSessionId: string;
  compileRunId: string;
  shellPipelinePhase: ShellPipelinePhase;
  shellPipelineStage: ValidationShellPipelineResult['stage'];
  shellPipelineResult: ValidationShellPipelineResult | null;
  runAttempt: number;
  runStartedAt: number | null;
  lastStepChangeAt: number | null;
  renderStatus: RuntimeRenderStatus;
  currentStage: string | null;
  completedStages: string[];
  errors: string[];
  pipelineRunning: boolean;
  subscriberCount: number;
  heartbeatUnsub: (() => void) | null;
};

const sessions = new Map<string, SessionState>();
let validationModeRefCount = 0;

function buildPreviewSessionId(key: ExperienceLabSessionKey): string {
  return `${key.companyId}:${key.conceptId}:${key.departmentId}:${key.stationId}:${key.projectId}`;
}

function newCompileRunId(): string {
  return `run-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function bumpValidationMode(): void {
  validationModeRefCount += 1;
  if (validationModeRefCount === 1) {
    setValidationRenderMode('experience-lab-validation');
  }
}

function releaseValidationMode(): void {
  validationModeRefCount = Math.max(0, validationModeRefCount - 1);
  if (validationModeRefCount === 0) {
    setValidationRenderMode('production');
    setValidationPreviewSession(null);
  }
}

function sessionPreviewContext(session: SessionState): ReturnType<typeof buildPreviewCompileContext> {
  return buildPreviewCompileContext({
    previewSessionId: session.previewSessionId,
    departmentId: session.key.departmentId,
    projectId: session.key.projectId,
    stationId: session.key.stationId,
    conceptId: session.key.conceptId,
    companyId: session.key.companyId,
    compileRunId: session.compileRunId,
  });
}

function mapShellStageToPhase(stage: ValidationShellPipelineResult['stage']): ShellPipelinePhase {
  if (stage === 'compile-preview-spec') return 'compile-spec';
  if (stage === 'generate-shell') return 'generate-shell';
  if (stage === 'register-ephemeral') return 'register';
  return 'world-compile';
}

function publishRuntimeEvent(
  session: SessionState,
  type: RuntimeEventType,
  extra?: Partial<Pick<ExperienceLabRuntimeSnapshot, 'currentStage' | 'errors'>> & {
    detail?: string;
    errorCode?: string;
    progressPct?: number;
  }
): void {
  runtimeEventBus.publish({
    type,
    sessionId: session.previewSessionId,
    compileRunId: session.compileRunId,
    timestamp: Date.now(),
    stage: extra?.currentStage ?? session.currentStage ?? undefined,
    progressPct: extra?.progressPct,
    detail: extra?.detail,
    errorCode: extra?.errorCode,
  });
}

function sessionEvidenceCtx(session: SessionState, extra?: Partial<StallEvidenceContext>): StallEvidenceContext {
  return {
    previewSessionId: session.previewSessionId,
    compileRunId: session.compileRunId,
    stationId: session.key.stationId,
    projectId: session.key.projectId,
    conceptId: session.key.conceptId,
    companyId: session.key.companyId,
    pipelineRunning: session.pipelineRunning,
    currentCompilerStage: session.currentStage,
    ...extra,
  };
}

function recordUiCompilerEvidence(
  session: SessionState,
  snapshot: ExperienceLabRuntimeSnapshot,
  evidencePoint: string
): void {
  const compileStages = snapshot.compileReport?.stages?.map((s) => s.stage) ?? null;
  const sync = captureUiCompilerSyncSnapshot('experience-lab-render-runtime.buildSnapshot', {
    evidencePoint,
    previewSessionId: session.previewSessionId,
    compileRunId: session.compileRunId,
    sessionCurrentStage: session.currentStage,
    compileReportStages: compileStages,
    compileReportSuccess: snapshot.compileReport?.success ?? null,
    compileReportFailedStage: snapshot.compileReport?.failedStage ?? null,
    uiCurrentStepId: snapshot.renderPipelineProgress.currentStepId,
    lastCompletedStage: session.completedStages[session.completedStages.length - 1] ?? null,
    shellPipelinePhase: session.shellPipelinePhase,
    pipelineRunning: session.pipelineRunning,
    stepStallMs: snapshot.runMeta.stepStallMs,
    isStalled: snapshot.runMeta.isStalled,
    lastUiUpdateAt: Date.now(),
  });
  if (snapshot.runMeta.isStalled) {
    logStallThresholdReached('experience-lab-render-runtime.buildSnapshot', sessionEvidenceCtx(session, {
      currentUiStep: snapshot.renderPipelineProgress.currentStepId,
    }), {
      stepStallMs: snapshot.runMeta.stepStallMs,
      uiCurrentStepId: snapshot.renderPipelineProgress.currentStepId,
      syncSnapshot: sync,
    });
  }
}

function buildSnapshot(session: SessionState): ExperienceLabRuntimeSnapshot | null {
  const driver = getSceneStackDriver(session.key.departmentId, session.key.projectId);
  const binding = resolveCreativePreviewRenderBinding(session.key.companyId, session.key.conceptId);
  const stationId = session.key.stationId;

  const layers = driver?.getLayerViews(stationId) ?? [];
  const status = driver?.getCompositeStatus(stationId) ?? 'idle';
  const pipeline = driver?.getStationPipelineProgress(stationId) ?? {
    stationId,
    layersComplete: 0,
    layersTotal: 0,
    currentLayerId: null,
    currentLayerLabel: null,
    phase: 'idle' as const,
  };
  const blueprint = resolveMasterSceneBlueprint({
    departmentId: session.key.departmentId,
    projectId: session.key.projectId,
    stationId,
    workspaceId: session.key.workspaceId,
  });
  const sceneGraph =
    driver?.getStationSceneGraph(stationId) ??
    buildSceneGraph({
      blueprint,
      departmentId: session.key.departmentId,
      projectId: session.key.projectId,
      stationId,
      compositionMode: 'world-compiler',
    });
  const compileReport = driver?.getStationCompileReport(stationId) ?? null;

  const layerPipelineActive = driver?.isStationPipelineActive(stationId) ?? false;
  const ensureStationActive =
    session.shellPipelinePhase === 'ensure-station' ||
    (session.shellPipelinePhase === 'ready' && status === 'building');

  const renderPipelineProgress = computeRenderPipelineProgress({
    shellPhase:
      session.shellPipelinePhase === 'ensure-station' || session.shellPipelinePhase === 'world-compile'
        ? 'ready'
        : session.shellPipelinePhase === 'compile-spec'
          ? 'compile-spec'
          : session.shellPipelinePhase === 'generate-shell'
            ? 'generate-shell'
            : session.shellPipelinePhase === 'register'
              ? 'register'
              : session.shellPipelinePhase,
    shellStage: session.shellPipelineStage,
    ensureStationActive,
    layerPipelineActive,
    compileStages: compileReport?.stages,
    compileSuccess: compileReport?.success,
    compileFailedStage: compileReport?.failedStage ?? null,
    shellFailed: session.shellPipelinePhase === 'failed' || session.shellPipelineResult?.ok === false,
  });

  const elapsedMs = session.runStartedAt ? Date.now() - session.runStartedAt : 0;
  const stepStallMs = session.lastStepChangeAt ? Date.now() - session.lastStepChangeAt : 0;
  const isStalled =
    renderPipelineProgress.isRunning &&
    stepStallMs >= RENDER_PIPELINE_STALL_MS &&
    !renderPipelineProgress.isComplete;

  const runMeta: RenderPipelineRunMeta = {
    runAttempt: session.runAttempt,
    runStartedAt: session.runStartedAt,
    elapsedMs,
    lastStepChangeAt: session.lastStepChangeAt,
    stepStallMs,
    isStalled,
  };

  const previewContext = sessionPreviewContext(session);
  const shellDiagnostic = diagnoseShellResolution(session.key.departmentId, session.key.projectId, stationId, {
    previewCompileContext: previewContext,
  });

  const shellReady = shellIsMountReady(session.key.departmentId, session.key.projectId, stationId, {
    previewCompileContext: previewContext,
  });

  const isBuilding =
    renderPipelineProgress.isRunning || layerPipelineActive || status === 'building' || session.pipelineRunning;

  const snapshot: ExperienceLabRuntimeSnapshot = {
    sessionId: session.previewSessionId,
    compileRunId: session.compileRunId,
    binding,
    stationId,
    previewSessionId: session.previewSessionId,
    heartbeat: getExperienceLabHeartbeatTick(),
    shellPipelinePhase: session.shellPipelinePhase,
    shellPipelineStage: session.shellPipelineStage,
    shellPipelineResult: session.shellPipelineResult,
    renderPipelineProgress,
    runMeta,
    renderStatus: session.renderStatus,
    currentStage: session.currentStage,
    completedStages: [...session.completedStages],
    errors: [...session.errors],
    layers,
    status,
    pipeline,
    sceneGraph,
    compileReport,
    shellDiagnostic,
    shellReady,
    isBuilding,
    companyId: session.key.companyId,
    conceptId: session.key.conceptId,
  };

  if (
    session.shellPipelinePhase === 'world-compile' ||
    session.shellPipelinePhase === 'ensure-station' ||
    snapshot.runMeta.isStalled
  ) {
    recordUiCompilerEvidence(session, snapshot, session.shellPipelinePhase);
  }

  return snapshot;
}

function notifySnapshot(session: SessionState): void {
  const snapshot = buildSnapshot(session);
  if (snapshot) {
    runtimeEventBus.notifySnapshot(session.previewSessionId, snapshot);
    publishRuntimeEvent(session, 'ProgressUpdated', { progressPct: snapshot.renderPipelineProgress.progressPct });
  }
}

function ensureSessionState(key: ExperienceLabSessionKey): SessionState {
  const previewSessionId = buildPreviewSessionId(key);
  let session = sessions.get(previewSessionId);
  if (!session) {
    const initialCompileRunId = newCompileRunId();
    session = {
      key,
      previewSessionId,
      compileRunId: initialCompileRunId,
      shellPipelinePhase: 'idle',
      shellPipelineStage: 'compile-preview-spec',
      shellPipelineResult: null,
      runAttempt: 0,
      runStartedAt: null,
      lastStepChangeAt: null,
      renderStatus: 'idle',
      currentStage: null,
      completedStages: [],
      errors: [],
      pipelineRunning: false,
      subscriberCount: 0,
      heartbeatUnsub: null,
    };
    sessions.set(previewSessionId, session);
    const sessionCtx: StallEvidenceContext = {
      previewSessionId,
      compileRunId: initialCompileRunId,
      stationId: key.stationId,
      projectId: key.projectId,
      conceptId: key.conceptId,
      companyId: key.companyId,
    };
    logPipelineLifecycle('PREVIEW_SESSION_CREATED', 'experience-lab-render-runtime.ensureSessionState', sessionCtx);
    logPipelineLifecycle('COMPILE_RUN_CREATED', 'experience-lab-render-runtime.ensureSessionState', sessionCtx, {
      compileRunId: initialCompileRunId,
    });
    bumpValidationMode();
    setValidationPreviewSession(previewSessionId);
    startExperienceLabHeartbeat();
    session.heartbeatUnsub = subscribeExperienceLabHeartbeat(() => {
      notifySnapshot(session!);
    });
  }
  return session;
}

async function waitForSceneStackDriver(
  departmentId: string,
  projectId: string,
  timeoutMs = 15_000
): Promise<ReturnType<typeof getSceneStackDriver>> {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    const driver = getSceneStackDriver(departmentId, projectId);
    if (driver) return driver;
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  return null;
}

async function runFullPipeline(session: SessionState): Promise<void> {
  if (session.pipelineRunning) return;
  if (isLayer1Frozen()) return;

  const pipelineCtx = sessionEvidenceCtx(session, { compileOwner: 'runFullPipeline' });
  logPipelineLifecycle('RUN_FULL_PIPELINE_ENTERED', 'experience-lab-render-runtime.runFullPipeline', pipelineCtx);
  logPipelineOwnership('experience-lab-render-runtime.runFullPipeline', pipelineCtx, {
    trigger: isAutoRunDisabled() ? 'manual' : 'auto',
  });

  let pipelineEntered = false;
  try {
  pipelineEntered = true;
  const driverBoundary = beginAsyncBoundary('waitForSceneStackDriver', pipelineCtx);
  const driver = await waitForSceneStackDriver(session.key.departmentId, session.key.projectId);
  endAsyncBoundary(driverBoundary, driver ? 'resolved' : 'rejected', {
    resolvedCategory: driver ? 'driverReady' : 'driverMissing',
    rejectionMessage: driver ? undefined : 'Scene stack driver not registered',
  });

  if (!driver) {
    session.errors = ['Scene stack driver not registered — runtime provider required'];
    session.renderStatus = 'failed';
    session.shellPipelinePhase = 'failed';
    notifySnapshot(session);
    publishRuntimeEvent(session, 'RuntimeError', {
      errorCode: 'DRIVER_MISSING',
      detail: session.errors[0],
    });
    return;
  }

  session.pipelineRunning = true;
  logPipelineLifecycle('PIPELINE_RUNNING_SET_TRUE', 'experience-lab-render-runtime.runFullPipeline', sessionEvidenceCtx(session));
  session.compileRunId = newCompileRunId();
  logPipelineLifecycle('COMPILE_RUN_CREATED', 'experience-lab-render-runtime.runFullPipeline', sessionEvidenceCtx(session), {
    compileRunId: session.compileRunId,
  });
  const compilerInstanceId = createCompilerInstanceId();
  session.runAttempt += 1;
  session.runStartedAt = Date.now();
  session.lastStepChangeAt = Date.now();
  session.renderStatus = 'running';
  session.errors = [];
  session.completedStages = [];
  session.shellPipelinePhase = 'compile-spec';
  session.shellPipelineStage = 'compile-preview-spec';
  session.shellPipelineResult = null;

  beginCompileRun({
    compileRunId: session.compileRunId,
    compilerInstanceId,
    companyId: session.key.companyId,
    conceptId: session.key.conceptId,
    stationId: session.key.stationId,
    previewSessionId: session.previewSessionId,
    shellId: null,
    trigger: isAutoRunDisabled() ? 'manual' : 'auto',
    caller: 'experience-lab-render-runtime.runFullPipeline',
  });

  setLayer1RunContext({
    compileRunId: session.compileRunId,
    compilerInstanceId,
    stationId: session.key.stationId,
    shellId: null,
    companyId: session.key.companyId,
    conceptId: session.key.conceptId,
  });

  publishRuntimeEvent(session, 'RuntimeStarted', { currentStage: 'compile-preview-spec' });
  notifySnapshot(session);

  const shellBoundary = beginAsyncBoundary('runExperienceLabValidationShellPipeline', sessionEvidenceCtx(session));
  const shellResult = await runExperienceLabValidationShellPipeline({
    companyId: session.key.companyId,
    conceptId: session.key.conceptId,
    projectId: session.key.projectId,
    previewSessionId: session.previewSessionId,
    workspaceId: session.key.workspaceId,
    compileRunId: session.compileRunId,
    departmentId: session.key.departmentId,
    stationId: session.key.stationId,
    forceRegenerate: true,
    onStageChange: (stage) => {
      session.shellPipelineStage = stage;
      session.shellPipelinePhase = mapShellStageToPhase(stage);
      session.lastStepChangeAt = Date.now();
      session.currentStage = stage;
      notifySnapshot(session);
      publishRuntimeEvent(session, 'ProgressUpdated', { currentStage: stage });
      if (stage === 'register-ephemeral' || stage === 'complete') {
        publishRuntimeEvent(session, 'ShellLoaded', { currentStage: stage });
        session.completedStages.push('shell');
      }
    },
  });

  endAsyncBoundary(shellBoundary, shellResult.ok ? 'resolved' : 'rejected', {
    resolvedCategory: shellResult.ok ? 'shellPipelineOk' : 'shellPipelineFailed',
    rejectionMessage: shellResult.ok ? undefined : shellResult.errorDetail ?? 'Shell pipeline failed',
  });

  session.shellPipelineResult = shellResult;

  if (shellResult.ok && shellResult.shell?.shellId) {
    updateActiveShellId(shellResult.shell.shellId, 'experience-lab-render-runtime.shellPipeline');
    setLayer1RunContext({
      compileRunId: session.compileRunId,
      compilerInstanceId,
      stationId: session.key.stationId,
      shellId: shellResult.shell.shellId,
      companyId: session.key.companyId,
      conceptId: session.key.conceptId,
    });
  }

  if (!shellResult.ok) {
    session.shellPipelinePhase = 'failed';
    session.renderStatus = 'failed';
    session.errors = [shellResult.errorDetail ?? 'Shell pipeline failed'];
    session.pipelineRunning = false;
    logPipelineLifecycle('PIPELINE_RUNNING_CLEARED', 'experience-lab-render-runtime.runFullPipeline', sessionEvidenceCtx(session), {
      reason: 'shellPipelineFailed',
    });
    endCompileRun('failed', { failedStage: shellResult.stage, error: session.errors[0] });
    notifySnapshot(session);
    publishRuntimeEvent(session, 'RuntimeError', {
      errorCode: shellResult.errorCode,
      detail: shellResult.errorDetail,
    });
    return;
  }

  session.shellPipelinePhase = 'ensure-station';
  session.lastStepChangeAt = Date.now();
  driver.bump();
  notifySnapshot(session);

  const previewContext = sessionPreviewContext(session);

  const ensureBoundary = beginAsyncBoundary('runFullPipeline.ensureStation', sessionEvidenceCtx(session));
  try {
    await driver.ensureStation(session.key.stationId, {
      validationMode: true,
      skipEnvironmentShell: true,
      previewCompileContext: previewContext,
      investigation: {
        compileRunId: session.compileRunId,
        compilerInstanceId,
        renderId: session.runAttempt,
      },
    });
    endAsyncBoundary(ensureBoundary, 'resolved', { resolvedCategory: 'ensureStationComplete' });
  } catch (err) {
    endAsyncBoundary(ensureBoundary, 'rejected', {
      rejectionMessage: err instanceof Error ? err.message : String(err),
    });
    logPipelineLifecycle('RUN_FULL_PIPELINE_UNHANDLED_REJECTION', 'experience-lab-render-runtime.runFullPipeline', sessionEvidenceCtx(session), {
      phase: 'ensureStation',
      pipelineRunningAfter: session.pipelineRunning,
      error: err instanceof Error ? err.message : String(err),
    });
    throw err;
  }

  if (isLayer1Frozen()) {
    session.shellPipelinePhase = 'failed';
    session.renderStatus = 'failed';
    session.errors = ['Layer 1 (Signature Landmark™) generation failed — see COMPILE STOPPED panel'];
    session.pipelineRunning = false;
    logPipelineLifecycle('PIPELINE_RUNNING_CLEARED', 'experience-lab-render-runtime.runFullPipeline', sessionEvidenceCtx(session), {
      reason: 'layer1Frozen',
    });
    endCompileRun('failed', { failedStage: 'GENERATION_REQUEST_FAILED', error: session.errors[0] });
    notifySnapshot(session);
    return;
  }

  session.shellPipelinePhase = 'world-compile';
  session.lastStepChangeAt = Date.now();
  notifySnapshot(session);

  notifySnapshot(session);

  const compileBoundary = beginAsyncBoundary('runFullPipeline.compileStation', sessionEvidenceCtx(session));
  let compiled: Awaited<ReturnType<typeof driver.compileStation>>;
  try {
    compiled = await driver.compileStation(session.key.stationId, {
      validationMode: true,
      previewCompileContext: previewContext,
      investigation: {
        compileRunId: session.compileRunId,
        compilerInstanceId,
        renderId: session.runAttempt,
      },
      onStageComplete: (stage, success) => {
        session.currentStage = stage;
        session.lastStepChangeAt = Date.now();
        logPipelineLifecycle('ON_STAGE_COMPLETE_PUBLISHED', 'experience-lab-render-runtime.onStageComplete', sessionEvidenceCtx(session, {
          currentCompilerStage: stage,
        }), { stage, success });
        if (success) {
          session.completedStages.push(stage);
          const eventType = WORLD_STAGE_EVENTS[stage];
          if (eventType) publishRuntimeEvent(session, eventType, { currentStage: stage });
          if (stage === 'mount-landmark') {
            publishRuntimeEvent(session, 'ArchitectureGenerated', { currentStage: stage });
          }
        }
        notifySnapshot(session);
      },
    });
    endAsyncBoundary(compileBoundary, 'resolved', {
      resolvedCategory: compiled.report.success ? 'compileSuccess' : 'compileFailed',
    });
  } catch (err) {
    endAsyncBoundary(compileBoundary, 'rejected', {
      rejectionMessage: err instanceof Error ? err.message : String(err),
    });
    logPipelineLifecycle('RUN_FULL_PIPELINE_UNHANDLED_REJECTION', 'experience-lab-render-runtime.runFullPipeline', sessionEvidenceCtx(session), {
      phase: 'compileStation',
      pipelineRunningAfter: session.pipelineRunning,
      error: err instanceof Error ? err.message : String(err),
    });
    throw err;
  }

  if (!compiled.report.success) {
    driver.bump();
    session.shellPipelinePhase = 'failed';
    session.renderStatus = 'failed';
    session.errors = [compiled.report.failedStageDetail ?? 'World compile failed'];
    session.pipelineRunning = false;
    logPipelineLifecycle('PIPELINE_RUNNING_CLEARED', 'experience-lab-render-runtime.runFullPipeline', sessionEvidenceCtx(session), {
      reason: 'compileFailed',
    });
    endCompileRun('failed', {
      failedStage: compiled.report.failedStage ?? undefined,
      error: session.errors[0],
    });
    notifySnapshot(session);
    publishRuntimeEvent(session, 'RuntimeError', {
      errorCode: compiled.report.failedStageErrorCode ?? 'STAGE_FAILED',
      detail: compiled.report.failedStageDetail ?? undefined,
      currentStage: compiled.report.failedStage ?? undefined,
    });
    return;
  }

  session.shellPipelinePhase = 'ready';
  session.renderStatus = 'complete';
  session.currentStage = 'complete';
  session.pipelineRunning = false;
  logPipelineLifecycle('PIPELINE_RUNNING_CLEARED', 'experience-lab-render-runtime.runFullPipeline', sessionEvidenceCtx(session), {
    reason: 'success',
  });
  logPipelineLifecycle('RUN_FULL_PIPELINE_EXIT_SUCCESS', 'experience-lab-render-runtime.runFullPipeline', sessionEvidenceCtx(session));
  session.lastStepChangeAt = Date.now();
  endCompileRun('success');
  notifySnapshot(session);
  publishRuntimeEvent(session, 'RenderCompleted', { progressPct: 100 });
  } finally {
    if (pipelineEntered) {
      if (session.compileRunId) {
        clearActiveEphemeralCompileAuthorization(session.compileRunId);
      }
      logPipelineLifecycle('PIPELINE_FINALLY', 'experience-lab-render-runtime.runFullPipeline', sessionEvidenceCtx(session), {
        pipelineRunning: session.pipelineRunning,
        renderStatus: session.renderStatus,
        shellPipelinePhase: session.shellPipelinePhase,
      });
      if (!session.pipelineRunning) {
        logPipelineLifecycle('PIPELINE_OWNER_RELEASED', 'experience-lab-render-runtime.runFullPipeline', sessionEvidenceCtx(session), {
          compileRunId: session.compileRunId,
          previewSessionId: session.previewSessionId,
        });
      }
    }
  }
}

export function subscribeCompilerSession(
  key: ExperienceLabSessionKey,
  listener: (snapshot: ExperienceLabRuntimeSnapshot) => void
): () => void {
  const session = ensureSessionState(key);
  session.subscriberCount += 1;
  publishRuntimeEvent(session, 'CompilerSubscribed');

  const unsubSnapshot = runtimeEventBus.subscribeSession(session.previewSessionId, listener);
  const snapshot = buildSnapshot(session);
  if (snapshot) listener(snapshot);

  if (session.renderStatus === 'idle' && !session.pipelineRunning && !isAutoRunDisabled() && !isLayer1Frozen()) {
    void runFullPipeline(session);
  }

  return () => {
    session.subscriberCount = Math.max(0, session.subscriberCount - 1);
    publishRuntimeEvent(session, 'CompilerDetached');
    unsubSnapshot();
    // Runtime continues — heartbeat and session persist for reconnect.
  };
}

export function requestRuntimeRetry(key: ExperienceLabSessionKey): void {
  if (isLayer1Frozen()) return;
  const session = ensureSessionState(key);
  session.shellPipelinePhase = 'idle';
  session.shellPipelineResult = null;
  session.shellPipelineStage = 'compile-preview-spec';
  session.renderStatus = 'idle';
  session.pipelineRunning = false;
  void runFullPipeline(session);
}

export function requestRuntimeRegenerateLayer(
  key: ExperienceLabSessionKey,
  layerId: import('../scene-stack').SceneStackLayerId
): void {
  const driver = getSceneStackDriver(key.departmentId, key.projectId);
  if (!driver) return;
  const previewSessionId = buildPreviewSessionId(key);
  const session = sessions.get(previewSessionId);
  const previewCompileContext = session
    ? buildPreviewCompileContext({
        previewSessionId,
        departmentId: key.departmentId,
        projectId: key.projectId,
        stationId: key.stationId,
        conceptId: key.conceptId,
        companyId: key.companyId,
        compileRunId: session.compileRunId,
      })
    : undefined;
  void driver.regenerateLayer(key.stationId, layerId, {
    validationMode: true,
    previewCompileContext,
  });
}

export function getRuntimeSnapshot(key: ExperienceLabSessionKey): ExperienceLabRuntimeSnapshot | null {
  const previewSessionId = buildPreviewSessionId(key);
  const session = sessions.get(previewSessionId);
  if (!session) return null;
  return buildSnapshot(session);
}

export function isRuntimeSessionActive(key: ExperienceLabSessionKey): boolean {
  return sessions.has(buildPreviewSessionId(key));
}

export function getRuntimeSessionHeartbeat(key: ExperienceLabSessionKey): number {
  return sessions.has(buildPreviewSessionId(key)) ? getExperienceLabHeartbeatTick() : 0;
}

/** Diagnostics — active session ids (runtime-owned, survives compiler unmount). */
export function listActiveRuntimeSessions(): string[] {
  return Array.from(sessions.keys());
}

/** Test / teardown — release all sessions. Not called by World Compiler. */
export function resetExperienceLabRenderRuntimeForTests(): void {
  for (const session of sessions.values()) {
    session.heartbeatUnsub?.();
  }
  sessions.clear();
  while (validationModeRefCount > 0) {
    releaseValidationMode();
  }
  stopExperienceLabHeartbeat();
}
