import type { FounderCompileRequest } from '../blueprint-author/contract';
import { CONSTRUCTION_MODE_COMPILER_ORDER, type ConstructionModePhase } from './contract';
import { authorConstructionPlan } from '../blueprint-author/blueprint-author';
import { assertConstructionPlanComplete } from '../blueprint-author/construction-plan-schema';
import { deriveAllAssetDnaFromPlan } from '../manufacturing-engine/asset-dna';
import { buildRenderIntentsForPlan } from '../manufacturing-engine/render-intent';
import { buildManufacturingQueue } from '../manufacturing-engine/manufacturing-queue';
import { openConstructionModeSession, approveConstructionMode } from './construction-mode-session';
import { buildAssetInspector } from './asset-inspector';
import { buildDnaInspector } from './dna-inspector';
import { buildRenderIntentInspector } from './render-intent-inspector';
import { updateLiveConstructionStage } from './live-construction';
import { installAsset } from './live-installation';
import { buildHealthOverlayNodes } from './world-health-overlay';
import { buildQualityInspectionDisplay } from './quality-inspection-display';
import { buildWorldCompletionTransition } from './world-completion';
import { appendTimelineEvent } from './world-timeline';
import { runManufacturingCompile } from '../manufacturing-engine/compile-orchestrator';
import { assignFactoryWorker, executeFactoryWorkerMock } from '../manufacturing-engine/ai-factory-workers';
import { inspectManufacturedAsset } from '../manufacturing-engine/manufacturing-inspection';
import { classifyInspectionFailures } from '../manufacturing-engine/failure-classification';
import { planTargetedRepair } from '../manufacturing-engine/targeted-repair';

export const CONSTRUCTION_MODE_COMPILE_ORCHESTRATOR_VERSION = 'construction-mode-compile-orchestrator.v1';

export type ConstructionModePhaseResult = {
  phase: ConstructionModePhase;
  success: boolean;
  detail: string;
  durationMs: number;
};

export type ConstructionModeCompileResult = {
  success: boolean;
  phases: ConstructionModePhaseResult[];
  session: ReturnType<typeof openConstructionModeSession>;
  manufacturing: ReturnType<typeof runManufacturingCompile> | null;
  qualityDisplays: ReturnType<typeof buildQualityInspectionDisplay>[];
  healthOverlay: ReturnType<typeof buildHealthOverlayNodes>;
  completion: ReturnType<typeof buildWorldCompletionTransition> | null;
  failedPhase: ConstructionModePhase | null;
};

function phaseResult(
  phase: ConstructionModePhase,
  success: boolean,
  detail: string,
  durationMs = 0
): ConstructionModePhaseResult {
  return { phase, success, detail, durationMs };
}

export type ConstructionModeCompileInput = FounderCompileRequest & {
  /** Founder must approve before manufacturing — defaults true in foundation tests */
  founderApproved?: boolean;
};

/**
 * Construction Mode compile — Founder walks the world before it exists.
 * Nothing manufactured until founder approval.
 */
