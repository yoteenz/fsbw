/** Experience Lab V3 — Five-Workspace OS. V2 must never import from here. */

export const EXPERIENCE_LAB_V3_ROUTE = '/admin/studio/experience-lab-v3' as const;
export const EXPERIENCE_LAB_V3_WORLD_BUILDER_ROUTE = '/admin/studio/world-builder' as const;
export const EXPERIENCE_LAB_V3_WORLD_V3_ROUTE = '/admin/studio/world-v3' as const;

/** Five core swipeable workspaces inside the persistent viewport. */
export const V3_CORE_WORKSPACE_IDS = [
  'environment',
  'production',
  'review',
  'assets',
  'intelligence',
] as const;

export type V3CoreWorkspaceId = (typeof V3_CORE_WORKSPACE_IDS)[number];

export type ExperienceLabV3ProgramId = 'studio-world' | 'industry-packs';

export type V3DesignVariantId =
  | 'light-01'
  | 'light-02'
  | 'light-03'
  | 'dark-01'
  | 'dark-02'
  | 'dark-03';

export type V3DesignVariantTheme = 'light' | 'dark';

export type V3DesignVariantRecord = {
  id: V3DesignVariantId;
  name: string;
  theme: V3DesignVariantTheme;
  environmentPackageId: string;
  previewEnvironmentUrl: string;
  thumbnailUrl: string;
  revision: number;
  cardStatus: 'active' | 'generating' | 'approved' | 'canonical';
};

export type WorkOrderStatus =
  | 'queued'
  | 'preparing'
  | 'generating'
  | 'waiting'
  | 'blocked'
  | 'validation'
  | 'consistency-check'
  | 'founder-review'
  | 'approval-needed'
  | 'asset-manufacturing'
  | 'cds-ready'
  | 'marketplace-ready'
  | 'published'
  | 'completed'
  | 'failed';

export type WorkOrderKind =
  | 'generate-reception'
  | 'generate-mobile'
  | 'generate-tablet'
  | 'generate-hero'
  | 'generate-materials'
  | 'generate-lighting'
  | 'generate-construction'
  | 'generate-blueprint'
  | 'generate-marketplace-assets'
  | 'generate-package'
  | 'generate-thumbnail'
  | 'generate-desktop';

export type WorkOrderPriority = 'low' | 'normal' | 'high' | 'critical';

export type WorkOrder = {
  id: string;
  kind: WorkOrderKind;
  title: string;
  status: WorkOrderStatus;
  progress: number;
  etaMs: number | null;
  priority: WorkOrderPriority;
  costUsd: number;
  owner: string;
  provider: string;
  revision: number;
  packageId: string;
  environmentId: string;
  departmentId: string;
  variantId: string;
  dependencies: string[];
  queueColumn: 'generating' | 'waiting' | 'blocked' | 'review' | 'completed';
  createdAt: string;
  updatedAt: string;
};

export type PackageOutputSlot = {
  id: string;
  label: string;
  status: WorkOrderStatus;
  progress: number;
  timestamp: string | null;
  provider: string;
  credits: number;
  cached: boolean;
  derivedFrom: 'desktop' | null;
};

export type ExperienceLabV3Package = {
  packageId: string;
  environmentId: string;
  departmentId: string;
  variantId: string;
  variantLabel: string;
  revision: number;
  lifecycleStatus: string;
  outputs: PackageOutputSlot[];
};

export type PipelineStage = {
  id: string;
  label: string;
  status: 'idle' | 'active' | 'complete' | 'blocked';
  workOrderCount: number;
};

export type OperationsMetrics = {
  todaySpendUsd: number;
  gpuUsagePercent: number;
  generationQueueCount: number;
  creditsRemaining: number;
  pendingReviews: number;
  assetManufacturingCount: number;
  marketplaceJobs: number;
  cdsQueueCount: number;
  failedJobs: number;
  systemHealthPercent: number;
  founderNotifications: number;
};

export type WorkspaceContextState = {
  programId: ExperienceLabV3ProgramId;
  departmentId: string;
  departmentLabel: string;
  environmentId: string;
  environmentLabel: string;
  variantId: string;
  variantLabel: string;
  revision: number;
  companionDevice: 'desktop' | 'mobile' | 'tablet' | null;
  lifecycleStatus: string;
};

/** Context-aware workbench tool ids — swap set per active workspace. */
export type V3WorkbenchToolId =
  | 'blueprint'
  | 'lighting'
  | 'materials'
  | 'construction'
  | 'camera'
  | 'compare'
  | 'split-view'
  | 'pause'
  | 'retry'
  | 'dependencies'
  | 'outputs'
  | 'logs'
  | 'priority'
  | 'assign'
  | 'approve'
  | 'reject'
  | 'comment'
  | 'promote'
  | 'request-revision'
  | 'history'
  | 'publish'
  | 'save'
  | 'duplicate'
  | 'archive'
  | 'export'
  | 'marketplace'
  | 'metadata'
  | 'budget'
  | 'forecast'
  | 'providers'
  | 'diagnostics'
  | 'reports'
  | 'performance'
  | 'queue-health';

/** Single interchangeable inspector — morphs on workbench tool selection. */
export type V3InspectorModeId =
  | 'lighting'
  | 'materials'
  | 'camera'
  | 'construction'
  | 'work-order'
  | 'dependencies'
  | 'queue-health'
  | 'design-brief'
  | 'revision-timeline'
  | 'review-compare'
  | 'package-detail'
  | 'material-library'
  | 'budget-forecast'
  | 'provider-health'
  | 'queue-analytics'
  | 'blueprint-detail';

export type ReviewItem = {
  id: string;
  title: string;
  status: 'pending' | 'approved' | 'rejected' | 'revision-requested';
  revision: number;
  submittedAt: string;
};

export type AssetLibraryItem = {
  id: string;
  label: string;
  kind: 'blueprint' | 'material' | 'package' | 'preset' | 'reference' | 'marketplace' | 'icon';
  updatedAt: string;
};

export type ExperienceLabV3State = {
  activeWorkspace: V3CoreWorkspaceId;
  workspace: WorkspaceContextState;
  designVariants: V3DesignVariantRecord[];
  designVariantsCollapsed: boolean;
  activeWorkbenchTool: V3WorkbenchToolId | null;
  activeInspectorMode: V3InspectorModeId | null;
  activeWorkOrderId: string | null;
  activeReviewId: string | null;
  workOrders: WorkOrder[];
  activePackage: ExperienceLabV3Package | null;
  pipeline: PipelineStage[];
  operations: OperationsMetrics;
  reviewItems: ReviewItem[];
  assetLibrary: AssetLibraryItem[];
  spotlightOpen: boolean;
  assistantOpen: boolean;
  blueprintFullscreen: boolean;
  blueprintZoom: number;
  blueprintPan: { x: number; y: number };
};
