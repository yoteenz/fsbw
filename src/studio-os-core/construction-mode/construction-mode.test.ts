import { describe, expect, it } from 'vitest';
import {
  CONSTRUCTION_MODE_COMPILER_ORDER,
  buildConstructionPlanDashboard,
  buildWorldPreviewModel,
  initLayerToggles,
  isolateLayer,
  buildSocketVisualization,
  buildCameraSystemPreview,
  selectCameraFraming,
  buildNavigationGraphView,
  buildAssetInspector,
  buildDnaInspector,
  buildRenderIntentInspector,
  initLiveConstructionView,
  updateLiveConstructionStage,
  installAsset,
  initLiveInstallation,
  buildHealthOverlayNodes,
  buildDependencyGraph,
  buildAiWorkerMonitor,
  buildWorldCompletionTransition,
  appendTimelineEvent,
  initWorldTimeline,
  startTimeMachineReplay,
  advanceTimeMachineReplay,
  openConstructionModeSession,
  approveConstructionMode,
  runConstructionModeCompile,
  HEALTH_OVERLAY_MAP,
} from './index';
import {
  authorConstructionPlan,
  fixtureFounderReceptionRequest,
} from '../blueprint-author';
import {
  deriveAllAssetDnaFromPlan,
  buildRenderIntentsForPlan,
  buildManufacturingQueue,
} from '../manufacturing-engine';

