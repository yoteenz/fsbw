import type { AssetDnaRecord } from './asset-dna';
import type { RenderIntent } from './render-intent';
import type { FactoryWorkerAssignment } from './ai-factory-workers';
import type { ManufacturingInspectionResult } from './manufacturing-inspection';

export const WORLD_MANUFACTURING_HISTORY_VERSION = 'world-manufacturing-history.v1';

export type ManufacturingHistoryEntry = {
  entryId: string;
  assetId: string;
  builtBy: string;
  blueprintRevision: number;
  dnaRevision: string;
  renderIntentRevision: string;
  workerModel: string;
  workerRole: string;
  generationTimeMs: number;
  inspectionScore: number;
  repairCount: number;
  replacementCount: number;
  currentHealth: 'healthy' | 'warning' | 'critical' | 'repairing';
  lifetimeHealth: number;
  manufacturedAt: string;
};

export function recordManufacturingHistory(input: {
  planId: string;
  blueprintRevision: number;
  dna: AssetDnaRecord;
  intent: RenderIntent;
  assignment: FactoryWorkerAssignment;
  inspection: ManufacturingInspectionResult;
  generationTimeMs: number;
}): ManufacturingHistoryEntry {
  return {
    entryId: `hist-${input.dna.assetId}-${Date.now()}`,
    assetId: input.dna.assetId,
    builtBy: input.assignment.workerRole,
    blueprintRevision: input.blueprintRevision,
    dnaRevision: input.dna.assetRevision,
    renderIntentRevision: input.intent.intentVersion,
    workerModel: input.assignment.providerModel,
    workerRole: input.assignment.workerRole,
    generationTimeMs: input.generationTimeMs,
    inspectionScore: input.inspection.inspectionScore,
    repairCount: input.dna.repairHistory.length,
    replacementCount: 0,
    currentHealth: input.inspection.approved ? 'healthy' : 'warning',
    lifetimeHealth: input.inspection.inspectionScore,
    manufacturedAt: new Date().toISOString(),
  };
}
