/**
 * Contractor Directory micro-trace — GSPU-02→03 boundary forensics (compilerDiag=1 only).
 * Observe-only: does not change package resolution behavior.
 */
import { isWorldCompilerDiagnosticMode } from './diagnostic-mode';

export type GspuMicroMarkerId =
  | 'GSPU-02a-before-record-shell-stage'
  | 'GSPU-02b-after-record-shell-stage'
  | 'GSPU-02c-before-gspu02-success'
  | 'GSPU-02d-after-gspu02-success'
  | 'GSPU-02e-before-gspu03-running'
  | 'GSPU-02f-after-gspu03-running'
  | 'GSPU-03a-read-department-id'
  | 'GSPU-03b-before-registry-init'
  | 'GSPU-03c-after-registry-init'
  | 'GSPU-03d-registry-ready-check'
  | 'GSPU-03e-before-package-lookup'
  | 'GSPU-03f-after-package-lookup'
  | 'GSPU-03g-package-validation';

export type GspuMicroMarkerStatus = 'pending' | 'running' | 'success' | 'failed' | 'skipped';

export type GspuMicroMarkerRecord = {
  markerId: GspuMicroMarkerId;
  label: string;
  sourceLabel: string;
  enteredAt: number | null;
  completedAt: number | null;
  durationMs: number | null;
  status: GspuMicroMarkerStatus;
  compileRunId: string | null;
  invocationId: string | null;
  requestKey: string | null;
  stationId: string | null;
  companyId: string | null;
  departmentId: string | null;
  projectId: string | null;
  conceptId: string | null;
  surface: string | null;
  resultSummary: string | null;
  errorDetail: string | null;
};

export type GspuPackageRegistryForensic = {
  registryName: string;
  expectedPackageKey: string | null;
  actualPackageKey: string | null;
  matchingRegisteredKeys: string[];
  registrySize: number;
  keyPresent: boolean | null;
  registryReady: boolean | null;
  bootReady: boolean | null;
  packageReady: boolean | null;
  lookupStarted: boolean;
  lookupReturned: boolean;
  lookupDurationMs: number | null;
  lookupResultType: string | null;
  packageStatus: string | null;
  initializationPromiseState: 'none' | 'pending' | 'settled';
  lockState: string | null;
  lockOwner: string | null;
  lockAgeMs: number | null;
  waiterCount: number;
  initSettled: boolean | null;
};

export type GspuMicroStallClassification =
  | 'A-pre-package-context-read'
  | 'B-package-key-computation'
  | 'C-registry-access'
  | 'D-registry-readiness-wait'
  | 'E-package-lookup'
  | 'F-lazy-package-load'
  | 'G-package-validation'
  | 'H-lost-readiness-event'
  | 'I-circular-dependency-lock'
  | 'J-other';

export type GenerateShellPackageMicroTraceState = {
  markers: GspuMicroMarkerRecord[];
  currentMicroMarkerId: GspuMicroMarkerId | null;
  lastSuccessfulMicroMarkerId: GspuMicroMarkerId | null;
  packageRegistry: GspuPackageRegistryForensic;
  microStallClassification: GspuMicroStallClassification | null;
  microStallClassificationDetail: string | null;
  lastStateTransition: string | null;
  lastStateTransitionAt: number | null;
};

