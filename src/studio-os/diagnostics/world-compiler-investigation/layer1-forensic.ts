/**
 * Layer 1 (Signature Landmark™) terminal failure forensics — diagnostic mode only.
 * Preserves FAILED_AT_LAYER_1 state; never clears on remount when frozen.
 */
import type { SceneStackLayerId } from '../../../studio-os-core/scene-stack/types';
import { emitStudioOsRuntimeEvent } from '../runtime-emit';
import { isWorldCompilerDiagnosticMode, shouldFreezeOnFirstFailure } from './diagnostic-mode';
import { logCompilerEvent } from './investigation-log';
import type { CompileStoppedSnapshot } from './types';

export const LAYER_1_ID: SceneStackLayerId = 'signature-landmark';
export const LAYER_1_DISPLAY = 'Signature Landmark™';

export type Layer1Transition =
  | 'LAYER_1_ENTERED'
  | 'LANDMARK_REQUEST_CREATED'
  | 'GENERATION_REQUEST_STARTED'
  | 'GENERATION_REQUEST_COMPLETED'
  | 'GENERATION_REQUEST_FAILED'
  | 'LANDMARK_VALIDATION_STARTED'
  | 'LANDMARK_VALIDATION_FAILED'
  | 'LANDMARK_MOUNT_FAILED'
  | 'LAYER_1_COMPLETED';

export type Layer1ForensicSnapshot = {
  state: 'FAILED_AT_LAYER_1';
  compileRunId: string;
  compilerInstanceId: string | null;
  stationId: string;
  shellId: string | null;
  companyId: string | null;
  conceptId: string | null;
  layerId: SceneStackLayerId;
  failedTransition: Layer1Transition;
  lastSuccessfulTransition: Layer1Transition | null;
  errorCode: string | null;
  errorMessage: string;
  stackTrace: string | null;
  failedFunction: string;
  failedFile: string;
  adapter: string;
  shellRemainedValid: boolean;
  requestInput: Record<string, unknown>;
  responseOutput: Record<string, unknown> | null;
  frozenAt: string;
};

const STORAGE_KEY = 'worldCompilerLayer1Forensic_v1';

let frozen: Layer1ForensicSnapshot | null = null;
let lastSuccessfulTransition: Layer1Transition | null = null;
let activeRunContext: {
  compileRunId: string;
  compilerInstanceId: string | null;
  stationId: string;
  shellId: string | null;
  companyId: string | null;
  conceptId: string | null;
} | null = null;

function persist(): void {
  if (!frozen) return;
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(frozen));
  } catch {
    /* quota */
  }
}

export function loadLayer1ForensicFromSession(): Layer1ForensicSnapshot | null {
  if (frozen) return frozen;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw) frozen = JSON.parse(raw) as Layer1ForensicSnapshot;
  } catch {
    /* ignore */
  }
  return frozen;
}

export function setLayer1RunContext(ctx: {
  compileRunId: string;
  compilerInstanceId: string | null;
  stationId: string;
  shellId: string | null;
  companyId: string | null;
  conceptId: string | null;
}): void {
  activeRunContext = ctx;
  lastSuccessfulTransition = null;
}

export function recordLayer1Transition(
  transition: Layer1Transition,
  detail?: Record<string, unknown>
): void {
  if (!isWorldCompilerDiagnosticMode()) return;

  const eventMap: Partial<Record<Layer1Transition, import('../types').FlightEventType>> = {
    LAYER_1_ENTERED: 'LAYER_1_ENTERED',
    LANDMARK_REQUEST_CREATED: 'LANDMARK_REQUEST_CREATED',
    GENERATION_REQUEST_STARTED: 'GENERATION_REQUEST_STARTED',
    GENERATION_REQUEST_COMPLETED: 'GENERATION_REQUEST_COMPLETED',
    GENERATION_REQUEST_FAILED: 'GENERATION_REQUEST_FAILED',
    LANDMARK_VALIDATION_STARTED: 'LANDMARK_VALIDATION_STARTED',
    LANDMARK_VALIDATION_FAILED: 'LANDMARK_VALIDATION_FAILED',
  };

  const flightType = eventMap[transition];
  if (flightType) {
    emitStudioOsRuntimeEvent(flightType, 'layer1-forensic', {
      transition,
      compileRunId: activeRunContext?.compileRunId,
      layerId: LAYER_1_ID,
      ...detail,
    });
  }

  logCompilerEvent(
    transition === 'GENERATION_REQUEST_FAILED' || transition === 'LANDMARK_VALIDATION_FAILED'
      ? 'COMPILE_FAILED'
      : 'COMPILE_STAGE_ENTER',
    'layer1-forensic',
    {
      stageName: transition,
      layerNumber: 1,
      detail: {
        compileRunId: activeRunContext?.compileRunId,
        ...detail,
      },
    }
  );

  if (
    transition !== 'GENERATION_REQUEST_FAILED' &&
    transition !== 'LANDMARK_VALIDATION_FAILED' &&
    transition !== 'LANDMARK_MOUNT_FAILED'
  ) {
    lastSuccessfulTransition = transition;
  }
}

