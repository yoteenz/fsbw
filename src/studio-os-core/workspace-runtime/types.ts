import type {
  RUNTIME_COMPONENTS,
  RUNTIME_CONFIG_CATEGORIES,
  SANDBOX_ENVIRONMENTS,
  WORKSPACE_RUNTIME_PHILOSOPHY,
} from './constants';

export type RuntimeComponentId = (typeof RUNTIME_COMPONENTS)[number];
export type SandboxEnvironment = (typeof SANDBOX_ENVIRONMENTS)[number];
export type RuntimeConfigCategory = (typeof RUNTIME_CONFIG_CATEGORIES)[number];
export type RuntimePhilosophyLine = (typeof WORKSPACE_RUNTIME_PHILOSOPHY)[number];

export type RuntimeComponentEntry = {
  componentId: RuntimeComponentId;
  name: string;
  description: string;
  isolated: true;
  status: 'active' | 'standby' | 'updating';
  version: string;
};

export type RuntimeConfigurationEntry = {
  configId: string;
  category: RuntimeConfigCategory;
  label: string;
  value: string;
  scoped: true;
  affectsOtherOrganizations: false;
};

export type SandboxEnvironmentStatus = {
  environment: SandboxEnvironment;
  label: string;
  status: 'healthy' | 'ready' | 'degraded' | 'offline';
  description: string;
  lastDeployedAt?: string;
  safeForTesting: boolean;
};

export type RuntimeHealthMetric = {
  metricId: string;
  label: string;
  scorePct: number;
  detail: string;
  status: 'healthy' | 'warning' | 'critical';
  trend: 'stable' | 'up' | 'down';
};

export type RuntimeIsolationFinding = {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  message: string;
  recommendation: string;
};

export type RuntimeImprovementRecommendation = {
  id: string;
  title: string;
  detail: string;
  priority: 'high' | 'medium' | 'low';
};

export type OrganizationWorkspaceRuntimeProfile = {
  organizationId: string;
  companyName: string;
  updatedAt: string;
  runtimeScore: number;
  isolationScorePct: number;
  components: RuntimeComponentEntry[];
  configuration: RuntimeConfigurationEntry[];
  sandboxes: SandboxEnvironmentStatus[];
  healthMetrics: RuntimeHealthMetric[];
  healthDashboardScore: number;
  isolationFindings: RuntimeIsolationFinding[];
  recommendations: RuntimeImprovementRecommendation[];
  activeSandbox: SandboxEnvironment;
  modulesRequiringUpdate: number;
  dockRuntimeLine: string;
  independentHeadquarters: true;
  lastSyncedAt: string;
};

export type WorkspaceRuntimeStore = {
  version: string;
  profiles: OrganizationWorkspaceRuntimeProfile[];
};

export type WorkspaceRuntimeDockAdvice = {
  response: string;
  concierge: string;
  runtimeScore?: number;
};

export type RuntimeSearchHit = {
  type: 'component' | 'config' | 'sandbox';
  id: string;
  label: string;
  score: number;
  matchReason: string;
};
