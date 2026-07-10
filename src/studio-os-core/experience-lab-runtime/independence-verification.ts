/**
 * Evidence helpers — Experience Lab runs independently of World Compiler.
 */

import { buildSceneGraph, resolveMasterSceneBlueprint } from '../scene-stack';
import type { WorldCompilationReport } from '../scene-stack/world-compiler/compilation-report';
import { runtimeEventBus } from './runtime-event-bus';
import {
  getExperienceLabHeartbeatTick,
  isExperienceLabHeartbeatActive,
  resetExperienceLabHeartbeatForTests,
} from './runtime-heartbeat';
import {
  listActiveRuntimeSessions,
  resetExperienceLabRenderRuntimeForTests,
  subscribeCompilerSession,
} from './experience-lab-render-runtime';
import { registerSceneStackDriver } from './scene-stack-driver';
import type { ExperienceLabSessionKey } from './runtime-types';

export type IndependenceVerificationResult = {
  passed: boolean;
  checks: Array<{ id: string; passed: boolean; detail: string }>;
};

function registerMockDriver(key: ExperienceLabSessionKey): () => void {
  const blueprint = resolveMasterSceneBlueprint({
    departmentId: key.departmentId,
    projectId: key.projectId,
    stationId: key.stationId,
    workspaceId: key.workspaceId,
  });
  const graph = buildSceneGraph({
    blueprint,
    departmentId: key.departmentId,
    projectId: key.projectId,
    stationId: key.stationId,
    compositionMode: 'world-compiler',
  });

  const mockReport: WorldCompilationReport = {
    reportVersion: 'test',
    compiledAt: new Date().toISOString(),
    success: true,
    headline: 'Mock compile',
    shellLocked: false,
    stages: [],
    validation: { passed: true, sceneIntegrityPct: 100, issues: [] },
    sceneIntegrityPct: 100,
    renderReadinessPct: 100,
    failedStage: null,
    failedStageDetail: null,
    failedStageErrorCode: null,
    validationMode: true,
    shellDiagnostic: null,
    renderTimeMs: 0,
    objectCount: 0,
    componentPackageCount: 0,
    memoryEstimateMb: 0,
    generationCostEstimate: 0,
    lines: [],
  };

  return registerSceneStackDriver({
    departmentId: key.departmentId,
    projectId: key.projectId,
    ensureStation: async () => undefined,
    compileStation: async () => ({
      graph,
      report: mockReport,
      rejected: false,
    }),
    regenerateLayer: async () => true,
    getLayerViews: () => [],
    getCompositeStatus: () => 'ready',
    getStationPipelineProgress: () => ({
      stationId: key.stationId,
      layersComplete: 0,
      layersTotal: 0,
      currentLayerId: null,
      currentLayerLabel: null,
      phase: 'idle',
    }),
    getStationSceneGraph: () => graph,
    getStationCompileReport: () => null,
    isStationPipelineActive: () => false,
    bump: () => undefined,
  });
}

export function verifyRuntimeCompilerIndependence(
  sampleKey: ExperienceLabSessionKey
): IndependenceVerificationResult {
  const checks: IndependenceVerificationResult['checks'] = [];
  const previewSessionId = `${sampleKey.companyId}:${sampleKey.conceptId}:${sampleKey.departmentId}:${sampleKey.stationId}:${sampleKey.projectId}`;

  resetExperienceLabRenderRuntimeForTests();
  resetExperienceLabHeartbeatForTests();
  const unregister = registerMockDriver(sampleKey);

  let snapshotCount = 0;
  const unsub = subscribeCompilerSession(sampleKey, () => {
    snapshotCount += 1;
  });

  checks.push({
    id: 'session-created-by-runtime',
    passed: listActiveRuntimeSessions().includes(previewSessionId),
    detail: `active sessions: ${listActiveRuntimeSessions().join(', ')}`,
  });

  unsub();

  checks.push({
    id: 'compiler-detach-does-not-clear-session',
    passed: listActiveRuntimeSessions().includes(previewSessionId),
    detail: 'session persists after CompilerDetached',
  });

  checks.push({
    id: 'heartbeat-survives-compiler-unmount',
    passed: isExperienceLabHeartbeatActive() && getExperienceLabHeartbeatTick() >= 0,
    detail: `heartbeat active=${isExperienceLabHeartbeatActive()}`,
  });

  const compilerDetachedCount = runtimeEventBus
    .getRecentEvents(previewSessionId)
    .filter((e) => e.type === 'CompilerDetached').length;
  checks.push({
    id: 'compiler-detached-event-emitted',
    passed: compilerDetachedCount >= 1,
    detail: `CompilerDetached count=${compilerDetachedCount}`,
  });

  let reconnectSnapshots = 0;
  const resub = subscribeCompilerSession(sampleKey, () => {
    reconnectSnapshots += 1;
  });

  checks.push({
    id: 'compiler-reconnect-resumes-visualization',
    passed: reconnectSnapshots >= 1,
    detail: `reconnect snapshot deliveries=${reconnectSnapshots}`,
  });

  checks.push({
    id: 'initial-snapshot-delivered',
    passed: snapshotCount >= 1,
    detail: `initial snapshots=${snapshotCount}`,
  });

  resub();
  unregister();
  resetExperienceLabRenderRuntimeForTests();
  resetExperienceLabHeartbeatForTests();

  return {
    passed: checks.every((c) => c.passed),
    checks,
  };
}
