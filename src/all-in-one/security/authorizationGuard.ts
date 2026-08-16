import type { DemoStore } from '../demo/demoTypes';
import type { OfficeStaffContext } from '../office-core/officeWorkTypes';
import { resolveOfficeStaffContext, hasOfficePermission } from '../office-core/officeContext';
import { resolveOrganizationId } from '../portal/organizationContext';
import type { SecurityAuditEventType } from './securityTypes';

export type ResourceType =
  | 'customer'
  | 'organization'
  | 'invoice'
  | 'quote'
  | 'payment'
  | 'document'
  | 'service_request'
  | 'conversation'
  | 'appointment'
  | 'workflow'
  | 'load'
  | 'factoring_case'
  | 'insurance_case'
  | 'brokerage_shipment'
  | 'report'
  | 'integration';

export type PrincipalType = 'anonymous' | 'customer' | 'staff';

export interface AccessContext {
  principalType: PrincipalType;
  organizationId?: string;
  staff?: OfficeStaffContext;
}

export interface AccessDecision {
  allowed: boolean;
  reason?: string;
  auditEvent?: SecurityAuditEventType;
}

function orgForClient(clientId: string): string {
  return clientId;
}

export function resolveCustomerOrgId(store: DemoStore): string {
  return resolveOrganizationId(store, 'carrier');
}

export function buildStaffAccessContext(store: DemoStore): AccessContext {
  return {
    principalType: 'staff',
    staff: resolveOfficeStaffContext(store),
  };
}

export function buildCustomerAccessContext(store: DemoStore): AccessContext {
  return {
    principalType: 'customer',
    organizationId: resolveCustomerOrgId(store),
  };
}

