import type { WorkHierarchyLevel } from './types';

export const WORK_ORCHESTRATION_STORAGE_KEY = 'studioOsWorkOrchestration_v1';
export const WORK_ORCHESTRATION_VERSION = '1.0.0';
export const WORK_ORCHESTRATION_ID = 'work-orchestration';

export const WORK_PLATFORM_CHAIN = [
  { level: 'studio-os', label: 'STUDIO OS', description: 'Founders lead outcomes · organization orchestrates work' },
  { level: 'work-orchestration', label: 'WORK ORCHESTRATION', description: 'Tasks are implementation details · work generated intelligently' },
  { level: 'execution', label: 'ACTIVITIES · COMPLETION', description: 'Smallest executable units · rarely founder-facing' },
] as const;

export const WORK_HIERARCHY_CHAIN: { level: WorkHierarchyLevel; label: string; description: string }[] = [
  { level: 'organizational-objective', label: 'ORGANIZATIONAL OBJECTIVE', description: 'What the company is trying to achieve' },
  { level: 'initiative', label: 'INITIATIVE', description: 'Major program from strategy' },
  { level: 'campaign', label: 'CAMPAIGN', description: 'Coordinated execution unit' },
  { level: 'work-package', label: 'WORK PACKAGE', description: 'Grouped related work · not 42 individual tasks' },
  { level: 'deliverables', label: 'DELIVERABLES', description: 'Pages · videos · emails · assets' },
  { level: 'activities', label: 'ACTIVITIES', description: 'Smallest executable unit · automation or human' },
  { level: 'dependencies', label: 'DEPENDENCIES', description: 'Automatic sequencing · blockers identified immediately' },
  { level: 'completion', label: 'COMPLETION', description: 'Institutional knowledge · playbook updates' },
];

export const WORK_CONNECTED_SYSTEMS = [
  'Chief of Staff',
  'Strategy Engine',
  'Campaign Engine',
  'Newsroom',
  'Studio Intelligence',
  'Simulation Engine',
  'Knowledge Graph',
  'Operational DNA',
  'Executive Organization',
] as const;

export const COS_ORCHESTRATION_RESPONSIBILITIES = [
  'Prioritize work by strategic impact',
  'Assign departments automatically',
  'Balance workloads across teams',
  'Resolve bottlenecks before escalation',
  'Resequence activities when dependencies shift',
  'Identify blockers immediately',
  'Protect founder attention · escalate strategic exceptions only',
] as const;

export const DNA_ACTIVITY_LAYERS = [
  'Company DNA',
  'Creative DNA',
  'Writing DNA',
  'Leadership DNA',
  'Operational DNA',
] as const;
