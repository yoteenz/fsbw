/** Production reference seed — roles and permissions only (no fictional operational records) */

export const PRODUCTION_REFERENCE_ROLES = [
  { code: 'OWNER', name: 'Organization Owner', scope: 'organization' },
  { code: 'ADMIN', name: 'Administrator', scope: 'organization' },
  { code: 'MANAGER', name: 'Manager', scope: 'internal' },
  { code: 'OPERATIONS', name: 'Operations', scope: 'internal' },
  { code: 'DISPATCHER', name: 'Dispatcher', scope: 'internal' },
  { code: 'FINANCE', name: 'Finance', scope: 'internal' },
  { code: 'CRM', name: 'CRM', scope: 'internal' },
  { code: 'SECURITY', name: 'Security', scope: 'internal' },
  { code: 'CUSTOMER', name: 'Customer', scope: 'organization' },
] as const;

export const PRODUCTION_REFERENCE_PERMISSIONS = [
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
] as const;