/** Default deny — explicit allow per resource. */
export function canAccessResource(
  store: DemoStore,
  ctx: AccessContext,
  resource: ResourceType,
  resourceId: string,
): AccessDecision {
  switch (resource) {
    case 'invoice': {
      const inv = store.invoices.find((i) => i.id === resourceId);
      if (!inv) return { allowed: false, reason: 'not_found' };
      if (ctx.principalType === 'customer') {
        const ok = inv.organizationId === ctx.organizationId;
        return { allowed: ok, reason: ok ? undefined : 'forbidden', auditEvent: ok ? undefined : 'DOCUMENT_VIEWED' };
      }
      if (ctx.principalType === 'staff' && ctx.staff) {
        const ok = hasOfficePermission(ctx.staff, 'billing.read');
        return { allowed: ok, reason: ok ? undefined : 'forbidden' };
      }
      return { allowed: false, reason: 'forbidden' };
    }
    case 'quote': {
      const q = store.quotes.find((x) => x.id === resourceId);
      if (!q) return { allowed: false, reason: 'not_found' };
      if (ctx.principalType === 'customer') {
        return { allowed: q.organizationId === ctx.organizationId, reason: q.organizationId === ctx.organizationId ? undefined : 'forbidden' };
      }
      if (ctx.principalType === 'staff' && ctx.staff) {
        return { allowed: hasOfficePermission(ctx.staff, 'billing.read'), reason: 'forbidden' };
      }
      return { allowed: false };
    }
    case 'document': {
      const doc = store.documents.find((d) => d.id === resourceId);
      if (!doc) return { allowed: false, reason: 'not_found' };
      if (ctx.principalType === 'customer') {
        const ok = doc.organizationId === ctx.organizationId && doc.visibility === 'customer';
        return { allowed: ok, reason: ok ? undefined : 'forbidden', auditEvent: 'DOCUMENT_VIEWED' };
      }
      if (ctx.principalType === 'staff' && ctx.staff) {
        return { allowed: hasOfficePermission(ctx.staff, 'clients.read'), reason: 'forbidden' };
      }
      return { allowed: false };
    }
    case 'service_request': {
      const req = store.requests.find((r) => r.id === resourceId);
      if (!req) return { allowed: false, reason: 'not_found' };
      if (ctx.principalType === 'customer') {
        return { allowed: req.clientId === ctx.organizationId, reason: 'forbidden' };
      }
      if (ctx.principalType === 'staff' && ctx.staff) {
        return { allowed: hasOfficePermission(ctx.staff, 'clients.read'), reason: 'forbidden' };
      }
      return { allowed: false };
    }
    case 'conversation': {
      const conv = store.commConversations?.find((c) => c.id === resourceId);
      if (!conv) return { allowed: false, reason: 'not_found' };
      if (ctx.principalType === 'customer') {
        return { allowed: conv.organizationId === ctx.organizationId, reason: 'forbidden' };
      }
      if (ctx.principalType === 'staff' && ctx.staff) {
        return { allowed: hasOfficePermission(ctx.staff, 'comm.read'), reason: 'forbidden' };
      }
      return { allowed: false };
    }
    case 'appointment': {
      const appt = store.appointments?.find((a) => a.id === resourceId);
      if (!appt) return { allowed: false, reason: 'not_found' };
      if (ctx.principalType === 'customer') {
        return { allowed: appt.organizationId === ctx.organizationId, reason: 'forbidden' };
      }
      if (ctx.principalType === 'staff' && ctx.staff) {
        return { allowed: hasOfficePermission(ctx.staff, 'appointments.read'), reason: 'forbidden' };
      }
      return { allowed: false };
    }
    case 'load': {
      const load = store.loads.find((l) => l.id === resourceId);
      if (!load) return { allowed: false, reason: 'not_found' };
      const org = load.organizationId;
      if (ctx.principalType === 'customer') {
        return { allowed: org === ctx.organizationId, reason: 'forbidden' };
      }
      if (ctx.principalType === 'staff' && ctx.staff) {
        return { allowed: hasOfficePermission(ctx.staff, 'work.read'), reason: 'forbidden' };
      }
      return { allowed: false };
    }
    case 'integration': {
      if (ctx.principalType === 'staff' && ctx.staff) {
        const ok = ctx.staff.permissions.includes('integrations.read') || ctx.staff.permissions.includes('integrations.manage');
        return { allowed: ok, reason: 'forbidden' };
      }
      return { allowed: false, reason: 'forbidden' };
    }
    case 'report': {
      if (ctx.principalType === 'staff' && ctx.staff) {
        return { allowed: ctx.staff.permissions.includes('reports.read'), reason: 'forbidden' };
      }
      return { allowed: false };
    }
    case 'customer': {
      const client = store.clients.find((c) => c.id === resourceId);
      if (!client) return { allowed: false, reason: 'not_found' };
      if (ctx.principalType === 'customer') {
        return { allowed: client.id === ctx.organizationId, reason: 'forbidden' };
      }
      if (ctx.principalType === 'staff' && ctx.staff) {
        return { allowed: hasOfficePermission(ctx.staff, 'clients.read'), reason: 'forbidden' };
      }
      return { allowed: false };
    }
    case 'organization': {
      if (ctx.principalType === 'customer') {
        return { allowed: resourceId === ctx.organizationId, reason: 'forbidden' };
      }
      if (ctx.principalType === 'staff' && ctx.staff) {
        return { allowed: hasOfficePermission(ctx.staff, 'clients.read'), reason: 'forbidden' };
      }
      return { allowed: false };
    }
    default:
      return { allowed: false, reason: 'unsupported' };
  }
}

export function assertResourceAccess(
  store: DemoStore,
  ctx: AccessContext,
  resource: ResourceType,
  resourceId: string,
): AccessDecision {
  return canAccessResource(store, ctx, resource, resourceId);
}

export function filterAuthorizedSearchResults<T extends { organizationId?: string; clientId?: string }>(
  items: T[],
  ctx: AccessContext,
): T[] {
  if (ctx.principalType === 'staff' && ctx.staff?.permissions.includes('clients.read')) {
    return items;
  }
  if (ctx.principalType === 'customer' && ctx.organizationId) {
    return items.filter((i) => {
      const org = i.organizationId ?? i.clientId;
      return org === ctx.organizationId;
    });
  }
  return [];
}

export function canExportFinancial(ctx: AccessContext): boolean {
  if (ctx.principalType !== 'staff' || !ctx.staff) return false;
  return ctx.staff.permissions.includes('reports.export') || ctx.staff.permissions.includes('billing.manage');
}

export function canViewIntegrationSecrets(ctx: AccessContext): boolean {
  if (ctx.principalType !== 'staff' || !ctx.staff) return false;
  return ctx.staff.permissions.includes('integrations.credentials.manage');
}

export function orgForStoreRecord(_store: DemoStore, clientId: string): string {
  return orgForClient(clientId);
}
