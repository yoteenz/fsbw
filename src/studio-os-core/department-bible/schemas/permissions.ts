import type { DepartmentRole } from './department-bible';

export const DEPARTMENT_PERMISSION_MODEL_VERSION = 'department-permission-model.v1' as const;

export type DepartmentCapability =
  | 'generate'
  | 'approve'
  | 'publish'
  | 'manufacture'
  | 'customize'
  | 'monitor'
  | 'govern'
  | 'list'
  | 'purchase'
  | 'certify'
  | 'inspect'
  | 'compile'
  | 'queue'
  | 'browse'
  | 'archive';

export type RoleCapabilityGrant = {
  role: DepartmentRole;
  capabilities: DepartmentCapability[];
};

export type DepartmentPermissionModel = {
  modelVersion: typeof DEPARTMENT_PERMISSION_MODEL_VERSION;
  departmentId: string;
  grants: RoleCapabilityGrant[];
  defaultDeny: true;
};
