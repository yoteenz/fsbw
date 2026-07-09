/** Studio OS Build Order Engine™ — infrastructure constants */

export const BUILD_ORDER_SUBSYSTEM_VERSION = '1.0.0';
export const BUILD_ORDER_SUBSYSTEM_NAME = 'Studio OS Build Order Engine™';

export const BUILD_ORDER_STATUSES = [
  'planned',
  'in_progress',
  'implemented',
  'blocked',
  'deferred',
] as const;

export type BuildOrderStatus = (typeof BUILD_ORDER_STATUSES)[number];

export const BUILD_ORDER_PRIORITIES = ['P0', 'P1', 'P2', 'P3', 'P4'] as const;

export type BuildOrderPriority = (typeof BUILD_ORDER_PRIORITIES)[number];

export const BUILD_ORDER_ARCHITECTURAL_PHASES = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] as const;

export type BuildOrderArchitecturalPhase = (typeof BUILD_ORDER_ARCHITECTURAL_PHASES)[number];

export const READINESS_LEVELS = ['high', 'medium', 'low', 'shipped'] as const;

export type ReadinessLevel = (typeof READINESS_LEVELS)[number];

export const VALUE_LEVELS = ['highest', 'high', 'medium', 'low'] as const;

export type ValueLevel = (typeof VALUE_LEVELS)[number];

export const COMPLEXITY_LEVELS = ['low', 'medium', 'high'] as const;

export type ComplexityLevel = (typeof COMPLEXITY_LEVELS)[number];

export const RISK_LEVELS = ['low', 'medium', 'high', 'critical'] as const;

export type RiskLevel = (typeof RISK_LEVELS)[number];

/** Kernel systems with Genesis runtime already shipped */
export const SHIPPED_SYSTEM_IDS = [
  'genesis',
  'canonical-object-registry',
  'universal-interaction-engine',
  'universal-decision-engine',
  'studio-os-dependency-map',
] as const;

/** Canonical critical path from STUDIO_OS_BUILD_ORDER.md §4 */
export const CRITICAL_PATH_SYSTEM_IDS = [
  'genesis',
  'canonical-object-registry',
  'universal-interaction-engine',
  'universal-decision-engine',
  'business-discovery',
  'company-genome',
  'organization-registry',
  'company-registry',
  'identity-engine',
  'authentication',
  'permissions-engine',
  'event-bus',
  'workflow-engine',
  'mission-engine',
  'command-center',
  'workspace-framework',
  'executive-headquarters',
] as const;
