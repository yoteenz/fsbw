import type {
  AssetLibraryItem,
  ExperienceLabV3Package,
  ExperienceLabV3State,
  OperationsMetrics,
  PipelineStage,
  ReviewItem,
  WorkOrder,
  WorkOrderStatus,
  WorkspaceContextState,
} from '../experience-lab-v3.types';
import { buildV3DesignVariants } from '../registry/v3-workspace-registry';
import {
  defaultV3WorkbenchTool,
  resolveV3InspectorModeForTool,
} from '../registry/v3-workbench-registry';
import { resolveV3DepartmentLabel } from '../registry/v3-program-registry';

const now = () => new Date().toISOString();

function buildDemoWorkOrders(ctx: WorkspaceContextState): WorkOrder[] {
  const base = {
    packageId: `pkg.${ctx.departmentId}.${ctx.variantId}.r${ctx.revision}`,
    environmentId: ctx.environmentId,
    departmentId: ctx.departmentId,
    variantId: ctx.variantId,
    owner: 'Studio Scheduler',
    provider: 'fal-ai',
    revision: ctx.revision,
    createdAt: now(),
    updatedAt: now(),
  };

  return [
    {
      ...base,
      id: 'wo-blueprint',
      kind: 'generate-blueprint',
      title: 'Generate Blueprint',
      status: 'generating',
      progress: 62,
      etaMs: 45_000,
      priority: 'high',
      costUsd: 0.12,
      dependencies: [],
      queueColumn: 'generating',
    },
    {
      ...base,
      id: 'wo-mobile',
      kind: 'generate-mobile',
      title: 'Generate Mobile Companion',
      status: 'waiting',
      progress: 0,
      etaMs: 120_000,
      priority: 'normal',
      costUsd: 0.15,
      dependencies: ['wo-blueprint'],
      queueColumn: 'waiting',
    },
    {
      ...base,
      id: 'wo-materials',
      kind: 'generate-materials',
      title: 'Generate Materials',
      status: 'blocked',
      progress: 0,
      etaMs: null,
      priority: 'normal',
      costUsd: 0.09,
      dependencies: ['wo-blueprint'],
      queueColumn: 'blocked',
    },
    {
      ...base,
      id: 'wo-founder',
      kind: 'generate-package',
      title: 'Founder Review Package',
      status: 'founder-review',
      progress: 100,
      etaMs: null,
      priority: 'critical',
      costUsd: 0,
      dependencies: ['wo-mobile'],
      queueColumn: 'review',
    },
    {
      ...base,
      id: 'wo-desktop',
      kind: 'generate-desktop',
      title: 'Generate Desktop Canonical',
      status: 'completed',
      progress: 100,
      etaMs: null,
      priority: 'high',
      costUsd: 0.18,
      dependencies: [],
      queueColumn: 'completed',
    },
  ];
}

function buildDemoPackage(ctx: WorkspaceContextState): ExperienceLabV3Package {
  const slots: ExperienceLabV3Package['outputs'] = [
    { id: 'desktop', label: 'Desktop', status: 'completed', progress: 100, timestamp: now(), provider: 'fal-ai', credits: 18, cached: true, derivedFrom: 'desktop' },
    { id: 'mobile', label: 'Mobile', status: 'generating', progress: 42, timestamp: null, provider: 'fal-ai', credits: 15, cached: false, derivedFrom: 'desktop' },
    { id: 'tablet', label: 'Tablet', status: 'waiting', progress: 0, timestamp: null, provider: 'fal-ai', credits: 15, cached: false, derivedFrom: 'desktop' },
    { id: 'hero', label: 'Hero', status: 'queued', progress: 0, timestamp: null, provider: 'fal-ai', credits: 12, cached: false, derivedFrom: 'desktop' },
    { id: 'thumbnail', label: 'Thumbnail', status: 'queued', progress: 0, timestamp: null, provider: 'fal-ai', credits: 6, cached: false, derivedFrom: 'desktop' },
    { id: 'blueprint', label: 'Blueprint', status: 'generating', progress: 62, timestamp: null, provider: 'fal-ai', credits: 12, cached: false, derivedFrom: null },
    { id: 'construction', label: 'Construction', status: 'blocked', progress: 0, timestamp: null, provider: 'fal-ai', credits: 12, cached: false, derivedFrom: null },
    { id: 'lighting', label: 'Lighting', status: 'waiting', progress: 0, timestamp: null, provider: 'fal-ai', credits: 9, cached: false, derivedFrom: null },
    { id: 'materials', label: 'Materials', status: 'blocked', progress: 0, timestamp: null, provider: 'fal-ai', credits: 9, cached: false, derivedFrom: null },
    { id: 'manifest', label: 'Manifest', status: 'queued', progress: 0, timestamp: null, provider: 'system', credits: 3, cached: false, derivedFrom: null },
    { id: 'validation', label: 'Validation', status: 'approval-needed', progress: 88, timestamp: null, provider: 'immune-system', credits: 0, cached: false, derivedFrom: null },
  ];

  return {
    packageId: `pkg.${ctx.departmentId}.${ctx.variantId}.r${ctx.revision}`,
    environmentId: ctx.environmentId,
    departmentId: ctx.departmentId,
    variantId: ctx.variantId,
    variantLabel: ctx.variantLabel,
    revision: ctx.revision,
    lifecycleStatus: ctx.lifecycleStatus,
    outputs: slots,
  };
}

