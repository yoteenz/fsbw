/** Genesis Core Systems Blueprint™ — infrastructure constants */

export const CORE_SYSTEMS_SUBSYSTEM_VERSION = '1.0.0';
export const CORE_SYSTEMS_SUBSYSTEM_NAME = 'Core Systems Blueprint™';

/** Platform domain organization from Core Systems Blueprint™ */
export const CORE_SYSTEM_DOMAINS = [
  'executive-command',
  'knowledge-intelligence',
  'creation-experience',
  'education-career',
  'marketplace-economy',
  'operations-automation',
  'identity-trust',
  'discovery-insight',
] as const;

export type CoreSystemDomain = (typeof CORE_SYSTEM_DOMAINS)[number];

/** Dependency classes from blueprint §11.2 */
export const SYSTEM_DEPENDENCY_CLASSES = [
  'foundational',
  'supporting',
  'platform',
  'experience',
  'optional',
] as const;

export type SystemDependencyClass = (typeof SYSTEM_DEPENDENCY_CLASSES)[number];

export const SYSTEM_LIFECYCLE_STATES = [
  'draft',
  'proposed',
  'active',
  'deprecated',
  'archived',
  'suspended',
] as const;

export type SystemLifecycleState = (typeof SYSTEM_LIFECYCLE_STATES)[number];

export const DEPENDENCY_RELATION_TYPES = [
  'requires',
  'optional',
  'integrates_with',
  'observes',
  'routes_to',
  'contains',
] as const;

export type DependencyRelationType = (typeof DEPENDENCY_RELATION_TYPES)[number];

export const INTEGRATION_CONTRACT_STATUSES = [
  'draft',
  'active',
  'deprecated',
  'retired',
] as const;

export type IntegrationContractStatus = (typeof INTEGRATION_CONTRACT_STATUSES)[number];

export const EXPANSION_HOOK_TYPES = [
  'plugin',
  'adapter',
  'strategy',
  'observer',
  'middleware',
] as const;

export type ExpansionHookType = (typeof EXPANSION_HOOK_TYPES)[number];

/** Content home folders — organizational boundaries, not runtime seeds */
export const CORE_SYSTEM_CONTENT_HOMES = [
  'core-systems',
  'orb',
  'atlas',
  'headquarters',
  'knowledge',
  'foundry',
  'exchange',
  'professions',
  'career-worlds',
  'automation',
  'workflows',
  'identity',
  'experience',
  'analytics',
  'search',
  'notifications',
  'research',
] as const;

export type CoreSystemContentHome = (typeof CORE_SYSTEM_CONTENT_HOMES)[number];

/** Canonical system IDs — metadata for traceability; registries start empty */
export const CANONICAL_CORE_SYSTEM_IDS = [
  'orb',
  'executive-headquarters',
  'mission-control',
  'command-center',
  'atlas',
  'blueprint-engine',
  'institute-of-knowledge',
  'knowledge-core',
  'world-graph',
  'research-engine',
  'profession-brains',
  'professional-memory',
  'studio-foundry',
  'generation-engine',
  'experience-engine',
  'simulation-engine',
  'career-worlds',
  'studio-exchange',
  'marketplace-engine',
  'workflow-engine',
  'automation-engine',
  'notification-engine',
  'identity-engine',
  'permissions-engine',
  'search-engine',
  'analytics-engine',
] as const;

export type CanonicalCoreSystemId = (typeof CANONICAL_CORE_SYSTEM_IDS)[number];

export type CanonicalCoreSystemMeta = {
  systemId: CanonicalCoreSystemId;
  officialName: string;
  domain: CoreSystemDomain;
  dependencyClass: SystemDependencyClass;
  contentHome: CoreSystemContentHome;
};

