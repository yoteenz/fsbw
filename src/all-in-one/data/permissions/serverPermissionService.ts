/**
 * Shared permission definitions — server is authority; client is UX only.
 */

export const AIO_PERMISSIONS = [
  'customers.read',
  'customers.update',
  'documents.read',
  'documents.restricted.read',
  'billing.read',
  'billing.manage',
  'dispatch.read',
  'dispatch.manage',
  'factoring.read',
  'factoring.submit',
  'insurance.read',
  'integrations.manage',
  'reports.financial.read',
  'security.audit.read',
  'crm.read',
  'crm.manage',
  'workflows.read',
  'workflows.manage',
] as const;

export type AioPermission = (typeof AIO_PERMISSIONS)[number];

export interface ActorContext {
  userId: string;
  organizationIds: string[];
  permissions: Set<string>;
  isInternalStaff: boolean;
  correlationId?: string;
}

export function can(actor: ActorContext, permission: string): boolean {
  if (actor.isInternalStaff && actor.permissions.has('*')) return true;
  return actor.permissions.has(permission);
}

export function canAccessOrganization(actor: ActorContext, organizationId: string): boolean {
  if (actor.isInternalStaff) return true;
  return actor.organizationIds.includes(organizationId);
}

export function canAccessResource(
  actor: ActorContext,
  permission: string,
  organizationId: string,
): boolean {
  return can(actor, permission) && canAccessOrganization(actor, organizationId);
}

/** Reject client-supplied actor fields — identity from session only */
export function sanitizeActorFromClient<T extends { actorUserId?: string; role?: string }>(
  payload: T,
): Omit<T, 'actorUserId' | 'role'> {
  const { actorUserId: _a, role: _r, ...rest } = payload;
  return rest;
}
