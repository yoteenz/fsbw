import type { COMPONENT_CATEGORIES, COMPONENT_REGISTRY_PHILOSOPHY } from './constants';

export type ComponentCategory = (typeof COMPONENT_CATEGORIES)[number];
export type ComponentPhilosophyLine = (typeof COMPONENT_REGISTRY_PHILOSOPHY)[number];

export type ComponentRegistryEntry = {
  componentId: string;
  officialName: string;
  description: string;
  category: ComponentCategory;
  variants: string[];
  dependencies: string[];
  usageSurfaces: string[];
  version: string;
  owner: string;
  accessibility: string[];
  responsiveRules: string[];
  designTokens: string[];
  animationRules: string[];
  interactionRules: string[];
  documentation: string[];
  componentPath: string;
  status: 'live' | 'demo' | 'deprecated';
  milestone?: string;
  reuseScore: number;
};

export type ComponentDiscoveryHit = {
  entry: ComponentRegistryEntry;
  score: number;
  matchReason: string;
};

export type ComponentRegistryHealthMetric = {
  id: string;
  label: string;
  scorePct: number;
  detail: string;
  status: 'healthy' | 'warning' | 'critical';
};

export type OrganizationComponentRegistryProfile = {
  organizationId: string;
  companyName: string;
  updatedAt: string;
  registryScore: number;
  totalComponents: number;
  categoryCounts: Record<string, number>;
  components: ComponentRegistryEntry[];
  healthMetrics: ComponentRegistryHealthMetric[];
  totalReuseScore: number;
  dockRegistryLine: string;
  lastIndexedAt: string;
};

export type ComponentRegistryStore = {
  version: string;
  profiles: OrganizationComponentRegistryProfile[];
};

export type ComponentRegistryDockAdvice = {
  response: string;
  concierge: string;
  registryScore?: number;
};
