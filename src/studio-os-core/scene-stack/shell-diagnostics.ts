/**
 * Shell resolution diagnostics — Experience Lab / World Compiler failure evidence.
 */

import { getSceneStackLayerRecord } from './store';
import { resolveShellLockState } from './world-compiler/immutable-shell';
import {
  getValidationEnvironmentShell,
  verifyEphemeralShellMount,
} from './ephemeral-validation-registry';
import type { PreviewCompileContext } from './preview-compile-context';
import { isExperienceLabValidationRender } from './validation-render';

export type ShellRecoveryPhase =
  | 'none'
  | 'registration-started'
  | 'registration-complete'
  | 'lookup-verified'
  | 'mount-ready'
  | 'recovery-complete'
  | 'recovery-failed';

export type ShellResolutionDiagnostic = {
  departmentId: string;
  projectId: string;
  stationId: string;
  layerId: 'environment-shell';
  previewSessionId: string | null;
  requestedShellId: string;
  heroAssetId: string | null;
  productionGroupId: string | null;
  recordStatus: string | null;
  publicUrl: string | null;
  shellVersion: number;
  resolution: string;
  shellLocked: boolean;
  validationMode: boolean;
  authorizationMode: 'production' | 'experience-lab-validation';
  registryMode: 'local-scene-stack' | 'ephemeral-validation';
  recoveryPhase: ShellRecoveryPhase;
  failureReason: string | null;
  recoveryAction: string;
  sourceFunction: string;
  sourceFile: string;
};

export type ShellDiagnosticOptions = {
  validationMode?: boolean;
  previewSessionId?: string;
  previewCompileContext?: PreviewCompileContext;
};

function resolveDiagnosticContext(
  _departmentId: string,
  _projectId: string,
  _stationId: string,
  options?: ShellDiagnosticOptions
): {
  validationMode: boolean;
  previewSessionId: string | null;
  lockOptions: { validationMode: boolean; previewSessionId?: string };
  lookupOptions: { validationMode: boolean; previewSessionId?: string } | undefined;
} {
  const ctx = options?.previewCompileContext;
  const validationMode = ctx?.validationMode ?? options?.validationMode ?? isExperienceLabValidationRender();
  const previewSessionId = ctx?.previewSessionId ?? options?.previewSessionId ?? null;
  const lockOptions = {
    validationMode,
    ...(previewSessionId ? { previewSessionId } : {}),
  };
  const lookupOptions =
    validationMode && previewSessionId
      ? { validationMode: true, previewSessionId }
      : undefined;
  return { validationMode, previewSessionId, lockOptions, lookupOptions };
}

export function diagnoseShellResolution(
  departmentId: string,
  projectId: string,
  stationId: string,
  options?: ShellDiagnosticOptions
): ShellResolutionDiagnostic {
  const { validationMode, previewSessionId, lockOptions, lookupOptions } = resolveDiagnosticContext(
    departmentId,
    projectId,
    stationId,
    options
  );

  const ephemeralShell =
    validationMode && previewSessionId ? getValidationEnvironmentShell(previewSessionId) : null;

  const shell = getSceneStackLayerRecord(
    departmentId,
    projectId,
    stationId,
    'environment-shell',
    lookupOptions
  );
  const lock = resolveShellLockState(departmentId, projectId, stationId, lockOptions);
  const mountReady = Boolean(lock.shellUrl && lock.locked);

  let recoveryPhase: ShellRecoveryPhase = 'none';
  let failureReason: string | null = null;
  let recoveryAction = 'Run full render pipeline — generates environment shell from preview spec first.';

  if (validationMode && previewSessionId && ephemeralShell) {
    const verification = verifyEphemeralShellMount({
      previewSessionId,
      departmentId,
      projectId,
      stationId,
    });
    if (mountReady && lock.resolution === 'validation-draft') {
      recoveryPhase = 'recovery-complete';
      failureReason = null;
      recoveryAction = 'Ephemeral validation shell verified and mount-ready for this preview session.';
    } else if (verification.ok && verification.mountReady) {
      recoveryPhase = 'mount-ready';
      failureReason = null;
      recoveryAction = 'Shell lookup verified — mount-ready.';
    } else if (verification.ok) {
      recoveryPhase = 'lookup-verified';
      failureReason = verification.detail ?? 'Shell registered but not mount-ready.';
      recoveryAction = 'Shell registered — awaiting mount verification.';
    } else {
      recoveryPhase = 'recovery-failed';
      failureReason =
        verification.detail ??
        `Registration/lookup mismatch for preview ${previewSessionId}.`;
      recoveryAction = `Recovery failed: ${verification.errorCode ?? 'SHELL_RECOVERY_LOOKUP_MISMATCH'}.`;
    }
  } else if (lock.resolution === 'missing-record') {
    recoveryPhase = ephemeralShell ? 'recovery-failed' : 'none';
    failureReason = previewSessionId
      ? `No environment-shell layer record for preview ${previewSessionId} at this station.`
      : 'No environment-shell layer record for this station/project.';
    recoveryAction = 'Invoke ensureStation to generate environment-shell via Creative Studio layer stack.';
  } else if (lock.resolution === 'missing-url') {
    failureReason = shell?.publicUrl
      ? `Shell record exists (status: ${shell.status}) but World Compiler requires approved or validation draft_ready mount.`
      : 'environment-shell record exists without publicUrl — generation incomplete or failed.';
    recoveryAction = shell?.publicUrl
      ? 'Enable validation render mode or approve shell in Creative Direction Studio.'
      : 'Retry shell layer generation (Run full render pipeline).';
  } else if (!lock.shellUrl) {
    failureReason = 'resolveShellLockState returned no shellUrl.';
  } else if (mountReady) {
    recoveryPhase = lock.resolution === 'validation-draft' ? 'recovery-complete' : 'mount-ready';
    failureReason = null;
    recoveryAction =
      lock.resolution === 'validation-draft'
        ? 'Validation shell mount-ready.'
        : 'Production shell mount-ready.';
  }

  return {
    departmentId,
    projectId,
    stationId,
    layerId: 'environment-shell',
    previewSessionId,
    requestedShellId: `${departmentId}:${projectId}:${stationId}:environment-shell`,
    heroAssetId: shell?.heroAssetId ?? ephemeralShell?.shellPrompt.heroAssetId ?? null,
    productionGroupId: shell?.productionGroupId ?? ephemeralShell?.shellPrompt.productionGroupId ?? null,
    recordStatus: shell?.status ?? null,
    publicUrl: shell?.publicUrl ?? null,
    shellVersion: lock.shellVersion,
    resolution: lock.resolution,
    shellLocked: lock.locked,
    validationMode,
    authorizationMode: validationMode ? 'experience-lab-validation' : 'production',
    registryMode:
      validationMode && previewSessionId && ephemeralShell
        ? 'ephemeral-validation'
        : 'local-scene-stack',
    recoveryPhase,
    failureReason,
    recoveryAction,
    sourceFunction: 'resolveShellLockState',
    sourceFile: 'src/studio-os-core/scene-stack/world-compiler/immutable-shell.ts',
  };
}

export function shellIsMountReady(
  departmentId: string,
  projectId: string,
  stationId: string,
  options?: ShellDiagnosticOptions
): boolean {
  const { lockOptions } = resolveDiagnosticContext(departmentId, projectId, stationId, options);
  const lock = resolveShellLockState(departmentId, projectId, stationId, lockOptions);
  return Boolean(lock.shellUrl && lock.locked);
}
