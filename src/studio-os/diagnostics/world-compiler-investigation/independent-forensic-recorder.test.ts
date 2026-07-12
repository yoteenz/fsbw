import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('./diagnostic-mode', () => ({
  isWorldCompilerDiagnosticMode: vi.fn(() => true),
}));

import {
  __ifrTestFillBuffer,
  buildIndependentForensicRecorderState,
  bindIndependentForensicRecorderContext,
  exportIndependentForensicRecorderJson,
  markIndependentForensicRecorderPanelMounted,
  recordIfrAsyncFunctionCall,
  recordIfrCheckpoint,
  recordIfrFunctionCall,
  resetIndependentForensicRecorder,
} from './independent-forensic-recorder';
import {
  buildForensicReconciliationTable,
  findFirstMissingIfrEventAfterRecordedBefore,
  findLastProvenIfrEvent,
} from './independent-forensic-reconciliation';
import {
  bindRecordShellStageForensicContext,
  buildRecordShellStageForensicState,
  recordRssMicroMarker,
  resetRecordShellStageForensic,
} from './record-shell-stage-forensic';
import {
  bindGenerateShellPackageMicroTraceContext,
  buildGenerateShellPackageMicroTraceState,
  recordGspuMicroMarker,
  resetGenerateShellPackageMicroTrace,
} from './generate-shell-package-micro-trace';

const RUN = { compileRunId: 'ifr-run-001', surface: 'experience-lab-validation', stationId: 'arrival' };

