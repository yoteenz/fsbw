import type { ActiveOrganizationContext } from './types';
import { buildActiveOrganizationContext } from './resolve';
import { resolveModuleTenantId } from '../workspace/tenant-ids';
import { loadWorkspace } from '../workspace/loader';
import { workspaceStudioEntryPath, workspaceStudioModulePath } from '../workspace/routes';
import { scheduleQaIntelligenceChainSync } from '../sync/qa-intelligence-chain';

export const STUDIO_OS_ORGANIZATION_BOUNDARY_CHANGED = 'studio-os-organization-boundary-changed';

export type OrganizationBoundaryChangedDetail = {
  organizationId: string;
  moduleTenantId: string;
  timelineOrganizationId: string;
};

let boundaryDebounceTimer: ReturnType<typeof setTimeout> | null = null;
let pendingBoundaryContext: ActiveOrganizationContext | null = null;
let lastBoundaryOrganizationId: string | null = null;
const BOUNDARY_DEBOUNCE_MS = 350;

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
 * Debounced to avoid sync storms when multiple modules mount simultaneously.
 */
export function syncOrganizationBoundary(context: ActiveOrganizationContext): void {
  pendingBoundaryContext = context;
  if (boundaryDebounceTimer) clearTimeout(boundaryDebounceTimer);
  boundaryDebounceTimer = setTimeout(() => {
    boundaryDebounceTimer = null;
    const ctx = pendingBoundaryContext;
    pendingBoundaryContext = null;
    if (ctx) flushOrganizationBoundarySync(ctx);
  }, BOUNDARY_DEBOUNCE_MS);
}

function flushOrganizationBoundarySync(context: ActiveOrganizationContext): void {
  const organizationChanged =
    lastBoundaryOrganizationId !== null && lastBoundaryOrganizationId !== context.organizationId;
  lastBoundaryOrganizationId = context.organizationId;

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

  if (organizationChanged) {
    scheduleQaIntelligenceChainSync(context.organizationId);
  }

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
