/** Studio OS Dependency Map™ — infrastructure constants */

export const DEPENDENCY_MAP_SUBSYSTEM_VERSION = '1.0.0';
export const DEPENDENCY_MAP_SUBSYSTEM_NAME = 'Studio OS Dependency Map™';

export const SYSTEM_IMPLEMENTATION_STATUSES = [
  'planned',
  'in_progress',
  'implemented',
  'blocked',
  'deferred',
] as const;

export type SystemImplementationStatus = (typeof SYSTEM_IMPLEMENTATION_STATUSES)[number];

export const BUILD_PRIORITIES = ['P0', 'P1', 'P2', 'P3', 'P4'] as const;

export type BuildPriority = (typeof BUILD_PRIORITIES)[number];

export const IMPLEMENTATION_RISK_LEVELS = ['low', 'medium', 'high', 'critical'] as const;

export type ImplementationRiskLevel = (typeof IMPLEMENTATION_RISK_LEVELS)[number];

export const BUILD_PHASES = [0, 1, 2, 3, 4, 5, 6, 7, 8] as const;

export type BuildPhase = (typeof BUILD_PHASES)[number];

/** Systems with Genesis runtime infrastructure already shipped */
export const IMPLEMENTED_SYSTEM_IDS = [
  'genesis',
  'canonical-object-model',
  'universal-interaction-model',
  'universal-decision-architecture',
  'core-systems-registry',
] as const;
