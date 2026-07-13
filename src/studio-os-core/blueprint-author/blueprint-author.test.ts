import { describe, expect, it } from 'vitest';
import {
  BLUEPRINT_AUTHOR_VERSION,
  BLUEPRINT_COMPILER_ORDER,
  authorConstructionPlan,
  assertConstructionPlanComplete,
  decomposePlanToJobQueue,
  assertJobsIndependent,
  buildAiWorkerInput,
  executeAiWorkerMock,
  assertWorkerBounded,
  verifyWorkerOutputAgainstBlueprint,
  captureBlueprintRevision,
  diffBlueprintAgainstActual,
  planBlueprintImmuneRecovery,
  runBlueprintCompile,
  fixtureFounderReceptionRequest,
  fixtureReceptionConstructionPlan,
  assertAssetInSocket,
  assertNoGenericMaterialInvention,
  resolveStyleProfile,
  FORBIDDEN_GENERIC_MATERIALS,
  CONSTRUCTION_PLAN_SCHEMA_VERSION,
} from './index';

describe('Blueprint Author™', () => {
  it('defines canonical compiler order with Blueprint Author first', () => {
    expect(BLUEPRINT_COMPILER_ORDER[0]).toBe('founder-request');
    expect(BLUEPRINT_COMPILER_ORDER[1]).toBe('blueprint-author');
    expect(BLUEPRINT_COMPILER_ORDER[2]).toBe('construction-plan');
    expect(BLUEPRINT_COMPILER_ORDER).toContain('job-queue');
    expect(BLUEPRINT_COMPILER_ORDER).toContain('immune-system');
    expect(BLUEPRINT_COMPILER_ORDER[BLUEPRINT_COMPILER_ORDER.length - 1]).toBe('living-room');
  });

  it('authors deterministic reception construction plan', () => {
    const request = fixtureFounderReceptionRequest();
    const plan = authorConstructionPlan(request);
    expect(plan.schemaVersion).toBe(CONSTRUCTION_PLAN_SCHEMA_VERSION);
    expect(plan.room.displayName).toBe('Reception');
    expect(plan.architecture.architectureId).toBe('ReceptionShell');
    expect(plan.heroAssets).toHaveLength(2);
    expect(plan.materialSet.materialSetId).toBe('FounderMaterialLibrary');
    expect(plan.metadata.author).toBe(BLUEPRINT_AUTHOR_VERSION);
  });

  it('asserts construction plan completeness', () => {
    const request = fixtureFounderReceptionRequest();
    const plan = authorConstructionPlan(request);
    const check = assertConstructionPlanComplete(plan);
    expect(check.ok).toBe(true);
  });

  it('defines asset sockets — AI never guesses placement', () => {
    const request = fixtureFounderReceptionRequest();
    const plan = authorConstructionPlan(request);
    expect(plan.assetSockets.some((s) => s.socketId === 'ReceptionDeskSocket')).toBe(true);
    const deskAsset = plan.heroAssets.find((a) => a.assetId === 'ReceptionDesk');
    const socketCheck = assertAssetInSocket({
      assetClass: deskAsset!.assetClass,
      socketId: deskAsset!.socketId,
      sockets: plan.assetSockets,
    });
    expect(socketCheck.ok).toBe(true);
  });

  it('forbids generic material invention', () => {
    const bad = assertNoGenericMaterialInvention({ actualMaterialLabel: 'Generic Marble' });
    expect(bad.ok).toBe(false);
    const good = assertNoGenericMaterialInvention({ actualMaterialLabel: 'founder-marble' });
    expect(good.ok).toBe(true);
    expect(FORBIDDEN_GENERIC_MATERIALS).toContain('marble');
  });

  it('resolves organization style profiles — not vague prompts', () => {
    const style = resolveStyleProfile('executive-reception');
    expect(style?.styleId).toBe('ExecutiveReception');
    expect(style?.visualLanguage).toContain('Concierge');
  });

  it('decomposes plan into independent bounded jobs', () => {
    const plan = authorConstructionPlan(fixtureFounderReceptionRequest());
    const queue = decomposePlanToJobQueue(plan);
    expect(queue.jobs.length).toBeGreaterThanOrEqual(8);
    const independence = assertJobsIndependent(queue.jobs);
    expect(independence.ok).toBe(true);
    expect(queue.jobs.every((j) => j.boundedScope)).toBe(true);
    expect(queue.jobs.some((j) => j.jobType === 'architecture')).toBe(true);
    expect(queue.jobs.some((j) => j.jobType === 'hero-asset')).toBe(true);
    expect(queue.jobs.some((j) => j.jobType === 'lighting')).toBe(true);
    expect(queue.jobs.some((j) => j.jobType === 'interaction')).toBe(true);
  });

  it('AI workers receive bounded input — no whole-room context', () => {
    const plan = authorConstructionPlan(fixtureFounderReceptionRequest());
    const queue = decomposePlanToJobQueue(plan);
    const heroJob = queue.jobs.find((j) => j.jobType === 'hero-asset')!;
    const workerInput = buildAiWorkerInput({
      job: heroJob,
      organizationId: 'frontal-slayer',
      brandGroundingRequired: true,
    });
    expect(assertWorkerBounded(workerInput).ok).toBe(true);
    expect(workerInput.assetId).toBe('ReceptionDesk');
    expect(workerInput.socketId).toBe('ReceptionDeskSocket');
    expect(workerInput.materialIds).toContain('founder-marble');
    expect(workerInput.boundedScope).toBe(true);
  });

  it('quality guard validates output against blueprint', () => {
    const plan = authorConstructionPlan(fixtureFounderReceptionRequest());
    const queue = decomposePlanToJobQueue(plan);
    const heroJob = queue.jobs.find((j) => j.assetId === 'ReceptionDesk')!;
    const workerInput = buildAiWorkerInput({ job: heroJob, organizationId: 'frontal-slayer' });
    const output = executeAiWorkerMock({ workerInput, expectedVersion: '7.0.0' });
    const quality = verifyWorkerOutputAgainstBlueprint({
      plan,
      workerOutput: output,
      expectedAssetVersion: '7.0.0',
      expectedMaterialLabel: 'founder-marble',
    });
    expect(quality.approved).toBe(true);
    expect(quality.failedChecks).toHaveLength(0);
  });

  it('detects blueprint drift — version mismatch triggers repair', () => {
    const plan = authorConstructionPlan(fixtureFounderReceptionRequest());
    const diff = diffBlueprintAgainstActual({
      plan,
      actualAssets: [
        {
          assetId: 'ReceptionDesk',
          version: '6.0.0',
          socketId: 'ReceptionDeskSocket',
          materialLabel: 'founder-marble',
          transparency: 'alpha',
        },
        {
          assetId: 'CrystalLandmark',
          version: '5.0.0',
          socketId: 'LandmarkSocket',
          materialLabel: 'founder-crystal',
          transparency: 'alpha',
        },
      ],
    });
    expect(diff.hasDrift).toBe(true);
    expect(diff.entries.some((e) => e.category === 'asset-version')).toBe(true);
    const repairs = planBlueprintImmuneRecovery({ plan, diffResult: diff });
    expect(repairs.some((r) => r.action === 'upgrade-asset')).toBe(true);
    expect(repairs.every((r) => r.blueprintAuthoritative)).toBe(true);
  });

  it('detects generic marble drift — immune rebuilds material layer', () => {
    const plan = authorConstructionPlan(fixtureFounderReceptionRequest());
    const diff = diffBlueprintAgainstActual({
      plan,
      actualAssets: [
        {
          assetId: 'ReceptionDesk',
          version: '7.0.0',
          socketId: 'ReceptionDeskSocket',
          materialLabel: 'Generic Marble',
          transparency: 'alpha',
        },
        {
          assetId: 'CrystalLandmark',
          version: '5.0.0',
          socketId: 'LandmarkSocket',
          materialLabel: 'founder-crystal',
          transparency: 'alpha',
        },
      ],
    });
    expect(diff.entries.some((e) => e.category === 'material')).toBe(true);
    const repairs = planBlueprintImmuneRecovery({ plan, diffResult: diff });
    expect(repairs.some((r) => r.action === 'rebuild-material-layer')).toBe(true);
  });

  it('rejects full-scene render — requeues landmark job', () => {
    const plan = authorConstructionPlan(fixtureFounderReceptionRequest());
    const diff = diffBlueprintAgainstActual({
      plan,
      actualAssets: [
        {
          assetId: 'ReceptionDesk',
          version: '7.0.0',
          socketId: 'ReceptionDeskSocket',
          materialLabel: 'founder-marble',
          transparency: 'alpha',
        },
        {
          assetId: 'CrystalLandmark',
          version: '5.0.0',
          socketId: 'LandmarkSocket',
          materialLabel: 'founder-crystal',
          transparency: 'full-scene',
        },
      ],
    });
    expect(diff.entries.some((e) => e.category === 'transparency')).toBe(true);
    const repairs = planBlueprintImmuneRecovery({ plan, diffResult: diff });
    expect(repairs.some((r) => r.action === 'reject-and-requeue')).toBe(true);
  });

  it('captures blueprint revision for reproducible compiles', () => {
    const plan = authorConstructionPlan(fixtureFounderReceptionRequest());
    const revision = captureBlueprintRevision(plan);
    expect(revision.revision).toBe(14);
    expect(revision.versions.materialVersion).toBe('12.0.0');
    expect(revision.planId).toBe(plan.planId);
  });

  it('runs full blueprint compile pipeline', () => {
    const result = runBlueprintCompile(fixtureFounderReceptionRequest());
    expect(result.success).toBe(true);
    expect(result.constructionPlan.planId).toContain('plan-');
    expect(result.jobQueue.jobs.length).toBeGreaterThan(0);
    expect(result.qualityResults.length).toBeGreaterThan(0);
    expect(result.worldBuild?.success).toBe(true);
    expect(result.failedPhase).toBeNull();
    const blueprintPhase = result.phases.find((p) => p.phase === 'blueprint-author');
    expect(blueprintPhase?.success).toBe(true);
  });

  it('fixture reception plan matches sprint specification', () => {
    const style = resolveStyleProfile('executive-reception')!;
    const plan = fixtureReceptionConstructionPlan({
      organizationId: 'frontal-slayer',
      buildingId: 'building-frontal-slayer-hq',
      floorId: 'floor-executive-01',
      roomId: 'room-reception-story-table',
      requestId: 'test-req',
      founderIntent: 'Executive reception',
      styleProfile: style,
    });
    expect(plan.lightingProfile.profileId).toBe('ExecutiveReceptionLighting');
    expect(plan.heroAssets.find((a) => a.assetId === 'ReceptionDesk')?.version).toBe('7.0.0');
    expect(plan.cameraAnchors).toHaveLength(5);
    expect(plan.navigationGraph.loaded).toBe(true);
  });
});
