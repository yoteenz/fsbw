import type {
  ASSET_CATEGORIES,
  ASSET_HEALTH_CHECKS,
  ASSET_METADATA_FIELDS,
  ASSET_REGISTRY_PHILOSOPHY,
  VERSIONING_CAPABILITIES,
} from './constants';

export type AssetCategory = (typeof ASSET_CATEGORIES)[number];
export type AssetMetadataField = (typeof ASSET_METADATA_FIELDS)[number];
export type VersioningCapability = (typeof VERSIONING_CAPABILITIES)[number];
export type AssetHealthCheckId = (typeof ASSET_HEALTH_CHECKS)[number];
export type AssetPhilosophyLine = (typeof ASSET_REGISTRY_PHILOSOPHY)[number];

export type AssetCategoryEntry = {
  category: AssetCategory;
  label: string;
  description: string;
  searchable: true;
  registeredCount: number;
};

export type RegisteredAssetEntry = {
  assetId: string;
  name: string;
  category: AssetCategory;
  owner: string;
  department: string;
  version: string;
  tags: string[];
  description: string;
  relatedSystems: string[];
  lastModified: string;
  usageCount: number;
  status: 'active' | 'archived' | 'unused';
};

export type AssetMetadataSchema = {
  field: AssetMetadataField;
  label: string;
  required: boolean;
  tracked: true;
};

export type AssetVersionRecord = {
  versionId: string;
  assetId: string;
  version: string;
  isCurrent: boolean;
  approvedBy?: string;
  changeSummary: string;
  archivedAt?: string;
};

export type AssetHealthMetric = {
  checkId: AssetHealthCheckId;
  label: string;
  scorePct: number;
  issueCount: number;
  detail: string;
  status: 'healthy' | 'warning' | 'critical';
};

export type AssetGovernanceFinding = {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  message: string;
  recommendation: string;
};

export type AssetImprovementRecommendation = {
  id: string;
  title: string;
  detail: string;
  priority: 'high' | 'medium' | 'low';
};

export type OrganizationAssetRegistryProfile = {
  organizationId: string;
  companyName: string;
  updatedAt: string;
  registryScore: number;
  catalogCoveragePct: number;
  versioningIntegrityPct: number;
  healthScorePct: number;
  categories: AssetCategoryEntry[];
  registeredAssets: RegisteredAssetEntry[];
  metadataSchema: AssetMetadataSchema[];
  versionRecords: AssetVersionRecord[];
  healthMetrics: AssetHealthMetric[];
  governanceFindings: AssetGovernanceFinding[];
  recommendations: AssetImprovementRecommendation[];
  totalAssetCount: number;
  unusedAssetCount: number;
  duplicateCount: number;
  dockRegistryLine: string;
  managedPlatformResource: true;
  lastSyncedAt: string;
};

export type AssetRegistryStore = {
  version: string;
  profiles: OrganizationAssetRegistryProfile[];
};

export type AssetRegistryDockAdvice = {
  response: string;
  concierge: string;
  registryScore?: number;
};

export type AssetSearchHit = {
  type: 'category' | 'asset' | 'version' | 'health';
  id: string;
  label: string;
  score: number;
  matchReason: string;
};
