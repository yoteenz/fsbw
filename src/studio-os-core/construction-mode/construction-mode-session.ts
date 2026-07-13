import type { ConstructionPlan } from '../blueprint-author/construction-plan-schema';
import type { AssetDnaRecord } from '../manufacturing-engine/asset-dna';
import type { RenderIntent } from '../manufacturing-engine/render-intent';
import type { ManufacturingQueue } from '../manufacturing-engine/manufacturing-queue';
import type { FounderApprovalStatus, ConstructionModeStatus } from './contract';
import { buildConstructionPlanDashboard } from './construction-plan-dashboard';
import { buildWorldPreviewModel } from './world-preview';
import { initLayerToggles, type LayerToggleState } from './layer-toggles';
import { buildSocketVisualization } from './socket-visualization';
import { buildCameraSystemPreview } from './camera-system-preview';
import { buildNavigationGraphView } from './navigation-graph-view';
import { buildDependencyGraph } from './dependency-visualizer';
import { buildAiWorkerMonitor } from './ai-worker-monitor';
import { initLiveConstructionView } from './live-construction';
import { initLiveInstallation } from './live-installation';
import { initWorldTimeline, appendTimelineEvent } from './world-timeline';
import { initFounderTimeMachine } from './founder-time-machine';

export const CONSTRUCTION_MODE_SESSION_VERSION = 'construction-mode-session.v1';

/** Interactive Construction Mode state — nothing generated yet */
export type ConstructionModeSession = {
  sessionVersion: typeof CONSTRUCTION_MODE_SESSION_VERSION;
  planId: string;
  status: ConstructionModeStatus;
  approvalStatus: FounderApprovalStatus;
  dashboard: ReturnType<typeof buildConstructionPlanDashboard>;
  worldPreview: ReturnType<typeof buildWorldPreviewModel>;
  layerToggles: LayerToggleState[];
  sockets: ReturnType<typeof buildSocketVisualization>;
  cameras: ReturnType<typeof buildCameraSystemPreview>;
  navigation: ReturnType<typeof buildNavigationGraphView>;
  dependencies: ReturnType<typeof buildDependencyGraph>;
  workerMonitor: ReturnType<typeof buildAiWorkerMonitor>;
  liveConstruction: ReturnType<typeof initLiveConstructionView>;
  liveInstallation: ReturnType<typeof initLiveInstallation>;
  timeline: ReturnType<typeof initWorldTimeline>;
  timeMachine: ReturnType<typeof initFounderTimeMachine>;
  generationOccurred: false;
};

export function openConstructionModeSession(input: {
  plan: ConstructionPlan;
  dnaRecords: AssetDnaRecord[];
  renderIntents: RenderIntent[];
  queue: ManufacturingQueue;
  organizationId: string;
}): ConstructionModeSession {
  const dashboard = buildConstructionPlanDashboard({
    plan: input.plan,
    queue: input.queue,
    dnaRecords: input.dnaRecords,
  });
  const worldPreview = buildWorldPreviewModel({ plan: input.plan, dnaRecords: input.dnaRecords });
  const timeline = appendTimelineEvent(initWorldTimeline(input.plan.planId), {
    eventType: 'construction-mode-opened',
    label: 'Construction Mode opened',
    assetId: null,
    detail: `Preview ${input.plan.room.displayName} rev${input.plan.metadata.revision}`,
  });

  return {
    sessionVersion: CONSTRUCTION_MODE_SESSION_VERSION,
    planId: input.plan.planId,
    status: 'awaiting-approval',
    approvalStatus: 'pending',
    dashboard,
    worldPreview,
    layerToggles: initLayerToggles(),
    sockets: buildSocketVisualization({ plan: input.plan, dnaRecords: input.dnaRecords }),
    cameras: buildCameraSystemPreview(input.plan),
    navigation: buildNavigationGraphView(input.plan),
    dependencies: buildDependencyGraph(input.queue),
    workerMonitor: buildAiWorkerMonitor({ queue: input.queue, organizationId: input.organizationId }),
    liveConstruction: initLiveConstructionView(input.queue),
    liveInstallation: initLiveInstallation(worldPreview),
    timeline,
    timeMachine: initFounderTimeMachine(timeline),
    generationOccurred: false,
  };
}

export function approveConstructionMode(session: ConstructionModeSession): ConstructionModeSession {
  return {
    ...session,
    status: 'manufacturing',
    approvalStatus: 'approved',
    timeline: appendTimelineEvent(session.timeline, {
      eventType: 'founder-approved',
      label: 'Founder approved compile',
      assetId: null,
      detail: 'Manufacturing authorized',
    }),
  };
}

export function rejectConstructionMode(session: ConstructionModeSession): ConstructionModeSession {
  return {
    ...session,
    status: 'previewing',
    approvalStatus: 'rejected',
  };
}
