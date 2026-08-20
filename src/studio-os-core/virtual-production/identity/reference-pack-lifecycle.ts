/**
 * Reference Pack V1 lifecycle — assign, QC, approve, reject, lock (immutable V1).
 */

import {
  REFERENCE_PACK_V1_SLOTS,
  type ReferencePackSlot,
} from '../canon/frontal-slayer-canon';
import type {
  IdentityQcEntry,
  PrimaryIdentityAnchor,
  ReferencePackCandidate,
  ReferencePackLockRecord,
  ReferencePackSlotRecord,
  ReferencePackSlotStates,
} from './types';
import {
  applyLockToSlotStates,
  packReadyToLock,
} from './reference-pack-v1';

export class ReferencePackImmutableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ReferencePackImmutableError';
  }
}

export function assignCandidateToSlot(
  states: ReferencePackSlotStates,
  slot: ReferencePackSlot,
  input: { assetId: string; mediaUrl?: string; operator?: string }
): ReferencePackSlotStates {
  assertPackMutable(states);
  const prev = states[slot] ?? { state: 'missing' };
  return {
    ...states,
    [slot]: {
      ...prev,
      state: 'candidate',
      candidateAssetId: input.assetId,
      candidateMediaUrl: input.mediaUrl,
      updatedAt: new Date().toISOString(),
      updatedBy: input.operator,
    },
  };
}

export function submitSlotForQc(
  states: ReferencePackSlotStates,
  slot: ReferencePackSlot,
  qc: IdentityQcEntry[],
  operator?: string
): ReferencePackSlotStates {
  assertPackMutable(states);
  const prev = states[slot];
  if (!prev?.candidateAssetId && !prev?.approvedAssetId) {
    throw new Error(`Slot ${slot} has no candidate to QC`);
  }
  return {
    ...states,
    [slot]: {
      ...prev,
      state: 'qc_required',
      qc,
      updatedAt: new Date().toISOString(),
      updatedBy: operator,
    },
  };
}

export function approveReferenceSlot(
  states: ReferencePackSlotStates,
  slot: ReferencePackSlot,
  input: { assetId: string; mediaUrl?: string; qc: IdentityQcEntry[]; operator?: string }
): ReferencePackSlotStates {
  assertPackMutable(states);
  return {
    ...states,
    [slot]: {
      state: 'approved',
      approvedAssetId: input.assetId,
      approvedMediaUrl: input.mediaUrl,
      candidateAssetId: undefined,
      candidateMediaUrl: undefined,
      qc: input.qc,
      updatedAt: new Date().toISOString(),
      updatedBy: input.operator,
    },
  };
}

export function rejectReferenceSlot(
  states: ReferencePackSlotStates,
  slot: ReferencePackSlot,
  input: {
    candidateAssetId: string;
    reason: string;
    qc: IdentityQcEntry[];
    operator?: string;
  }
): ReferencePackSlotStates {
  assertPackMutable(states);
  const prev = states[slot] ?? { state: 'missing' };
  const rejected = [...(prev.rejectedCandidateIds ?? [])];
  if (!rejected.includes(input.candidateAssetId)) {
    rejected.push(input.candidateAssetId);
  }
  return {
    ...states,
    [slot]: {
      ...prev,
      state: prev.approvedAssetId ? 'approved' : 'rejected',
      candidateAssetId: undefined,
      candidateMediaUrl: undefined,
      rejectedCandidateIds: rejected,
      qc: input.qc,
      notes: input.reason,
      updatedAt: new Date().toISOString(),
      updatedBy: input.operator,
    },
  };
}

export function designatePrimaryAnchor(input: {
  assetId: string;
  mediaUrl?: string;
  source: string;
  providerId: string;
  modelId?: string;
  referenceLineage?: unknown[];
  operator?: string;
}): PrimaryIdentityAnchor {
  return {
    assetId: input.assetId,
    mediaUrl: input.mediaUrl,
    source: input.source,
    providerId: input.providerId,
    modelId: input.modelId,
    referenceLineage: input.referenceLineage ?? [],
    approvalStatus: 'approved',
    notes: 'Primary identity anchor — strongest canonical Nia reference',
    designatedAt: new Date().toISOString(),
    designatedBy: input.operator,
  };
}

export function lockReferencePackV1(input: {
  packKey: string;
  version: number;
  slotStates: ReferencePackSlotStates;
  primaryAnchorAssetId: string;
  operator: string;
}): { lockedStates: ReferencePackSlotStates; lockRecord: ReferencePackLockRecord } {
  if (input.version !== 1) {
    throw new Error('Only Reference Pack V1 can be locked via this path; create V2 for changes');
  }
  if (isPackLocked(input.slotStates)) {
    throw new ReferencePackImmutableError('Reference Pack V1 is already locked');
  }
  if (!packReadyToLock(input.slotStates, Boolean(input.primaryAnchorAssetId))) {
    throw new Error('All 13 slots must be approved and primary anchor set before lock');
  }

  const lockedStates = applyLockToSlotStates(input.slotStates);
  const slotAssetIds: Partial<Record<ReferencePackSlot, string>> = {};
  for (const slot of REFERENCE_PACK_V1_SLOTS) {
    const id = lockedStates[slot]?.approvedAssetId;
    if (id) slotAssetIds[slot] = id;
  }

  return {
    lockedStates,
    lockRecord: {
      packKey: input.packKey,
      version: input.version,
      lockedAt: new Date().toISOString(),
      lockedBy: input.operator,
      primaryAnchorAssetId: input.primaryAnchorAssetId,
      slotAssetIds,
      immutable: true,
    },
  };
}

export function createReferencePackV2SeedFromLockedV1(input: {
  lockedV1States: ReferencePackSlotStates;
  operator: string;
}): ReferencePackSlotStates {
  if (!isPackLocked(input.lockedV1States)) {
    throw new Error('V2 seed requires locked V1');
  }
  const next = buildFreshV2States();
  // V2 starts empty — lineage copied in metadata at service layer
  return next;
}

function buildFreshV2States(): ReferencePackSlotStates {
  const states = {} as ReferencePackSlotStates;
  for (const slot of REFERENCE_PACK_V1_SLOTS) {
    states[slot] = { state: 'missing' };
  }
  return states;
}

export function isPackLocked(states: ReferencePackSlotStates): boolean {
  return REFERENCE_PACK_V1_SLOTS.some((s) => states[s]?.state === 'locked');
}

export function assertPackMutable(states: ReferencePackSlotStates): void {
  if (isPackLocked(states)) {
    throw new ReferencePackImmutableError(
      'Reference Pack V1 is locked — create Reference Pack V2 for changes'
    );
  }
}

export function buildCandidateRecord(input: Omit<ReferencePackCandidate, 'id' | 'createdAt' | 'updatedAt'>): ReferencePackCandidate {
  const ts = new Date().toISOString();
  return {
    ...input,
    id: `candidate-${input.slotKey}-${Date.now()}`,
    createdAt: ts,
    updatedAt: ts,
  };
}

export function slotRecordSummary(rec: ReferencePackSlotRecord | undefined): string {
  return rec?.state?.toUpperCase() ?? 'MISSING';
}
