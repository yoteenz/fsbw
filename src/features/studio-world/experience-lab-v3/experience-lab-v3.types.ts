/** Experience Lab V3 — isolated experimental OS shell. V2 must never import from here. */

export const EXPERIENCE_LAB_V3_ROUTE = '/admin/studio/experience-lab-v3' as const;
export const EXPERIENCE_LAB_V3_WORLD_BUILDER_ROUTE = '/admin/studio/world-builder' as const;

export type ExperienceLabV3ProgramId = 'studio-world' | 'industry-packs';

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

export type WorkbenchToolId =
  | 'architectural-tools'
  | 'materials'
  | 'lighting'
  | 'construction'
  | 'camera'
  | 'budget'
  | 'permit'
  | 'packaging'
  | 'pricing'
  | 'listings'
  | 'collectibles'
  | 'points'
  | 'unlockables'
  | 'workforce';

export type SpotlightResultKind =
  | 'department'
  | 'package'
  | 'variant'
  | 'asset'
  | 'prompt'
  | 'work-order'
  | 'blueprint'
  | 'history'
  | 'marketplace'
  | 'cds';

export type SpotlightResult = {
  id: string;
  kind: SpotlightResultKind;
  title: string;
  subtitle: string;
  href?: string;
};

export type ExperienceLabV3State = {
  workspace: WorkspaceContextState;
  activeWorkOrderId: string | null;
  activeWorkbenchTool: WorkbenchToolId | null;
  workOrders: WorkOrder[];
  activePackage: ExperienceLabV3Package | null;
  pipeline: PipelineStage[];
  operations: OperationsMetrics;
  spotlightOpen: boolean;
  assistantOpen: boolean;
  blueprintFullscreen: boolean;
  blueprintZoom: number;
  blueprintPan: { x: number; y: number };
};