const MARKER_DEFS: ReadonlyArray<{ id: GspuMicroMarkerId; label: string; sourceLabel: string }> = [
  { id: 'GSPU-02a-before-record-shell-stage', label: 'Before recordShellStage(create-shell-request)', sourceLabel: 'validation-shell-pipeline.ts:recordShellStage' },
  { id: 'GSPU-02b-after-record-shell-stage', label: 'After recordShellStage(create-shell-request)', sourceLabel: 'validation-shell-pipeline.ts:recordShellStage' },
  { id: 'GSPU-02c-before-gspu02-success', label: 'Before GSPU-02 success marker', sourceLabel: 'validation-shell-pipeline.ts:try-entry' },
  { id: 'GSPU-02d-after-gspu02-success', label: 'After GSPU-02 success marker', sourceLabel: 'validation-shell-pipeline.ts:recordGspuSubStage' },
  { id: 'GSPU-02e-before-gspu03-running', label: 'Before GSPU-03 running marker', sourceLabel: 'validation-shell-pipeline.ts:pre-resolve-package' },
  { id: 'GSPU-02f-after-gspu03-running', label: 'After GSPU-03 running marker', sourceLabel: 'validation-shell-pipeline.ts:recordGspuSubStage' },
  { id: 'GSPU-03a-read-department-id', label: 'Read recipe.departmentId (package key)', sourceLabel: 'validation-shell-pipeline.ts:recipe.departmentId' },
  { id: 'GSPU-03b-before-registry-init', label: 'Before ensureDepartmentPackageRegistryInitialized', sourceLabel: 'department-package/initialize.ts' },
  { id: 'GSPU-03c-after-registry-init', label: 'After ensureDepartmentPackageRegistryInitialized', sourceLabel: 'department-package/initialize.ts' },
  { id: 'GSPU-03d-registry-ready-check', label: 'Registry readiness check', sourceLabel: 'department-package/initialize.ts:isReady' },
  { id: 'GSPU-03e-before-package-lookup', label: 'Before requireDepartmentPackage lookup', sourceLabel: 'department-package-registry.ts:loadDepartmentPackage' },
  { id: 'GSPU-03f-after-package-lookup', label: 'After requireDepartmentPackage lookup', sourceLabel: 'department-package-registry.ts:loadDepartmentPackage' },
  { id: 'GSPU-03g-package-validation', label: 'Package validation / throw if missing', sourceLabel: 'department-package-registry.ts:requireDepartmentPackage' },
];

let runContext: {
  compileRunId: string | null;
  invocationId: string | null;
  requestKey: string | null;
  stationId: string | null;
  companyId: string | null;
  departmentId: string | null;
  projectId: string | null;
  conceptId: string | null;
  surface: string | null;
} = {
  compileRunId: null,
  invocationId: null,
  requestKey: null,
  stationId: null,
  companyId: null,
  departmentId: null,
  projectId: null,
  conceptId: null,
  surface: 'experience-lab-validation',
};

let markers = new Map<GspuMicroMarkerId, GspuMicroMarkerRecord>();
let currentMicroMarkerId: GspuMicroMarkerId | null = null;
let lastSuccessfulMicroMarkerId: GspuMicroMarkerId | null = null;
let packageRegistry: GspuPackageRegistryForensic = defaultRegistryForensic();
let lastStateTransition: string | null = null;
let lastStateTransitionAt: number | null = null;
let lookupStartedAt: number | null = null;

function enabled(): boolean {
  return isWorldCompilerDiagnosticMode();
}

function defaultRegistryForensic(): GspuPackageRegistryForensic {
  return {
    registryName: 'DepartmentPackageRegistry',
    expectedPackageKey: null,
    actualPackageKey: null,
    matchingRegisteredKeys: [],
    registrySize: 0,
    keyPresent: null,
    registryReady: null,
    bootReady: null,
    packageReady: null,
    lookupStarted: false,
    lookupReturned: false,
    lookupDurationMs: null,
    lookupResultType: null,
    packageStatus: null,
    initializationPromiseState: 'none',
    lockState: null,
    lockOwner: null,
    lockAgeMs: null,
    waiterCount: 0,
    initSettled: null,
  };
}

function initMarkers(): void {
  markers = new Map(
    MARKER_DEFS.map((def) => [
      def.id,
      {
        markerId: def.id,
        label: def.label,
        sourceLabel: def.sourceLabel,
        enteredAt: null,
        completedAt: null,
        durationMs: null,
        status: 'pending',
        compileRunId: runContext.compileRunId,
        invocationId: runContext.invocationId,
        requestKey: runContext.requestKey,
        stationId: runContext.stationId,
        companyId: runContext.companyId,
        departmentId: runContext.departmentId,
        projectId: runContext.projectId,
        conceptId: runContext.conceptId,
        surface: runContext.surface,
        resultSummary: null,
        errorDetail: null,
      },
    ])
  );
}

function transition(label: string): void {
  lastStateTransition = label;
  lastStateTransitionAt = Date.now();
}

