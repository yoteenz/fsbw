import type { FounderCompileRequest } from './contract';
import { authorConstructionPlan } from './blueprint-author';
import { assertConstructionPlanComplete } from './construction-plan-schema';
import { openConstructionModeSession } from '../construction-mode/construction-mode-session';
import type { ConstructionModeSession } from '../construction-mode/construction-mode-session';
import { deriveAllAssetDnaFromPlan } from '../manufacturing-engine/asset-dna';
import { buildRenderIntentsForPlan } from '../manufacturing-engine/render-intent';
import { buildManufacturingQueue } from '../manufacturing-engine/manufacturing-queue';
import type { ConstructionPlan } from './construction-plan-schema';
import { ARCHITECTURE_LAW_001_VERSION } from '../architecture-law-001/contract';
import { attachUiSocketBlueprintToConstructionPlan } from '../architecture-law-001/integration';
import type { AssetDnaRecord } from '../manufacturing-engine/asset-dna';
import type { RenderIntent } from '../manufacturing-engine/render-intent';
import type { ManufacturingQueue } from '../manufacturing-engine/manufacturing-queue';

export type BlueprintAuthorSessionBundle = {
  plan: ConstructionPlan;
  assetDna: AssetDnaRecord[];
  renderIntents: RenderIntent[];
  queue: ManufacturingQueue;
  session: ConstructionModeSession;
  planCheck: ReturnType<typeof assertConstructionPlanComplete>;
};

/** Open Construction Mode from Blueprint Author — zero AI generation. */
export function openBlueprintAuthorSession(request: FounderCompileRequest): BlueprintAuthorSessionBundle {
  const basePlan = authorConstructionPlan(request);
  const enriched = attachUiSocketBlueprintToConstructionPlan({
    plan: basePlan,
    departmentId: request.departmentId,
  });
  const plan: ConstructionPlan = {
    ...enriched,
    architectureLawVersion: ARCHITECTURE_LAW_001_VERSION,
  };
  const planCheck = assertConstructionPlanComplete(plan);
  const assetDna = deriveAllAssetDnaFromPlan(plan);
  const jobIdMap = Object.fromEntries(assetDna.map((d, i) => [d.assetId, `mfg-job-${String(i + 1).padStart(3, '0')}`]));
  const renderIntents = buildRenderIntentsForPlan({ plan, dnaRecords: assetDna, jobIds: jobIdMap });
  const queue = buildManufacturingQueue({ plan, dnaRecords: assetDna, renderIntents });
  const session = openConstructionModeSession({
    plan,
    dnaRecords: assetDna,
    renderIntents,
    queue,
    organizationId: request.organizationId,
  });

  return { plan, assetDna, renderIntents, queue, session, planCheck };
}

/** Open Blueprint Author from an existing Construction Plan (canonical departments, pre-authored plans). */
export function openBlueprintAuthorSessionFromPlan(
  plan: ConstructionPlan,
  departmentId: string
): BlueprintAuthorSessionBundle {
  const enriched = attachUiSocketBlueprintToConstructionPlan({
    plan,
    departmentId,
  });
  const fullPlan: ConstructionPlan = {
    ...enriched,
    architectureLawVersion: ARCHITECTURE_LAW_001_VERSION,
  };
  const planCheck = assertConstructionPlanComplete(fullPlan);
  const assetDna = deriveAllAssetDnaFromPlan(fullPlan);
  const jobIdMap = Object.fromEntries(assetDna.map((d, i) => [d.assetId, `mfg-job-${String(i + 1).padStart(3, '0')}`]));
  const renderIntents = buildRenderIntentsForPlan({ plan: fullPlan, dnaRecords: assetDna, jobIds: jobIdMap });
  const queue = buildManufacturingQueue({ plan: fullPlan, dnaRecords: assetDna, renderIntents });
  const session = openConstructionModeSession({
    plan: fullPlan,
    dnaRecords: assetDna,
    renderIntents,
    queue,
    organizationId: fullPlan.metadata.organizationId,
  });

  return { plan: fullPlan, assetDna, renderIntents, queue, session, planCheck };
}

export function computePlanConfidenceScore(planCheck: ReturnType<typeof assertConstructionPlanComplete>): number {
  if (!planCheck.ok) return Math.max(35, 88 - planCheck.missing.length * 8);
  return 91;
}

export type ConstructionPlanSummary = {
  projectName: string;
  blueprintRevision: number;
  estimatedCost: number;
  estimatedBuildTimeMs: number;
  estimatedWorkerCount: number;
  estimatedAssets: number;
  confidenceScore: number;
  status: string;
};

export function buildConstructionPlanSummary(bundle: BlueprintAuthorSessionBundle): ConstructionPlanSummary {
  const dash = bundle.session.dashboard;
  return {
    projectName: dash.roomDisplayName,
    blueprintRevision: dash.blueprintRevision,
    estimatedCost: dash.estimates.costUnits,
    estimatedBuildTimeMs: dash.estimates.durationMs,
    estimatedWorkerCount: dash.aiWorkers.filter((w) => w.jobCount > 0).length,
    estimatedAssets: bundle.session.worldPreview.placeholderAssets.length,
    confidenceScore: computePlanConfidenceScore(bundle.planCheck),
    status: bundle.session.status,
  };
}
