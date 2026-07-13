/**
 * Three governed department classes — never conflate canonical infrastructure with HQ templates.
 */

export const DEPARTMENT_CLASSIFICATION_VERSION = 'department-classification.v1' as const;

export type DepartmentClass =
  | 'CANONICAL_STUDIO_WORLD_DEPARTMENT'
  | 'SHARED_HQ_DEPARTMENT_TEMPLATE'
  | 'INDUSTRY_UNIQUE_DEPARTMENT_TEMPLATE';

export type DepartmentClassDefinition = {
  classId: DepartmentClass;
  displayName: string;
  description: string;
  tenantOwned: boolean;
  globalScope: boolean;
  experienceLabProgram: 'studio-world' | 'industry-packs' | null;
};

export const DEPARTMENT_CLASS_REGISTRY: Record<DepartmentClass, DepartmentClassDefinition> = {
  CANONICAL_STUDIO_WORLD_DEPARTMENT: {
    classId: 'CANONICAL_STUDIO_WORLD_DEPARTMENT',
    displayName: 'Canonical Studio World Department',
    description: 'Global infrastructure used to operate Studio World — exists once.',
    tenantOwned: false,
    globalScope: true,
    experienceLabProgram: 'studio-world',
  },
  SHARED_HQ_DEPARTMENT_TEMPLATE: {
    classId: 'SHARED_HQ_DEPARTMENT_TEMPLATE',
    displayName: 'Shared HQ Department Template',
    description: 'Reusable headquarters department referenced across multiple Industry Packs.',
    tenantOwned: false,
    globalScope: false,
    experienceLabProgram: 'industry-packs',
  },
  INDUSTRY_UNIQUE_DEPARTMENT_TEMPLATE: {
    classId: 'INDUSTRY_UNIQUE_DEPARTMENT_TEMPLATE',
    displayName: 'Industry-Unique Department Template',
    description: 'Specialized headquarters department for one or more related industries.',
    tenantOwned: false,
    globalScope: false,
    experienceLabProgram: 'industry-packs',
  },
};

export function classifyDepartment(input: {
  departmentId: string;
  isCanonicalRegistryMember?: boolean;
  isSharedHqTemplate?: boolean;
}): DepartmentClass {
  if (input.isCanonicalRegistryMember) return 'CANONICAL_STUDIO_WORLD_DEPARTMENT';
  if (input.isSharedHqTemplate) return 'SHARED_HQ_DEPARTMENT_TEMPLATE';
  return 'INDUSTRY_UNIQUE_DEPARTMENT_TEMPLATE';
}

export function assertNotMisclassifiedAsCanonical(input: {
  departmentClass: DepartmentClass;
  operation: string;
}): { ok: true } | { ok: false; code: string; message: string } {
  if (input.departmentClass === 'CANONICAL_STUDIO_WORLD_DEPARTMENT') return { ok: true };
  return {
    ok: false,
    code: 'NOT_CANONICAL_INFRASTRUCTURE',
    message: `${input.operation} applies only to canonical Studio World departments, not ${input.departmentClass}.`,
  };
}

/** Shared HQ templates reused across Industry Packs — not canonical Studio World infrastructure. */
export const SHARED_HQ_DEPARTMENT_TEMPLATE_IDS = new Set([
  'reception',
  'lobby',
  'conference-room',
  'executive-office',
  'storage',
  'staff-lounge',
  'training-room',
  'waiting-area',
  'office',
]);

export function classifyDepartmentById(
  departmentId: string,
  options?: { isCanonicalRegistryMember?: boolean }
): DepartmentClass {
  if (options?.isCanonicalRegistryMember) return 'CANONICAL_STUDIO_WORLD_DEPARTMENT';
  if (SHARED_HQ_DEPARTMENT_TEMPLATE_IDS.has(departmentId)) return 'SHARED_HQ_DEPARTMENT_TEMPLATE';
  return 'INDUSTRY_UNIQUE_DEPARTMENT_TEMPLATE';
}

export function classifyIndustryPackDepartmentSlot(departmentId: string): DepartmentClass {
  return classifyDepartmentById(departmentId);
}
