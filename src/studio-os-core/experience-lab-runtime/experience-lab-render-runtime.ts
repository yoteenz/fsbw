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

  const shellDiagnostic = diagnoseShellResolution(session.key.departmentId, session.key.projectId, stationId, {
    validationMode: true,
  });

  const shellReady = shellIsMountReady(session.key.departmentId, session.key.projectId, stationId, {
    validationMode: true,
  });

  const isBuilding =
    renderPipelineProgress.isRunning || layerPipelineActive || status === 'building' || session.pipelineRunning;

  return {
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
    session = {
      key,
      previewSessionId,
      compileRunId: newCompileRunId(),
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

  const driver = await waitForSceneStackDriver(session.key.departmentId, session.key.projectId);
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
  session.compileRunId = newCompileRunId();
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

  const shellResult = await runExperienceLabValidationShellPipeline({
    companyId: session.key.companyId,
    conceptId: session.key.conceptId,
    projectId: session.key.projectId,
    previewSessionId: session.previewSessionId,
    workspaceId: session.key.workspaceId,
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

  await driver.ensureStation(session.key.stationId, {
    validationMode: true,
    skipEnvironmentShell: true,
    investigation: {
      compileRunId: session.compileRunId,
      compilerInstanceId,
      renderId: session.runAttempt,
    },
  });

  if (isLayer1Frozen()) {
    session.shellPipelinePhase = 'failed';
    session.renderStatus = 'failed';
    session.errors = ['Layer 1 (Signature Landmark™) generation failed — see COMPILE STOPPED panel'];
    session.pipelineRunning = false;
    endCompileRun('failed', { failedStage: 'GENERATION_REQUEST_FAILED', error: session.errors[0] });
    notifySnapshot(session);
    return;
  }

  session.shellPipelinePhase = 'world-compile';
  session.lastStepChangeAt = Date.now();
  notifySnapshot(session);

  const compiled = await driver.compileStation(session.key.stationId, {
    validationMode: true,
    investigation: {
      compileRunId: session.compileRunId,
      compilerInstanceId,
      renderId: session.runAttempt,
    },
    onStageComplete: (stage, success) => {
      session.currentStage = stage;
      session.lastStepChangeAt = Date.now();
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

  if (!compiled.report.success) {
    driver.bump();
    session.shellPipelinePhase = 'failed';
    session.renderStatus = 'failed';
    session.errors = [compiled.report.failedStageDetail ?? 'World compile failed'];
    session.pipelineRunning = false;
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
  session.lastStepChangeAt = Date.now();
  endCompileRun('success');
  notifySnapshot(session);
  publishRuntimeEvent(session, 'RenderCompleted', { progressPct: 100 });
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
  void driver.regenerateLayer(key.stationId, layerId);
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
