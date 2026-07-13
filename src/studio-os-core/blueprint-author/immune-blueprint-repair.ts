import type { BlueprintDiffEntry, BlueprintDiffResult } from './blueprint-diff-engine';
import type { ConstructionPlan } from './construction-plan-schema';

export const IMMUNE_BLUEPRINT_REPAIR_VERSION = 'immune-blueprint-repair.v1';

export type BlueprintRepairAction =
  | 'upgrade-asset'
  | 'rebuild-material-layer'
  | 'requeue-asset-job'
  | 'reposition-to-socket'
  | 'reject-and-requeue'
  | 'repair-architecture'
  | 'none';

export type BlueprintRepairDecision = {
  diffEntry: BlueprintDiffEntry;
  action: BlueprintRepairAction;
  targetJobType: 'hero-asset' | 'furniture' | 'decor' | 'architecture' | 'lighting' | 'material-application' | null;
  targetAssetId: string | null;
  targetSocketId: string | null;
  blueprintAuthoritative: true;
  reason: string;
};

export function decideBlueprintRepair(diff: BlueprintDiffEntry): BlueprintRepairDecision {
  let action: BlueprintRepairAction = 'none';
  let targetJobType: BlueprintRepairDecision['targetJobType'] = null;

  switch (diff.category) {
    case 'asset-version':
      action = 'upgrade-asset';
      targetJobType = 'hero-asset';
      break;
    case 'material':
      action = 'rebuild-material-layer';
      targetJobType = 'material-application';
      break;
    case 'socket':
      action = 'reposition-to-socket';
      targetJobType = 'hero-asset';
      break;
    case 'transparency':
      action = 'reject-and-requeue';
      targetJobType = 'hero-asset';
      break;
    case 'missing-asset':
      action = 'requeue-asset-job';
      targetJobType = 'hero-asset';
      break;
    case 'architecture':
      action = 'repair-architecture';
      targetJobType = 'architecture';
      break;
    default:
      action = 'requeue-asset-job';
      targetJobType = 'hero-asset';
  }

  return {
    diffEntry: diff,
    action,
    targetJobType,
    targetAssetId: diff.assetId,
    targetSocketId: diff.socketId,
    blueprintAuthoritative: true,
    reason: `Blueprint repair: ${diff.repairHint}`,
  };
}

export function planBlueprintImmuneRecovery(input: {
  plan: ConstructionPlan;
  diffResult: BlueprintDiffResult;
}): BlueprintRepairDecision[] {
  if (!input.diffResult.hasDrift) return [];

  return input.diffResult.entries
    .filter((e) => e.severity === 'critical' || e.severity === 'warning')
    .map((e) => decideBlueprintRepair(e));
}

/** Immune System asks: "What differs from Blueprint?" — never "What happened?" */
export function formatImmuneBlueprintQuery(plan: ConstructionPlan): string {
  return `What differs from Blueprint ${plan.planId} rev${plan.metadata.revision}?`;
}

export function assertRepairReferencesBlueprint(decision: BlueprintRepairDecision): boolean {
  return decision.blueprintAuthoritative === true;
}
