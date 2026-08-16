/** Security permissions — office staff only; customers use org-scoped object guards. */

export type SecurityPermission =
  | 'security.read'
  | 'security.manage'
  | 'security.audit.read'
  | 'security.incidents.read'
  | 'security.incidents.manage'
  | 'security.production_readiness.read'
  | 'security.settings.manage'
  | 'privacy.read'
  | 'privacy.manage'
  | 'privacy.requests.review';

export const SECURITY_PERMISSION_LABELS: Record<SecurityPermission, string> = {
  'security.read': 'View Security Center',
  'security.manage': 'Manage security posture',
  'security.audit.read': 'View security audit log',
  'security.incidents.read': 'View security incidents',
  'security.incidents.manage': 'Manage security incidents',
  'security.production_readiness.read': 'View production readiness',
  'security.settings.manage': 'Manage security settings',
  'privacy.read': 'View Privacy Center',
  'privacy.manage': 'Manage privacy policies',
  'privacy.requests.review': 'Review privacy requests',
};

export function hasSecurityPermission(permissions: string[], required: SecurityPermission): boolean {
  if (permissions.includes('security.manage')) return true;
  if (required.startsWith('security.') && permissions.includes(required)) return true;
  if (required.startsWith('privacy.') && (permissions.includes(required) || permissions.includes('privacy.manage'))) return true;
  return false;
}

export const SECURITY_FULL: SecurityPermission[] = [
  'security.read',
  'security.manage',
  'security.audit.read',
  'security.incidents.read',
  'security.incidents.manage',
  'security.production_readiness.read',
  'security.settings.manage',
  'privacy.read',
  'privacy.manage',
  'privacy.requests.review',
];

export const SECURITY_AUDIT_ONLY: SecurityPermission[] = [
  'security.read',
  'security.audit.read',
  'privacy.read',
];

export const SECURITY_PRIVACY_REVIEW: SecurityPermission[] = [
  'privacy.read',
  'privacy.requests.review',
];
