import { readStudioOsJson, writeStudioOsJson } from '../../../utils/studioOsBrowserStorage';
import type { AssetCandidateRecord } from './contract';
import { QUARANTINE_RETENTION_MS } from './contract';

const QUARANTINE_KEY = 'studioOsAssetQuarantine_v1';

type QuarantineStore = {
  records: QuarantinedAssetRecord[];
};

export type QuarantinedAssetRecord = AssetCandidateRecord & {
  quarantineId: string;
  rejectionReason: string;
  retainedUntil: string;
};

const EMPTY: QuarantineStore = { records: [] };

function uid(): string {
  return `quar-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function readStore(): QuarantineStore {
  const store = readStudioOsJson(QUARANTINE_KEY, () => EMPTY);
  return { records: pruneExpired(store.records) };
}

function pruneExpired(records: QuarantinedAssetRecord[]): QuarantinedAssetRecord[] {
  const now = Date.now();
  return records.filter((r) => new Date(r.retainedUntil).getTime() > now);
}

function writeStore(store: QuarantineStore): void {
  writeStudioOsJson(QUARANTINE_KEY, { records: pruneExpired(store.records) });
}

export function quarantineRejectedCandidate(input: {
  candidate: AssetCandidateRecord;
  rejectionReason: string;
  deniedReasons: string[];
}): QuarantinedAssetRecord {
  const quarantineId = uid();
  const record: QuarantinedAssetRecord = {
    ...input.candidate,
    quarantineId,
    registryState: 'quarantined',
    rejectionReason: input.rejectionReason,
    retainedUntil: new Date(Date.now() + QUARANTINE_RETENTION_MS).toISOString(),
    approvalStatus: 'denied',
    approvalReason: input.deniedReasons.join(' '),
    rejectedAt: new Date().toISOString(),
  };

  const store = readStore();
  writeStore({ records: [record, ...store.records].slice(0, 48) });
  return record;
}

export function listQuarantinedAssets(filter?: {
  stationId?: string;
  layerId?: string;
  compileRunId?: string | null;
}): QuarantinedAssetRecord[] {
  let records = readStore().records;
  if (filter?.stationId) records = records.filter((r) => r.stationId === filter.stationId);
  if (filter?.layerId) records = records.filter((r) => r.layerId === filter.layerId);
  if (filter?.compileRunId) records = records.filter((r) => r.compileRunId === filter.compileRunId);
  return records;
}

export function getQuarantinedAsset(quarantineId: string): QuarantinedAssetRecord | null {
  return readStore().records.find((r) => r.quarantineId === quarantineId) ?? null;
}

export function getLatestQuarantineForLayer(
  stationId: string,
  layerId: string
): QuarantinedAssetRecord | null {
  const records = listQuarantinedAssets({ stationId, layerId });
  return records[0] ?? null;
}
