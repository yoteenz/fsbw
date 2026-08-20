/**
 * Repair workflow — preserve original, produce replacement, supersede without destruction.
 */

import type {
  VirtualProductionGenerationAsset,
  VirtualProductionRepair,
  VirtualProductionShot,
} from './types';
import { canTransitionApproval } from './workflows';

export type RepairCreationInput = {
  orgId: string;
  campaignId: string;
  shotId: string;
  originalAssetId: string;
  reason: string;
  providerId?: string;
  modelId?: string;
};

export function createRepairRecord(input: RepairCreationInput): Omit<VirtualProductionRepair, 'id'> {
  return {
    orgId: input.orgId,
    campaignId: input.campaignId,
    shotId: input.shotId,
    originalAssetId: input.originalAssetId,
    status: 'open',
    reason: input.reason,
    metadata: {
      requestedProviderId: input.providerId,
      requestedModelId: input.modelId,
      createdReason: 'qc_failure',
    },
  };
}

export function applyRepairSupersession(
  originalAsset: VirtualProductionGenerationAsset,
  replacementAsset: VirtualProductionGenerationAsset,
  shot: VirtualProductionShot
): {
  originalAsset: VirtualProductionGenerationAsset;
  replacementAsset: VirtualProductionGenerationAsset;
  shot: VirtualProductionShot;
} {
  if (!canTransitionApproval(originalAsset.approvalState, 'superseded')) {
    throw new Error(`Cannot supersede asset in state ${originalAsset.approvalState}`);
  }

  const updatedOriginal: VirtualProductionGenerationAsset = {
    ...originalAsset,
    approvalState: 'superseded',
    metadata: {
      ...originalAsset.metadata,
      supersededBy: replacementAsset.id,
      supersededAt: new Date().toISOString(),
    },
  };

  const updatedReplacement: VirtualProductionGenerationAsset = {
    ...replacementAsset,
    parentAssetId: originalAsset.id,
    repairAncestry: [...originalAsset.repairAncestry, originalAsset.id],
    approvalState: 'ready_for_review',
    metadata: {
      ...replacementAsset.metadata,
      supersedes: originalAsset.id,
    },
  };

  const updatedShot: VirtualProductionShot = {
    ...shot,
    replacementTakeId: replacementAsset.id,
    approvalState: 'ready_for_review',
    metadata: {
      ...shot.metadata,
      lastRepairAt: new Date().toISOString(),
      originalTakePreserved: originalAsset.id,
    },
  };

  return {
    originalAsset: updatedOriginal,
    replacementAsset: updatedReplacement,
    shot: updatedShot,
  };
}

export function selectReplacementTake(
  shot: VirtualProductionShot,
  replacementAssetId: string
): VirtualProductionShot {
  return {
    ...shot,
    selectedTakeId: replacementAssetId,
    replacementTakeId: replacementAssetId,
    approvalState: 'approved',
    metadata: {
      ...shot.metadata,
      replacementSelectedAt: new Date().toISOString(),
    },
  };
}

export function preserveOriginalOnRepair(original: VirtualProductionGenerationAsset): boolean {
  return original.approvalState !== 'archived';
}
