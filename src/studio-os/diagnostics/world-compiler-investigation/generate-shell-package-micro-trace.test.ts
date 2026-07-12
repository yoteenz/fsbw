import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('./diagnostic-mode', () => ({
  isWorldCompilerDiagnosticMode: vi.fn(() => true),
}));

import {
  beginGspuInvocation,
  bindGenerateShellDispatchDeskContext,
  buildGenerateShellDispatchDeskState,
  classifyGspuStall,
  markGspuWrapperInvocation,
  recordGspuSubStage,
  resetGenerateShellDispatchDesk,
} from './generate-shell-dispatch-desk';
import {
  bindGenerateShellPackageMicroTraceContext,
  buildGenerateShellPackageMicroTraceState,
  classifyGspuMicroStall,
  recordGspuMicroMarker,
  recordGspuPackageRegistryForensic,
  resetGenerateShellPackageMicroTrace,
} from './generate-shell-package-micro-trace';

const RUN = {
  compileRunId: 'run-micro-001',
  stationId: 'arrival',
  requestKey: 'shell-micro',
};

describe('generate shell package micro trace', () => {
  beforeEach(() => {
    resetGenerateShellDispatchDesk();
    resetGenerateShellPackageMicroTrace();
    bindGenerateShellDispatchDeskContext(RUN);
    bindGenerateShellPackageMicroTraceContext({ ...RUN, invocationId: 'gspu-1', departmentId: 'creative-direction' });
  });

  afterEach(() => {
    resetGenerateShellPackageMicroTrace();
    resetGenerateShellDispatchDesk();
  });

  it('emits before/after telemetry for GSPU-02 window statements', () => {
    const ids = [
      'GSPU-02a-before-record-shell-stage',
      'GSPU-02b-after-record-shell-stage',
      'GSPU-02c-before-gspu02-success',
      'GSPU-02d-after-gspu02-success',
      'GSPU-02e-before-gspu03-running',
      'GSPU-02f-after-gspu03-running',
    ] as const;

    for (const id of ids) {
      recordGspuMicroMarker(id, 'running');
      recordGspuMicroMarker(id, 'success');
    }

    const state = buildGenerateShellPackageMicroTraceState();
    for (const id of ids) {
      const marker = state.markers.find((m) => m.markerId === id);
      expect(marker?.status).toBe('success');
      expect(marker?.enteredAt).not.toBeNull();
      expect(marker?.completedAt).not.toBeNull();
    }
  });

  it('traces package key computation', () => {
    recordGspuMicroMarker('GSPU-03a-read-department-id', 'running');
    recordGspuPackageRegistryForensic({ actualPackageKey: 'creative-direction', expectedPackageKey: 'creative-direction' });
    recordGspuMicroMarker('GSPU-03a-read-department-id', 'success', { resultSummary: 'creative-direction' });

    const state = buildGenerateShellPackageMicroTraceState();
    expect(state.packageRegistry.actualPackageKey).toBe('creative-direction');
    expect(state.lastSuccessfulMicroMarkerId).toBe('GSPU-03a-read-department-id');
  });

  it('traces registry access and readiness', () => {
    recordGspuMicroMarker('GSPU-03b-before-registry-init', 'running');
    recordGspuPackageRegistryForensic({ registryReady: false, bootReady: false, initializationPromiseState: 'pending' });
    recordGspuMicroMarker('GSPU-03d-registry-ready-check', 'running');

    const stall = classifyGspuMicroStall();
    expect(stall.classification).toBe('D-registry-readiness-wait');
  });

  it('traces package lookup start and return', () => {
    recordGspuMicroMarker('GSPU-03e-before-package-lookup', 'running');
    recordGspuPackageRegistryForensic({ lookupStarted: true, keyPresent: true, registrySize: 12 });
    recordGspuMicroMarker('GSPU-03e-before-package-lookup', 'success');
    recordGspuMicroMarker('GSPU-03f-after-package-lookup', 'success', { resultSummary: 'pkg-creative-direction-golden-v1' });
    recordGspuPackageRegistryForensic({ lookupReturned: true, lookupResultType: 'DepartmentPackage' });

    const state = buildGenerateShellPackageMicroTraceState();
    expect(state.packageRegistry.lookupStarted).toBe(true);
    expect(state.packageRegistry.lookupReturned).toBe(true);
  });

  it('traces missing package validation failure', () => {
    recordGspuMicroMarker('GSPU-03g-package-validation', 'running');
    recordGspuMicroMarker('GSPU-03g-package-validation', 'failed', { errorDetail: 'DepartmentPackageNotRegisteredError' });

    const stall = classifyGspuMicroStall();
    expect(stall.classification).toBe('G-package-validation');
  });

  it('persists diagnostics after stall', () => {
    recordGspuMicroMarker('GSPU-02a-before-record-shell-stage', 'running');
    const snapshot = buildGenerateShellPackageMicroTraceState();
    expect(snapshot.currentMicroMarkerId).toBe('GSPU-02a-before-record-shell-stage');
    expect(snapshot.microStallClassification).toBeTruthy();
  });
});

describe('dispatch desk stall classifier correction', () => {
  beforeEach(() => {
    resetGenerateShellDispatchDesk();
    bindGenerateShellDispatchDeskContext(RUN);
    bindGenerateShellPackageMicroTraceContext(RUN);
  });

  afterEach(() => {
    resetGenerateShellDispatchDesk();
  });

  it('does not classify wrapper+body pair as duplicate collision', () => {
    markGspuWrapperInvocation({
      callerFunction: 'generateShellPublicUrl',
      callerFile: 'validation-shell-pipeline.ts',
    });
    beginGspuInvocation({
      callerFunction: 'generateShellPublicUrl',
      callerFile: 'validation-shell-pipeline.ts',
      source: 'function-body',
    });
    recordGspuSubStage('GSPU-02-stage-create-shell-request', 'running');

    const stall = classifyGspuStall();
    expect(stall.classification).not.toBe('J-duplicate-invocation-collision');
  });

  it('selects stall from last unresolved micro-marker', () => {
    recordGspuMicroMarker('GSPU-02a-before-record-shell-stage', 'running');
    recordGspuSubStage('GSPU-02-stage-create-shell-request', 'running');

    const stall = classifyGspuStall();
    expect(stall.detail).toContain('micro:GSPU-02a');
    expect(stall.classification).toBe('B-context-preparation-wait');

    const desk = buildGenerateShellDispatchDeskState();
    expect(desk.packageMicroTrace.currentMicroMarkerId).toBe('GSPU-02a-before-record-shell-stage');
  });
});
