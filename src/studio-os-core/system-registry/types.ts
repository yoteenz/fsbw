import type {
  SYSTEM_DISCOVERY_SURFACES,
  SYSTEM_LIFECYCLE_STATUSES,
  SYSTEM_REGISTRY_CATEGORIES,
} from './constants';

export type SystemRegistryCategory = (typeof SYSTEM_REGISTRY_CATEGORIES)[number];
export type SystemDiscoverySurface = (typeof SYSTEM_DISCOVERY_SURFACES)[number];
export type SystemLifecycleStatus = (typeof SYSTEM_LIFECYCLE_STATUSES)[number];

export type SystemRegistryEntry = {
  uniqueId: string;
  officialName: string;
  description: string;
  category: SystemRegistryCategory;
  owner: string;
  dependencies: string[];
  status: SystemLifecycleStatus;
  version: string;
  createdDate: string;
  updatedDate: string;
  permissions: string[];
  organizations: string[];
  relatedSystems: string[];
  documentation: string[];
  health: number;
  lifecycle: SystemLifecycleStatus;
  /** Discovery helpers */
  keywords: string[];
  aliases: string[];
  route?: string;
  moduleId?: string;
  milestone?: string;
  componentPath?: string;
};

export type SystemDiscoveryHit = {
  entry: SystemRegistryEntry;
  score: number;
  matchReason: string;
};

export type SystemDependencyNode = {
  uniqueId: string;
  officialName: string;
  category: SystemRegistryCategory;
  dependents: string[];
  dependencies: string[];
};

export type SystemRegistryHealthMetric = {
  id: string;
  label: string;
  scorePct: number;
  detail: string;
  status: 'healthy' | 'warning' | 'critical';
};

export type OrganizationSystemRegistryProfile = {
  organizationId: string;
  companyName: string;
  updatedAt: string;
  registryScore: number;
  totalSystems: number;
  categoryCounts: Record<string, number>;
  systems: SystemRegistryEntry[];
  dependencyNodes: SystemDependencyNode[];
  healthMetrics: SystemRegistryHealthMetric[];
  discoverySurfaces: Array<{ surface: SystemDiscoverySurface; synced: boolean; systemCount: number }>;
  dockRegistryLine: string;
  lastIndexedAt: string;
};

export type SystemRegistryStore = {
  version: string;
  profiles: OrganizationSystemRegistryProfile[];
};

export type SystemRegistryDockAdvice = {
  response: string;
  concierge: string;
  registryScore?: number;
};
