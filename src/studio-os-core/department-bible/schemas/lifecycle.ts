export const DEPARTMENT_LIFECYCLE_VERSION = 'department-lifecycle.v1' as const;

export const CANONICAL_LIFECYCLE_STATES = [
  'DRAFT',
  'BLUEPRINT_READY',
  'FOUNDER_RENDER',
  'APPROVED',
  'MANUFACTURING',
  'CONSTRUCTION',
  'INSPECTION',
  'PUBLISHED',
  'ARCHIVED',
  'DEPRECATED',
] as const;

export type CanonicalLifecycleState = (typeof CANONICAL_LIFECYCLE_STATES)[number];

export type DepartmentLifecycleModel = {
  lifecycleVersion: typeof DEPARTMENT_LIFECYCLE_VERSION;
  departmentId: string;
  states: CanonicalLifecycleState[];
  transitions: Array<{ from: CanonicalLifecycleState; to: CanonicalLifecycleState; requiresApproval?: string }>;
  terminalStates: CanonicalLifecycleState[];
};

export const DEFAULT_LIFECYCLE_TRANSITIONS: DepartmentLifecycleModel['transitions'] = [
  { from: 'DRAFT', to: 'BLUEPRINT_READY', requiresApproval: 'blueprint-author' },
  { from: 'BLUEPRINT_READY', to: 'FOUNDER_RENDER' },
  { from: 'FOUNDER_RENDER', to: 'APPROVED', requiresApproval: 'founder-preview' },
  { from: 'APPROVED', to: 'MANUFACTURING' },
  { from: 'MANUFACTURING', to: 'CONSTRUCTION' },
  { from: 'CONSTRUCTION', to: 'INSPECTION', requiresApproval: 'quality-guard' },
  { from: 'INSPECTION', to: 'PUBLISHED', requiresApproval: 'immune-system' },
  { from: 'PUBLISHED', to: 'ARCHIVED' },
  { from: 'PUBLISHED', to: 'DEPRECATED' },
];