export function resetGenerateShellPackageMicroTrace(): void {
  initMarkers();
  currentMicroMarkerId = null;
  lastSuccessfulMicroMarkerId = null;
  packageRegistry = defaultRegistryForensic();
  lastStateTransition = null;
  lastStateTransitionAt = null;
  lookupStartedAt = null;
}

export function bindGenerateShellPackageMicroTraceContext(ctx: {
  compileRunId: string;
  invocationId?: string | null;
  requestKey?: string;
  stationId: string;
  companyId?: string;
  departmentId?: string;
  projectId?: string;
  conceptId?: string;
  surface?: string;
}): void {
  if (!enabled()) return;
  runContext = {
    compileRunId: ctx.compileRunId,
    invocationId: ctx.invocationId ?? null,
    requestKey: ctx.requestKey ?? null,
    stationId: ctx.stationId,
    companyId: ctx.companyId ?? null,
    departmentId: ctx.departmentId ?? null,
    projectId: ctx.projectId ?? null,
    conceptId: ctx.conceptId ?? null,
    surface: ctx.surface ?? 'experience-lab-validation',
  };
  resetGenerateShellPackageMicroTrace();
}

export function setGspuMicroTraceInvocationId(invocationId: string): void {
  if (!enabled()) return;
  runContext.invocationId = invocationId;
}

export function recordGspuMicroMarker(
  id: GspuMicroMarkerId,
  status: GspuMicroMarkerStatus,
  detail?: { resultSummary?: string; errorDetail?: string }
): void {
  if (!enabled()) return;
  const def = MARKER_DEFS.find((m) => m.id === id);
  const now = Date.now();
  const existing = markers.get(id) ?? {
    markerId: id,
    label: def?.label ?? id,
    sourceLabel: def?.sourceLabel ?? id,
    enteredAt: null,
    completedAt: null,
    durationMs: null,
    status: 'pending' as GspuMicroMarkerStatus,
    compileRunId: runContext.compileRunId,
    invocationId: runContext.invocationId,
    requestKey: runContext.requestKey,
    stationId: runContext.stationId,
    companyId: runContext.companyId,
    departmentId: runContext.departmentId,
    projectId: runContext.projectId,
    conceptId: runContext.conceptId,
    surface: runContext.surface,
    resultSummary: null,
    errorDetail: null,
  };

  if (status === 'running') {
    existing.status = 'running';
    existing.enteredAt = now;
    currentMicroMarkerId = id;
    if (id === 'GSPU-03e-before-package-lookup') lookupStartedAt = now;
  } else {
    existing.status = status;
    existing.completedAt = now;
    if (existing.enteredAt) existing.durationMs = now - existing.enteredAt;
    if (status === 'success') lastSuccessfulMicroMarkerId = id;
    if (currentMicroMarkerId === id) currentMicroMarkerId = null;
    if (id === 'GSPU-03f-after-package-lookup' && lookupStartedAt) {
      packageRegistry.lookupDurationMs = now - lookupStartedAt;
      packageRegistry.lookupReturned = true;
    }
  }

  if (detail?.resultSummary) existing.resultSummary = detail.resultSummary;
  if (detail?.errorDetail) existing.errorDetail = detail.errorDetail;
  existing.compileRunId = runContext.compileRunId;
  existing.invocationId = runContext.invocationId;
  markers.set(id, existing);
  transition(`${id} → ${status}`);
}

export function recordGspuPackageRegistryForensic(partial: Partial<GspuPackageRegistryForensic>): void {
  if (!enabled()) return;
  packageRegistry = { ...packageRegistry, ...partial };
  if (partial.lookupStarted) {
    packageRegistry.lookupStarted = true;
    lookupStartedAt = Date.now();
  }
  transition(`Registry forensic: ${Object.keys(partial).join(', ')}`);
}

