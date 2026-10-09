import type { AssetLineageTier } from './types';

export type LineageTransformRecord = {
  transformId: string;
  manifestId: string;
  inputAssetIds: string[];
  outputAssetIds: string[];
  version: string;
  agentOrTool: string;
  executedAt: string;
  configuration: Record<string, unknown>;
  validationResult: 'PASS' | 'FAIL' | 'PENDING' | 'SKIPPED';
  approvalState: string;
  supersedesTransformId?: string;
  tier: AssetLineageTier;
};

export type FabricationAssetRecord = {
  assetId: string;
  manifestId: string;
  tier: AssetLineageTier;
  storageRef: string;
  contentHash?: string;
  sourceTool?: string;
  provider?: string;
  generationSettings?: Record<string, unknown>;
  promptVersion?: string;
  fabricationScriptVersion?: string;
  inputAuthorityVersion?: string;
  materialDependencies?: string[];
  exportConfiguration?: Record<string, unknown>;
  approvalStatus: string;
  supersededByAssetId?: string;
};

export function appendLineageTransform(
  chain: LineageTransformRecord[],
  next: LineageTransformRecord
): LineageTransformRecord[] {
  if (next.supersedesTransformId) {
    return [...chain.filter((t) => t.transformId !== next.supersedesTransformId), next];
  }
  return [...chain, next];
}

export function assertImmutableOriginPreserved(
  assets: FabricationAssetRecord[],
  originAssetId: string
): { ok: boolean; reason?: string } {
  const origin = assets.find((a) => a.assetId === originAssetId);
  if (!origin) return { ok: false, reason: 'Origin asset missing from lineage set' };
  if (origin.tier !== 'ORIGINAL_REFERENCE') {
    return { ok: false, reason: 'Origin must remain ORIGINAL_REFERENCE tier' };
  }
  const overwritten = assets.some(
    (a) => a.assetId === originAssetId && a.supersededByAssetId && a.tier === 'ORIGINAL_REFERENCE'
  );
  if (overwritten) return { ok: false, reason: 'Original reference cannot be superseded in place' };
  return { ok: true };
}
