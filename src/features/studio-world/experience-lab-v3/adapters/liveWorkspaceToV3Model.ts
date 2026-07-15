import { buildEnvironmentPackageGenerationQueue } from '../../../../studio-os-core/environment-asset-package/EnvironmentPackageGenerationQueue';
import type { EnvironmentPackageOutputKey } from '../../../../studio-os-core/environment-asset-package/EnvironmentPackageOutputs';
import { getDesignVariantPackage } from '../../experience-lab-v2/experience-lab-environment-package-bridge';
import type { ExperienceLabLiveWorkspaceViewModel } from '../../experience-lab-v2/live-workspace/ExperienceLabLiveWorkspaceViewModel';
import type {
  AssetLibraryItem,
  ExperienceLabV3Package,
  OperationsMetrics,
  PackageOutputSlot,
  PipelineStage,
  ReviewItem,
  WorkOrder,
  WorkOrderStatus,
  WorkspaceContextState,
} from '../experience-lab-v3.types';

const OUTPUT_LABELS: Record<string, string> = {
  desktop: 'Desktop Master',
  mobile: 'Mobile Companion',
  tablet: 'Tablet Companion',
  heroLandscape: 'Hero Landscape',
  heroPortrait: 'Hero Portrait',
  squareThumbnail: 'Square Thumbnail',
  wideThumbnail: 'Wide Thumbnail',
  blueprint: 'Blueprint',
  constructionPlan: 'Construction Plan',
  lightingProfile: 'Lighting Profile',
  materialsProfile: 'Materials Profile',
  assetManifest: 'Asset Manifest',
  metadata: 'Metadata',
};

const PIPELINE_STAGES = [
  { id: 'request', label: 'Request Received', statuses: ['queued'] },
  { id: 'queued', label: 'Job Queued', statuses: ['waiting', 'preparing'] },
  { id: 'prep', label: 'Asset Preparation', statuses: ['preparing'] },
  { id: 'ai', label: 'AI Generation', statuses: ['generating'] },
  { id: 'post', label: 'Post Processing', statuses: ['validation'] },
  { id: 'validation', label: 'Validation', statuses: ['validation'] },
  { id: 'consistency', label: 'Consistency Check', statuses: ['consistency-check'] },
  { id: 'review', label: 'Ready for Review', statuses: ['founder-review', 'approval-needed', 'completed'] },
] as const;

function mapQueueStatus(status: string): WorkOrderStatus {
  switch (status) {
    case 'running':
      return 'generating';
    case 'completed':
    case 'cached':
      return 'completed';
    case 'failed':
      return 'failed';
    default:
      return 'waiting';
  }
}

function mapQueueColumn(status: WorkOrderStatus): WorkOrder['queueColumn'] {
  if (status === 'generating') return 'generating';
  if (status === 'blocked' || status === 'failed') return 'blocked';
  if (status === 'founder-review' || status === 'approval-needed') return 'review';
  if (status === 'completed') return 'completed';
  return 'waiting';
}

function mapApprovalToReviewStatus(
  state: string
): ReviewItem['status'] {
  if (state === 'approved' || state === 'canonical') return 'approved';
  if (state === 'rejected') return 'rejected';
  if (state === 'archived') return 'revision-requested';
  return 'pending';
}

export function buildWorkspaceContextFromLive(live: ExperienceLabLiveWorkspaceViewModel): WorkspaceContextState {
  return {
    programId: live.programId === 'industry-packs' ? 'industry-packs' : 'studio-world',
    departmentId: live.departmentId,
    departmentLabel: live.departmentName,
    environmentId: live.environmentId ?? 'unknown',
    environmentLabel: live.environmentName,
    variantId: live.variantId,
    variantLabel: live.variantName,
    revision: live.packageRevision,
    companionDevice: 'mobile',
    lifecycleStatus: live.packageStatus,
  };
}

export function buildWorkOrdersFromLive(live: ExperienceLabLiveWorkspaceViewModel): WorkOrder[] {
  const pkg = getDesignVariantPackage(live.variantId);
  if (!pkg) return [];

  const queue = buildEnvironmentPackageGenerationQueue(pkg);
  const ctx = buildWorkspaceContextFromLive(live);

  return queue.map((item, index) => {
    const status = mapQueueStatus(item.status);
    const progress =
      item.status === 'completed' || item.status === 'cached'
        ? 100
        : item.status === 'running'
          ? 45
          : 0;

    return {
      id: `wo-${item.kind}`,
      kind: `generate-${item.kind}` as WorkOrder['kind'],
      title: `Generate ${OUTPUT_LABELS[item.outputKeys[0] ?? item.kind] ?? item.kind}`,
      status,
      progress,
      etaMs: item.status === 'running' ? 60_000 : null,
      priority: item.kind === 'blueprint' || item.kind === 'desktop' ? 'high' : 'normal',
      costUsd: live.actualCost ?? live.estimatedCost ?? 0,
      owner: live.workbenchModules.workforce.responsibleDepartment,
      provider: live.provider,
      revision: live.packageRevision,
      packageId: live.environmentPackageId,
      environmentId: ctx.environmentId,
      departmentId: ctx.departmentId,
      variantId: ctx.variantId,
      dependencies: live.workbenchModules.architectural.dependencies,
      queueColumn: mapQueueColumn(status),
      createdAt: live.updatedAt,
      updatedAt: live.updatedAt,
      lane:
        item.status === 'running'
          ? 'now-running'
          : index === queue.findIndex((q) => q.status === 'running') + 1
            ? 'up-next'
            : item.status === 'pending'
              ? 'waiting'
              : 'blocked',
    } as WorkOrder & { lane?: string };
  });
}

