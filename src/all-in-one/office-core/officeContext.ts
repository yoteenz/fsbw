import { updateDemoStore } from '../demo/demoStore';
import type { DemoStore, StaffMember } from '../demo/demoTypes';
import type { OfficePermission, OfficeStaffContext, OfficeStaffRole } from './officeWorkTypes';

const CRM_FULL: OfficePermission[] = [
  'crm.read', 'crm.leads.read', 'crm.leads.manage', 'crm.leads.merge',
  'crm.opportunities.read', 'crm.opportunities.manage',
  'crm.activities.read', 'crm.activities.manage', 'crm.followups.manage',
  'crm.pipeline.read', 'crm.pipeline.manage', 'crm.quotes.prepare',
  'crm.convert', 'crm.reports.read', 'crm.settings.manage',
];

const CRM_SALES: OfficePermission[] = [
  'crm.read', 'crm.leads.read', 'crm.leads.manage',
  'crm.opportunities.read', 'crm.opportunities.manage',
  'crm.activities.read', 'crm.activities.manage', 'crm.followups.manage',
  'crm.pipeline.read', 'crm.pipeline.manage', 'crm.quotes.prepare',
  'crm.convert', 'crm.reports.read',
];

const ROLE_PERMISSIONS: Record<OfficeStaffRole, OfficePermission[]> = {
  owner: [
    'clients.read', 'clients.manage', 'work.read', 'work.manage', 'work.assign',
    'approvals.read', 'approvals.review', 'escalations.read', 'escalations.manage',
    'internal_notes.read', 'internal_notes.create', 'team.read', 'team.manage',
    'billing.read', 'billing.manage', 'brokerage_finance.read', 'factoring_finance.read',
    'audit.read', 'workload.read',
    'workflows.read', 'workflows.manage', 'workflows.override',
    'workflow_templates.read', 'workflow_templates.manage',
    'automation_rules.read', 'automation_rules.manage',
    'automation_exceptions.read', 'automation_exceptions.resolve',
    ...CRM_FULL,
  ],
  admin: [
    'clients.read', 'clients.manage', 'work.read', 'work.manage', 'work.assign',
    'approvals.read', 'approvals.review', 'escalations.read', 'escalations.manage',
    'internal_notes.read', 'internal_notes.create', 'team.read', 'team.manage',
    'billing.read', 'billing.manage', 'brokerage_finance.read', 'factoring_finance.read',
    'audit.read', 'workload.read',
    'workflows.read', 'workflows.manage', 'workflows.override',
    'workflow_templates.read', 'workflow_templates.manage',
    'automation_rules.read', 'automation_rules.manage',
    'automation_exceptions.read', 'automation_exceptions.resolve',
    ...CRM_FULL,
  ],
  manager: [
    'clients.read', 'clients.manage', 'work.read', 'work.manage', 'work.assign',
    'approvals.read', 'approvals.review', 'escalations.read', 'escalations.manage',
    'internal_notes.read', 'internal_notes.create', 'team.read',
    'billing.read', 'brokerage_finance.read', 'workload.read',
    'workflows.read', 'workflows.manage', 'workflows.override',
    'workflow_templates.read', 'automation_rules.read', 'automation_exceptions.read',
    ...CRM_FULL,
  ],
  permitting_specialist: [
    'clients.read', 'work.read', 'work.manage', 'internal_notes.read', 'internal_notes.create',
    'billing.read', 'workflows.read', 'workflows.manage',
  ],
  road_ready_specialist: [
    'clients.read', 'work.read', 'work.manage', 'internal_notes.read', 'internal_notes.create',
  ],
  insurance_coordinator: [
    'clients.read', 'work.read', 'work.manage', 'internal_notes.read', 'internal_notes.create',
  ],
  dispatcher: [
    'clients.read', 'work.read', 'work.manage', 'internal_notes.read', 'internal_notes.create',
  ],
  factoring_coordinator: [
    'clients.read', 'work.read', 'work.manage', 'internal_notes.read', 'internal_notes.create',
    'factoring_finance.read',
  ],
  broker: [
    'clients.read', 'work.read', 'work.manage', 'internal_notes.read', 'internal_notes.create',
    'brokerage_finance.read',
    ...CRM_SALES,
  ],
  billing_specialist: [
    'clients.read', 'work.read', 'work.manage', 'internal_notes.read', 'internal_notes.create',
    'billing.read', 'billing.manage',
    'crm.read', 'crm.leads.read', 'crm.opportunities.read', 'crm.quotes.prepare',
  ],
  customer_support: [
    'clients.read', 'work.read', 'work.manage', 'internal_notes.read', 'internal_notes.create',
    'crm.read', 'crm.leads.read', 'crm.leads.manage', 'crm.activities.read', 'crm.activities.manage', 'crm.followups.manage',
  ],
  viewer: ['clients.read', 'work.read', 'internal_notes.read'],
};

const MANAGER_ROLES: OfficeStaffRole[] = ['owner', 'admin', 'manager'];

export function resolveOfficeStaffContext(store: DemoStore): OfficeStaffContext {
  const staffId = store.officeStaffId ?? 'staff-1';
  const staff = store.staff.find((s) => s.id === staffId) ?? store.staff[0];
  const role = (store.officeStaffRole ?? staff?.officeRole ?? 'manager') as OfficeStaffRole;
  const teamIds = staff?.teamIds ?? store.officeTeams?.filter((t) => t.division).map((t) => t.id).slice(0, 1) ?? [];

  return {
    staffId: staff?.id ?? staffId,
    staffName: staff?.name ?? 'Staff',
    role,
    teamIds,
    permissions: ROLE_PERMISSIONS[role] ?? ROLE_PERMISSIONS.viewer,
    isManager: MANAGER_ROLES.includes(role),
  };
}

export function hasOfficePermission(ctx: OfficeStaffContext, permission: OfficePermission): boolean {
  return ctx.permissions.includes(permission);
}

export function canViewFinancialDomain(
  ctx: OfficeStaffContext,
  domain: 'billing' | 'brokerage' | 'factoring',
): boolean {
  if (domain === 'billing') return hasOfficePermission(ctx, 'billing.read');
  if (domain === 'brokerage') return hasOfficePermission(ctx, 'brokerage_finance.read');
  if (domain === 'factoring') return hasOfficePermission(ctx, 'factoring_finance.read');
  return false;
}

export function setOfficeStaff(staffId: string, role?: OfficeStaffRole): void {
  updateDemoStore((s) => {
    s.officeStaffId = staffId;
    const staff = s.staff.find((m) => m.id === staffId);
    if (role) s.officeStaffRole = role;
    else if (staff?.officeRole) s.officeStaffRole = staff.officeRole;
    return s;
  });
}

export function setOfficeStaffRole(role: OfficeStaffRole): void {
  updateDemoStore((s) => {
    s.officeStaffRole = role;
    return s;
  });
}

export function staffDisplayRole(staff: StaffMember): string {
  return staff.officeRole?.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) ?? staff.role;
}

export function greetingForStaff(name: string, hour = new Date().getHours()): string {
  const first = name.split(' ')[0]?.toUpperCase() ?? name.toUpperCase();
  if (hour < 12) return `GOOD MORNING, ${first}.`;
  if (hour < 17) return `GOOD AFTERNOON, ${first}.`;
  return `GOOD EVENING, ${first}.`;
}
