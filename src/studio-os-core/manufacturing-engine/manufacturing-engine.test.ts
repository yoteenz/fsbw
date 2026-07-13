import { describe, expect, it } from 'vitest';
import {
  WORLD_MANUFACTURING_COMPILER_ORDER,
  deriveAllAssetDnaFromPlan,
  buildRenderIntentsForPlan,
  assertNoPromptInRenderIntent,
  buildManufacturingQueue,
  assignFactoryWorker,
  assertWorkerSpecialization,
  executeFactoryWorkerMock,
  inspectManufacturedAsset,
  classifyInspectionFailures,
  classifyFailureLabel,
  planTargetedRepair,
  buildFounderPreview,
  initLiveManufacturingView,
  updateLiveManufacturingStage,
  formatProgressBar,
  evaluateQualityGuardEvolution,
  diffExpectedVsActualDna,
  planImmuneDnaRecovery,
  getModelScoreboard,
  resolveBestModelForTask,
  lockOrganizationMaterials,
  assertNoMaterialSubstitution,
  buildDigitalTwinState,
  runManufacturingCompile,
  computeAssetSignatureHash,
} from './index';
import { authorConstructionPlan, fixtureFounderReceptionRequest } from '../blueprint-author';

describe('Studio World Manufacturing Engine™', () => {
  const plan = authorConstructionPlan(fixtureFounderReceptionRequest());

  it('defines extended manufacturing compiler order', () => {
    expect(WORLD_MANUFACTURING_COMPILER_ORDER[3]).toBe('asset-dna');
    expect(WORLD_MANUFACTURING_COMPILER_ORDER[4]).toBe('render-intent');
    expect(WORLD_MANUFACTURING_COMPILER_ORDER[5]).toBe('manufacturing-queue');
    expect(WORLD_MANUFACTURING_COMPILER_ORDER).toContain('manufacturing-inspection');
    expect(WORLD_MANUFACTURING_COMPILER_ORDER[WORLD_MANUFACTURING_COMPILER_ORDER.length - 1]).toBe('living-world');
  });

  it('derives immutable Asset DNA for every asset', () => {
    const dnaRecords = deriveAllAssetDnaFromPlan(plan);
    expect(dnaRecords.length).toBeGreaterThanOrEqual(6);
    const desk = dnaRecords.find((d) => d.assetId === 'ReceptionDesk');
    expect(desk?.assetRevision).toBe('7.0.0');
    expect(desk?.negativeDna.forbiddenMaterials).toContain('gold');
    expect(desk?.negativeDna.forbiddenGenerations).toContain('complete-rooms');
    expect(desk?.assetSignatureHash).toBe(computeAssetSignatureHash(desk!));
  });

  it('builds Render Intent — not prompts', () => {
    const dnaRecords = deriveAllAssetDnaFromPlan(plan);
    const jobIds = Object.fromEntries(dnaRecords.map((d, i) => [d.assetId, `job-${i}`]));
    const intents = buildRenderIntentsForPlan({ plan, dnaRecords, jobIds });
    const deskIntent = intents.find((i) => i.assetId === 'ReceptionDesk')!;
    expect(deskIntent.outputType).toBe('transparent-png');
    expect(deskIntent.forbiddenArchitecture).toBe(true);
    expect(deskIntent.forbiddenPeople).toBe(true);
    expect(deskIntent.background).toBe('transparent');
    expect(assertNoPromptInRenderIntent(deskIntent).ok).toBe(true);
  });

  it('decomposes manufacturing queue with cost estimates', () => {
    const dnaRecords = deriveAllAssetDnaFromPlan(plan);
    const jobIds = Object.fromEntries(dnaRecords.map((d, i) => [d.assetId, `job-${i}`]));
    const intents = buildRenderIntentsForPlan({ plan, dnaRecords, jobIds });
    const queue = buildManufacturingQueue({ plan, dnaRecords, renderIntents: intents });
    expect(queue.jobs.length).toBeGreaterThanOrEqual(8);
    expect(queue.totalEstimatedCost).toBeGreaterThan(0);
    expect(queue.totalEstimatedTokens).toBeGreaterThan(0);
    expect(queue.jobs.some((j) => j.jobType === 'architecture')).toBe(true);
    expect(queue.jobs.every((j) => j.repairPolicy.targetedRepairFirst)).toBe(true);
  });

  it('assigns specialized factory workers — no role crossover', () => {
    const dnaRecords = deriveAllAssetDnaFromPlan(plan);
    const jobIds = Object.fromEntries(dnaRecords.map((d, i) => [d.assetId, `job-${i}`]));
    const intents = buildRenderIntentsForPlan({ plan, dnaRecords, jobIds });
    const queue = buildManufacturingQueue({ plan, dnaRecords, renderIntents: intents });
    const heroJob = queue.jobs.find((j) => j.assetId === 'ReceptionDesk')!;
    const assignment = assignFactoryWorker({ job: heroJob, organizationId: 'frontal-slayer' });
    expect(assignment.workerRole).toBe('hero-asset-worker');
    expect(assertWorkerSpecialization({ assignment, attemptedRole: 'hero-asset-worker' }).ok).toBe(true);
    expect(assertWorkerSpecialization({ assignment, attemptedRole: 'furniture-worker' }).ok).toBe(false);
  });

  it('inspects manufactured asset — not the room', () => {
    const dnaRecords = deriveAllAssetDnaFromPlan(plan);
    const deskDna = dnaRecords.find((d) => d.assetId === 'ReceptionDesk')!;
    const intent = buildRenderIntentsForPlan({
      plan,
      dnaRecords,
      jobIds: { ReceptionDesk: 'job-1' },
    }).find((i) => i.assetId === 'ReceptionDesk')!;
    const assignment = assignFactoryWorker({
      job: { jobId: 'j1', jobType: 'hero-asset', assetId: 'ReceptionDesk' } as import('./manufacturing-queue').ManufacturingJob,
      organizationId: 'frontal-slayer',
    });
    const output = executeFactoryWorkerMock({ assignment, intent, dna: deskDna });
    const inspection = inspectManufacturedAsset({ plan, dna: deskDna, intent, output, actualMaterialLabel: 'founder-marble' });
    expect(inspection.approved).toBe(true);
    expect(inspection.checks.some((c) => c.checkId === 'no-architecture')).toBe(true);
  });

  it('classifies failures precisely — not generic "Generation Failed"', () => {
    const failures = classifyInspectionFailures({
      jobId: 'j1',
      assetId: 'ReceptionDesk',
      failedChecks: ['background-clean', 'no-architecture'],
      output: {
        jobId: 'j1',
        assetId: 'ReceptionDesk',
        workerRole: 'hero-asset-worker',
        providerModel: 'test',
        success: false,
        sourceUrl: null,
        generationTimeMs: 0,
        actualSilhouette: 'drift',
        actualTransparency: 'unknown',
        actualScale: null,
        architectureDetected: true,
        backgroundDetected: true,
        errors: ['architecture-leakage'],
      },
    });
    expect(failures.some((f) => f.failureClass === 'architecture-leakage')).toBe(true);
    expect(failures.some((f) => f.failureClass === 'background-failure')).toBe(true);
    expect(classifyFailureLabel('architecture-leakage')).toContain('Architecture');
  });

  it('plans targeted repair — background removal without full regeneration', () => {
    const repair = planTargetedRepair({
      failureClass: 'background-failure',
      severity: 'warning',
      jobId: 'j1',
      assetId: 'ReceptionDesk',
      inspectionCheckId: 'background-clean',
      detail: 'Background detected',
      repairable: true,
    });
    expect(repair.action).toBe('background-removal');
    expect(repair.reusePreviousGeneration).toBe(true);
    expect(repair.fullRegenerationRequired).toBe(false);
    expect(repair.workerRole).toBe('background-removal-worker');
  });

  it('plans silhouette repair — adjust and reuse', () => {
    const repair = planTargetedRepair({
      failureClass: 'silhouette-failure',
      severity: 'warning',
      jobId: 'j1',
      assetId: 'ReceptionDesk',
      inspectionCheckId: 'silhouette-match',
      detail: 'Silhouette drift',
      repairable: true,
    });
    expect(repair.action).toBe('adjust-silhouette');
    expect(repair.reusePreviousGeneration).toBe(true);
  });

  it('builds founder preview before AI spend', () => {
    const dnaRecords = deriveAllAssetDnaFromPlan(plan);
    const jobIds = Object.fromEntries(dnaRecords.map((d, i) => [d.assetId, `job-${i}`]));
    const intents = buildRenderIntentsForPlan({ plan, dnaRecords, jobIds });
    const queue = buildManufacturingQueue({ plan, dnaRecords, renderIntents: intents });
    const preview = buildFounderPreview({ plan, queue, dnaRecords });
    expect(preview.roomDisplayName).toBe('Reception');
    expect(preview.blueprintRevision).toBe(14);
    expect(preview.compileReady).toBe(true);
    expect(preview.estimate.estimatedAiCostUnits).toBeGreaterThan(0);
    expect(preview.sections.some((s) => s.label === 'Hero Assets')).toBe(true);
  });

  it('tracks live manufacturing view', () => {
    const dnaRecords = deriveAllAssetDnaFromPlan(plan);
    const jobIds = Object.fromEntries(dnaRecords.map((d, i) => [d.assetId, `job-${i}`]));
    const intents = buildRenderIntentsForPlan({ plan, dnaRecords, jobIds });
    const queue = buildManufacturingQueue({ plan, dnaRecords, renderIntents: intents });
    let view = initLiveManufacturingView(queue);
    const firstJob = queue.jobs[0]!;
    view = updateLiveManufacturingStage(view, firstJob.jobId, 'rendering', 60, 'Rendering');
    expect(view.currentStage).toBe(firstJob.assetId);
    expect(formatProgressBar(60)).toContain('█');
  });

  it('evaluates quality guard evolution chain', () => {
    const dnaRecords = deriveAllAssetDnaFromPlan(plan);
    const deskDna = dnaRecords.find((d) => d.assetId === 'ReceptionDesk')!;
    const intent = buildRenderIntentsForPlan({ plan, dnaRecords, jobIds: { ReceptionDesk: 'j1' } }).find(
      (i) => i.assetId === 'ReceptionDesk'
    )!;
    const assignment = assignFactoryWorker({
      job: { jobId: 'j1', jobType: 'hero-asset', assetId: 'ReceptionDesk' } as import('./manufacturing-queue').ManufacturingJob,
      organizationId: 'frontal-slayer',
    });
    const output = executeFactoryWorkerMock({ assignment, intent, dna: deskDna });
    const inspection = inspectManufacturedAsset({ plan, dna: deskDna, intent, output });
    const quality = evaluateQualityGuardEvolution({ plan, dna: deskDna, intent, output, inspection });
    expect(quality.chain).toEqual(['blueprint', 'dna', 'render-intent', 'output']);
    expect(quality.approved).toBe(true);
  });

  it('immune system compares expected DNA vs actual DNA', () => {
    const dnaRecords = deriveAllAssetDnaFromPlan(plan);
    const deskDna = dnaRecords.find((d) => d.assetId === 'ReceptionDesk')!;
    const diff = diffExpectedVsActualDna({
      expected: deskDna,
      actual: { assetRevision: '6.0.0', materialLabel: 'Generic Marble' },
    });
    expect(diff.hasDrift).toBe(true);
    const repairs = planImmuneDnaRecovery({ dnaDiff: diff, failures: [] });
    expect(repairs.length).toBeGreaterThan(0);
    expect(repairs.every((r) => r.roomRemainsOperational)).toBe(true);
  });

  it('locks organization materials — no substitution', () => {
    const lock = lockOrganizationMaterials({
      organizationId: 'frontal-slayer',
      materialIds: ['founder-marble', 'founder-glass'],
    });
    expect(lock.ok).toBe(true);
    if (lock.ok) expect(lock.materials.every((m) => m.locked)).toBe(true);
    const bad = assertNoMaterialSubstitution({ expectedMaterialId: 'founder-marble', actualLabel: 'Generic Marble' });
    expect(bad.ok).toBe(false);
  });

  it('maintains evidence-based model scoreboard', () => {
    const board = getModelScoreboard();
    expect(board.routingEvidenceBased).toBe(true);
    const best = resolveBestModelForTask({ taskType: 'hero-asset', scoreboard: board });
    expect(best).toBeTruthy();
  });

  it('builds digital twin room state', () => {
    const dnaRecords = deriveAllAssetDnaFromPlan(plan);
    const twin = buildDigitalTwinState({
      roomId: plan.room.roomId,
      roomDisplayName: plan.room.displayName,
      dnaRecords,
      history: [],
      repairingAssetIds: ['CrystalLandmark'],
    });
    expect(twin.overallHealth).toBe('repairing');
    expect(twin.assets.find((a) => a.assetId === 'CrystalLandmark')?.health).toBe('repairing');
  });

  it('runs full manufacturing compile pipeline', () => {
    const result = runManufacturingCompile(fixtureFounderReceptionRequest());
    expect(result.success).toBe(true);
    expect(result.assetDna.length).toBeGreaterThan(0);
    expect(result.renderIntents.length).toBeGreaterThan(0);
    expect(result.founderPreview.compileReady).toBe(true);
    expect(result.qualityResults.every((q) => q.approved)).toBe(true);
    expect(result.blueprintCompile?.success).toBe(true);
    expect(result.digitalTwin.overallHealth).toBe('healthy');
    expect(result.failedPhase).toBeNull();
  });
});
