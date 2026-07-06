import { CONTEXT_DIMENSIONS } from './constants';
import type { ContextDimension, ContextualPermissionRule } from './types';

const RULE_TEMPLATES: Omit<ContextualPermissionRule, 'ruleId'>[] = [
  {
    dimension: 'organization',
    label: 'Organization Boundary',
    description: 'Capabilities scoped to active organization context only.',
    conditions: ['Active organization context required', 'Cross-org access blocked without delegation'],
    grantedCapabilities: ['*'],
    active: true,
  },
  {
    dimension: 'department',
    label: 'Department Scope',
    description: 'Finance capabilities limited to Finance department members.',
    conditions: ['User department matches resource department', 'Manager inherits department scope'],
    grantedCapabilities: ['invoices.*', 'financials.view-financials'],
    active: true,
  },
  {
    dimension: 'workspace',
    label: 'Workspace Isolation',
    description: 'Project workspace permissions isolated from headquarters.',
    conditions: ['Workspace ID matches assigned project', 'Guest roles workspace-scoped only'],
    grantedCapabilities: ['content.view', 'content.create'],
    active: true,
  },
  {
    dimension: 'feature',
    label: 'Feature Gate',
    description: 'Legacy Vault requires explicit access-legacy-vault capability.',
    conditions: ['Feature flag enabled', 'Capability access-legacy-vault granted'],
    grantedCapabilities: ['legacy-vault.access-legacy-vault'],
    active: true,
  },
  {
    dimension: 'approval-state',
    label: 'Pending Approval Lock',
    description: 'Edit blocked while content awaits founder approval.',
    conditions: ['Resource status pending-approval', 'Only approver roles may edit'],
    grantedCapabilities: ['content.approve', 'content.reject'],
    active: true,
  },
  {
    dimension: 'business-hours',
    label: 'Business Hours Restriction',
    description: 'Financial approvals restricted outside business hours except emergency mode.',
    conditions: ['Weekdays 9 AM–6 PM org timezone', 'Emergency mode overrides'],
    grantedCapabilities: ['invoices.approve', 'financials.view-financials'],
    active: true,
  },
  {
    dimension: 'temporary-delegation',
    label: 'Temporary Delegation',
    description: 'Time-limited capability grants with automatic expiry and audit.',
    conditions: ['Delegation expires after configured days', 'Audit trail mandatory'],
    grantedCapabilities: ['financials.view-financials', 'invoices.approve'],
    active: true,
  },
  {
    dimension: 'emergency-mode',
    label: 'Emergency Mode Override',
    description: 'Founder may grant temporary elevated access during incidents.',
    conditions: ['Founder initiates emergency mode', 'All grants logged to audit history'],
    grantedCapabilities: ['*'],
    active: true,
  },
  {
    dimension: 'project',
    label: 'Project Scope',
    description: 'Contractor capabilities limited to assigned project resources.',
    conditions: ['Project membership verified', 'Expires on project completion'],
    grantedCapabilities: ['content.view', 'content.create', 'campaigns.view'],
    active: true,
  },
  {
    dimension: 'location',
    label: 'Location Restriction (Optional)',
    description: 'Optional geo-restriction for sensitive financial access.',
    conditions: ['Optional — disabled by default', 'Enable per organization preference'],
    grantedCapabilities: ['financials.view-financials'],
    active: false,
  },
];

/** Contextual permission rules — adapt to organization, department, workspace, and state. */
export function buildContextualRules(): ContextualPermissionRule[] {
  return RULE_TEMPLATES.map((t, i) => ({
    ruleId: `ctx-${t.dimension}-${i}`,
    ...t,
  }));
}

export function getActiveContextualRules(): ContextualPermissionRule[] {
  return buildContextualRules().filter((r) => r.active);
}

export function getRulesForDimension(dimension: ContextDimension): ContextualPermissionRule[] {
  return buildContextualRules().filter((r) => r.dimension === dimension);
}

export function evaluateContextualAccess(
  capabilityId: string,
  context: {
    department?: string;
    requiredDepartment?: string;
    approvalPending?: boolean;
    businessHours?: boolean;
    emergencyMode?: boolean;
    hasDelegation?: boolean;
  }
): { allowed: boolean; blockReason?: string } {
  if (context.approvalPending && capabilityId.includes('.edit')) {
    return { allowed: false, blockReason: 'Resource pending approval — edit locked until approved or rejected.' };
  }
  if (context.requiredDepartment && context.department !== context.requiredDepartment) {
    if (capabilityId.includes('financials') || capabilityId.includes('invoices')) {
      return { allowed: false, blockReason: `Finance capabilities require ${context.requiredDepartment} department membership.` };
    }
  }
  if (context.businessHours === false && !context.emergencyMode && capabilityId.includes('approve')) {
    return { allowed: false, blockReason: 'Approval restricted outside business hours — enable emergency mode or wait for business hours.' };
  }
  if (context.hasDelegation) {
    return { allowed: true };
  }
  return { allowed: true };
}

export { CONTEXT_DIMENSIONS };
