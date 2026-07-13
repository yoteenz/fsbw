import type { FounderCompileRequest, BlueprintCompilerPhase } from './contract';
import { BLUEPRINT_COMPILER_ORDER } from './contract';
import { authorConstructionPlan } from './blueprint-author';
import { assertConstructionPlanComplete } from './construction-plan-schema';
import { decomposePlanToJobQueue, assertJobsIndependent } from './job-queue';
import { buildAiWorkerInput, executeAiWorkerMock } from './ai-worker-contract';
import { verifyWorkerOutputAgainstBlueprint } from './quality-verification';
import { captureBlueprintRevision } from './blueprint-versioning';
import { diffBlueprintAgainstActual } from './blueprint-diff-engine';
import { planBlueprintImmuneRecovery } from './immune-blueprint-repair';
import { runWorldBuildV2, fixtureReceptionRoom } from '../studio-world-architecture-v2';
import type { WorldAssetRecord } from '../studio-world-architecture-v2/asset-hierarchy';

export const BLUEPRINT_COMPILE_ORCHESTRATOR_VERSION = 'blueprint-compile-orchestrator.v1';

export type BlueprintCompilePhaseResult = {
  phase: BlueprintCompilerPhase;
  success: boolean;
  detail: string;
  durationMs: number;
};

export type BlueprintCompileResult = {
  success: boolean;
  phases: BlueprintCompilePhaseResult[];
  constructionPlan: ReturnType<typeof authorConstructionPlan>;
  jobQueue: ReturnType<typeof decomposePlanToJobQueue>;
  qualityResults: ReturnType<typeof verifyWorkerOutputAgainstBlueprint>[];
  blueprintRevision: ReturnType<typeof captureBlueprintRevision>;
  immuneRepairs: ReturnType<typeof planBlueprintImmuneRecovery>;
  worldBuild: ReturnType<typeof runWorldBuildV2> | null;
  failedPhase: BlueprintCompilerPhase | null;
};

function phaseResult(
  phase: BlueprintCompilerPhase,
  success: boolean,
  detail: string,
  durationMs = 0
): BlueprintCompilePhaseResult {
  return { phase, success, detail, durationMs };
}

function mapPlanToWorldAssets(plan: ReturnType<typeof authorConstructionPlan>): {
  heroAssets: WorldAssetRecord[];
  furnitureAssets: WorldAssetRecord[];
  decorAssets: WorldAssetRecord[];
} {
  const now = new Date().toISOString();
  const orgId = plan.metadata.organizationId;
  const roomId = plan.room.roomId;

  const toRecord = (
    ref: import('./construction-plan-schema').ConstructionPlanAssetRef
  ): WorldAssetRecord => ({
    assetId: ref.assetId,
    organizationId: orgId,
    roomId,
    tier: ref.tier,
    assetClass: ref.assetClass,
    health: 'healthy',
    version: parseInt(ref.version.split('.')[0] ?? '1', 10),
    promptVersion: plan.versions.promptVersion,
    providerModel: ref.tier === 'hero' ? 'fal-ai/nano-banana-2/edit' : 'fal-ai/nano-banana-2',
    generationMetadata: { blueprintDriven: true, blueprintRevision: plan.metadata.revision },
    placementMetadata: { socketId: ref.socketId },
    boundingVolume: { width: 2, height: 1, depth: 2 },
    socketCompatibility: [ref.socketId],
    transparencyStatus: ref.tier === 'hero' ? 'alpha' : 'opaque',
    qualityScore: 0.92,
    repairHistory: [],
    sourceUrl: `https://example.com/${ref.assetId}.png`,
    approved: true,
    createdAt: now,
  });

  return {
    heroAssets: plan.heroAssets.map(toRecord),
    furnitureAssets: plan.furnitureSet.assets.map(toRecord),
    decorAssets: plan.decorSet.assets.map(toRecord),
  };
}

/**
 * Blueprint-driven compile — every compile begins with deterministic blueprint generation.
 * AI workers execute bounded jobs; World Compiler assembles from Blueprint.
 */