export function classifyGspuMicroStall(): {
  classification: GspuMicroStallClassification;
  detail: string;
} {
  const running = [...markers.values()].filter((m) => m.status === 'running');
  const lastRunning = running[running.length - 1];
  const lastFailed = [...markers.values()].filter((m) => m.status === 'failed').pop();
  const id = lastRunning?.markerId ?? currentMicroMarkerId ?? lastFailed?.markerId;

  if (!id) {
    return { classification: 'J-other', detail: 'No running micro-marker' };
  }

  if (id === 'GSPU-03g-package-validation' && lastFailed?.status === 'failed') {
    return { classification: 'G-package-validation', detail: lastFailed.errorDetail ?? 'Package validation failed' };
  }

  if (id.startsWith('GSPU-02a') || id.startsWith('GSPU-02b') || id.startsWith('GSPU-02c') || id.startsWith('GSPU-02d')) {
    return { classification: 'A-pre-package-context-read', detail: `Stuck at ${id}: ${lastRunning?.label ?? ''}` };
  }
  if (id === 'GSPU-02e-before-gspu03-running' || id === 'GSPU-02f-after-gspu03-running' || id === 'GSPU-03a-read-department-id') {
    return { classification: 'B-package-key-computation', detail: `Stuck at ${id}` };
  }
  if (id === 'GSPU-03b-before-registry-init' || id === 'GSPU-03c-after-registry-init') {
    return { classification: 'C-registry-access', detail: `Stuck at ${id}` };
  }
  if (id === 'GSPU-03d-registry-ready-check' || packageRegistry.initializationPromiseState === 'pending') {
    return { classification: 'D-registry-readiness-wait', detail: `Registry ready=${packageRegistry.registryReady} boot=${packageRegistry.bootReady}` };
  }
  if (id === 'GSPU-03e-before-package-lookup' || id === 'GSPU-03f-after-package-lookup') {
    return { classification: 'E-package-lookup', detail: `Lookup started=${packageRegistry.lookupStarted} returned=${packageRegistry.lookupReturned}` };
  }
  if (id === 'GSPU-03g-package-validation') {
    return { classification: 'G-package-validation', detail: lastRunning?.errorDetail ?? 'Package validation' };
  }

  return { classification: 'J-other', detail: `Unhandled micro-marker ${id}` };
}

export function restoreGenerateShellPackageMicroTraceFromSnapshot(
  snapshot: GenerateShellPackageMicroTraceState
): void {
  if (!snapshot) return;
  markers = new Map((snapshot.markers ?? []).map((m) => [m.markerId, { ...m }]));
  for (const def of MARKER_DEFS) {
    if (!markers.has(def.id)) {
      markers.set(def.id, {
        markerId: def.id,
        label: def.label,
        sourceLabel: def.sourceLabel,
        enteredAt: null,
        completedAt: null,
        durationMs: null,
        status: 'pending',
        compileRunId: runContext.compileRunId,
        invocationId: runContext.invocationId,
        requestKey: runContext.requestKey,
        stationId: runContext.stationId,
        companyId: runContext.companyId,
        departmentId: runContext.departmentId,
        projectId: runContext.projectId,
        conceptId: runContext.conceptId,
        surface: runContext.surface,
        resultSummary: null,
        errorDetail: null,
      });
    }
  }
  currentMicroMarkerId = snapshot.currentMicroMarkerId;
  lastSuccessfulMicroMarkerId = snapshot.lastSuccessfulMicroMarkerId;
  packageRegistry = snapshot.packageRegistry ? { ...defaultRegistryForensic(), ...snapshot.packageRegistry } : defaultRegistryForensic();
  lastStateTransition = snapshot.lastStateTransition;
  lastStateTransitionAt = snapshot.lastStateTransitionAt;
}

export function buildGenerateShellPackageMicroTraceState(): GenerateShellPackageMicroTraceState {
  const hasRunning = [...markers.values()].some((m) => m.status === 'running');
  const microStall = classifyGspuMicroStall();

  return {
    markers: MARKER_DEFS.map((d) => markers.get(d.id)!).filter(Boolean),
    currentMicroMarkerId: hasRunning ? currentMicroMarkerId : null,
    lastSuccessfulMicroMarkerId,
    packageRegistry: { ...packageRegistry },
    microStallClassification: hasRunning ? microStall.classification : null,
    microStallClassificationDetail: hasRunning ? microStall.detail : null,
    lastStateTransition,
    lastStateTransitionAt,
  };
}

/** Known wrapper+body pair — not a stall cause. */
export function isKnownInstrumentationWrapperPair(input: {
  wrapperActive: boolean;
  bodyActive: boolean;
  parentLinked: boolean;
}): boolean {
  return input.wrapperActive && input.bodyActive && input.parentLinked;
}
