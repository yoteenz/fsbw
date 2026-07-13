import type { ConstructionPlan } from '../blueprint-author/construction-plan-schema';
import type { AssetDnaRecord } from './asset-dna';
import type { RenderIntent } from './render-intent';
import type { FactoryWorkerOutput } from './ai-factory-workers';
import type { ManufacturingInspectionResult } from './manufacturing-inspection';

export const QUALITY_GUARD_EVOLUTION_VERSION = 'quality-guard-evolution.v1';

export type QualityGuardChain = 'blueprint' | 'dna' | 'render-intent' | 'output';

export type QualityGuardEvolutionResult = {
  jobId: string;
  assetId: string;
  approved: boolean;
  chain: QualityGuardChain[];
  blueprintMatch: boolean;
  dnaMatch: boolean;
  renderIntentMatch: boolean;
  outputMatch: boolean;
  inspectionScore: number;
  detail: string;
};

/** Quality Guard compares Blueprint → DNA → Render Intent → Output — NOT Prompt → Image */
export function evaluateQualityGuardEvolution(input: {
  plan: ConstructionPlan;
  dna: AssetDnaRecord;
  intent: RenderIntent;
  output: FactoryWorkerOutput;
  inspection: ManufacturingInspectionResult;
}): QualityGuardEvolutionResult {
  const blueprintMatch =
    input.plan.heroAssets.some((a) => a.assetId === input.dna.assetId) ||
    input.plan.architecture.architectureId === input.dna.assetId ||
    input.plan.furnitureSet.assets.some((a) => a.assetId === input.dna.assetId) ||
    input.plan.decorSet.assets.some((a) => a.assetId === input.dna.assetId);

  const dnaMatch =
    input.dna.assetRevision === input.intent.assetRevision &&
    input.dna.visualDna.silhouette === input.intent.expectedSilhouette;

  const renderIntentMatch =
    input.output.actualTransparency === input.intent.expectedTransparency &&
    input.output.actualScale === input.intent.expectedScale &&
    !input.output.architectureDetected;

  const outputMatch = input.inspection.approved;

  const approved = blueprintMatch && dnaMatch && renderIntentMatch && outputMatch;

  return {
    jobId: input.output.jobId,
    assetId: input.output.assetId,
    approved,
    chain: ['blueprint', 'dna', 'render-intent', 'output'],
    blueprintMatch,
    dnaMatch,
    renderIntentMatch,
    outputMatch,
    inspectionScore: input.inspection.inspectionScore,
    detail: approved
      ? 'Quality Guard: Blueprint → DNA → Render Intent → Output approved'
      : 'Quality Guard: chain break detected',
  };
}
