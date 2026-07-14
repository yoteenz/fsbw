import type { CanonicalMainDepartmentId } from '../../../../studio-os-core/canonical-studio-world/canonical-department-registry';
import { getCanonicalDepartmentRecord } from '../../../../studio-os-core/canonical-studio-world/canonical-department-registry';
import { resolveDepartmentCharter } from '../../../../studio-os-core/canonical-studio-world/department-charters';
import { buildCanonicalDepartmentConstructionPlan } from '../../../../studio-os-core/canonical-studio-world/canonical-department-construction-plan';
import type { CanonicalQueueSnapshot } from '../../../../studio-os-core/canonical-studio-world/canonical-department-queue';
import type { PackageLifecycleState } from '../../../../studio-os-core/environment-asset-package/ProductionReadinessGate';
import type { EnvironmentAssetPackage } from '../../../../studio-os-core/environment-asset-package';
import { buildEnvironmentPackageGenerationQueue } from '../../../../studio-os-core/environment-asset-package';
import {
  buildEmptyOutputRegistry,
  countOutputRegistry,
  resolveOutputUrl,
} from '../../../../studio-os-core/environment-asset-package/EnvironmentPackageOutputs';
import { buildPackageDrawerModel } from '../../../../studio-os-core/environment-asset-package/EnvironmentPackageService';
import { getProductionReadinessForPackage } from '../../../../studio-os-core/environment-asset-package/ProductionReadinessRepository';
import { ensureProductionReadinessForPackage } from '../../../../studio-os-core/environment-asset-package/ProductionReadinessService';
import { isEnvironmentPackageInMemoryOnly } from '../../../../studio-os-core/environment-asset-package/environment-package-feature-flags';
import { buildFounderRenderJobView } from '../../../../studio-os-core/founder-render';
import type { GenerationPipelineState } from '../experience-lab-v2-generation-pipeline';
import { buildGenerationPipelineBreadcrumb } from '../experience-lab-v2-generation-pipeline';
import { evaluateExperienceLabV2Approval } from '../experience-lab-v2-approval';
import { readExperienceLabV2TestMode } from '../experience-lab-v2-test-modes';
import type { ExperienceLabV2TestMode } from '../experience-lab-v2.types';
import type { WorkbenchEditingToolId } from '../experience-lab-v2-workbench-config';
import { contextContentForWorkbenchTool } from '../experience-lab-v2-workbench-config';
import type { DesignVariantId, DesignVariantRecord } from '../experience-lab-design-variants';
import type {
  ExperienceLabLiveWorkspaceViewModel,
  LiveWorkspaceReviewEntry,
  LiveWorkspaceTimelineEvent,
  LiveWorkspaceTimelineEventType,
} from './ExperienceLabLiveWorkspaceViewModel';
import { resolveExperienceLabBlueprintDisplay } from './resolveExperienceLabBlueprintDisplay';

export type BuildLiveWorkspaceInput = {
  pipeline: GenerationPipelineState;
  departmentId: CanonicalMainDepartmentId;
  activeVariant: DesignVariantRecord | null;
  activeVariantId: DesignVariantId;
  environmentPackage: EnvironmentAssetPackage | null;
  queue: CanonicalQueueSnapshot | null;
  workbenchToolId: WorkbenchEditingToolId | null;
  historicalPreviewRevision: number | null;
  imageLoaded?: boolean;
  approvalRecorded?: boolean;
  hasAdminPermission?: boolean;
  useMock?: boolean;
  syncTick?: number;
};

function mapAuditEventType(detail: string, reason: string): LiveWorkspaceTimelineEventType {
  const text = `${detail} ${reason}`.toLowerCase();
  if (text.includes('canonical') || text.includes('promoted')) return 'promoted-to-canonical';
  if (text.includes('production') && text.includes('approved')) return 'promoted-to-production';
  if (text.includes('approved')) return 'founder-approved';
  if (text.includes('rejected')) return 'founder-rejected';
  if (text.includes('archived')) return 'archived';
  if (text.includes('generation') && text.includes('start')) return 'generation-started';
  if (text.includes('generated') || text.includes('complete')) return 'output-completed';
  if (text.includes('failed')) return 'output-failed';
  if (text.includes('variant')) return 'variant-selected';
  if (text.includes('preview')) return 'preview-generated';
  if (text.includes('revision')) return 'revision-started';
  if (text.includes('queue')) return 'queue-authorized';
  if (text.includes('readiness')) return 'readiness-evaluated';
  if (text.includes('cds') || text.includes('handoff')) return 'cds-handoff-created';
  if (text.includes('created')) return 'package-created';
  return 'revision-completed';
}

