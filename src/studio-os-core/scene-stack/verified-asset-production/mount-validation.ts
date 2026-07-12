import type { AssetProductionApprovalProof } from './contract';
import type { SceneStackLayerId } from '../types';
import { buildPlacementMetadata } from '../placement-metadata';
import type { MasterSceneBlueprint } from '../master-scene-blueprint';

export type MountValidationInput = {
  layerId: SceneStackLayerId;
  approvedUrl: string;
  approvalProof: AssetProductionApprovalProof;
  blueprint: MasterSceneBlueprint;
  shellUrl?: string | null;
  frameCoverage?: number;
  transparentSides?: number;
};

export type MountValidationResult = {
  valid: boolean;
  sceneValidationStatus: 'passed' | 'failed';
  issues: string[];
  placementFailure: boolean;
  assetValid: boolean;
  mountMetadata: Record<string, unknown>;
};

export function validateSceneMount(input: MountValidationInput): MountValidationResult {
  const placement = buildPlacementMetadata(input.blueprint, input.layerId);
  const issues: string[] = [];

  if (!input.approvalProof?.assetCandidateId) {
    issues.push('Mount rejected — missing approval proof.');
  }

  if (input.layerId === 'environment-shell') {
    return {
      valid: issues.length === 0,
      sceneValidationStatus: issues.length === 0 ? 'passed' : 'failed',
      issues,
      placementFailure: false,
      assetValid: true,
      mountMetadata: { ...placement, zOrder: 0 },
    };
  }

  const coverage = input.frameCoverage ?? 0.4;
  if (coverage > 0.85) {
    issues.push('Mounted asset covers too much of the shell.');
  }

  if (input.transparentSides !== undefined && input.transparentSides < 1) {
    issues.push('Transparency may not compose correctly over shell.');
  }

  const placementFailure =
    placement.anchorX < 0 || placement.anchorX > 1 || placement.anchorY < 0 || placement.anchorY > 1;

  if (placementFailure) {
    issues.push('Mount anchor outside safe bounds — placement correction required.');
  }

  return {
    valid: issues.length === 0,
    sceneValidationStatus: issues.length === 0 ? 'passed' : 'failed',
    issues,
    placementFailure,
    assetValid: true,
    mountMetadata: {
      ...placement,
      zOrder: input.layerId === 'signature-landmark' ? 10 : 20,
      approvedAssetUrl: input.approvedUrl,
      approvalProof: input.approvalProof,
    },
  };
}

export function assertMountRequiresApprovalProof(
  approvalProof?: AssetProductionApprovalProof | null
): { ok: true } | { ok: false; reason: string } {
  if (!approvalProof?.assetCandidateId || !approvalProof.approvedAt) {
    return { ok: false, reason: 'Scene Stack mount requires verified asset approval proof.' };
  }
  return { ok: true };
}