describe('independent forensic recorder', () => {
  beforeEach(() => {
    resetIndependentForensicRecorder();
    resetRecordShellStageForensic();
    resetGenerateShellPackageMicroTrace();
    bindIndependentForensicRecorderContext(RUN);
    bindRecordShellStageForensicContext({ compileRunId: RUN.compileRunId });
    bindGenerateShellPackageMicroTraceContext({ ...RUN, invocationId: 'gspu-1', departmentId: 'creative-direction' });
    markIndependentForensicRecorderPanelMounted(false);
  });

  afterEach(() => {
    resetIndependentForensicRecorder();
    resetRecordShellStageForensic();
    resetGenerateShellPackageMicroTrace();
  });

  it('appends events in strict sequence', () => {
    recordIfrCheckpoint('IFR-01', 'before-statement', 'validation-shell-pipeline.ts', 'generateShellPublicUrl');
    recordIfrCheckpoint('IFR-02', 'after-statement', 'validation-shell-pipeline.ts', 'generateShellPublicUrl');
    const state = buildIndependentForensicRecorderState();
    expect(state.events.map((e) => e.sourceMarker)).toEqual(['IFR-01', 'IFR-02']);
    expect(state.events[0]!.sequenceNumber).toBe(1);
    expect(state.events[1]!.sequenceNumber).toBe(2);
  });

  it('keeps sequence numbers monotonic', () => {
    for (let i = 0; i < 5; i += 1) {
      recordIfrCheckpoint(`IFR-${i}`, 'explicit-checkpoint', 'test.ts', 'test');
    }
    const nums = buildIndependentForensicRecorderState().events.map((e) => e.sequenceNumber);
    for (let i = 1; i < nums.length; i += 1) {
      expect(nums[i]!).toBeGreaterThan(nums[i - 1]!);
    }
  });

  it('has no subscriber notification system', async () => {
    const mod = await import('./independent-forensic-recorder');
    expect('subscribeIndependentForensicRecorder' in mod).toBe(false);
    expect('notifyIndependentForensicRecorder' in mod).toBe(false);
    recordIfrCheckpoint('IFR-01', 'explicit-checkpoint', 'test.ts', 'test');
    expect(buildIndependentForensicRecorderState().eventCount).toBe(1);
  });

  it('does not call runtime state stores when recording', () => {
    recordIfrFunctionCall(() => 42, 'recordShellStage', 'shell-foundation-black-box.ts');
    const rss = buildRecordShellStageForensicState();
    const gspu = buildGenerateShellPackageMicroTraceState();
    expect(rss.markers.every((m) => m.status === 'pending')).toBe(true);
    expect(gspu.markers.every((m) => m.status === 'pending')).toBe(true);
  });

  it('does not await persistence on append', () => {
    recordIfrCheckpoint('IFR-01', 'explicit-checkpoint', 'test.ts', 'test');
    const state = buildIndependentForensicRecorderState();
    expect(state.eventCount).toBe(1);
    expect(['idle', 'pending', 'written']).toContain(state.persistenceStatus);
  });

  it('captures before/after function calls', () => {
    recordIfrFunctionCall(() => 'ok', 'recordShellStage', 'shell-foundation-black-box.ts');
    const types = buildIndependentForensicRecorderState().events.map((e) => e.eventType);
    expect(types).toContain('function-enter');
    expect(types).toContain('function-exit');
  });

  it('captures thrown exceptions', () => {
    expect(() =>
      recordIfrFunctionCall(() => {
        throw new Error('boom');
      }, 'requireDepartmentPackage', 'registry.ts')
    ).toThrow('boom');
    const ev = buildIndependentForensicRecorderState().events.find((e) => e.eventType === 'exception');
    expect(ev?.errorMessage).toBe('boom');
  });

  it('captures await resolution and rejection', async () => {
    await recordIfrAsyncFunctionCall(async () => 'resolved', 'requestStudioBuilderGenerate', 'api.ts');
    const resolved = buildIndependentForensicRecorderState();
    expect(resolved.events.some((e) => e.eventType === 'await-resolve')).toBe(true);

    resetIndependentForensicRecorder();
    bindIndependentForensicRecorderContext(RUN);
    await expect(
      recordIfrAsyncFunctionCall(async () => {
        throw new Error('reject');
      }, 'requestStudioBuilderGenerate', 'api.ts')
    ).rejects.toThrow('reject');
    const rejected = buildIndependentForensicRecorderState();
    expect(rejected.events.some((e) => e.eventType === 'await-reject')).toBe(true);
  });

  it('reproduces RSS/GSPU disagreement in reconciliation fixture', () => {
    recordIfrCheckpoint('IFR-01', 'before-statement', 'validation-shell-pipeline.ts', 'generateShellPublicUrl');
    recordIfrCheckpoint('IFR-02', 'after-statement', 'validation-shell-pipeline.ts', 'generateShellPublicUrl');
    recordRssMicroMarker('RSS-10-return', 'success', { resultSummary: 'returned' });
    recordGspuMicroMarker('GSPU-02a-before-record-shell-stage', 'running');
    recordGspuMicroMarker('GSPU-02b-after-record-shell-stage', 'pending');

    const table = buildForensicReconciliationTable({
      ifrEvents: buildIndependentForensicRecorderState().events,
      rssMarkers: buildRecordShellStageForensicState().markers,
      gspuMarkers: buildGenerateShellPackageMicroTraceState().markers,
    });
    const s02 = table.find((r) => r.sourceStep === 'S02');
    expect(s02?.independentRecorder).toBe('observed');
    expect(s02?.rss).toBe('observed');
    expect(s02?.gspu).toBe('stale');
    expect(s02?.note).toContain('IFR primary');
  });

  it('proves source execution despite stale store state', () => {
    recordIfrCheckpoint('IFR-01', 'before-statement', 'pipeline.ts', 'generateShellPublicUrl');
    recordIfrFunctionCall(() => undefined, 'recordShellStage', 'black-box.ts');
    recordIfrCheckpoint('IFR-02', 'after-statement', 'pipeline.ts', 'generateShellPublicUrl');
    recordGspuMicroMarker('GSPU-02b-after-record-shell-stage', 'pending');

    const last = findLastProvenIfrEvent(buildIndependentForensicRecorderState().events);
    expect(last?.sourceMarker).toBe('IFR-02');
    const gap = findFirstMissingIfrEventAfterRecordedBefore(buildIndependentForensicRecorderState().events);
    expect(gap?.missingAfter).toBe('IFR-03');
  });

  it('has deterministic bounded buffer behavior', () => {
    __ifrTestFillBuffer(2100);
    const state = buildIndependentForensicRecorderState();
    expect(state.eventCount).toBeLessThanOrEqual(state.maxEventCapacity);
    expect(state.droppedEventCount).toBeGreaterThan(0);
  });

  it('exposes dropped-event count', () => {
    __ifrTestFillBuffer(2050);
    expect(buildIndependentForensicRecorderState().droppedEventCount).toBeGreaterThan(0);
  });

  it('exports raw facts only without inferred stall cause', () => {
    recordIfrCheckpoint('IFR-01', 'before-statement', 'pipeline.ts', 'generateShellPublicUrl');
    const json = exportIndependentForensicRecorderJson();
    expect(json).toContain('IFR-01');
    expect(json).not.toMatch(/stallClassification|rootCause|inferred/i);
  });

  it('does not record secrets in safeDetail', () => {
    recordIfrCheckpoint('IFR-14', 'after-statement', 'pipeline.ts', 'auth', 'productionAuthorizationId=secret-token-abc');
    const detail = buildIndependentForensicRecorderState().events[0]!.safeDetail ?? '';
    expect(detail).not.toContain('secret-token-abc');
  });

  it('tracks panel mounted state', () => {
    markIndependentForensicRecorderPanelMounted(true);
    expect(buildIndependentForensicRecorderState().panelMounted).toBe(true);
    markIndependentForensicRecorderPanelMounted(false);
    expect(buildIndependentForensicRecorderState().panelMounted).toBe(false);
  });

  it('does not alter runtime result of wrapped function', () => {
    const value = recordIfrFunctionCall(() => ({ packageId: 'pkg-1' }), 'requireDepartmentPackage', 'registry.ts');
    expect(value).toEqual({ packageId: 'pkg-1' });
  });
});
