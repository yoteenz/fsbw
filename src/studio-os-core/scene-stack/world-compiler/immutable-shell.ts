/**
 * Immutable Shell™ — approved environment shell is locked.
 * Never regenerated unless founder explicitly requests shell regen.
 */

import { getSceneStackLayerRecord } from '../store';
import type { SceneStackLayerId } from '../types';
import { isExperienceLabValidationRender } from '../validation-render';

export type ShellLockState = {
  locked: boolean;
  shellVersion: number;
  shellUrl: string | null;
  lockedAt: string | null;
  explicitRegenRequired: boolean;
  /** Diagnostic — why shell resolved this way */
  resolution: 'approved' | 'validation-draft' | 'missing-url' | 'missing-record';
  shellRecordStatus: string | null;
};

export function resolveShellLockState(
  departmentId: string,
  projectId: string,
  stationId: string,
  options?: { validationMode?: boolean }
): ShellLockState {
  const validationMode = options?.validationMode ?? isExperienceLabValidationRender();
  const shell = getSceneStackLayerRecord(departmentId, projectId, stationId, 'environment-shell');

  if (!shell) {
    return {
      locked: false,
      shellVersion: 0,
      shellUrl: null,
      lockedAt: null,
      explicitRegenRequired: false,
      resolution: 'missing-record',
      shellRecordStatus: null,
    };
  }

  if (!shell.publicUrl) {
    return {
      locked: false,
      shellVersion: shell.version,
      shellUrl: null,
      lockedAt: null,
      explicitRegenRequired: false,
      resolution: 'missing-url',
      shellRecordStatus: shell.status,
    };
  }

  if (shell.status === 'approved') {
    return {
      locked: true,
      shellVersion: shell.version,
      shellUrl: shell.publicUrl,
      lockedAt: shell.approvedAt ?? shell.generatedAt ?? null,
      explicitRegenRequired: false,
      resolution: 'approved',
      shellRecordStatus: shell.status,
    };
  }

  if (validationMode && shell.status === 'draft_ready') {
    return {
      locked: true,
      shellVersion: shell.version,
      shellUrl: shell.publicUrl,
      lockedAt: shell.generatedAt ?? null,
      explicitRegenRequired: false,
      resolution: 'validation-draft',
      shellRecordStatus: shell.status,
    };
  }

  return {
    locked: false,
    shellVersion: shell.version,
    shellUrl: shell.publicUrl,
    lockedAt: null,
    explicitRegenRequired: false,
    resolution: 'missing-url',
    shellRecordStatus: shell.status,
  };
}

/** Downstream layers must never trigger shell regen */
export function assertShellImmutableForLayer(
  targetLayerId: SceneStackLayerId,
  shellLock: ShellLockState
): { ok: true } | { ok: false; reason: string; code: string } {
  if (targetLayerId === 'environment-shell') return { ok: true };
  if (!shellLock.locked || !shellLock.shellUrl) {
    return {
      ok: false,
      code: 'SHELL_NOT_LOCKED',
      reason: `Environment Shell™ must be loaded before mounting ${targetLayerId}. Shell resolution: ${shellLock.resolution}${shellLock.shellRecordStatus ? ` (status: ${shellLock.shellRecordStatus})` : ''}.`,
    };
  }
  return { ok: true };
}
