/**
 * Shell resolution diagnostics — Experience Lab / World Compiler failure evidence.
 */

import { getSceneStackLayerRecord } from './store';
import { resolveShellLockState } from './world-compiler/immutable-shell';
import { getValidationEnvironmentShell } from './ephemeral-validation-registry';
import { getValidationPreviewSession, isExperienceLabValidationRender } from './validation-render';

export type ShellResolutionDiagnostic = {
  departmentId: string;
  projectId: string;
  stationId: string;
  layerId: 'environment-shell';
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
  failureReason: string | null;
  recoveryAction: string;
  sourceFunction: string;
  sourceFile: string;
};

export function diagnoseShellResolution(
  departmentId: string,
  projectId: string,
  stationId: string,
  options?: { validationMode?: boolean }
): ShellResolutionDiagnostic {
  const validationMode = options?.validationMode ?? isExperienceLabValidationRender();
  const previewSessionId = getValidationPreviewSession();
  const ephemeralShell =
    validationMode && previewSessionId
      ? getValidationEnvironmentShell(previewSessionId)
      : null;

  const shell = getSceneStackLayerRecord(departmentId, projectId, stationId, 'environment-shell');
  const lock = resolveShellLockState(departmentId, projectId, stationId, { validationMode });

  let failureReason: string | null = null;
  let recoveryAction = 'Run full render pipeline — generates environment shell from preview spec first.';

  if (ephemeralShell) {
    failureReason = null;
    recoveryAction = 'Ephemeral validation shell registered for this preview session.';
  } else if (lock.resolution === 'missing-record') {
    failureReason = 'No environment-shell layer record for this station/project.';
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
  }

  return {
    departmentId,
    projectId,
    stationId,
    layerId: 'environment-shell',
    requestedShellId: `${departmentId}:${projectId}:${stationId}:environment-shell`,
    heroAssetId: shell?.heroAssetId ?? null,
    productionGroupId: shell?.productionGroupId ?? null,
    recordStatus: shell?.status ?? null,
    publicUrl: shell?.publicUrl ?? null,
    shellVersion: lock.shellVersion,
    resolution: lock.resolution,
    shellLocked: lock.locked,
    validationMode,
    authorizationMode: validationMode ? 'experience-lab-validation' : 'production',
    registryMode: ephemeralShell ? 'ephemeral-validation' : 'local-scene-stack',
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
  options?: { validationMode?: boolean }
): boolean {
  const lock = resolveShellLockState(departmentId, projectId, stationId, options);
  return Boolean(lock.shellUrl && lock.locked);
}