function buildTimelineEvents(
  pkg: EnvironmentAssetPackage | null,
  readinessAudit: ReturnType<typeof getProductionReadinessForPackage>
): LiveWorkspaceTimelineEvent[] {
  const events: LiveWorkspaceTimelineEvent[] = [];

  if (pkg) {
    for (const entry of pkg.revisionHistory) {
      events.push({
        id: `rev.${pkg.packageId}.${entry.revision}.${entry.changedAt}`,
        eventType: mapAuditEventType(entry.reason, entry.status),
        revision: entry.revision,
        timestamp: entry.changedAt,
        actor: null,
        output: entry.status,
        costUsd: pkg.actualCostUsd,
        note: entry.reason,
        status: entry.status,
      });
    }
  }

  if (readinessAudit) {
    for (const entry of readinessAudit.auditLog) {
      events.push({
        id: entry.id,
        eventType: mapAuditEventType(entry.detail, entry.eventType),
        revision: entry.revision,
        timestamp: entry.occurredAt,
        actor: entry.actor,
        output: entry.eventType,
        costUsd: readinessAudit.generationEstimate.estimatedDollarsUsd,
        note: entry.detail,
        status: entry.eventType,
      });
    }
  }

  return events.sort((a, b) => a.timestamp.localeCompare(b.timestamp));
}

function buildReviewEntries(
  pkg: EnvironmentAssetPackage | null,
  activeVariant: DesignVariantRecord | null,
  historicalPreviewRevision: number | null
): LiveWorkspaceReviewEntry[] {
  if (!pkg || !activeVariant) return [];

  const mobileUrl = resolveOutputUrl(pkg.outputs, 'mobile');
  const desktopUrl = resolveOutputUrl(pkg.outputs, 'desktop');
  const blueprintUrl = resolveOutputUrl(pkg.outputs, 'blueprint');
  const constructionUrl = resolveOutputUrl(pkg.outputs, 'constructionPlan');

  const outputs: Array<{
    type: LiveWorkspaceReviewEntry['outputType'];
    url: string | null;
    status: string;
  }> = [
    { type: 'environment', url: mobileUrl ?? desktopUrl, status: pkg.outputs.mobile.status },
    { type: 'blueprint', url: blueprintUrl, status: pkg.outputs.blueprint.status },
    { type: 'construction', url: constructionUrl, status: pkg.outputs.constructionPlan.status },
    { type: 'render', url: desktopUrl ?? mobileUrl, status: pkg.outputs.desktop.status },
  ];

  return pkg.revisionHistory.map((rev, index) => {
    const output = outputs[index % outputs.length];
    const approvalState: LiveWorkspaceReviewEntry['approvalState'] =
      pkg.canonical
        ? 'canonical'
        : pkg.status === 'approved'
          ? 'approved'
          : pkg.status === 'archived'
            ? 'archived'
            : 'pending';

    return {
      id: `review.${pkg.packageId}.r${rev.revision}.${output.type}`,
      revision: rev.revision,
      previewThumbnailUrl: output.url,
      outputType: output.type,
      variantId: activeVariant.id,
      variantName: activeVariant.name,
      theme: activeVariant.theme,
      generatedAt: pkg.updatedAt,
      provider: pkg.provider,
      model: pkg.model,
      generationCostUsd: pkg.actualCostUsd ?? pkg.estimatedCostUsd,
      status: rev.status,
      founderComment: pkg.founderNotes,
      approvalState,
      isCanonical: pkg.canonical,
      isArchived: pkg.status === 'archived',
      isHistoricalPreview: historicalPreviewRevision !== null && rev.revision !== pkg.revision,
    };
  });
}