function buildPipeline(workOrders: WorkOrder[]): PipelineStage[] {
  const count = (statuses: WorkOrderStatus[]) =>
    workOrders.filter((w) => statuses.includes(w.status)).length;

  const stages: Array<{ id: string; label: string; statuses: WorkOrderStatus[] }> = [
    { id: 'queued', label: 'Queued', statuses: ['queued', 'waiting'] },
    { id: 'preparing', label: 'Preparing', statuses: ['preparing'] },
    { id: 'ai-generation', label: 'AI Generation', statuses: ['generating'] },
    { id: 'validation', label: 'Validation', statuses: ['validation'] },
    { id: 'consistency', label: 'Consistency Check', statuses: ['consistency-check'] },
    { id: 'founder-review', label: 'Founder Review', statuses: ['founder-review', 'approval-needed'] },
    { id: 'canonical', label: 'Canonical', statuses: ['cds-ready', 'asset-manufacturing'] },
    { id: 'marketplace', label: 'Marketplace', statuses: ['marketplace-ready', 'published'] },
  ];

  return stages.map((s) => ({
    id: s.id,
    label: s.label,
    status: count(s.statuses) > 0 ? 'active' : 'idle',
    workOrderCount: count(s.statuses),
  }));
}

function buildReviewItems(ctx: WorkspaceContextState): ReviewItem[] {
  return [
    {
      id: 'rev-founder-01',
      title: `${ctx.departmentLabel} · R${ctx.revision} Founder Review`,
      status: 'pending',
      revision: ctx.revision,
      submittedAt: now(),
    },
    {
      id: 'rev-compare-02',
      title: 'Variant Compare · LUMEN A vs NOIR B',
      status: 'revision-requested',
      revision: ctx.revision - 1,
      submittedAt: now(),
    },
  ];
}

function buildAssetLibrary(ctx: WorkspaceContextState): AssetLibraryItem[] {
  return [
    { id: 'asset-bp-01', label: 'Reception Blueprint R18', kind: 'blueprint', updatedAt: now() },
    { id: 'asset-mat-marble', label: 'Marble Floor Preset', kind: 'material', updatedAt: now() },
    { id: 'asset-pkg-main', label: ctx.variantLabel, kind: 'package', updatedAt: now() },
    { id: 'asset-ref-lobby', label: 'Lobby Reference Board', kind: 'reference', updatedAt: now() },
    { id: 'asset-mkt-icon', label: 'Marketplace Icon Set', kind: 'icon', updatedAt: now() },
  ];
}

const DEMO_OPERATIONS: OperationsMetrics = {
  todaySpendUsd: 4.82,
  gpuUsagePercent: 34,
  generationQueueCount: 7,
  creditsRemaining: 892,
  pendingReviews: 2,
  assetManufacturingCount: 1,
  marketplaceJobs: 3,
  cdsQueueCount: 1,
  failedJobs: 0,
  systemHealthPercent: 94,
  founderNotifications: 1,
};

export function createInitialV3State(): ExperienceLabV3State {
  const workspace: WorkspaceContextState = {
    programId: 'studio-world',
    departmentId: 'reception',
    departmentLabel: 'Reception',
    environmentId: 'experience-lab-main',
    environmentLabel: 'Experience Lab',
    variantId: 'dark-02',
    variantLabel: 'NOIR B',
    revision: 18,
    companionDevice: 'mobile',
    lifecycleStatus: 'Awaiting Approval',
  };

  const activeWorkspace = 'environment' as const;
  const workOrders = buildDemoWorkOrders(workspace);
  const defaultTool = defaultV3WorkbenchTool(activeWorkspace);

  return {
    activeWorkspace,
    workspace,
    designVariants: buildV3DesignVariants(workspace.departmentId, workspace.revision),
    designVariantsCollapsed: false,
    activeWorkbenchTool: defaultTool,
    activeInspectorMode: resolveV3InspectorModeForTool(activeWorkspace, defaultTool),
    activeWorkOrderId: 'wo-blueprint',
    activeReviewId: 'rev-founder-01',
    workOrders,
    activePackage: buildDemoPackage(workspace),
    pipeline: buildPipeline(workOrders),
    operations: DEMO_OPERATIONS,
    reviewItems: buildReviewItems(workspace),
    assetLibrary: buildAssetLibrary(workspace),
    spotlightOpen: false,
    assistantOpen: false,
    blueprintFullscreen: false,
    blueprintZoom: 1,
    blueprintPan: { x: 0, y: 0 },
  };
}

export function rebuildV3ContextState(
  prev: ExperienceLabV3State,
  patch: Partial<WorkspaceContextState>
): ExperienceLabV3State {
  const workspace: WorkspaceContextState = {
    ...prev.workspace,
    ...patch,
    departmentLabel:
      patch.departmentLabel
      ?? resolveV3DepartmentLabel(patch.programId ?? prev.workspace.programId, patch.departmentId ?? prev.workspace.departmentId),
  };

  const workOrders = buildDemoWorkOrders(workspace);
  const defaultTool = defaultV3WorkbenchTool(prev.activeWorkspace);

  return {
    ...prev,
    workspace,
    designVariants: buildV3DesignVariants(workspace.departmentId, workspace.revision),
    workOrders,
    activePackage: buildDemoPackage(workspace),
    pipeline: buildPipeline(workOrders),
    reviewItems: buildReviewItems(workspace),
    assetLibrary: buildAssetLibrary(workspace),
    activeWorkOrderId: workOrders[0]?.id ?? null,
    activeWorkbenchTool: defaultTool,
    activeInspectorMode: resolveV3InspectorModeForTool(prev.activeWorkspace, defaultTool),
  };
}
