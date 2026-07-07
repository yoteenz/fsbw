import type { AUTO_SYNC_SURFACES, IMPLEMENTATION_STATUS_LABELS, REGISTRY_CATEGORIES } from './constants';
import type { ImplementationStatus, RegistryKind } from '../manifest-reconciliation/types';

export type RegistryCategory = (typeof REGISTRY_CATEGORIES)[number];
export type AutoSyncSurface = (typeof AUTO_SYNC_SURFACES)[number];
export type KnowledgeImplementationStatus = ImplementationStatus;
export type KnowledgeRegistryKind = RegistryKind;

/** @deprecated use complete/planned via implementationStatus */
export type RegistryFeatureStatus = 'live' | 'demo' | 'in-progress' | 'planned' | 'deprecated' | 'upcoming';

export type KnowledgeRegistryEntry = {
  officialName: string;
  internalId: string;
  category: RegistryCategory;
  description: string;
  purpose: string;
  capabilities: string[];
  dependencies: string[];
  relatedSystems: string[];
  /** User-facing legacy status */
  status: RegistryFeatureStatus;
  /** Master Spec implementation status */
  implementationStatus: KnowledgeImplementationStatus;
  implementationStatusLabel: (typeof IMPLEMENTATION_STATUS_LABELS)[KnowledgeImplementationStatus];
  registryKind: KnowledgeRegistryKind;
  volumeId?: string;
  canonicalMilestone?: string;
  shippedMilestone?: string | null;
  dependsOn: string[];
  enables: string[];
  mergeTargets?: string[];
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
  moduleId?: string;
  route?: string;
  /** Shipped badge for user-facing surfaces */
  milestone?: string;
  docPath: string;
  completionPct?: number;
  implementationNotes?: string;
  chapterId?: string;
  searchableInGlobalSearch: true;
};

/** @deprecated alias */
export type DocumentationRegistryEntry = KnowledgeRegistryEntry;

export type VolumeRegistrySummary = {
  volumeId: string;
  title: string;
  status: KnowledgeImplementationStatus;
  completionPct: number;
  milestoneCount: number;
  completeCount: number;
  chapterCount: number;
  dependsOn: string[];
};

export type ChapterRegistrySummary = {
  chapterId: string;
  volumeId: string;
  number: number;
  title: string;
  status: KnowledgeImplementationStatus;
  completionPct: number;
  milestoneCount: number;
  completeCount: number;
  dependsOn: string[];
};

export type RegistryVersionSnapshot = {
  version: string;
  releaseDate: string;
  summary: string;
  architectureChanges: string[];
  deprecated: boolean;
};

export type KnowledgeHealthMetric = {
  id: string;
  label: string;
  scorePct: number;
  detail: string;
  status: 'healthy' | 'warning' | 'critical';
};

/** @deprecated alias */
export type DocumentationHealthMetric = KnowledgeHealthMetric;

export type AutoSyncSurfaceStatus = {
  surface: AutoSyncSurface;
  label: string;
  synced: boolean;
  entryCount: number;
  lastSyncedAt: string;
};

export type OrganizationKnowledgeRegistryProfile = {
  organizationId: string;
  companyName: string;
  updatedAt: string;
  registryScore: number;
  totalEntries: number;
  masterSpecCoveragePct: number;
  volumeSummaries: VolumeRegistrySummary[];
  chapterSummaries: ChapterRegistrySummary[];
  healthMetrics: KnowledgeHealthMetric[];
  autoSyncSurfaces: AutoSyncSurfaceStatus[];
  registryEntries: KnowledgeRegistryEntry[];
  walkthroughSteps: number;
  academyLessonsGenerated: number;
  dockRegistryLine: string;
  singleSourceOfTruth: true;
  syncedSources: string[];
  manifestCompiledAt: string;
};

/** @deprecated alias */
export type OrganizationDocumentationRegistryProfile = OrganizationKnowledgeRegistryProfile;

export type KnowledgeRegistryStore = {
  version: string;
  profiles: OrganizationKnowledgeRegistryProfile[];
};

/** @deprecated alias */
export type DocumentationRegistryStore = KnowledgeRegistryStore;

export type KnowledgeRegistryDockAdvice = {
  response: string;
  concierge: string;
  registryScore?: number;
};

/** @deprecated alias */
export type DocumentationRegistryDockAdvice = KnowledgeRegistryDockAdvice;

export type RegistrySearchHit = {
  entry: KnowledgeRegistryEntry;
  score: number;
  matchReason: string;
  statusLabel: string;
};