function deriveFounderRenderFromPackage(
  pkg: EnvironmentAssetPackage | null,
  departmentId: CanonicalMainDepartmentId
) {
  const built = buildCanonicalDepartmentConstructionPlan(departmentId, 'landscape');
  const plan = built.ok ? built.plan : null;
  if (!plan || !pkg) return null;

  const previewUrl =
    resolveOutputUrl(pkg.outputs, 'desktop')
    ?? resolveOutputUrl(pkg.outputs, 'mobile')
    ?? null;

  let status: 'no_preview' | 'queued' | 'generating' | 'ready' | 'failed' | 'stale' | 'approved' = 'no_preview';
  if (pkg.status === 'generating') status = 'generating';
  else if (previewUrl && pkg.canonical) status = 'approved';
  else if (previewUrl && pkg.status === 'approved') status = 'approved';
  else if (previewUrl) status = 'ready';
  else if (pkg.status === 'failed') status = 'failed';

  return buildFounderRenderJobView({
    plan,
    job: {
      jobId: pkg.packageId,
      status,
      previewArtifactUrl: previewUrl,
      blueprintRevision: pkg.revision,
      approvalStatus: pkg.status === 'approved' || pkg.canonical ? 'approved' : 'pending',
      providerModel: pkg.model,
      modelRoute: pkg.provider,
    },
    estimatedCost: pkg.estimatedCostUsd,
  });
}

