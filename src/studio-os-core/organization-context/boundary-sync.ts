import type { ActiveOrganizationContext } from './types';
import { buildActiveOrganizationContext } from './resolve';
import { resolveModuleTenantId } from '../workspace/tenant-ids';
import { loadWorkspace } from '../workspace/loader';
import { workspaceStudioEntryPath, workspaceStudioModulePath } from '../workspace/routes';

export const STUDIO_OS_ORGANIZATION_BOUNDARY_CHANGED = 'studio-os-organization-boundary-changed';

export type OrganizationBoundaryChangedDetail = {
  organizationId: string;
  moduleTenantId: string;
  timelineOrganizationId: string;
};

function dispatchOrganizationBoundaryChanged(detail: OrganizationBoundaryChangedDetail): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(STUDIO_OS_ORGANIZATION_BOUNDARY_CHANGED, { detail }));
}

function trySelect<T extends string>(fn: ((id: T) => void) | undefined, id: T): void {
  try {
    fn?.(id);
  } catch {
    /* optional module store */
  }
}

/**
 * Rebuild organization-scoped module stores when the active organization changes.
 * Called from activateWorkspaceContext — modules must not inherit another org's state.
 */
export function syncOrganizationBoundary(context: ActiveOrganizationContext): void {
  void import('../executive-timeline/store').then((m) => {
    trySelect(m.selectTimelineOrganization, context.timelineOrganizationId);
  });

  void import('../distribution-engine/store').then((m) => {
    const distributionId =
      context.moduleTenantId === 'portfolio'
        ? 'studio-os'
        : context.moduleTenantId;
    trySelect(
      m.selectDistributionEngineWorkspace,
      distributionId as Parameters<typeof m.selectDistributionEngineWorkspace>[0]
    );
  });

  void import('../industry-architecture/store').then((m) => {
    m.ensureOrganizationArchitectureProfile(context.organizationId);
  });

  void import('../monetization-architecture/store').then((m) => {
    m.ensureOrganizationMonetizationProfile(context.organizationId);
  });

  void import('../business-discovery-blueprint/store').then((m) => {
    m.ensureOrganizationDiscoveryBlueprint(context.organizationId);
  });

  void import('../organization-inauguration/store').then((m) => {
    m.ensureOrganizationInaugurationProfile(context.organizationId);
  });

  void import('../profession-brain/store').then((m) => {
    m.ensureOrganizationProfessionBrainProfile(context.organizationId);
  });

  void import('../expert-marketplace/store').then((m) => {
    m.ensureOrganizationExpertMarketplaceProfile(context.organizationId);
  });

  void import('../studio-institute/org-store').then((m) => {
    m.ensureOrganizationStudioInstituteProfile(context.organizationId);
  });

  void import('../knowledge-commerce/store').then((m) => {
    m.ensureOrganizationKnowledgeCommerceProfile(context.organizationId);
  });

  void import('../professional-trust-framework/store').then((m) => {
    m.ensureOrganizationTrustFrameworkProfile(context.organizationId);
  });

  void import('../organization-genome/store').then((m) => {
    m.ensureOrganizationGenomeProfile(context.organizationId);
  });

  void import('../memory-engine/store').then((m) => {
    m.ensureOrganizationMemoryProfile(context.organizationId);
  });

  void import('../company-health-index/store').then((m) => {
    m.ensureOrganizationHealthIndexProfile(context.organizationId);
  });

  void import('../organization-pulse/store').then((m) => {
    m.ensureOrganizationPulseProfile(context.organizationId);
  });

  void import('../succession-mode/store').then((m) => {
    m.ensureOrganizationSuccessionProfile(context.organizationId);
  });

  void import('../executive-council/org-store').then((m) => {
    m.ensureOrganizationExecutiveCouncilProfile(context.organizationId);
  });

  dispatchOrganizationBoundaryChanged({
    organizationId: context.organizationId,
    moduleTenantId: context.moduleTenantId,
    timelineOrganizationId: context.timelineOrganizationId,
  });
}

/** Build boundary context from platform workspace id without React. */
export function syncOrganizationBoundaryForPlatformWorkspace(platformWorkspaceId: string): void {
  const loaded = loadWorkspace(platformWorkspaceId);
  if (!loaded) return;

  const moduleTenantId = resolveModuleTenantId(platformWorkspaceId);
  const context = buildActiveOrganizationContext(
    loaded.schema,
    moduleTenantId,
    (segment) => workspaceStudioModulePath(platformWorkspaceId, segment),
    workspaceStudioEntryPath(platformWorkspaceId, loaded.schema.studioEntryPath)
  );
  syncOrganizationBoundary(context);
}
