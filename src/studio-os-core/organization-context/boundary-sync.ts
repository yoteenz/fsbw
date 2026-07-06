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
