/** Integration permissions — mapped to Office authorization model */

export type IntegrationPermission =
  | 'integrations.read'
  | 'integrations.manage'
  | 'integrations.credentials.manage'
  | 'integrations.test'
  | 'integrations.sync'
  | 'integrations.reconciliation.read'
  | 'integrations.reconciliation.resolve'
  | 'integrations.audit.read'
  | 'integrations.regulatory.verify'
  | 'integrations.payment.manage'
  | 'integrations.messaging.manage'
  | 'integrations.maps.use'
  | 'integrations.factoring.submit'
  | 'integrations.insurance.submit'
  | 'integrations.loadboard.search'
  | 'integrations.loadboard.import'
  | 'integrations.accounting.export'
  | 'integrations.external_action.confirm';

export const INTEGRATION_PERMISSION_LABELS: Record<IntegrationPermission, string> = {
  'integrations.read': 'View integrations',
  'integrations.manage': 'Manage integrations',
  'integrations.credentials.manage': 'Manage credentials',
  'integrations.test': 'Test connections',
  'integrations.sync': 'Run sync jobs',
  'integrations.reconciliation.read': 'View reconciliation',
  'integrations.reconciliation.resolve': 'Resolve reconciliation',
  'integrations.audit.read': 'View integration audit',
  'integrations.regulatory.verify': 'Run regulatory verification',
  'integrations.payment.manage': 'Manage payment integrations',
  'integrations.messaging.manage': 'Manage messaging integrations',
  'integrations.maps.use': 'Use maps routing',
  'integrations.factoring.submit': 'Submit to factoring partner',
  'integrations.insurance.submit': 'Submit to insurance partner',
  'integrations.loadboard.search': 'Search load boards',
  'integrations.loadboard.import': 'Import external loads',
  'integrations.accounting.export': 'Export to accounting',
  'integrations.external_action.confirm': 'Confirm external actions',
};

export function hasIntegrationPermission(
  permissions: string[],
  required: IntegrationPermission,
): boolean {
  return permissions.includes(required) || permissions.includes('integrations.manage');
}
