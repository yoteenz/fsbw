import type { AUTO_SYNC_SURFACES, REGISTRY_CATEGORIES } from './constants';

export type RegistryCategory = (typeof REGISTRY_CATEGORIES)[number];
export type AutoSyncSurface = (typeof AUTO_SYNC_SURFACES)[number];

export type RegistryFeatureStatus = 'live' | 'demo' | 'planned' | 'deprecated' | 'upcoming';

export type DocumentationRegistryEntry = {
  /** Official Name */
  officialName: string;
  /** Internal ID */
  internalId: string;
  category: RegistryCategory;
  description: string;
  purpose: string;
  capabilities: string[];
  dependencies: string[];
  relatedSystems: string[];
  status: RegistryFeatureStatus;
  owner: string;
  version: string;
  releaseDate: string;
  lastUpdated: string;
  associatedDepartments: string[];
  associatedConcierges: string[];
  associatedWorkflows: string[];
  supportedOrganizations: string[];
  requiredPermissions: string[];
  featureFlags: string[];
  keywords: string[];
  aliases: string[];
  searchSynonyms: string[];
  documentationLinks: string[];
  academyLessons: string[];
  tutorialReferences: string[];
  walkthroughReferences: string[];
  tooltips: string[];
  faqReferences: string[];
  commandDockReferences: string[];
  developerDocumentation: string[];
  architectureDocumentation: string[];
  releaseNotes: string[];
  exampleWorkflows: string[];
  relatedScreens: string[];
  relatedComponents: string[];
  futureMilestones: string[];
  /** Runtime routing */
  moduleId?: string;
  route?: string;
  milestone?: string;
  docPath: string;
};

export type RegistryVersionSnapshot = {
  version: string;
  releaseDate: string;
  summary: string;
  architectureChanges: string[];
  deprecated: boolean;
};

export type DocumentationHealthMetric = {
  id: string;
  label: string;
  scorePct: number;
  detail: string;
  status: 'healthy' | 'warning' | 'critical';
};

export type AutoSyncSurfaceStatus = {
  surface: AutoSyncSurface;
  label: string;
  synced: boolean;
  entryCount: number;
  lastSyncedAt: string;
};

export type OrganizationDocumentationRegistryProfile = {
  organizationId: string;
  companyName: string;
  updatedAt: string;
  registryScore: number;
  totalEntries: number;
  healthMetrics: DocumentationHealthMetric[];
  autoSyncSurfaces: AutoSyncSurfaceStatus[];
  registryEntries: DocumentationRegistryEntry[];
  walkthroughSteps: number;
  academyLessonsGenerated: number;
  dockRegistryLine: string;
  oneSourceManyConsumers: true;
  syncedSources: string[];
};

export type DocumentationRegistryStore = {
  version: string;
  profiles: OrganizationDocumentationRegistryProfile[];
};

export type DocumentationRegistryDockAdvice = {
  response: string;
  concierge: string;
  registryScore?: number;
};

export type RegistrySearchHit = {
  entry: DocumentationRegistryEntry;
  score: number;
  matchReason: string;
};
