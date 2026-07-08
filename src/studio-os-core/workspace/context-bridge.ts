import { asModuleTenantId, resolveModuleTenantId, type ModuleTenantId } from './tenant-ids';
import { isRuntimeWorkspaceActive, writeActiveWorkspaceIdToStorage, setRuntimeActiveWorkspaceId } from './storage';
import { syncOrganizationBoundaryForPlatformWorkspace } from '../organization-context/boundary-sync';
import { isWorkspaceRegistryConfigured } from './registry';

export const STUDIO_OS_WORKSPACE_CHANGED = 'studio-os-workspace-changed';

export type WorkspaceChangedDetail = {
  platformWorkspaceId: string;
  moduleTenantId: ModuleTenantId;
};

function dispatchWorkspaceChanged(detail: WorkspaceChangedDetail): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(STUDIO_OS_WORKSPACE_CHANGED, { detail }));
}

function trySelect<T extends string>(fn: ((id: T) => void) | undefined, id: T): void {
  try {
    fn?.(id);
  } catch {
    /* module store optional */
  }
}

/** Persist workspace id from URL before registry import — safe during guard bootstrap. */
export function persistWorkspaceId(platformWorkspaceId: string): void {
  writeActiveWorkspaceIdToStorage(platformWorkspaceId);
}

/**
 * Single entry for workspace context switch — platform storage + module tenant sync.
 * Does not duplicate features; fans out to existing module selectors.
 */
export function activateWorkspaceContext(platformWorkspaceId: string): ModuleTenantId {
  const tenantId = resolveModuleTenantId(platformWorkspaceId);
  if (isRuntimeWorkspaceActive(platformWorkspaceId)) {
    return tenantId;
  }

  writeActiveWorkspaceIdToStorage(platformWorkspaceId);
  setRuntimeActiveWorkspaceId(platformWorkspaceId);

  void import('../concierge-layer/store').then((m) =>
    trySelect(m.selectConciergeLayerWorkspace, asModuleTenantId(tenantId))
  );
  void import('../company-onboarding-intelligence/store').then((m) =>
    trySelect(m.selectCompanyOnboardingIntelligenceWorkspace, asModuleTenantId(tenantId))
  );
  void import('../organizational-apprenticeship/store').then((m) =>
    trySelect(m.selectOrganizationalApprenticeshipWorkspace, asModuleTenantId(tenantId))
  );
  void import('../strategy-engine/store').then((m) => {
    const strategyId =
      platformWorkspaceId === 'vxd-inc'
        ? 'vxd'
        : platformWorkspaceId === 'frontal-slayer'
          ? 'frontal-slayer'
          : platformWorkspaceId === 'ai-media'
            ? 'ndxbook'
            : 'studio-os';
    trySelect(m.selectStrategyEngineWorkspace, strategyId as Parameters<typeof m.selectStrategyEngineWorkspace>[0]);
  });
  void import('../organizational-intelligence/store').then((m) =>
    trySelect(m.selectOrganizationalIntelligenceWorkspace, asModuleTenantId(tenantId))
  );
  void import('../company-genome/store').then((m) =>
    trySelect(m.selectCompanyGenomeWorkspace, asModuleTenantId(tenantId))
  );
  void import('../architect-studio/store').then((m) => {
    const archId =
      tenantId === 'portfolio' ? 'portfolio-campus' : tenantId === 'ndxbook' ? 'ndxbook' : tenantId === 'frontal-slayer' ? 'frontal-slayer' : 'studio-os';
    trySelect(m.selectArchitectStudioWorkspace, archId as Parameters<typeof m.selectArchitectStudioWorkspace>[0]);
  });
  void import('../arrival-experience/store').then((m) =>
    trySelect(m.selectArrivalExperienceWorkspace, asModuleTenantId(tenantId))
  );
  void import('../studio-institute/store').then((m) =>
    trySelect(m.selectStudioInstituteWorkspace, asModuleTenantId(tenantId))
  );
  void import('../leadership-modes/store').then((m) =>
    trySelect(m.selectLeadershipModesWorkspace, asModuleTenantId(tenantId))
  );

  dispatchWorkspaceChanged({ platformWorkspaceId, moduleTenantId: tenantId });
  if (isWorkspaceRegistryConfigured()) {
    syncOrganizationBoundaryForPlatformWorkspace(platformWorkspaceId);
  }
  return tenantId;
}
