import type { PermissionAuditRecord, RoleProfileId } from './types';

function auditRecord(
  partial: Pick<PermissionAuditRecord, 'auditId' | 'eventType' | 'actor' | 'reason' | 'organizationId'> &
    Partial<PermissionAuditRecord>
): PermissionAuditRecord {
  return {
    affectedSystems: partial.affectedSystems ?? [],
    occurredAt: partial.occurredAt ?? new Date().toISOString(),
    ...partial,
  };
}

/** Complete permission audit history — who, when, why, affected systems. */
export function buildSeedAuditHistory(organizationId: string): PermissionAuditRecord[] {
  const now = Date.now();
  return [
    auditRecord({
      auditId: 'audit-001',
      eventType: 'granted',
      actor: 'Founder',
      targetUser: 'Finance Analyst',
      capabilityId: 'invoices.approve',
      reason: 'Temporary delegation for month-end close',
      affectedSystems: ['Permission Engine', 'Policy Engine', 'Automation Registry'],
      organizationId,
      department: 'Finance',
      occurredAt: new Date(now - 86400000 * 2).toISOString(),
    }),
    auditRecord({
      auditId: 'audit-002',
      eventType: 'delegated',
      actor: 'Founder',
      targetUser: 'Contractor Lead',
      capabilityId: 'campaigns.create',
      reason: 'Two-day project delegation — Q3 campaign assets',
      affectedSystems: ['Permission Engine', 'Content Scheduling'],
      organizationId,
      department: 'Marketing',
      occurredAt: new Date(now - 86400000).toISOString(),
    }),
    auditRecord({
      auditId: 'audit-003',
      eventType: 'revoked',
      actor: 'HR Director',
      targetUser: 'Former Employee',
      roleId: 'marketing',
      reason: 'Offboarding — all capabilities revoked',
      affectedSystems: ['Permission Engine', 'Command Dock', 'Legacy Vault'],
      organizationId,
      department: 'Marketing',
      occurredAt: new Date(now - 86400000 * 3).toISOString(),
    }),
    auditRecord({
      auditId: 'audit-004',
      eventType: 'modified',
      actor: 'Founder',
      targetUser: 'Marketing Team',
      roleId: 'marketing',
      reason: 'Added campaigns.publish to Marketing role profile',
      affectedSystems: ['Permission Engine', 'Policy Engine'],
      organizationId,
      department: 'Marketing',
      occurredAt: new Date(now - 86400000 * 5).toISOString(),
    }),
    auditRecord({
      auditId: 'audit-005',
      eventType: 'security',
      actor: 'Permission Engine',
      targetUser: 'Unknown User',
      reason: 'Blocked unauthorized Legacy Vault access attempt',
      affectedSystems: ['Legacy Vault', 'Permission Engine', 'Policy Engine'],
      organizationId,
      occurredAt: new Date(now - 3600000).toISOString(),
    }),
    auditRecord({
      auditId: 'audit-006',
      eventType: 'expired',
      actor: 'Permission Engine',
      targetUser: 'Finance Analyst',
      capabilityId: 'invoices.approve',
      reason: 'Temporary delegation expired after 2 days',
      affectedSystems: ['Permission Engine'],
      organizationId,
      department: 'Finance',
      occurredAt: new Date(now - 43200000).toISOString(),
    }),
  ].sort((a, b) => b.occurredAt.localeCompare(a.occurredAt));
}

export function filterAuditThisWeek(history: PermissionAuditRecord[]): PermissionAuditRecord[] {
  const weekAgo = new Date(Date.now() - 86400000 * 7);
  return history.filter((a) => new Date(a.occurredAt) >= weekAgo);
}

export function grantTemporaryAccess(
  organizationId: string,
  actor: string,
  targetUser: string,
  capabilityId: string,
  reason: string,
  department?: string
): PermissionAuditRecord {
  return auditRecord({
    auditId: `audit-${Date.now()}`,
    eventType: 'delegated',
    actor,
    targetUser,
    capabilityId,
    reason,
    affectedSystems: ['Permission Engine', 'Policy Engine'],
    organizationId,
    department,
    occurredAt: new Date().toISOString(),
  });
}

export function explainDeniedApproval(roleId: RoleProfileId, capabilityId: string): string {
  if (roleId === 'guest' || roleId === 'contractor') {
    return `${roleId} role lacks invoices.approve — requires Finance or Manager role with approval capability.`;
  }
  if (roleId === 'marketing' && capabilityId.includes('invoices')) {
    return 'Marketing role cannot approve invoices — assign Finance role or temporary delegation.';
  }
  if (roleId === 'manager' && capabilityId.includes('invoices.approve')) {
    return 'Manager may approve invoices within threshold — amounts above limit escalate to Executive/Founder.';
  }
  return `Role ${roleId} missing capability ${capabilityId} — review role composition or request delegation.`;
}
