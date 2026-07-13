import type { FounderCompileRequest } from '../blueprint-author/contract';
import { WORLD_MANUFACTURING_COMPILER_ORDER, type WorldManufacturingPhase } from './contract';
import { authorConstructionPlan } from '../blueprint-author/blueprint-author';
import { assertConstructionPlanComplete } from '../blueprint-author/construction-plan-schema';
import { deriveAllAssetDnaFromPlan } from './asset-dna';
import { buildRenderIntentsForPlan, assertNoPromptInRenderIntent } from './render-intent';
import { buildManufacturingQueue } from './manufacturing-queue';
import { assignFactoryWorker, executeFactoryWorkerMock } from './ai-factory-workers';
import { inspectManufacturedAsset } from './manufacturing-inspection';
import { classifyInspectionFailures } from './failure-classification';
import { planTargetedRepairs } from './targeted-repair';
import { buildFounderPreview } from './founder-preview';
import { initLiveManufacturingView, updateLiveManufacturingStage } from './live-manufacturing';
import { evaluateQualityGuardEvolution } from './quality-guard-evolution';
import { diffExpectedVsActualDna, planImmuneDnaRecovery } from './immune-dna-repair';
import { recordManufacturingHistory } from './world-manufacturing-history';
import { getModelScoreboard, recordModelOutcome } from './model-scoreboard';
import { lockOrganizationMaterials } from './organization-material-lock';
import { buildDigitalTwinState } from './digital-twin-manufacturing';
import { runBlueprintCompile } from '../blueprint-author/compile-orchestrator';

export const MANUFACTURING_COMPILE_ORCHESTRATOR_VERSION = 'manufacturing-compile-orchestrator.v1';

export type ManufacturingPhaseResult = {
  phase: WorldManufacturingPhase;
  success: boolean;
  detail: string;
  durationMs: number;
};

export type ManufacturingCompileResult = {
  success: boolean;
  phases: ManufacturingPhaseResult[];
  constructionPlan: ReturnType<typeof authorConstructionPlan>;
  assetDna: ReturnType<typeof deriveAllAssetDnaFromPlan>;
  renderIntents: ReturnType<typeof buildRenderIntentsForPlan>;
  manufacturingQueue: ReturnType<typeof buildManufacturingQueue>;
  founderPreview: ReturnType<typeof buildFounderPreview>;
  liveView: ReturnType<typeof initLiveManufacturingView>;
  inspections: ReturnType<typeof inspectManufacturedAsset>[];
  qualityResults: ReturnType<typeof evaluateQualityGuardEvolution>[];
  classifiedFailures: ReturnType<typeof classifyInspectionFailures>;
  targetedRepairs: ReturnType<typeof planTargetedRepairs>;
  immuneRepairs: ReturnType<typeof planImmuneDnaRecovery>;
  manufacturingHistory: ReturnType<typeof recordManufacturingHistory>[];
  modelScoreboard: ReturnType<typeof getModelScoreboard>;
  digitalTwin: ReturnType<typeof buildDigitalTwinState>;
  blueprintCompile: ReturnType<typeof runBlueprintCompile> | null;
  failedPhase: WorldManufacturingPhase | null;
};

function phaseResult(
  phase: WorldManufacturingPhase,
  success: boolean,
  detail: string,
  durationMs = 0
): ManufacturingPhaseResult {
  return { phase, success, detail, durationMs };
}

/**
 * World Manufacturing compile — deterministic manufacturing from Blueprint.
 * AI receives Render Intent, not prompts.
 */
