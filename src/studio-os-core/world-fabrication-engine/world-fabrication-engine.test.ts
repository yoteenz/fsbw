import { describe, expect, it } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';
import { assertGateAllowed, isFounderApproved } from './approvals';
import { evaluateFabricationSpend, type FabricationJobBudget } from './cost-control';
import { validateCodexHandoff } from './handoffs';
import { assertImmutableOriginPreserved, type FabricationAssetRecord } from './lineage';
import { validateMassingRequest } from './massing-provider';
import {
  createFabricationJobManifest,
  requestPaidMassing,
  transitionJobStage,
  validateAuthorityForFabrication,
  validateJobIntegrity,
  type FabricationJobStore,
} from './job-service';
import { BUILD_OBJECT_STAGE_PATH, canTransitionStage } from './stages';
import { ingestValidationReport } from './validation-report';
import { validateSpatialContinuity } from './scene-and-interaction';
import type { VisualAuthorityRecord } from './types';

const approvedAuthority = (id: string): VisualAuthorityRecord => ({
  authorityId: id,
  projectId: 'p1',
  sourceType: 'APPROVED_ENVIRONMENT_IMAGE',
  assetReference: 'ref://approved-1',
  approvalStatus: 'APPROVED',
  version: '1',
  approvedBy: 'founder',
  approvedAt: '2026-10-08T00:00:00.000Z',
  scope: 'test',
  requiredCharacteristics: ['match approved silhouette'],
  prohibitedDeviations: ['generic fantasy substitute'],
});

function baseJob(): FabricationJobStore {
  const manifest = createFabricationJobManifest({
    manifestId: 'wf-test-1',
    project: {
      worldProjectId: 'wp-1',
      organizationId: 'org-1',
      title: 'Test World',
      proofEnvironment: 'SITE00_BUILD_OBJECT',
    },
    spatialSpecId: 'sp-1',
    visualAuthorityIds: ['va-1'],
    referenceViewIds: [],
    targetRuntime: 'WEB_THREEJS',
    costBudgetId: 'budget-1',
    lineageRootAuthorityId: 'asset-origin-1',
  });
  const budget: FabricationJobBudget = {
    budgetId: 'budget-1',
    manifestId: manifest.manifestId,
    organizationId: 'org-1',
    jobBudgetCapCredits: 10,
    perStageCaps: { STAGE_04: 5 },
    spentCredits: 0,
    allowPaidGeneration: false,
    autoRetryPaid: false,
    requiresFounderApprovalAboveCap: true,
  };
  return {
    manifest,
    authorities: [approvedAuthority('va-1')],
    spatialSpec: {
      spatialSpecId: 'sp-1',
      projectId: 'p1',
      worldPurpose: 'POC',
      zoneType: 'BUILD_OBJECT',
      architecturalIdentity: 'test',
      scaleAssumptions: ['human scale inferred'],
      primarySilhouette: 'test',
      structuralComponents: [],
      entrances: [],
      exits: [],
      interiorSpaces: [],
      pathConnections: [],
      verticalCirculation: [],
      majorLandmarks: [],
      materialFamilies: [],
      lightingDirection: 'neutral',
      interactiveElements: [],
      cameraConstraints: [],
      collisionRequirements: [],
      navigationRequirements: [],
      targetRuntime: 'WEB_THREEJS',
      referenceUncertainties: [{ subject: 'hidden volume', certainty: 'DESIGN_INFERRED' }],
    },
    stages: BUILD_OBJECT_STAGE_PATH.map((stageId) => ({
      stageId,
      status: stageId === 'STAGE_00' ? 'IN_PROGRESS' : 'NOT_STARTED',
    })),
    budget,
    lineage: [],
    assets: [
      {
        assetId: 'asset-origin-1',
        manifestId: manifest.manifestId,
        tier: 'ORIGINAL_REFERENCE',
        storageRef: 'ref://origin',
        approvalStatus: 'APPROVED',
      },
    ],
    reviews: [
      {
        reviewId: 'r1',
        manifestId: manifest.manifestId,
        gate: 'VISUAL_AUTHORITY_APPROVAL',
        status: 'APPROVED',
        reviewedBy: 'founder',
        reviewedAt: '2026-10-08T00:00:00.000Z',
      },
    ],
  };
}

