import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('./diagnostic-mode', () => ({
  isWorldCompilerDiagnosticMode: vi.fn(() => true),
}));

vi.mock('./generation-request-forensic', () => ({
  getLastGenerationRequestHttpForensic: vi.fn(() => null),
}));

import {
  beginShellFoundationRun,
  buildShellFoundationBlackBoxState,
  clearShellFoundationBlackBox,
  completeShellFoundationRun,
  endShellAwait,
  beginShellAwait,
  loadShellFoundationBlackBoxFromSession,
  recordShellError,
  recordShellFunctionEnter,
  recordShellFunctionExit,
  recordShellNetwork,
  recordShellStage,
  traceShellAsync,
} from './shell-foundation-black-box';

const RUN_CTX = {
  compileRunId: 'run-shell-test-001',
  previewSessionId: 'frontal-slayer:a:creative-direction:arrival:proj-1',
  companyId: 'frontal-slayer',
  conceptId: 'a' as const,
  departmentId: 'creative-direction',
  stationId: 'arrival',
  projectId: 'proj-1',
};

const memoryStore = new Map<string, string>();

describe('shell foundation black box', () => {
  beforeEach(() => {
    vi.stubGlobal('sessionStorage', {
      getItem: (key: string) => memoryStore.get(key) ?? null,
      setItem: (key: string, value: string) => {
        memoryStore.set(key, value);
      },
      removeItem: (key: string) => {
        memoryStore.delete(key);
      },
    });
    memoryStore.clear();
    clearShellFoundationBlackBox();
    beginShellFoundationRun(RUN_CTX);
  });

  afterEach(() => {
    clearShellFoundationBlackBox();
  });

  it('records every shell stage telemetry', () => {
    recordShellStage('initialize-shell', 'running');
    recordShellStage('initialize-shell', 'success');
    recordShellStage('compile-preview-spec', 'running');
    recordShellStage('compile-preview-spec', 'failed', { errorCode: 'PREVIEW_SPEC_COMPILE_FAILED' });

    const state = buildShellFoundationBlackBoxState();
    const init = state.stages.find((s) => s.id === 'initialize-shell');
    const spec = state.stages.find((s) => s.id === 'compile-preview-spec');
    expect(init?.status).toBe('success');
    expect(spec?.status).toBe('failed');
    expect(state.lastSuccessfulStageId).toBe('initialize-shell');
  });

  it('records function enter and exit', () => {
    recordShellFunctionEnter('runExperienceLabValidationShellPipeline', 'validation-shell-pipeline.ts');
    recordShellFunctionExit('runExperienceLabValidationShellPipeline', 'validation-shell-pipeline.ts');

    const state = buildShellFoundationBlackBoxState();
    expect(state.functionTraces.some((t) => t.status === 'entered')).toBe(true);
    expect(state.functionTraces.some((t) => t.status === 'exited')).toBe(true);
    expect(state.heartbeat.lastSuccessfulFunction).toBe('runExperienceLabValidationShellPipeline');
  });

  it('records await pending and resolved', () => {
    const id = beginShellAwait('generateShellPublicUrl', 'generateShellPublicUrl', 120_000);
    endShellAwait(id, 'resolved');

    const state = buildShellFoundationBlackBoxState();
    expect(state.awaitTracks.some((a) => a.state === 'resolved')).toBe(true);
    expect(state.heartbeat.lastCompletedAwait).toBe('generateShellPublicUrl');
  });

  it('records network failures', () => {
    recordShellNetwork({
      method: 'POST',
      route: '/api/admin/studio-builder-generate',
      status: 500,
      durationMs: 420,
      responseSize: 128,
      error: 'FUNCTION_INVOCATION_FAILED',
    });

    const state = buildShellFoundationBlackBoxState();
    expect(state.network).toHaveLength(1);
    expect(state.network[0]?.error).toContain('FUNCTION_INVOCATION_FAILED');
  });

  it('records thrown errors without swallowing', async () => {
    await expect(
      traceShellAsync(
        'compile-preview-spec',
        'buildEnvironmentShellRecipe',
        'validation-shell-pipeline.ts',
        async () => {
          throw new Error('recipe build failed');
        }
      )
    ).rejects.toThrow('recipe build failed');

    const state = buildShellFoundationBlackBoxState();
    expect(state.errors.some((e) => e.message.includes('recipe build failed'))).toBe(true);
    expect(state.functionTraces.some((t) => t.status === 'threw')).toBe(true);
  });

  it('detects stall signals for long pending awaits', () => {
    vi.useFakeTimers();
    const id = beginShellAwait('generateShellPublicUrl', 'generateShellPublicUrl', 5_000);
    vi.advanceTimersByTime(6_000);
    const state = buildShellFoundationBlackBoxState();
    expect(state.stallSignals.length).toBeGreaterThan(0);
    endShellAwait(id, 'resolved');
    vi.useRealTimers();
  });

  it('persists timeline after failure', () => {
    recordShellError({
      message: 'Shell generation failed',
      category: 'pipeline',
      sourceFile: 'validation-shell-pipeline.ts',
      functionName: 'runExperienceLabValidationShellPipeline',
    });
    completeShellFoundationRun(false, 'Shell generation failed');

    const state = buildShellFoundationBlackBoxState();
    expect(state.pipelineComplete).toBe(true);
    expect(state.pipelineOk).toBe(false);
    expect(state.timeline.length).toBeGreaterThan(0);
    expect(state.lastVisibleEvent).toBeTruthy();
  });

  it('survives session reload', () => {
    recordShellStage('generate-shell', 'running');
    recordShellStage('generate-shell', 'success');
    const before = buildShellFoundationBlackBoxState();
    expect(before.dispatchDesk).toBeDefined();
    const raw = sessionStorage.getItem('shellFoundationBlackBox_v1');
    expect(raw).toBeTruthy();
    clearShellFoundationBlackBox();
    expect(buildShellFoundationBlackBoxState().timeline.length).toBe(0);
    if (raw) sessionStorage.setItem('shellFoundationBlackBox_v1', raw);
    loadShellFoundationBlackBoxFromSession();
    const after = buildShellFoundationBlackBoxState();
    expect(after.runContext.compileRunId).toBe(before.runContext.compileRunId);
  });
});
