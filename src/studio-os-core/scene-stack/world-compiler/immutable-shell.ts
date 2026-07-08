/**
 * Immutable Shell™ — approved environment shell is locked.
 * Never regenerated unless founder explicitly requests shell regen.
 */

import { getSceneStackLayerRecord } from '../store';
import type { SceneStackLayerId } from '../types';

export type ShellLockState = {
  locked: boolean;
  shellVersion: number;
  shellUrl: string | null;
  lockedAt: string | null;
  explicitRegenRequired: boolean;
};

export function resolveShellLockState(
  departmentId: string,
  projectId: string,
  stationId: string
): ShellLockState {
  const shell = getSceneStackLayerRecord(departmentId, projectId, stationId, 'environment-shell');

  if (!shell?.publicUrl || shell.status !== 'approved') {
    return {
      locked: false,
      shellVersion: shell?.version ?? 0,
      shellUrl: shell?.publicUrl ?? null,
      lockedAt: null,
      explicitRegenRequired: false,
    };
  }

  return {
    locked: true,
    shellVersion: shell.version,
    shellUrl: shell.publicUrl,
    lockedAt: shell.approvedAt ?? shell.generatedAt ?? null,
    explicitRegenRequired: false,
  };
}

/** Downstream layers must never trigger shell regen */
export function assertShellImmutableForLayer(
  targetLayerId: SceneStackLayerId,
  shellLock: ShellLockState
): { ok: true } | { ok: false; reason: string } {
  if (targetLayerId === 'environment-shell') return { ok: true };
  if (!shellLock.locked) {
    return {
      ok: false,
      reason: 'Environment Shell™ must be approved and locked before mounting downstream components.',
    };
  }
  return { ok: true };
}