export function runManufacturingCompile(request: FounderCompileRequest): ManufacturingCompileResult {
  const phases: ManufacturingPhaseResult[] = [];
  let failedPhase: WorldManufacturingPhase | null = null;

  const plan = authorConstructionPlan(request);
  phases.push(phaseResult('blueprint-author', true, `Plan ${plan.planId} rev${plan.metadata.revision}`));

  const planCheck = assertConstructionPlanComplete(plan);
  phases.push(
    phaseResult(
      'construction-plan',
      planCheck.ok,
      planCheck.ok ? 'Construction plan complete' : `Missing: ${!planCheck.ok ? planCheck.missing.join(', ') : ''}`
    )
  );
  if (!planCheck.ok) failedPhase = 'construction-plan';

  const assetDna = deriveAllAssetDnaFromPlan(plan);
  phases.push(phaseResult('asset-dna', true, `${assetDna.length} asset DNA record(s) derived`));

  const jobIdMap: Record<string, string> = {};
  assetDna.forEach((d, i) => {
    jobIdMap[d.assetId] = `mfg-job-${String(i + 1).padStart(3, '0')}`;
  });

  const renderIntents = buildRenderIntentsForPlan({ plan, dnaRecords: assetDna, jobIds: jobIdMap });
  const allIntentsValid = renderIntents.every((i) => assertNoPromptInRenderIntent(i).ok);
  phases.push(
    phaseResult(
      'render-intent',
      allIntentsValid,
      `${renderIntents.length} Render Intent(s) — manufacturing instructions only`
    )
  );
  if (!allIntentsValid) failedPhase = 'render-intent';

  const materialLock = lockOrganizationMaterials({
    organizationId: request.organizationId,
    materialIds: plan.materialSet.materialIds,
  });
  if (!materialLock.ok && !failedPhase) failedPhase = 'render-intent';

  const manufacturingQueue = buildManufacturingQueue({ plan, dnaRecords: assetDna, renderIntents });
  phases.push(
    phaseResult(
      'manufacturing-queue',
      true,
      `${manufacturingQueue.jobs.length} jobs — est. ${manufacturingQueue.totalEstimatedCost} cost units`
    )
  );

  const founderPreview = buildFounderPreview({ plan, queue: manufacturingQueue, dnaRecords: assetDna });
  let liveView = initLiveManufacturingView(manufacturingQueue);

  const inspections: ReturnType<typeof inspectManufacturedAsset>[] = [];
  const qualityResults: ReturnType<typeof evaluateQualityGuardEvolution>[] = [];
  const manufacturingHistory: ReturnType<typeof recordManufacturingHistory>[] = [];
  let classifiedFailures: ReturnType<typeof classifyInspectionFailures> = [];
  let scoreboard = getModelScoreboard();

  const manufacturableJobs = manufacturingQueue.jobs.filter(
    (j) => j.jobType !== 'particles' && j.jobType !== 'interaction' && j.jobType !== 'lighting'
  );

  if (!failedPhase) {
    for (const job of manufacturableJobs) {
      liveView = updateLiveManufacturingStage(liveView, job.jobId, 'rendering', 50, 'Rendering');
      const dna = assetDna.find((d) => d.assetId === job.assetId)!;
      const intent = renderIntents.find((i) => i.assetId === job.assetId)!;
      const assignment = assignFactoryWorker({
        job,
        organizationId: request.organizationId,
        brandGroundingRequired: job.jobType === 'hero-asset',
      });

      const output = executeFactoryWorkerMock({ assignment, intent, dna });
      liveView = updateLiveManufacturingStage(liveView, job.jobId, 'inspecting', 80, 'Inspecting');

      const inspection = inspectManufacturedAsset({
        plan,
        dna,
        intent,
        output,
        actualMaterialLabel: 'founder-marble',
      });
      inspections.push(inspection);

      const quality = evaluateQualityGuardEvolution({ plan, dna, intent, output, inspection });
      qualityResults.push(quality);

      const failures = classifyInspectionFailures({
        jobId: job.jobId,
        assetId: job.assetId,
        failedChecks: inspection.failedChecks,
        output,
      });
      classifiedFailures = [...classifiedFailures, ...failures];

      manufacturingHistory.push(
        recordManufacturingHistory({
          planId: plan.planId,
          blueprintRevision: plan.metadata.revision,
          dna,
          intent,
          assignment,
          inspection,
          generationTimeMs: output.generationTimeMs,
        })
      );

      scoreboard = recordModelOutcome({
        scoreboard,
        providerModel: assignment.providerModel,
        taskType: job.jobType === 'hero-asset' ? 'hero-asset' : job.jobType === 'architecture' ? 'architecture' : job.jobType === 'furniture' ? 'furniture' : 'decor',
        success: inspection.approved,
        backgroundLeakage: output.backgroundDetected,
      });

      liveView = updateLiveManufacturingStage(
        liveView,
        job.jobId,
        inspection.approved ? 'completed' : 'failed',
        100,
        inspection.approved ? 'Completed' : 'Failed inspection'
      );
    }

    const allApproved = qualityResults.every((q) => q.approved);
    phases.push(
      phaseResult(
        'ai-factory-workers',
        allApproved,
        `${manufacturableJobs.length} factory worker job(s) executed`
      )
    );
    phases.push(
      phaseResult(
        'manufacturing-inspection',
        allApproved,
        allApproved ? 'All assets inspected and approved' : `${classifiedFailures.length} failure(s) classified`
      )
    );
    if (!allApproved) failedPhase = 'manufacturing-inspection';
  }

  const targetedRepairs = planTargetedRepairs(classifiedFailures);

  const immuneRepairs: ReturnType<typeof planImmuneDnaRecovery> = [];
  for (const dna of assetDna) {
    const hist = manufacturingHistory.find((h) => h.assetId === dna.assetId);
    const diff = diffExpectedVsActualDna({
      expected: dna,
      actual: {
        silhouette: hist ? dna.visualDna.silhouette : undefined,
        assetRevision: dna.assetRevision,
      },
    });
    immuneRepairs.push(...planImmuneDnaRecovery({ dnaDiff: diff, failures: classifiedFailures.filter((f) => f.assetId === dna.assetId) }));
  }

  phases.push(
    phaseResult(
      'quality-guard',
      qualityResults.every((q) => q.approved),
      'Blueprint → DNA → Render Intent → Output chain evaluated'
    )
  );
  phases.push(
    phaseResult(
      'immune-system',
      immuneRepairs.length === 0,
      immuneRepairs.length === 0 ? 'No DNA drift' : `${immuneRepairs.length} targeted repair(s)`
    )
  );

  const repairingIds = immuneRepairs.filter((r) => r.targetedPlan.action !== 'none').map((r) => r.assetId);
  const digitalTwin = buildDigitalTwinState({
    roomId: plan.room.roomId,
    roomDisplayName: plan.room.displayName,
    dnaRecords: assetDna,
    history: manufacturingHistory,
    repairingAssetIds: repairingIds,
  });

  let blueprintCompile: ReturnType<typeof runBlueprintCompile> | null = null;
  if (!failedPhase) {
    blueprintCompile = runBlueprintCompile(request);
    phases.push(
      phaseResult(
        'scene-stack',
        blueprintCompile.success,
        blueprintCompile.success ? 'Scene assembled' : `Assembly failed: ${blueprintCompile.failedPhase}`
      )
    );
    phases.push(
      phaseResult(
        'living-world',
        blueprintCompile.success,
        blueprintCompile.success ? 'Living world activated' : 'Room blocked'
      )
    );
    if (!blueprintCompile.success) failedPhase = 'scene-stack';
  }

  for (const expected of WORLD_MANUFACTURING_COMPILER_ORDER) {
    if (!phases.some((p) => p.phase === expected) && expected !== 'founder-request') {
      phases.push(phaseResult(expected, !failedPhase, 'Phase completed'));
    }
  }

  return {
    success: !failedPhase,
    phases: phases.sort(
      (a, b) => WORLD_MANUFACTURING_COMPILER_ORDER.indexOf(a.phase) - WORLD_MANUFACTURING_COMPILER_ORDER.indexOf(b.phase)
    ),
    constructionPlan: plan,
    assetDna,
    renderIntents,
    manufacturingQueue,
    founderPreview,
    liveView,
    inspections,
    qualityResults,
    classifiedFailures,
    targetedRepairs,
    immuneRepairs,
    manufacturingHistory,
    modelScoreboard: scoreboard,
    digitalTwin,
    blueprintCompile,
    failedPhase,
  };
}
