import type { EnvironmentAssetPackage } from '../../../../studio-os-core/environment-asset-package';
import {
  resolveOutputUrl,
  type EnvironmentPackageOutputStatus,
} from '../../../../studio-os-core/environment-asset-package/EnvironmentPackageOutputs';
import type { ProductionReadinessRecord } from '../../../../studio-os-core/environment-asset-package/ProductionReadinessGate';
import { buildEnvironmentPackageGenerationQueue } from '../../../../studio-os-core/environment-asset-package/EnvironmentPackageGenerationQueue';
import type {
  BlueprintDisplayState,
  LiveWorkspaceBlueprintDisplay,
} from './ExperienceLabLiveWorkspaceViewModel';
import type { DesignVariantId } from '../experience-lab-design-variants';

export type BlueprintResolutionInput = {
  pkg: EnvironmentAssetPackage | null;
  readiness: ProductionReadinessRecord | null;
  environmentName: string;
  variantId: DesignVariantId;
  previewRevision?: number | null;
};

function mapOutputStatusToDisplayState(
  status: EnvironmentPackageOutputStatus,
  pkg: EnvironmentAssetPackage,
  readiness: ProductionReadinessRecord | null,
  hasUrl: boolean,
  isStale: boolean
): BlueprintDisplayState {
  if (pkg.canonical && hasUrl) return 'CANONICAL';
  if (pkg.status === 'approved' && hasUrl) return 'APPROVED';
  if (isStale && hasUrl) return 'STALE';
  if (status === 'failed') return 'FAILED';
  if (status === 'generating') return 'GENERATING';
  if (hasUrl && (status === 'generated' || status === 'cached')) return 'GENERATED';
  if (readiness && readiness.blockers.length > 0 && !readiness.founderApproved) return 'BLOCKED';
  if (status === 'pending' && readiness?.authorizedQueueEntry?.status === 'pending') return 'QUEUED';
  return 'NOT_REQUESTED';
}

/** Resolve blueprint image and state from active package output registry. */
export function resolveExperienceLabBlueprintDisplay(
  input: BlueprintResolutionInput
): LiveWorkspaceBlueprintDisplay {
  const { pkg, readiness, environmentName, variantId } = input;

  if (!pkg) {
    return {
      packageId: '',
      variantId,
      environmentName,
      artifactUrl: null,
      outputStatus: 'pending',
      displayState: 'NOT_REQUESTED',
      revision: 0,
      generationJobKind: null,
      checksum: null,
      generatedAt: null,
      approvalState: 'pending',
      isStale: false,
      isCanonical: false,
      blockerReason: 'No active environment package',
      dependency: null,
      queuePosition: null,
      failureCode: null,
      source: 'unavailable',
      canGenerate: false,
      canRetry: false,
      canApprove: false,
      canOpen: false,
    };
  }

  const blueprintEntry = pkg.outputs.blueprint;
  const activeUrl = resolveOutputUrl(pkg.outputs, 'blueprint');
  const approvedUrl =
    pkg.approvedAt && activeUrl ? activeUrl : activeUrl;
  const cachedUrl = blueprintEntry.status === 'cached' ? blueprintEntry.url : null;
  const resolvedUrl = activeUrl ?? approvedUrl ?? cachedUrl;

  let source: LiveWorkspaceBlueprintDisplay['source'] = 'pending';
  if (activeUrl && blueprintEntry.status !== 'pending') {
    source = 'active-revision';
  } else if (approvedUrl) {
    source = 'latest-approved';
  } else if (cachedUrl) {
    source = 'cached';
  } else if (blueprintEntry.status === 'pending' || blueprintEntry.status === 'generating') {
    source = 'pending';
  } else {
    source = 'unavailable';
  }

  const previewRevision = input.previewRevision ?? null;
  const isStale =
    previewRevision !== null
      ? previewRevision < pkg.revision
      : blueprintEntry.status === 'cached' && pkg.status === 'generating';

  const displayState = mapOutputStatusToDisplayState(
    blueprintEntry.status,
    pkg,
    readiness,
    Boolean(resolvedUrl),
    isStale
  );

  const queue = buildEnvironmentPackageGenerationQueue(pkg);
  const blueprintJob = queue.find((q) => q.kind === 'blueprint') ?? null;
  const queuePosition =
    readiness?.authorizedQueueEntry?.status === 'pending'
      ? readiness.authorizedQueueEntry.priority
      : null;

  const blockerReason =
    readiness?.blockers.length
      ? readiness.blockers.join(', ')
      : displayState === 'BLOCKED'
        ? 'Production readiness gate blocked'
        : null;

  const canGenerate =
    Boolean(readiness)
    && !resolvedUrl
    && blueprintEntry.status === 'pending'
    && (readiness?.founderApproved ?? false)
    && displayState !== 'BLOCKED';

  const canRetry = blueprintEntry.status === 'failed' || displayState === 'STALE';
  const canApprove =
    Boolean(resolvedUrl)
    && (displayState === 'GENERATED' || displayState === 'STALE')
    && !pkg.canonical
    && pkg.status !== 'approved';
  const canOpen = Boolean(resolvedUrl);

  return {
    packageId: pkg.packageId,
    variantId,
    environmentName,
    artifactUrl: resolvedUrl,
    outputStatus: blueprintEntry.status,
    displayState,
    revision: pkg.revision,
    generationJobKind: blueprintJob?.kind ?? null,
    checksum: pkg.promptHash,
    generatedAt: blueprintEntry.generatedAt,
    approvalState: pkg.status === 'approved' || pkg.canonical ? 'approved' : 'pending',
    isStale,
    isCanonical: pkg.canonical,
    blockerReason,
    dependency: readiness?.blockers[0] ?? null,
    queuePosition,
    failureCode: blueprintEntry.status === 'failed' ? 'BLUEPRINT_OUTPUT_FAILED' : null,
    source,
    canGenerate,
    canRetry,
    canApprove,
    canOpen,
  };
}
