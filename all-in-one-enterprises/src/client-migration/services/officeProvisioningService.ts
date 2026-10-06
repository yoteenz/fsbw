import type { DemoStore } from '../../demo/demoTypes';
import type { OfficeWorkspaceEntitlement, WorkspaceEntitlementState } from '../types';

const DEFAULT_WORKSPACES = ['dispatch', 'factoring', 'insurance', 'bookkeeping', 'permitting'] as const;

export function provisionPrebuiltClientOffice(
  store: DemoStore,
  organizationId: string,
  confirmedServiceSlugs: string[],
): DemoStore {
  if (!store.officeWorkspaceEntitlements) store.officeWorkspaceEntitlements = [];

  for (const workspaceCode of DEFAULT_WORKSPACES) {
    const slugMatch = confirmedServiceSlugs.some((s) => s.toLowerCase().includes(workspaceCode));
    const state: WorkspaceEntitlementState = slugMatch ? 'PENDING_SETUP' : 'AVAILABLE_NOT_ACTIVATED';
    const row: OfficeWorkspaceEntitlement = {
      organizationId,
      workspaceCode,
      state,
      confirmedByStaffAt: slugMatch ? new Date().toISOString() : undefined,
    };
    store.officeWorkspaceEntitlements = [
      ...store.officeWorkspaceEntitlements.filter(
        (e) => !(e.organizationId === organizationId && e.workspaceCode === workspaceCode),
      ),
      row,
    ];
  }

  const client = store.clients.find((c) => c.id === organizationId);
  if (client) {
    client.activationConditions = {
      ...(client.activationConditions ?? {}),
      officeProvisioningSucceeded: true,
      canonicalIdentityExists: true,
      reviewOrIntakeComplete: true,
    };
  }

  return store;
}

export function activateWorkspaceEntitlements(store: DemoStore, organizationId: string): DemoStore {
  if (!store.officeWorkspaceEntitlements) return store;
  const now = new Date().toISOString();
  store.officeWorkspaceEntitlements = store.officeWorkspaceEntitlements.map((e) => {
    if (e.organizationId !== organizationId) return e;
    if (e.state !== 'PENDING_SETUP') return e;
    return { ...e, state: 'ACTIVE', activatedAt: now };
  });
  return store;
}
