import type { CanonLifecycleStatus, CanonVersionChangeRecord, ResidentCanonicalIdentity } from './types';

export const CANON_LIFECYCLE_STATUSES: readonly CanonLifecycleStatus[] = [
  'draft',
  'approved',
  'superseded',
  'archived',
] as const;

export function isValidCanonLifecycleStatus(value: string): value is CanonLifecycleStatus {
  return (CANON_LIFECYCLE_STATUSES as readonly string[]).includes(value);
}

export function appendCanonVersionChange(
  resident: ResidentCanonicalIdentity,
  change: Omit<CanonVersionChangeRecord, 'version'> & { version?: string }
): ResidentCanonicalIdentity {
  const nextVersion = change.version ?? bumpPatchVersion(resident.canonVersion);
  const record: CanonVersionChangeRecord = {
    version: nextVersion,
    status: change.status,
    changedAt: change.changedAt,
    changedBy: change.changedBy,
    approvedBy: change.approvedBy,
    reason: change.reason,
    previousVersion: change.previousVersion ?? resident.canonVersion,
    fieldsChanged: change.fieldsChanged,
  };

  return {
    ...resident,
    canonVersion: nextVersion,
    canonLifecycleStatus: change.status,
    versionHistory: [...resident.versionHistory, record],
    updatedAt: change.changedAt,
  };
}

function bumpPatchVersion(current: string): string {
  const match = /^v(\d+)\.(\d+)\.(\d+)$/.exec(current);
  if (!match) return `${current}-next`;
  const patch = Number(match[3]) + 1;
  return `v${match[1]}.${match[2]}.${patch}`;
}
