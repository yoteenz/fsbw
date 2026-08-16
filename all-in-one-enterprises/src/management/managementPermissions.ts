import type { OfficePermission, OfficeStaffContext } from '../office-core/officeWorkTypes';

export type ManagementPermission =
  | 'management.dashboard.read'
  | 'management.financial.read'
  | 'management.sales.read'
  | 'management.services.read'
  | 'management.dispatch.read'
  | 'management.brokerage.read'
  | 'management.factoring.read'
  | 'management.insurance.read'
  | 'management.customers.read'
  | 'management.communications.read'
  | 'management.team.read'
  | 'management.deadlines.read'
  | 'management.data_quality.read'
  | 'reports.read'
  | 'reports.export'
  | 'reports.save'
  | 'management.settings';

const MANAGEMENT_PERMS: ManagementPermission[] = [
  'management.dashboard.read',
  'management.financial.read',
  'management.sales.read',
  'management.services.read',
  'management.dispatch.read',
  'management.brokerage.read',
  'management.factoring.read',
  'management.insurance.read',
  'management.customers.read',
  'management.communications.read',
  'management.team.read',
  'management.deadlines.read',
  'management.data_quality.read',
  'reports.read',
  'reports.export',
  'reports.save',
  'management.settings',
];

export function hasManagementPermission(
  ctx: OfficeStaffContext,
  permission: ManagementPermission,
): boolean {
  return ctx.permissions.includes(permission as OfficePermission);
}

export function canAccessManagement(ctx: OfficeStaffContext): boolean {
  return hasManagementPermission(ctx, 'management.dashboard.read');
}

export { MANAGEMENT_PERMS };