describe('World Fabrication Engine V1', () => {
  it('creates fabrication manifest', () => {
    const m = createFabricationJobManifest({
      manifestId: 'm1',
      project: { worldProjectId: 'w', organizationId: 'o', title: 'T' },
      spatialSpecId: 's',
      visualAuthorityIds: ['va'],
      referenceViewIds: [],
      targetRuntime: 'WEB_THREEJS',
      costBudgetId: 'b',
      lineageRootAuthorityId: 'origin',
    });
    expect(m.manifestVersion).toBe('world-fabrication-v1');
    expect(m.currentStageId).toBe('STAGE_00');
  });

  it('rejects unapproved authority for fabrication', () => {
    const errors = validateAuthorityForFabrication([
      { ...approvedAuthority('x'), approvalStatus: 'DRAFT' },
    ]);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('blocks stage transition without approval for massing', () => {
    const result = canTransitionStage({
      manifestId: 'm',
      fromStageId: 'STAGE_03',
      toStageId: 'STAGE_04',
      actor: 'agent',
      approvalsSatisfied: false,
      validationPassed: false,
    });
    expect(result.ok).toBe(false);
  });

  it('blocks paid massing when not authorized', () => {
    const job = baseJob();
    const result = requestPaidMassing(job, {
      manifestId: job.manifest.manifestId,
      authorityId: 'va-1',
      provider: 'ARTLIST',
      modelId: 'hyper3d-rodin-v2.5-fast',
      inputImageRef: 'ref://img',
      paidExecutionAuthorized: true,
    });
    expect(result.ok).toBe(false);
  });

  it('blocks budget overrun', () => {
    const budget: FabricationJobBudget = {
      ...baseJob().budget,
      allowPaidGeneration: true,
      spentCredits: 9,
      jobBudgetCapCredits: 10,
    };
    const evalResult = evaluateFabricationSpend(budget, 5);
    expect(evalResult.allowed).toBe(false);
  });

  it('enforces founder approval gate order', () => {
    const gate = assertGateAllowed('GEOMETRY_APPROVAL', []);
    expect(gate.ok).toBe(false);
    expect(isFounderApproved('APPROVED')).toBe(true);
  });

  it('preserves immutable origin in lineage', () => {
    const assets: FabricationAssetRecord[] = [
      {
        assetId: 'origin',
        manifestId: 'm',
        tier: 'ORIGINAL_REFERENCE',
        storageRef: 'r',
        approvalStatus: 'APPROVED',
      },
    ];
    expect(assertImmutableOriginPreserved(assets, 'origin').ok).toBe(true);
  });

  it('validates codex handoff requires execution environment', () => {
    const errors = validateCodexHandoff({
      handoffId: 'h1',
      manifestId: 'm',
      approvedReferenceAssets: ['ref'],
      spatialSpecificationRef: 'sp',
      expectedModuleHierarchy: ['WALLS'],
      cameraTargets: ['hero'],
      exportRequirements: ['GLB'],
      qualityRequirements: [],
      performanceConstraints: [],
      allowedModificationScope: 'modular rebuild only',
      costLimitsRef: 'budget',
      validationSteps: ['topology'],
      expectedReturnPackage: ['blend', 'glb'],
      executionEnvironment: 'UNAVAILABLE',
    });
    expect(errors.some((e) => e.includes('unavailable'))).toBe(true);
  });

  it('transitions job stage when gates satisfied', () => {
    const job = baseJob();
    const moved = transitionJobStage(job, 'STAGE_01', 'composer');
    expect(moved.ok).toBe(true);
  });

  it('validates spatial graph symmetry', () => {
    const errors = validateSpatialContinuity([
      { nodeId: 'a', zoneId: 'z1', connectedNodeIds: ['b'], entryAnchors: [], exitAnchors: [] },
      { nodeId: 'b', zoneId: 'z2', connectedNodeIds: [], entryAnchors: [], exitAnchors: [] },
    ]);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('loads SITE 00 build object example manifest', () => {
    const path = join(
      process.cwd(),
      'src/studio-os-core/world-fabrication-engine/examples/site00-build-object-example.manifest.json'
    );
    const json = JSON.parse(readFileSync(path, 'utf8'));
    expect(json.proofEnvironment).toBe('SITE00_BUILD_OBJECT');
    expect(json.deploymentAuthorized).toBe(false);
  });

  it('validateMassingRequest requires paid authorization flag', () => {
    expect(
      validateMassingRequest({
        manifestId: 'm',
        authorityId: 'a',
        provider: 'ARTLIST',
        modelId: 'hyper3d-rodin-v2.5-fast',
        inputImageRef: 'img',
        paidExecutionAuthorized: false,
      }).length
    ).toBeGreaterThan(0);
  });

  it('ingestValidationReport rejects inconsistent PASS', () => {
    const result = ingestValidationReport({
      reportId: 'vr1',
      manifestId: 'm',
      stageId: 'STAGE_07',
      generatedAt: '2026-10-08',
      geometryChecks: [{ id: 'g1', pass: false }],
      materialChecks: [],
      spatialContinuityChecks: [],
      overall: 'PASS',
    });
    expect(result.accepted).toBe(false);
  });

  it('validateJobIntegrity passes for baseline job', () => {
    expect(validateJobIntegrity(baseJob())).toEqual([]);
  });
});