describe('Studio World Construction Mode™', () => {
  const plan = authorConstructionPlan(fixtureFounderReceptionRequest());

  it('defines compiler order with Construction Mode before manufacturing', () => {
    expect(CONSTRUCTION_MODE_COMPILER_ORDER[3]).toBe('construction-mode');
    expect(CONSTRUCTION_MODE_COMPILER_ORDER[4]).toBe('founder-approval');
    expect(CONSTRUCTION_MODE_COMPILER_ORDER).toContain('living-world');
  });

  it('builds construction plan dashboard — nothing generated yet', () => {
    const dna = deriveAllAssetDnaFromPlan(plan);
    const jobIds = Object.fromEntries(dna.map((d, i) => [d.assetId, `job-${i}`]));
    const intents = buildRenderIntentsForPlan({ plan, dnaRecords: dna, jobIds });
    const queue = buildManufacturingQueue({ plan, dnaRecords: dna, renderIntents: intents });
    const dashboard = buildConstructionPlanDashboard({ plan, queue, dnaRecords: dna });
    expect(dashboard.generationOccurred).toBe(false);
    expect(dashboard.roomDisplayName).toBe('Reception');
    expect(dashboard.blueprintRevision).toBe(14);
    expect(dashboard.architecture.name).toBe('ReceptionShell');
    expect(dashboard.actions.compileWorld).toBe(true);
    expect(dashboard.actions.previewWorld).toBe(true);
    expect(dashboard.estimates.costUnits).toBeGreaterThan(0);
  });

  it('renders procedural clay world preview — not AI generated', () => {
    const dna = deriveAllAssetDnaFromPlan(plan);
    const preview = buildWorldPreviewModel({ plan, dnaRecords: dna });
    expect(preview.renderStyle).toBe('procedural-clay');
    expect(preview.generationOccurred).toBe(false);
    expect(preview.architecture.color).toBe('white');
    expect(preview.placeholderAssets.length).toBeGreaterThan(0);
    expect(preview.sockets.every((s) => s.color === 'blue')).toBe(true);
    expect(preview.cameraMarkers.length).toBe(5);
  });

  it('supports independent layer toggles', () => {
    const layers = initLayerToggles();
    expect(layers.length).toBe(14);
    const isolated = isolateLayer(layers, 'sockets');
    expect(isolated.find((l) => l.layerId === 'sockets')?.visible).toBe(true);
    expect(isolated.find((l) => l.layerId === 'architecture')?.visible).toBe(false);
  });

  it('visualizes sockets with purpose and dependencies', () => {
    const dna = deriveAllAssetDnaFromPlan(plan);
    const sockets = buildSocketVisualization({ plan, dnaRecords: dna });
    const deskSocket = sockets.find((s) => s.socketId === 'ReceptionDeskSocket');
    expect(deskSocket?.occupied).toBe(true);
    expect(deskSocket?.acceptedAssetTypes).toContain('reception-desk');
    expect(deskSocket?.dependencies).toContain('ReceptionShell');
  });

  it('previews camera framing on selection', () => {
    const cameras = buildCameraSystemPreview(plan);
    const arrival = selectCameraFraming(cameras, 'LobbyArrival');
    expect(arrival?.purpose).toBe('arrival');
    expect(arrival?.framing.fov).toBe(60);
  });

  it('displays navigation graph for circulation understanding', () => {
    const nav = buildNavigationGraphView(plan);
    expect(nav.entryPoints.length).toBeGreaterThan(0);
    expect(nav.walkPaths.length).toBeGreaterThan(0);
    expect(nav.movementGraph.length).toBeGreaterThan(0);
  });

  it('opens asset inspector with full transparency', () => {
    const dna = deriveAllAssetDnaFromPlan(plan);
    const deskDna = dna.find((d) => d.assetId === 'ReceptionDesk')!;
    const jobIds = Object.fromEntries(dna.map((d, i) => [d.assetId, `job-${i}`]));
    const intents = buildRenderIntentsForPlan({ plan, dnaRecords: dna, jobIds });
    const queue = buildManufacturingQueue({ plan, dnaRecords: dna, renderIntents: intents });
    const deskJob = queue.jobs.find((j) => j.assetId === 'ReceptionDesk')!;
    const deskIntent = intents.find((i) => i.assetId === 'ReceptionDesk')!;
    const inspector = buildAssetInspector({
      plan,
      assetId: 'ReceptionDesk',
      dna: deskDna,
      intent: deskIntent,
      job: deskJob,
    });
    expect(inspector?.assetId).toBe('ReceptionDesk');
    expect(inspector?.actions.inspectDna).toBe(true);
    expect(inspector?.actions.openManufacturingInstructions).toBe(true);
  });

  it('exposes DNA inspector view', () => {
    const dna = deriveAllAssetDnaFromPlan(plan);
    const deskDna = dna.find((d) => d.assetId === 'ReceptionDesk')!;
    const panel = buildDnaInspector(deskDna);
    expect(panel.forbiddenMaterials).toContain('gold');
    expect(panel.forbiddenGenerations).toContain('complete-rooms');
    expect(panel.assetSignatureHash).toBeTruthy();
  });

  it('exposes Render Intent as manufacturing drawings', () => {
    const dna = deriveAllAssetDnaFromPlan(plan);
    const jobIds = Object.fromEntries(dna.map((d, i) => [d.assetId, `job-${i}`]));
    const intents = buildRenderIntentsForPlan({ plan, dnaRecords: dna, jobIds });
    const deskIntent = intents.find((i) => i.assetId === 'ReceptionDesk')!;
    const panel = buildRenderIntentInspector({ intent: deskIntent, workerRole: 'hero-asset-worker' });
    expect(panel.forbiddenArchitecture).toBe(true);
    expect(panel.expectedOutput).toContain('isolated');
  });

  it('blocks manufacturing without founder approval', () => {
    const result = runConstructionModeCompile({ ...fixtureFounderReceptionRequest(), founderApproved: false });
    expect(result.success).toBe(false);
    expect(result.failedPhase).toBe('founder-approval');
    expect(result.manufacturing).toBeNull();
    expect(result.session.approvalStatus).toBe('pending');
  });

  it('tracks live construction progress', () => {
    const dna = deriveAllAssetDnaFromPlan(plan);
    const jobIds = Object.fromEntries(dna.map((d, i) => [d.assetId, `job-${i}`]));
    const intents = buildRenderIntentsForPlan({ plan, dnaRecords: dna, jobIds });
    const queue = buildManufacturingQueue({ plan, dnaRecords: dna, renderIntents: intents });
    let view = initLiveConstructionView(queue);
    const job = queue.jobs[0]!;
    view = updateLiveConstructionStage(view, job.jobId, 'inspecting', 80, 'Inspecting');
    expect(view.stages[0]?.detail).toBe('Inspecting');
    expect(view.stages[0]?.progressBar).toContain('█');
  });

  it('installs assets — placeholder disappears', () => {
    const dna = deriveAllAssetDnaFromPlan(plan);
    const preview = buildWorldPreviewModel({ plan, dnaRecords: dna });
    let state = initLiveInstallation(preview);
    const before = state.placeholders.length;
    state = installAsset({ state, assetId: 'ReceptionDesk', sourceUrl: 'https://example.com/desk.png' });
    expect(state.placeholders.length).toBe(before - 1);
    expect(state.installed).toHaveLength(1);
    expect(state.installed[0]?.replacedPlaceholder).toBe(true);
  });

  it('maps health overlay colors', () => {
    expect(HEALTH_OVERLAY_MAP.green.label).toBe('Healthy');
    expect(HEALTH_OVERLAY_MAP.blue.label).toBe('Building');
    const overlay = buildHealthOverlayNodes({
      assets: [{ assetId: 'ReceptionDesk', health: 'green' }],
      sockets: [{ socketId: 'ReceptionDeskSocket', health: 'purple' }],
    });
    expect(overlay).toHaveLength(2);
  });

  it('visualizes manufacturing dependencies', () => {
    const dna = deriveAllAssetDnaFromPlan(plan);
    const jobIds = Object.fromEntries(dna.map((d, i) => [d.assetId, `job-${i}`]));
    const intents = buildRenderIntentsForPlan({ plan, dnaRecords: dna, jobIds });
    const queue = buildManufacturingQueue({ plan, dnaRecords: dna, renderIntents: intents });
    const graph = buildDependencyGraph(queue);
    expect(graph.edges.length).toBeGreaterThan(0);
    expect(graph.edges.some((e) => e.label.includes('depends on'))).toBe(true);
  });

  it('monitors AI factory workers', () => {
    const dna = deriveAllAssetDnaFromPlan(plan);
    const jobIds = Object.fromEntries(dna.map((d, i) => [d.assetId, `job-${i}`]));
    const intents = buildRenderIntentsForPlan({ plan, dnaRecords: dna, jobIds });
    const queue = buildManufacturingQueue({ plan, dnaRecords: dna, renderIntents: intents });
    const monitor = buildAiWorkerMonitor({ queue, organizationId: 'frontal-slayer' });
    expect(monitor.workers.some((w) => w.label === 'Architecture Worker')).toBe(true);
  });

  it('records world timeline — replayable', () => {
    let timeline = initWorldTimeline('plan-test');
    timeline = appendTimelineEvent(timeline, {
      eventType: 'blueprint-approved',
      label: 'Blueprint approved',
      assetId: null,
      detail: 'Rev 14',
    });
    timeline = appendTimelineEvent(timeline, {
      eventType: 'world-activated',
      label: 'World activated',
      assetId: null,
      detail: 'Living World',
    });
    expect(timeline.replayable).toBe(true);
    expect(timeline.events).toHaveLength(2);

    let machine = startTimeMachineReplay(
      { machineVersion: 'founder-time-machine.v1', planId: 'plan-test', events: timeline.events, currentIndex: 1, replayMode: null, isReplaying: false },
      'full-build'
    );
    expect(machine.isReplaying).toBe(true);
    machine = advanceTimeMachineReplay(machine);
    expect(machine.currentIndex).toBe(1);
  });

  it('runs full construction mode compile pipeline', () => {
    const result = runConstructionModeCompile(fixtureFounderReceptionRequest());
    expect(result.success).toBe(true);
    expect(result.session.dashboard.generationOccurred).toBe(false);
    expect(result.session.approvalStatus).toBe('approved');
    expect(result.session.status).toBe('living-world');
    expect(result.qualityDisplays.length).toBeGreaterThan(0);
    expect(result.completion?.toMode).toBe('living-world');
    expect(result.manufacturing?.success).toBe(true);
    expect(result.session.timeline.events.some((e) => e.eventType === 'world-activated')).toBe(true);
  });

  it('opens construction mode session with all subsystems', () => {
    const dna = deriveAllAssetDnaFromPlan(plan);
    const jobIds = Object.fromEntries(dna.map((d, i) => [d.assetId, `job-${i}`]));
    const intents = buildRenderIntentsForPlan({ plan, dnaRecords: dna, jobIds });
    const queue = buildManufacturingQueue({ plan, dnaRecords: dna, renderIntents: intents });
    let session = openConstructionModeSession({
      plan,
      dnaRecords: dna,
      renderIntents: intents,
      queue,
      organizationId: 'frontal-slayer',
    });
    expect(session.generationOccurred).toBe(false);
    expect(session.status).toBe('awaiting-approval');
    session = approveConstructionMode(session);
    expect(session.approvalStatus).toBe('approved');
    const completion = buildWorldCompletionTransition({ planId: plan.planId, roomDisplayName: plan.room.displayName, success: true });
    expect(completion.scaffoldingFade).toBe(true);
  });
});
