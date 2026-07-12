import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('./diagnostic-mode', () => ({
  isWorldCompilerDiagnosticMode: vi.fn(() => true),
}));

vi.mock('./generate-shell-dispatch-desk', () => ({
  bindGenerateShellDispatchDeskContext: vi.fn(),
  buildGenerateShellDispatchDeskState: vi.fn(() => ({
    packageMicroTrace: { markers: [], currentMicroMarkerId: null, lastSuccessfulMicroMarkerId: null, packageRegistry: {}, microStallClassification: null, microStallClassificationDetail: null, lastStateTransition: null, lastStateTransitionAt: null },
    invocations: [],
    subStages: [],
    currentSubStageId: null,
    lastSuccessfulSubStageId: null,
    currentAwaitLabel: null,
    promiseForensic: null,
    authorization: {},
    fetch: {},
    stallClassification: null,
    stallClassificationDetail: null,
    elapsedMs: null,
    lastStateTransition: null,
    lastStateTransitionAt: null,
    duplicateCallDetected: false,
    duplicateCallExplanation: null,
  })),
  markGspuWrapperInvocation: vi.fn(),
  resetGenerateShellDispatchDesk: vi.fn(),
  restoreGenerateShellDispatchDeskFromSnapshot: vi.fn(),
}));

import {
  beginShellFoundationRun,
  buildShellFoundationBlackBoxState,
  clearShellFoundationBlackBox,
  recordShellStage,
  subscribeShellFoundationBlackBox,
} from './shell-foundation-black-box';
import {
  buildRecordShellStageForensicState,
  classifyRssStall,
  recordRssMicroMarker,
  resetRecordShellStageForensic,
  setRecordShellStageForensicTestOptions,
} from './record-shell-stage-forensic';

const RUN_CTX = {
  compileRunId: 'run-rss-test-001',
  previewSessionId: 'frontal-slayer:a:creative-direction:arrival:proj-1',
  companyId: 'frontal-slayer',
  conceptId: 'a' as const,
  departmentId: 'creative-direction',
  stationId: 'arrival',
  projectId: 'proj-1',
};

const memoryStore = new Map<string, string>();

describe('recordShellStage forensic instrumentation', () => {
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
    resetRecordShellStageForensic();
    setRecordShellStageForensicTestOptions({ skipSubscribers: false });
    beginShellFoundationRun(RUN_CTX);
  });

  afterEach(() => {
    clearShellFoundationBlackBox();
    setRecordShellStageForensicTestOptions({ skipSubscribers: false });
  });

  it('emits RSS markers for every recordShellStage statement', () => {
    recordShellStage('create-shell-request', 'running');

    const rss = buildRecordShellStageForensicState();
    expect(rss.recordShellStageReturned).toBe(true);
    expect(rss.markers.find((m) => m.markerId === 'RSS-01-enter')?.status).toBe('success');
    expect(rss.markers.find((m) => m.markerId === 'RSS-02-locate-stage-def')?.status).toBe('success');
    expect(rss.markers.find((m) => m.markerId === 'RSS-05-stages-set')?.status).toBe('success');
    expect(rss.markers.find((m) => m.markerId === 'RSS-09a2-json-stringify')?.status).toBe('success');
    expect(rss.markers.find((m) => m.markerId === 'RSS-10-return')?.status).toBe('success');
  });

  it('tracks reentrancy depth on nested recordShellStage', () => {
    let nested = false;
    subscribeShellFoundationBlackBox(() => {
      if (!nested) {
        nested = true;
        recordShellStage('generate-shell', 'running');
      }
    });
    recordShellStage('create-shell-request', 'running');

    const rss = buildRecordShellStageForensicState();
    expect(rss.recursionCount).toBeGreaterThan(0);
    expect(rss.reentrancyClassification).toBe('D-subscriber-induced-recursion');
  });

  it('measures subscriber callback duration', () => {
    subscribeShellFoundationBlackBox(() => {
      buildShellFoundationBlackBoxState();
    });
    recordShellStage('create-shell-request', 'running');

    const rss = buildRecordShellStageForensicState();
    expect(rss.subscribers.length).toBeGreaterThan(0);
    expect(rss.subscribers[0]?.callbackEntered).toBe(true);
    expect(rss.subscribers[0]?.durationMs).not.toBeNull();
  });

  it('identifies throwing subscriber', () => {
    const unsub = subscribeShellFoundationBlackBox(() => {
      throw new Error('subscriber blew up');
    });
    try {
      expect(() => recordShellStage('create-shell-request', 'running')).toThrow('subscriber blew up');
      const rss = buildRecordShellStageForensicState();
      expect(rss.subscribers[0]?.threw).toBe(true);
    } finally {
      unsub();
    }
  });

  it('records JSON serialization and storage write metrics', () => {
    recordShellStage('create-shell-request', 'running');
    const rss = buildRecordShellStageForensicState();
    expect(rss.persistence.serializationCompleted).toBe(true);
    expect(rss.persistence.storageWriteCompleted).toBe(true);
    expect(rss.persistence.payloadByteSize).toBeGreaterThan(0);
  });

  it('returns faster with subscribers skipped in test harness', () => {
    setRecordShellStageForensicTestOptions({ skipSubscribers: true });
    subscribeShellFoundationBlackBox(() => {
      throw new Error('should not run');
    });
    expect(() => recordShellStage('create-shell-request', 'running')).not.toThrow();
    const rss = buildRecordShellStageForensicState();
    expect(rss.markers.find((m) => m.markerId === 'RSS-09b-subscriber-notify')?.status).toBe('skipped');
  });

  it('classifies stall from unresolved RSS marker during notify', () => {
    recordRssMicroMarker('RSS-09b-subscriber-notify', 'running');
    const stall = classifyRssStall();
    expect(stall.classification).toBe('F-subscriber-notification');
  });

  it('persists RSS forensic in black box export', () => {
    recordShellStage('create-shell-request', 'running');
    const state = buildShellFoundationBlackBoxState();
    expect(state.recordShellStageForensic).toBeDefined();
    expect(state.recordShellStageForensic.lastSuccessfulMicroMarkerId).toBeTruthy();
  });
});