export function buildPipelineFromLive(live: ExperienceLabLiveWorkspaceViewModel): PipelineStage[] {
  const workOrders = buildWorkOrdersFromLive(live);
  return PIPELINE_STAGES.map((stage) => {
    const count = workOrders.filter((w) => (stage.statuses as readonly string[]).includes(w.status)).length;
    return {
      id: stage.id,
      label: stage.label,
      status: count > 0 ? 'active' : 'idle',
      workOrderCount: count,
    };
  });
}

export function buildPackageOutputsFromLive(live: ExperienceLabLiveWorkspaceViewModel): PackageOutputSlot[] {
  const pkg = getDesignVariantPackage(live.variantId);
  if (!pkg) return [];

  const keys = Object.keys(OUTPUT_LABELS) as EnvironmentPackageOutputKey[];
  return keys.map((key) => {
    const out = pkg.outputs[key];
    const status = mapQueueStatus(
      out?.status === 'generating'
        ? 'running'
        : out?.status === 'generated'
          ? 'completed'
          : out?.status === 'failed'
            ? 'failed'
            : out?.status === 'cached'
              ? 'cached'
              : 'pending'
    );
    return {
      id: key,
      label: OUTPUT_LABELS[key] ?? key,
      status,
      progress:
        out?.status === 'generated' || out?.status === 'cached'
          ? 100
          : out?.status === 'generating'
            ? 50
            : 0,
      timestamp: out?.generatedAt ?? null,
      provider: out?.provider ?? live.provider,
      credits: 0,
      cached: out?.status === 'cached',
      derivedFrom: key === 'desktop' ? null : 'desktop',
    };
  });
}

export function buildActivePackageFromLive(live: ExperienceLabLiveWorkspaceViewModel): ExperienceLabV3Package | null {
  if (live.empty || !live.environmentPackageId) return null;
  const ctx = buildWorkspaceContextFromLive(live);
  return {
    packageId: live.environmentPackageId,
    environmentId: ctx.environmentId,
    departmentId: ctx.departmentId,
    variantId: ctx.variantId,
    variantLabel: ctx.variantLabel,
    revision: live.packageRevision,
    lifecycleStatus: live.packageStatus,
    outputs: buildPackageOutputsFromLive(live),
  };
}

export function buildReviewItemsFromLive(live: ExperienceLabLiveWorkspaceViewModel): ReviewItem[] {
  return live.founderReviewEntries.map((entry) => ({
    id: entry.id,
    title: `${entry.variantName} · R${entry.revision} · ${entry.outputType}`,
    status: mapApprovalToReviewStatus(entry.approvalState),
    revision: entry.revision,
    submittedAt: entry.generatedAt ?? live.updatedAt,
    outputType: entry.outputType,
    provider: entry.provider,
    costUsd: entry.generationCostUsd,
    thumbnailUrl: entry.previewThumbnailUrl,
    founderComment: entry.founderComment,
  }));
}

export function buildAssetLibraryFromLive(live: ExperienceLabLiveWorkspaceViewModel): AssetLibraryItem[] {
  const outputs = buildPackageOutputsFromLive(live);
  return outputs.map((out) => ({
    id: `asset-${out.id}`,
    label: out.label,
    kind:
      out.id.includes('blueprint')
        ? 'blueprint'
        : out.id.includes('material')
          ? 'material'
          : out.id.includes('manifest') || out.id.includes('metadata')
            ? 'package'
            : 'reference',
    updatedAt: out.timestamp ?? live.updatedAt,
    status: out.status,
    revision: live.packageRevision,
  }));
}

export function buildOperationsFromLive(live: ExperienceLabLiveWorkspaceViewModel): OperationsMetrics {
  const budget = live.workbenchModules.budget;
  const permit = live.workbenchModules.permit;
  return {
    todaySpendUsd: budget.actualCostUsd ?? budget.estimatedCostUsd,
    gpuUsagePercent: live.diagnostics.realtimeConnected ? 42 : 0,
    generationQueueCount: live.pendingOutputs.length,
    creditsRemaining: 892,
    pendingReviews: live.founderReviewEntries.filter((e) => e.approvalState === 'pending').length,
    assetManufacturingCount: live.generatedOutputs.length,
    marketplaceJobs: 0,
    cdsQueueCount: live.cdsHandoffState === 'eligible' ? 1 : 0,
    failedJobs: live.failedOutputs.length,
    systemHealthPercent: live.packageHealth,
    founderNotifications: permit.blockers.length,
    cacheSavingsUsd: budget.retryReserveUsd,
    schedulerStatus: live.diagnostics.realtimeConnected ? 'online' : 'disconnected',
    providerStatus: live.provider,
    storageHealthPercent: live.readinessPercent,
  };
}

export type V3LiveDerivedModel = {
  workspace: WorkspaceContextState;
  workOrders: WorkOrder[];
  pipeline: PipelineStage[];
  activePackage: ExperienceLabV3Package | null;
  reviewItems: ReviewItem[];
  assetLibrary: AssetLibraryItem[];
  operations: OperationsMetrics;
  loading: boolean;
  error: string | null;
  empty: boolean;
};

export function deriveV3ModelFromLiveWorkspace(live: ExperienceLabLiveWorkspaceViewModel): V3LiveDerivedModel {
  return {
    workspace: buildWorkspaceContextFromLive(live),
    workOrders: buildWorkOrdersFromLive(live),
    pipeline: buildPipelineFromLive(live),
    activePackage: buildActivePackageFromLive(live),
    reviewItems: buildReviewItemsFromLive(live),
    assetLibrary: buildAssetLibraryFromLive(live),
    operations: buildOperationsFromLive(live),
    loading: live.loading,
    error: live.error,
    empty: live.empty,
  };
}