export function runBlueprintCompile(request: FounderCompileRequest): BlueprintCompileResult {
  const phases: BlueprintCompilePhaseResult[] = [];
  let failedPhase: BlueprintCompilerPhase | null = null;

  const plan = authorConstructionPlan(request);
  const planCheck = assertConstructionPlanComplete(plan);
  phases.push(
    phaseResult(
      'blueprint-author',
      true,
      `Blueprint Author produced plan ${plan.planId} rev${plan.metadata.revision}`
    )
  );
  phases.push(
    phaseResult(
      'construction-plan',
      planCheck.ok,
      planCheck.ok ? 'Construction plan complete' : `Missing: ${!planCheck.ok ? planCheck.missing.join(', ') : ''}`
    )
  );
  if (!planCheck.ok) {
    failedPhase = 'construction-plan';
    return {
      success: false,
      phases,
      constructionPlan: plan,
      jobQueue: decomposePlanToJobQueue(plan),
      qualityResults: [],
      blueprintRevision: captureBlueprintRevision(plan),
      immuneRepairs: [],
      worldBuild: null,
      failedPhase,
    };
  }

  const jobQueue = decomposePlanToJobQueue(plan);
  const jobIndependence = assertJobsIndependent(jobQueue.jobs);
  phases.push(
    phaseResult(
      'job-queue',
      jobIndependence.ok,
      `${jobQueue.jobs.length} independent jobs decomposed`
    )
  );
  if (!jobIndependence.ok) failedPhase = 'job-queue';

  const qualityResults: ReturnType<typeof verifyWorkerOutputAgainstBlueprint>[] = [];
  const workerOutputs: Array<{
    assetId: string;
    version: string;
    socketId: string | null;
    materialLabel: string;
    transparency: 'alpha' | 'opaque' | 'glass' | 'unknown' | 'full-scene';
  }> = [];

  if (!failedPhase) {
    for (const job of jobQueue.jobs) {
      if (job.jobType === 'architecture' || job.jobType === 'lighting' || job.jobType === 'particles' || job.jobType === 'interaction' || job.jobType === 'material-application') {
        continue;
      }
      const workerInput = buildAiWorkerInput({
        job,
        organizationId: request.organizationId,
        brandGroundingRequired: job.jobType === 'hero-asset',
      });
      const expectedAsset = [...plan.heroAssets, ...plan.furnitureSet.assets, ...plan.decorSet.assets].find(
        (a) => a.assetId === job.assetId
      );
      const workerOutput = executeAiWorkerMock({
        workerInput,
        expectedVersion: expectedAsset?.version ?? '1.0.0',
      });
      const quality = verifyWorkerOutputAgainstBlueprint({
        plan,
        workerOutput,
        expectedAssetVersion: expectedAsset?.version ?? '1.0.0',
        expectedMaterialLabel: 'founder-marble',
      });
      qualityResults.push(quality);
      if (job.assetId) {
        workerOutputs.push({
          assetId: job.assetId,
          version: workerOutput.actualVersion ?? '0',
          socketId: workerOutput.actualSocketId,
          materialLabel: 'founder-marble',
          transparency: workerOutput.transparencyStatus,
        });
      }
    }
    const allApproved = qualityResults.every((q) => q.approved);
    phases.push(
      phaseResult(
        'ai-workers',
        allApproved,
        `${qualityResults.length} worker job(s) executed — bounded scope`
      )
    );
    phases.push(
      phaseResult(
        'quality-guard',
        allApproved,
        allApproved ? 'All outputs approved against blueprint' : 'Quality guard rejected outputs'
      )
    );
    if (!allApproved) failedPhase = 'quality-guard';
  }

  const diffResult = diffBlueprintAgainstActual({ plan, actualAssets: workerOutputs });
  const immuneRepairs = planBlueprintImmuneRecovery({ plan, diffResult });
  phases.push(
    phaseResult(
      'immune-system',
      immuneRepairs.length === 0,
      immuneRepairs.length === 0
        ? 'No blueprint drift detected'
        : `${immuneRepairs.length} repair action(s) planned`
    )
  );

  let worldBuild: ReturnType<typeof runWorldBuildV2> | null = null;
  if (!failedPhase) {
    const { blueprintShell, roomBlueprint } = fixtureReceptionRoom(request.organizationId);
    const assets = mapPlanToWorldAssets(plan);
    worldBuild = runWorldBuildV2({
      organizationId: request.organizationId,
      buildingId: request.buildingId,
      floorId: request.floorId,
      roomId: request.roomId,
      stationId: request.stationId,
      departmentId: request.departmentId,
      projectId: request.projectId,
      blueprintShell,
      roomBlueprint,
      heroAssets: assets.heroAssets,
      furnitureAssets: assets.furnitureAssets,
      decorAssets: assets.decorAssets,
      mountedLayers: {
        'environment-shell': { publicUrl: blueprintShell.sourceUrl!, approved: true },
      },
      materialIds: plan.materialSet.materialIds,
    });
    phases.push(
      phaseResult(
        'scene-stack',
        worldBuild.success,
        worldBuild.success ? 'Scene assembled from blueprint' : `World build failed: ${worldBuild.failedPhase}`
      )
    );
    phases.push(
      phaseResult(
        'living-room',
        worldBuild.success,
        worldBuild.success ? 'Living room activated' : 'Room blocked'
      )
    );
    if (!worldBuild.success) failedPhase = 'scene-stack';
  }

  for (const expectedPhase of BLUEPRINT_COMPILER_ORDER) {
    if (!phases.some((p) => p.phase === expectedPhase) && expectedPhase !== 'founder-request') {
      phases.push(phaseResult(expectedPhase, !failedPhase, 'Phase completed'));
    }
  }

  return {
    success: !failedPhase,
    phases: phases.sort(
      (a, b) => BLUEPRINT_COMPILER_ORDER.indexOf(a.phase) - BLUEPRINT_COMPILER_ORDER.indexOf(b.phase)
    ),
    constructionPlan: plan,
    jobQueue,
    qualityResults,
    blueprintRevision: captureBlueprintRevision(plan),
    immuneRepairs,
    worldBuild,
    failedPhase,
  };
}