export function buildExperienceLabLiveWorkspaceViewModel(
  input: BuildLiveWorkspaceInput
): ExperienceLabLiveWorkspaceViewModel {
  const pkg = input.environmentPackage;
  const activeVariant = input.activeVariant;
  const record = getCanonicalDepartmentRecord(input.departmentId);
  const charter = resolveDepartmentCharter(input.departmentId);
  const breadcrumb = buildGenerationPipelineBreadcrumb({
    state: input.pipeline,
    variantLabel: activeVariant?.name ?? null,
  });

  if (pkg) {
    ensureProductionReadinessForPackage(pkg);
  }

  const readiness = pkg ? getProductionReadinessForPackage(pkg.packageId) : null;
  const drawer = pkg ? buildPackageDrawerModel(pkg) : null;
  const outputCounts = pkg ? countOutputRegistry(pkg.outputs) : { generated: 0, pending: 0, total: 0 };
  const queue = pkg ? buildEnvironmentPackageGenerationQueue(pkg) : [];
  const testMode: ExperienceLabV2TestMode = input.useMock ? 'MOCK' : readExperienceLabV2TestMode();

  const blueprint = resolveExperienceLabBlueprintDisplay({
    pkg,
    readiness,
    environmentName: activeVariant?.name ?? record?.name ?? input.departmentId,
    variantId: input.activeVariantId,
    previewRevision: input.historicalPreviewRevision,
  });

  const founderRender = deriveFounderRenderFromPackage(pkg, input.departmentId);

  const approval = evaluateExperienceLabV2Approval({
    founderRender,
    imageLoaded: input.imageLoaded ?? false,
    blueprintRevision: pkg?.revision ?? record?.blueprintRevision ?? 0,
    testMode,
    approvalRecorded: input.approvalRecorded ?? founderRender?.approvalStatus === 'approved',
    hasAdminPermission: input.hasAdminPermission ?? true,
  });

  const generatedOutputs = pkg
    ? Object.entries(pkg.outputs)
        .filter(([, e]) => e.status === 'generated' || e.status === 'cached')
        .map(([k]) => k)
    : [];
  const pendingOutputs = pkg
    ? Object.entries(pkg.outputs)
        .filter(([, e]) => e.status === 'pending' || e.status === 'generating')
        .map(([k]) => k)
    : [];
  const failedOutputs = pkg
    ? Object.entries(pkg.outputs)
        .filter(([, e]) => e.status === 'failed')
        .map(([k]) => k)
    : [];

  const timelineEvents = buildTimelineEvents(pkg, readiness);
  const founderReviewEntries = buildReviewEntries(pkg, activeVariant, input.historicalPreviewRevision);

  const contextModule = input.workbenchToolId
    ? contextContentForWorkbenchTool(input.workbenchToolId)
    : null;

  const healthPercent = drawer?.overallHealthPercent ?? 0;

  const designBrief = {
    currentObjective: charter.mission,
    programLabel: breadcrumb.segments[0] ?? input.pipeline.programId,
    departmentOrPackLabel: breadcrumb.segments[1] ?? record?.name ?? input.departmentId,
    environmentLabel: breadcrumb.segments[2] ?? activeVariant?.name ?? '—',
    variantName: activeVariant?.name ?? '—',
    theme: activeVariant?.theme ?? 'light',
    packageRevision: pkg?.revision ?? 0,
    packageStatus: pkg?.status ?? 'none',
    promptVersion: pkg?.promptVersion ?? activeVariant?.promptHash ?? '—',
    provider: pkg?.provider ?? activeVariant?.generationProvider ?? '—',
    model: pkg?.model ?? '—',
    readinessPercent: drawer?.readinessPercent ?? 0,
    estimatedCostUsd: pkg?.estimatedCostUsd ?? activeVariant?.estimatedCostUsd ?? null,
    actualCostUsd: pkg?.actualCostUsd ?? null,
    founderNotes: pkg?.founderNotes ?? null,
    blockers: drawer?.readinessBlockers ?? [],
    moodLine: activeVariant ? `${activeVariant.theme.toUpperCase()} · ${activeVariant.compareGroup}` : null,
  };

  return {
    programId: input.pipeline.programId,
    departmentId: input.departmentId,
    departmentName: record?.name ?? input.departmentId,
    industryPackId: input.pipeline.industryPackId,
    environmentId: input.pipeline.environmentId,
    environmentName: activeVariant?.name ?? record?.name ?? input.departmentId,
    variantId: input.activeVariantId,
    variantName: activeVariant?.name ?? input.activeVariantId,
    theme: activeVariant?.theme ?? 'light',
    environmentPackageId: pkg?.packageId ?? '',
    packageRevision: pkg?.revision ?? 0,
    packageStatus: pkg?.status ?? 'none',
    packageHealth: healthPercent,
    readinessPercent: drawer?.readinessPercent ?? 0,
    readinessBlockers: drawer?.readinessBlockers ?? [],
    promptVersion: pkg?.promptVersion ?? '—',
    promptHash: pkg?.promptHash ?? activeVariant?.promptHash ?? '—',
    provider: pkg?.provider ?? '—',
    model: pkg?.model ?? '—',
    seed: pkg?.seed ?? activeVariant?.seed ?? '—',
    estimatedCost: pkg?.estimatedCostUsd ?? 0,
    actualCost: pkg?.actualCostUsd ?? null,
    currentObjective: charter.mission,
    founderNotes: pkg?.founderNotes ?? null,
    activeRevision: pkg?.revision ?? 0,
    revisionHistory: pkg?.revisionHistory ?? [],
    generationJobs: queue.map((q) => ({ kind: q.kind, status: q.status, outputKeys: q.outputKeys })),
    generatedOutputs,
    pendingOutputs,
    failedOutputs,
    activeWorkbenchTool: input.workbenchToolId,
    activeContextModule: contextModule,
    blueprintOutput: blueprint,
    blueprintStatus: blueprint.displayState,
    approvalState: approval,
    canonicalState: pkg?.canonical ?? false,
    cdsHandoffState: pkg?.canonical ? 'eligible' : 'none',
    updatedAt: pkg?.updatedAt ?? new Date().toISOString(),
    designBrief,
    founderReviewEntries,
    timelineEvents,
    workbenchModules: {
      architectural: {
        blueprintStatus: blueprint.displayState,
        constructionStatus: pkg?.outputs.constructionPlan.status ?? 'pending',
        activeRevision: pkg?.revision ?? 0,
        architectureReadiness: drawer?.readinessPercent ?? 0,
        dependencies: charter.requiredWorkbenchModules?.slice(0, 4) ?? [],
      },
      materials: {
        profileStatus: pkg?.outputs.materialsProfile.status ?? 'pending',
        summary: resolveOutputUrl(pkg?.outputs ?? buildEmptyOutputRegistry(), 'materialsProfile')
          ? 'Materials profile generated'
          : pkg?.outputs.materialsProfile.status ?? 'pending',
        revision: pkg?.revision ?? 0,
        appliedMaterials: generatedOutputs.filter((o) => o.includes('material')),
        pendingSelections: pendingOutputs.filter((o) => o.includes('material')),
        generationJobStatus: queue.find((q) => q.kind === 'materials')?.status ?? 'pending',
      },
      assetReference: {
        manifestStatus: pkg?.outputs.assetManifest.status ?? 'pending',
        attachedCount: generatedOutputs.length,
        missingCount: pendingOutputs.length,
        goldenReferences: charter.requiredWorkbenchModules ?? [],
        summary: `${generatedOutputs.length} outputs · ${pendingOutputs.length} pending`,
      },
      budget: {
        estimatedCostUsd: pkg?.estimatedCostUsd ?? 0,
        actualCostUsd: pkg?.actualCostUsd ?? null,
        outputsGenerated: outputCounts.generated,
        outputsPending: outputCounts.pending,
        outputsFailed: failedOutputs.length,
        outputsRemaining: outputCounts.pending,
        retryReserveUsd: (pkg?.estimatedCostUsd ?? 0) * 0.15,
        projectedFinalUsd:
          (pkg?.actualCostUsd ?? 0) + (pkg?.estimatedCostUsd ?? 0) * (outputCounts.pending / Math.max(outputCounts.total, 1)),
        displayEstimate: pkg?.actualCostUsd
          ? `$${pkg.actualCostUsd.toFixed(2)}`
          : pkg?.estimatedCostUsd
            ? `$${pkg.estimatedCostUsd.toFixed(2)} est.`
            : '—',
      },
      workforce: {
        activeAssignments: queue.filter((q) => q.status === 'running').map((q) => q.kind),
        generationWorkers: [pkg?.provider ?? 'preview-cache'],
        schedulerJobs: queue.map((q) => `${q.kind}:${q.status}`),
        responsibleDepartment: record?.name ?? input.departmentId,
        blockedAssignments: failedOutputs,
      },
      permit: {
        lifecycleState: (drawer?.lifecycleState ?? 'preview-ready') as PackageLifecycleState,
        readinessPercent: drawer?.readinessPercent ?? 0,
        blockers: drawer?.readinessBlockers ?? [],
        founderApproved: readiness?.founderApproved ?? false,
        canApproveForProduction: drawer?.canApproveForProduction ?? false,
        canPromoteToCanonical: drawer?.canPromoteToCanonical ?? false,
        cdsHandoffEligible: pkg?.canonical ?? false,
        permitStatus: approval.permitStatus,
      },
    },
    founderRender,
    historicalPreviewRevision: input.historicalPreviewRevision,
    isHistoricalPreviewMode: input.historicalPreviewRevision !== null,
    diagnostics: {
      activePackageId: pkg?.packageId ?? null,
      activeRevision: pkg?.revision ?? 0,
      selectedWorkbenchTool: input.workbenchToolId,
      resolvedContextModule: contextModule,
      blueprintOutputSource: blueprint.source,
      blueprintOutputStatus: blueprint.displayState,
      latestPackageEvent: timelineEvents.at(-1)?.eventType ?? null,
      realtimeConnected: !isEnvironmentPackageInMemoryOnly(),
      designBriefSource: pkg ? 'environment-package' : 'canonical-charter',
      reviewWallSourceCount: founderReviewEntries.length,
      timelineSourceCount: timelineEvents.length,
      packageReadinessPercent: drawer?.readinessPercent ?? 0,
      approvalEligible: approval.canApprove,
      repositoryMode: isEnvironmentPackageInMemoryOnly() ? 'in-memory' : 'durable',
    },
    loading: false,
    error: pkg ? null : 'No active environment package',
    empty: !pkg,
  };
}