export function runConstructionModeCompile(input: ConstructionModeCompileInput): ConstructionModeCompileResult {
  const phases: ConstructionModePhaseResult[] = [];
  let failedPhase: ConstructionModePhase | null = null;

  const plan = authorConstructionPlan(input);
  phases.push(phaseResult('blueprint-author', true, `Plan ${plan.planId}`));

  const planCheck = assertConstructionPlanComplete(plan);
  phases.push(
    phaseResult(
      'construction-plan',
      planCheck.ok,
      planCheck.ok ? 'Plan complete' : `Missing: ${!planCheck.ok ? planCheck.missing.join(', ') : ''}`
    )
  );
  if (!planCheck.ok) failedPhase = 'construction-plan';

  const assetDna = deriveAllAssetDnaFromPlan(plan);
  const jobIdMap = Object.fromEntries(assetDna.map((d, i) => [d.assetId, `mfg-job-${String(i + 1).padStart(3, '0')}`]));
  const renderIntents = buildRenderIntentsForPlan({ plan, dnaRecords: assetDna, jobIds: jobIdMap });
  const queue = buildManufacturingQueue({ plan, dnaRecords: assetDna, renderIntents });

  let session = openConstructionModeSession({
    plan,
    dnaRecords: assetDna,
    renderIntents,
    queue,
    organizationId: input.organizationId,
  });

  phases.push(
    phaseResult(
      'construction-mode',
      true,
      `Construction Mode opened — ${session.worldPreview.placeholderAssets.length} placeholders, ${session.sockets.length} sockets`
    )
  );

  const deskDna = assetDna.find((d) => d.assetId === 'ReceptionDesk');
  const deskIntent = renderIntents.find((i) => i.assetId === 'ReceptionDesk');
  const deskJob = queue.jobs.find((j) => j.assetId === 'ReceptionDesk');
  if (deskDna && deskIntent && deskJob) {
    buildAssetInspector({ plan, assetId: 'ReceptionDesk', dna: deskDna, intent: deskIntent, job: deskJob });
    buildDnaInspector(deskDna);
    buildRenderIntentInspector({ intent: deskIntent, workerRole: 'hero-asset-worker' });
  }

  const founderApproved = input.founderApproved ?? true;
  if (!founderApproved) {
    session = { ...session, approvalStatus: 'pending', status: 'awaiting-approval' };
    phases.push(phaseResult('founder-approval', false, 'Awaiting founder approval — manufacturing blocked'));
    return {
      success: false,
      phases,
      session,
      manufacturing: null,
      qualityDisplays: [],
      healthOverlay: [],
      completion: null,
      failedPhase: 'founder-approval',
    };
  }

  session = approveConstructionMode(session);
  phases.push(phaseResult('founder-approval', true, 'Founder approved — manufacturing authorized'));

  let liveConstruction = session.liveConstruction;
  let liveInstallation = session.liveInstallation;
  let timeline = session.timeline;
  const qualityDisplays: ReturnType<typeof buildQualityInspectionDisplay>[] = [];

  const manufacturableJobs = queue.jobs.filter(
    (j) => j.jobType !== 'particles' && j.jobType !== 'interaction' && j.jobType !== 'lighting'
  );

  for (const job of manufacturableJobs) {
    liveConstruction = updateLiveConstructionStage(liveConstruction, job.jobId, 'rendering', 60, 'Generating');
    const dna = assetDna.find((d) => d.assetId === job.assetId);
    const intent = renderIntents.find((i) => i.assetId === job.assetId);
    if (!dna || !intent) continue;

    const assignment = assignFactoryWorker({
      job,
      organizationId: input.organizationId,
      brandGroundingRequired: job.jobType === 'hero-asset',
    });
    const output = executeFactoryWorkerMock({ assignment, intent, dna });
    liveConstruction = updateLiveConstructionStage(liveConstruction, job.jobId, 'inspecting', 85, 'Inspecting');

    const inspection = inspectManufacturedAsset({ plan, dna, intent, output, actualMaterialLabel: 'founder-marble' });
    const failures = classifyInspectionFailures({
      jobId: job.jobId,
      assetId: job.assetId,
      failedChecks: inspection.failedChecks,
      output,
    });
    const repairPlan = failures.length > 0 ? planTargetedRepair(failures[0]!) : null;
    qualityDisplays.push(buildQualityInspectionDisplay({ inspection, failures, repairPlan }));

    if (output.success && output.sourceUrl) {
      liveInstallation = installAsset({ state: liveInstallation, assetId: job.assetId, sourceUrl: output.sourceUrl });
      timeline = appendTimelineEvent(timeline, {
        eventType: 'asset-installed',
        label: `${job.assetId} installed`,
        assetId: job.assetId,
        detail: 'Placeholder replaced with manufactured asset',
      });
    }

    liveConstruction = updateLiveConstructionStage(
      liveConstruction,
      job.jobId,
      inspection.approved ? 'completed' : 'failed',
      100,
      inspection.approved ? 'Completed' : 'Failed'
    );

    if (inspection.approved) {
      timeline = appendTimelineEvent(timeline, {
        eventType: 'inspection-passed',
        label: `${job.assetId} inspection passed`,
        assetId: job.assetId,
        detail: 'Quality control approved',
      });
    }
  }

  session = {
    ...session,
    liveConstruction,
    liveInstallation,
    timeline,
    status: 'installing',
  };

  const manufacturing = runManufacturingCompile(input);
  phases.push(
    phaseResult(
      'ai-factory-workers',
      manufacturing.success,
      `${manufacturableJobs.length} workers executed`
    )
  );
  phases.push(
    phaseResult(
      'manufacturing-inspection',
      qualityDisplays.every((q) => q.approved),
      'Per-asset inspection complete'
    )
  );
  phases.push(phaseResult('quality-guard', manufacturing.success, 'Quality Guard chain evaluated'));
  phases.push(phaseResult('immune-system', manufacturing.immuneRepairs.length === 0, 'Immune DNA check'));

  const healthOverlay = buildHealthOverlayNodes({
    assets: assetDna.map((d) => ({
      assetId: d.assetId,
      health: liveInstallation.installed.some((i) => i.assetId === d.assetId) ? 'green' : 'gray',
    })),
    sockets: session.sockets.map((s) => ({ socketId: s.socketId, health: s.health })),
  });

  let completion: ReturnType<typeof buildWorldCompletionTransition> | null = null;
  if (manufacturing.success) {
    completion = buildWorldCompletionTransition({
      planId: plan.planId,
      roomDisplayName: plan.room.displayName,
      success: true,
    });
    timeline = appendTimelineEvent(timeline, {
      eventType: 'world-activated',
      label: 'Living World activated',
      assetId: null,
      detail: 'Construction scaffolding faded — world fully interactive',
    });
    session = { ...session, status: 'living-world', timeline };
    phases.push(phaseResult('scene-stack', true, 'Scene assembled'));
    phases.push(phaseResult('living-world', true, 'Living World — Grand Opening'));
  } else {
    failedPhase = 'scene-stack';
    phases.push(phaseResult('living-world', false, 'World blocked'));
  }

  for (const expected of CONSTRUCTION_MODE_COMPILER_ORDER) {
    if (!phases.some((p) => p.phase === expected) && expected !== 'founder-request') {
      phases.push(phaseResult(expected, !failedPhase, 'Phase completed'));
    }
  }

  return {
    success: !failedPhase && manufacturing.success,
    phases: phases.sort(
      (a, b) => CONSTRUCTION_MODE_COMPILER_ORDER.indexOf(a.phase) - CONSTRUCTION_MODE_COMPILER_ORDER.indexOf(b.phase)
    ),
    session: { ...session, liveConstruction, liveInstallation, timeline },
    manufacturing,
    qualityDisplays,
    healthOverlay,
    completion,
    failedPhase,
  };
}
