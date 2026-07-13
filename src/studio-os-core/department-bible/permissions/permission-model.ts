import type { CanonicalMainDepartmentId } from '../../canonical-studio-world/canonical-department-registry';
import { getCanonicalDepartmentRecord } from '../../canonical-studio-world/canonical-department-registry';
import { DEPARTMENT_BIBLE_REGISTRY } from '../registry/bible-registry';
import type { DepartmentCapability, DepartmentPermissionModel } from '../schemas/permissions';
import { DEPARTMENT_PERMISSION_MODEL_VERSION } from '../schemas/permissions';
import type { DepartmentRole } from '../schemas/department-bible';

const CAPABILITY_MAP: Partial<Record<CanonicalMainDepartmentId, DepartmentCapability[]>> = {
  'experience-lab': ['generate', 'approve', 'publish', 'compile'],
  'creative-director-studio': ['manufacture', 'customize', 'approve'],
  'command-center': ['monitor', 'queue'],
  'city-council': ['govern', 'certify', 'approve'],
  marketplace: ['list', 'purchase'],
  'construction-mode': ['manufacture', 'compile'],
  'immune-system': ['inspect', 'govern'],
  'quality-guard': ['inspect', 'approve'],
  'studio-world-registry': ['publish', 'browse'],
};

function grantsForDepartment(departmentId: CanonicalMainDepartmentId): DepartmentPermissionModel['grants'] {
  const bible = DEPARTMENT_BIBLE_REGISTRY[departmentId];
  const caps = CAPABILITY_MAP[departmentId] ?? ['browse'];
  const result: DepartmentPermissionModel['grants'] = [];

  if (bible.allowedRoles.includes('admin')) {
    result.push({ role: 'admin', capabilities: caps });
  }
  if (bible.allowedRoles.includes('founder')) {
    result.push({ role: 'founder', capabilities: caps.filter((c) => c !== 'publish' && c !== 'govern') });
  }
  if (bible.allowedRoles.includes('ai-worker')) {
    result.push({ role: 'ai-worker', capabilities: caps });
  }
  if (bible.allowedRoles.includes('system')) {
    result.push({ role: 'system', capabilities: caps });
  }
  if (bible.marketplaceParticipation) {
    result.push({ role: 'marketplace-creator', capabilities: ['list', 'purchase'] });
  }
  if (departmentId === 'city-council' || departmentId === 'permit-center') {
    result.push({ role: 'municipal-inspector', capabilities: ['govern', 'inspect', 'certify'] });
  }

  return result;
}

export function resolveDepartmentPermissionModel(departmentId: CanonicalMainDepartmentId): DepartmentPermissionModel {
  return {
    modelVersion: DEPARTMENT_PERMISSION_MODEL_VERSION,
    departmentId,
    grants: grantsForDepartment(departmentId),
    defaultDeny: true,
  };
}

export function canRolePerform(departmentId: CanonicalMainDepartmentId, role: DepartmentRole, capability: DepartmentCapability): boolean {
  const model = resolveDepartmentPermissionModel(departmentId);
  const grant = model.grants.find((g) => g.role === role);
  return grant?.capabilities.includes(capability) ?? false;
}

export function resolvePermissionsForRecord(departmentId: CanonicalMainDepartmentId): string[] {
  const record = getCanonicalDepartmentRecord(departmentId);
  return record?.permittedActions ?? [];
}
