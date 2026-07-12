import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('./diagnostic-mode', () => ({
  isWorldCompilerDiagnosticMode: vi.fn(() => true),
}));

import {
  beginGspuInvocation,
  bindGenerateShellDispatchDeskContext,
  buildGenerateShellDispatchDeskState,
  classifyGspuStall,
  endGspuInvocation,
  markGspuWrapperInvocation,
  recordGspuAuthorization,
  recordGspuFetch,
  recordGspuSubStage,
  resetGenerateShellDispatchDesk,
  trackGspuInFlightRequest,
  __testGspuInFlightSize,
} from './generate-shell-dispatch-desk';

const RUN = {
  compileRunId: 'run-dispatch-001',
  stationId: 'arrival',
  requestKey: 'shell-test',
};

describe('generate shell dispatch desk', () => {
  beforeEach(() => {
    resetGenerateShellDispatchDesk();
    bindGenerateShellDispatchDeskContext(RUN);
  });

  afterEach(() => {
    resetGenerateShellDispatchDesk();
  });

  it('emits telemetry for every internal sub-stage', () => {
    const ids = [
      'GSPU-01-enter',
      'GSPU-02-stage-create-shell-request',
      'GSPU-03-resolve-package',
      'GSPU-04-build-payload',
      'GSPU-05-auth-attach',
      'GSPU-06-request-helper-enter',
    ] as const;

    for (const id of ids) {
      recordGspuSubStage(id, 'running');
      recordGspuSubStage(id, 'success');
    }

    const state = buildGenerateShellDispatchDeskState();
    for (const id of ids) {
      const stage = state.subStages.find((s) => s.subStageId === id);
      expect(stage?.status).toBe('success');
      expect(stage?.enteredAt).not.toBeNull();
      expect(stage?.completedAt).not.toBeNull();
    }
  });

  it('tracks awaits via currentAwaitLabel', () => {
    recordGspuSubStage('GSPU-07-token-ensure-enter', 'running');
    const state = buildGenerateShellDispatchDeskState();
    expect(state.currentAwaitLabel).toBeTruthy();
  });

  it('shows in-flight promise reuse', async () => {
    let resolveOuter!: (v: string) => void;
    const p = new Promise<string>((r) => {
      resolveOuter = r;
    });

    const first = trackGspuInFlightRequest('key-a', p, 'test');
    expect(first.reused).toBe(false);
    expect(__testGspuInFlightSize()).toBe(1);

    const second = trackGspuInFlightRequest('key-a', p, 'test');
    expect(second.reused).toBe(true);

    const state = buildGenerateShellDispatchDeskState();
    expect(state.promiseForensic?.reused).toBe(true);
    expect(state.promiseForensic?.promiseKey).toBe('key-a');

    resolveOuter('done');
    await p;
  });

  it('shows new promise creation', () => {
    const p = Promise.resolve('ok');
    trackGspuInFlightRequest('key-new', p, 'owner');
    const state = buildGenerateShellDispatchDeskState();
    expect(state.promiseForensic?.created).toBe(true);
    expect(state.promiseForensic?.reused).toBe(false);
  });

  it('records promise cleanup after settlement', async () => {
    await trackGspuInFlightRequest('key-clean', Promise.resolve(1), 'owner').promise;
    await new Promise((r) => setTimeout(r, 0));
    expect(__testGspuInFlightSize()).toBe(0);
  });

  it('records authorization wait visibility', () => {
    recordGspuAuthorization({
      tokenEnsureEntered: true,
      authorizationWaitDurationMs: 1200,
    });
    recordGspuSubStage('GSPU-08-token-get-first', 'running');

    const state = buildGenerateShellDispatchDeskState();
    expect(state.authorization.tokenEnsureEntered).toBe(true);
    expect(state.authorization.authorizationWaitDurationMs).toBe(1200);
    const stall = classifyGspuStall();
    expect(stall.classification).toBe('C-authorization-wait');
  });

  it('records request helper entry', () => {
    recordGspuFetch({ requestHelperEntered: true });
    recordGspuSubStage('GSPU-06-request-helper-enter', 'running');
    const state = buildGenerateShellDispatchDeskState();
    expect(state.fetch.requestHelperEntered).toBe(true);
  });

  it('records fetch start visibility', () => {
    recordGspuFetch({ fetchStarted: true, endpoint: '/api/admin/studio-builder-generate' });
    recordGspuSubStage('GSPU-15-fetch-started', 'running');
    const state = buildGenerateShellDispatchDeskState();
    expect(state.fetch.fetchStarted).toBe(true);
    expect(state.fetch.endpoint).toContain('studio-builder-generate');
  });

  it('records fetch rejection', () => {
    recordGspuFetch({ fetchRejected: true, fetchStarted: true });
    const state = buildGenerateShellDispatchDeskState();
    expect(state.fetch.fetchRejected).toBe(true);
  });

  it('records response parsing visibility', () => {
    recordGspuSubStage('GSPU-18-response-parse', 'running');
    recordGspuFetch({ responseBodyParseStarted: true });
    const stall = classifyGspuStall();
    expect(stall.classification).toBe('I-response-parsing-pending');
  });

  it('correlates duplicate wrapper and inner invocations', () => {
    const wrapId = markGspuWrapperInvocation({
      callerFunction: 'generateShellPublicUrl',
      callerFile: 'validation-shell-pipeline.ts',
      stageId: 'generate-shell',
    });
    const bodyId = beginGspuInvocation({
      callerFunction: 'generateShellPublicUrl',
      callerFile: 'validation-shell-pipeline.ts',
      source: 'function-body',
    });

    const state = buildGenerateShellDispatchDeskState();
    expect(state.invocations).toHaveLength(2);
    expect(state.invocations[1]?.parentInvocationId).toBe(wrapId);
    expect(state.invocations[1]?.invocationId).toBe(bodyId);
    expect(state.duplicateCallDetected).toBe(true);
    expect(state.duplicateCallExplanation).toContain('instrumentation only');

    const stall = classifyGspuStall();
    expect(stall.classification).not.toBe('J-duplicate-invocation-collision');
  });

  it('preserves parent child relationships', () => {
    const parent = beginGspuInvocation({
      callerFunction: 'traceShellAsync',
      callerFile: 'shell-foundation-black-box.ts',
      source: 'traceShellAsync-wrapper',
    });
    const child = beginGspuInvocation({
      callerFunction: 'generateShellPublicUrl',
      callerFile: 'validation-shell-pipeline.ts',
      source: 'function-body',
    });
    endGspuInvocation(child);
    endGspuInvocation(parent);

    const state = buildGenerateShellDispatchDeskState();
    const childRec = state.invocations.find((i) => i.invocationId === child);
    expect(childRec?.parentInvocationId).toBe(parent);
  });

  it('displays last successful sub-stage for panel consumers', () => {
    recordGspuSubStage('GSPU-04-build-payload', 'running');
    recordGspuSubStage('GSPU-04-build-payload', 'success');
    recordGspuSubStage('GSPU-05-auth-attach', 'running');

    const state = buildGenerateShellDispatchDeskState();
    expect(state.lastSuccessfulSubStageId).toBe('GSPU-04-build-payload');
    expect(state.currentSubStageId).toBe('GSPU-05-auth-attach');
  });

  it('classifies fetch-never-invoked when pre-fetch stalls', () => {
    recordGspuSubStage('GSPU-14-fetch-about-to-start', 'running');
    recordGspuFetch({ fetchAboutToStart: true, fetchStarted: false });
    const stall = classifyGspuStall();
    expect(stall.classification).toBe('G-fetch-never-invoked');
  });

  it('persists diagnostics after stall via black box snapshot shape', () => {
    recordGspuSubStage('GSPU-08-token-get-first', 'running');
    const snapshot = buildGenerateShellDispatchDeskState();
    expect(snapshot.subStages.some((s) => s.status === 'running')).toBe(true);
    expect(snapshot.stallClassification).toBeTruthy();
  });
});