export function freezeLayer1Failure(input: {
  failedTransition: Layer1Transition;
  errorCode: string | null;
  errorMessage: string;
  stackTrace?: string | null;
  failedFunction: string;
  failedFile: string;
  adapter: string;
  shellRemainedValid: boolean;
  requestInput: Record<string, unknown>;
  responseOutput: Record<string, unknown> | null;
}): Layer1ForensicSnapshot | null {
  if (!shouldFreezeOnFirstFailure() || !activeRunContext) return null;
  if (frozen?.state === 'FAILED_AT_LAYER_1') return frozen;

  frozen = {
    state: 'FAILED_AT_LAYER_1',
    compileRunId: activeRunContext.compileRunId,
    compilerInstanceId: activeRunContext.compilerInstanceId,
    stationId: activeRunContext.stationId,
    shellId: activeRunContext.shellId,
    companyId: activeRunContext.companyId,
    conceptId: activeRunContext.conceptId,
    layerId: LAYER_1_ID,
    failedTransition: input.failedTransition,
    lastSuccessfulTransition,
    errorCode: input.errorCode,
    errorMessage: input.errorMessage,
    stackTrace: input.stackTrace ?? null,
    failedFunction: input.failedFunction,
    failedFile: input.failedFile,
    adapter: input.adapter,
    shellRemainedValid: input.shellRemainedValid,
    requestInput: input.requestInput,
    responseOutput: input.responseOutput,
    frozenAt: new Date().toISOString(),
  };

  persist();

  emitStudioOsRuntimeEvent('COMPILER_TERMINATED', 'layer1-forensic', {
    state: frozen.state,
    compileRunId: frozen.compileRunId,
    failedTransition: frozen.failedTransition,
    errorCode: frozen.errorCode,
  });

  logCompilerEvent('COMPILE_STOPPED', 'layer1-forensic.freezeLayer1Failure', {
    detail: { ...frozen },
    stageName: input.failedTransition,
    layerNumber: 1,
  });

  return frozen;
}

export function getLayer1ForensicSnapshot(): Layer1ForensicSnapshot | null {
  return frozen ?? loadLayer1ForensicFromSession();
}

export function isLayer1Frozen(): boolean {
  return getLayer1ForensicSnapshot()?.state === 'FAILED_AT_LAYER_1';
}

export function layer1ForensicToCompileStopped(
  snap: Layer1ForensicSnapshot
): CompileStoppedSnapshot {
  return {
    compileRunId: snap.compileRunId,
    failedStage: snap.failedTransition,
    failedLayer: 1,
    error: snap.errorMessage,
    shellId: snap.shellId,
    lastSuccessfulEvent: snap.lastSuccessfulTransition,
    resetAttemptedBy: null,
    resetPrevented: true,
    frozenAt: snap.frozenAt,
    layer1Forensic: snap,
  };
}

export function formatLayer1DiagnosticsMarkdown(snap: Layer1ForensicSnapshot): string {
  return [
    '# Layer 1 Terminal Failure (FAILED_AT_LAYER_1)',
    '',
    `- compileRunId: ${snap.compileRunId}`,
    `- stationId: ${snap.stationId}`,
    `- shellId: ${snap.shellId ?? '—'}`,
    `- failedTransition: ${snap.failedTransition}`,
    `- errorCode: ${snap.errorCode ?? '—'}`,
    `- adapter: ${snap.adapter}`,
    `- shellRemainedValid: ${snap.shellRemainedValid}`,
    '',
    '## Request input',
    '```json',
    JSON.stringify(snap.requestInput, null, 2),
    '```',
    '',
    '## Response output',
    '```json',
    JSON.stringify(snap.responseOutput, null, 2),
    '```',
    '',
    snap.stackTrace ? `## Stack\n\`\`\`\n${snap.stackTrace}\n\`\`\`` : '',
  ].join('\n');
}

export function resetLayer1ForensicForTest(): void {
  frozen = null;
  activeRunContext = null;
  lastSuccessfulTransition = null;
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
