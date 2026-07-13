import type { CanonicalMainDepartmentId } from '../../canonical-studio-world/canonical-department-registry';
import type { DepartmentLifecycleModel } from '../schemas/lifecycle';
import { CANONICAL_LIFECYCLE_STATES, DEFAULT_LIFECYCLE_TRANSITIONS, DEPARTMENT_LIFECYCLE_VERSION } from '../schemas/lifecycle';

export function resolveDepartmentLifecycleModel(departmentId: CanonicalMainDepartmentId): DepartmentLifecycleModel {
  return {
    lifecycleVersion: DEPARTMENT_LIFECYCLE_VERSION,
    departmentId,
    states: [...CANONICAL_LIFECYCLE_STATES],
    transitions: DEFAULT_LIFECYCLE_TRANSITIONS,
    terminalStates: ['ARCHIVED', 'DEPRECATED'],
  };
}

export function validateLifecycleTransition(
  departmentId: CanonicalMainDepartmentId,
  from: string,
  to: string
): boolean {
  const model = resolveDepartmentLifecycleModel(departmentId);
  return model.transitions.some((t) => t.from === from && t.to === to);
}