export const CANONICAL_CORE_SYSTEMS: CanonicalCoreSystemMeta[] = [
  { systemId: 'orb', officialName: 'Orb™', domain: 'executive-command', dependencyClass: 'platform', contentHome: 'orb' },
  { systemId: 'executive-headquarters', officialName: 'Executive Headquarters™', domain: 'executive-command', dependencyClass: 'experience', contentHome: 'headquarters' },
  { systemId: 'mission-control', officialName: 'Mission Control™', domain: 'executive-command', dependencyClass: 'platform', contentHome: 'headquarters' },
  { systemId: 'command-center', officialName: 'Command Center™', domain: 'executive-command', dependencyClass: 'platform', contentHome: 'headquarters' },
  { systemId: 'atlas', officialName: 'Atlas™', domain: 'executive-command', dependencyClass: 'experience', contentHome: 'atlas' },
  { systemId: 'blueprint-engine', officialName: 'Blueprint Engine™', domain: 'executive-command', dependencyClass: 'platform', contentHome: 'core-systems' },
  { systemId: 'institute-of-knowledge', officialName: 'Institute of Knowledge™', domain: 'knowledge-intelligence', dependencyClass: 'platform', contentHome: 'knowledge' },
  { systemId: 'knowledge-core', officialName: 'Knowledge Core™', domain: 'knowledge-intelligence', dependencyClass: 'platform', contentHome: 'knowledge' },
  { systemId: 'world-graph', officialName: 'World Graph™', domain: 'knowledge-intelligence', dependencyClass: 'foundational', contentHome: 'knowledge' },
  { systemId: 'research-engine', officialName: 'Research Engine™', domain: 'knowledge-intelligence', dependencyClass: 'optional', contentHome: 'research' },
  { systemId: 'profession-brains', officialName: 'Profession Brains™', domain: 'knowledge-intelligence', dependencyClass: 'optional', contentHome: 'professions' },
  { systemId: 'professional-memory', officialName: 'Professional Memory™', domain: 'knowledge-intelligence', dependencyClass: 'optional', contentHome: 'professions' },
  { systemId: 'studio-foundry', officialName: 'Studio Foundry™', domain: 'creation-experience', dependencyClass: 'optional', contentHome: 'foundry' },
  { systemId: 'generation-engine', officialName: 'Generation Engine™', domain: 'creation-experience', dependencyClass: 'optional', contentHome: 'foundry' },
  { systemId: 'experience-engine', officialName: 'Experience Engine™', domain: 'creation-experience', dependencyClass: 'experience', contentHome: 'experience' },
  { systemId: 'simulation-engine', officialName: 'Simulation Engine™', domain: 'creation-experience', dependencyClass: 'optional', contentHome: 'experience' },
  { systemId: 'career-worlds', officialName: 'Career Worlds™', domain: 'education-career', dependencyClass: 'experience', contentHome: 'career-worlds' },
  { systemId: 'studio-exchange', officialName: 'Studio Exchange™', domain: 'marketplace-economy', dependencyClass: 'experience', contentHome: 'exchange' },
  { systemId: 'marketplace-engine', officialName: 'Marketplace Engine™', domain: 'marketplace-economy', dependencyClass: 'platform', contentHome: 'exchange' },
  { systemId: 'workflow-engine', officialName: 'Workflow Engine™', domain: 'operations-automation', dependencyClass: 'platform', contentHome: 'workflows' },
  { systemId: 'automation-engine', officialName: 'Automation Engine™', domain: 'operations-automation', dependencyClass: 'platform', contentHome: 'automation' },
  { systemId: 'notification-engine', officialName: 'Notification Engine™', domain: 'operations-automation', dependencyClass: 'supporting', contentHome: 'notifications' },
  { systemId: 'identity-engine', officialName: 'Identity Engine™', domain: 'identity-trust', dependencyClass: 'supporting', contentHome: 'identity' },
  { systemId: 'permissions-engine', officialName: 'Permissions Engine™', domain: 'identity-trust', dependencyClass: 'supporting', contentHome: 'identity' },
  { systemId: 'search-engine', officialName: 'Search Engine™', domain: 'discovery-insight', dependencyClass: 'supporting', contentHome: 'search' },
  { systemId: 'analytics-engine', officialName: 'Analytics Engine™', domain: 'discovery-insight', dependencyClass: 'supporting', contentHome: 'analytics' },
];
