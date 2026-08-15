import { updateDemoStore } from '../demo/demoStore';
import type { DemoStore } from '../demo/demoTypes';
import type { PortalContext, PortalKind, PortalMemberRole } from './clientCommandCenterTypes';

export function resolvePortalKind(pathname: string): PortalKind {
  return pathname.includes('/shipper') ? 'shipper' : 'carrier';
}

export function resolveOrganizationId(store: DemoStore, portalKind: PortalKind = 'carrier'): string {
  if (portalKind === 'shipper') {
    return store.shipperPortalOrgId ?? 'client-e';
  }
  return store.portalClientId ?? store.clients[0]?.id ?? 'client-a';
}

export function roleCanViewBilling(role: PortalMemberRole): boolean {
  return ['owner', 'admin', 'accounting'].includes(role);
}

export function roleCanViewFullMoney(role: PortalMemberRole): boolean {
  return ['owner', 'admin', 'accounting', 'operations'].includes(role);
}

export function resolvePortalContext(
  store: DemoStore,
  portalKind: PortalKind = 'carrier',
): PortalContext {
  const organizationId = resolveOrganizationId(store, portalKind);
  const client = store.clients.find((c) => c.id === organizationId);
  const memberRole = store.portalMemberRole ?? 'owner';
  const isShipper = portalKind === 'shipper' || client?.clientType === 'shipper';

  return {
    organizationId,
    portalKind,
    clientType: client?.clientType ?? (isShipper ? 'shipper' : 'owner_operator'),
    companyName: client?.companyName ?? 'Your Business',
    contactName: client?.contactName,
    memberRole,
    isShipper,
    canViewBilling: roleCanViewBilling(memberRole),
    canViewFullMoney: roleCanViewFullMoney(memberRole),
  };
}

export function setPortalOrganization(orgId: string): void {
  updateDemoStore((s) => {
    s.portalClientId = orgId;
    return s;
  });
}

export function setShipperOrganization(orgId: string): void {
  updateDemoStore((s) => {
    s.shipperPortalOrgId = orgId;
    return s;
  });
}

export function setPortalMemberRole(role: PortalMemberRole): void {
  updateDemoStore((s) => {
    s.portalMemberRole = role;
    return s;
  });
}
