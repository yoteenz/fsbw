/** Newsroom & Production Orchestration V1.0 — AI Media operational layer (Milestone 40). */

import type { NdxbookPlatformId, NdxbookVolumeId } from '../types';

export type NewsroomPipelineStageId =
  | 'idea'
  | 'research'
  | 'fact-verification'
  | 'script'
  | 'storyboard'
  | 'creative-review'
  | 'host-assignment'
  | 'voice-generation'
  | 'animation'
  | 'thumbnail'
  | 'captions'
  | 'quality-assurance'
  | 'executive-review'
  | 'scheduled'
  | 'published'
  | 'analytics'
  | 'institutional-knowledge';

export type NewsroomDepartmentId =
  | 'research'
  | 'writing'
  | 'creative'
  | 'voice'
  | 'animation'
  | 'publishing'
  | 'analytics'
  | 'experiments'
  | 'intelligence'
  | 'legal'
  | 'brand'
  | 'operations';

export type PagePriority = 'critical' | 'high' | 'normal' | 'low';
export type PageHealth = 'on-track' | 'at-risk' | 'blocked' | 'complete';

export type QualityGateLayer =
  | 'company-dna'
  | 'creative-dna'
  | 'writing-dna'
  | 'leadership-dna'
  | 'brand-guidelines'
  | 'legal'
  | 'chief-of-staff';

export type ProductionPage = {
  id: string;
  pageNumber: number;
  pageLabel: string;
  title: string;
  volumeId: NdxbookVolumeId;
  chapter: string;
  stageId: NewsroomPipelineStageId;
  assignedExecutive: string;
  assignedHost?: string;
  priority: PagePriority;
  confidencePct: number;
  health: PageHealth;
  estimatedCompletionMins: number;
  updatedAt: string;
  /** Embedded page workspace summary */
  researchNotes: string[];
  knowledgeSources: string[];
  scriptExcerpt: string;
  storyboardStatus: string;
  voiceStatus: string;
  animationStatus: string;
  thumbnailStatus: string;
  captionStatus: string;
  hashtags: string[];
  platformVersions: NdxbookPlatformId[];
  approvalHistory: string[];
  experiments: string[];
  analyticsSnapshot: string;
  comments: string[];
  revisionHistory: string[];
  knowledgeGraphNodeIds: string[];
  memoryReferences: string[];
  institutionalLearnings: string[];
};

export type PipelineStageColumn = {
  id: NewsroomPipelineStageId;
  label: string;
  pageIds: string[];
  assignedExecutive: string;
  estimatedCompletionMins: number;
  healthPct: number;
};

export type DepartmentLane = {
  id: NewsroomDepartmentId;
  label: string;
  capacityPct: number;
  currentWorkload: number;
  estimatedCompletionMins: number;
  healthPct: number;
  activePages: string[];
  executiveLead: string;
};

export type EditorialCalendarEntry = {
  id: string;
  title: string;
  pageLabel: string;
  scheduledAt: string;
  view: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'campaign' | 'seasonal' | 'launch' | 'initiative';
  volumeId: NdxbookVolumeId;
  platforms: NdxbookPlatformId[];
  status: 'planned' | 'in-production' | 'ready' | 'published';
};

export type ActivityWallEvent = {
  id: string;
  timestamp: string;
  message: string;
  executive: string;
  confidencePct: number;
  pageLabel?: string;
  category: 'creation' | 'research' | 'approval' | 'experiment' | 'voice' | 'publish' | 'analytics' | 'learning';
};

export type ProductionIntelligenceSignal = {
  id: string;
  signal: string;
  recommendation: string;
  severity: 'info' | 'warning' | 'critical';
  confidencePct: number;
  department?: NewsroomDepartmentId;
};

export type OrchestrationAction = {
  id: string;
  action: string;
  target: string;
  rationale: string;
  status: 'pending' | 'applied' | 'escalated';
  chiefOfStaffInitiated: boolean;
};

export type TalentRoutingRecommendation = {
  pageId: string;
  pageLabel: string;
  recommendedHost: string;
  rationale: string;
  confidencePct: number;
  factors: string[];
};

export type PageExperiment = {
  id: string;
  pageId: string;
  type: 'thumbnail' | 'hook' | 'caption' | 'voice' | 'host' | 'publish-time' | 'platform';
  name: string;
  status: 'active' | 'completed' | 'scheduled';
  winner?: string;
  confidencePct: number;
};

export type AssetLineageEntry = {
  id: string;
  pageId: string;
  assetType: 'script' | 'thumbnail' | 'animation' | 'voiceover' | 'caption' | 'graphic';
  version: number;
  label: string;
  revisedAt: string;
  revisedBy: string;
  changeNote: string;
};

export type OperationalDnaSection = {
  id: string;
  title: string;
  principles: string[];
};

export type KnowledgeProductionOutput = {
  pageId: string;
  pageLabel: string;
  institutionalKnowledge: string;
  graphNodesCreated: string[];
  templatesGenerated: string[];
  improvements: string[];
};

export type NewsroomDashboard = {
  summary: string;
  pagesInProduction: number;
  pagesPublishingToday: number;
  bottlenecks: number;
  overallHealthPct: number;
  cosOrchestrationStatus: string;
};

export type NewsroomStore = {
  version: string;
  lastUpdatedAt: string;
  workspaceId: string;
  dashboard: NewsroomDashboard;
  pipelineStages: PipelineStageColumn[];
  pages: ProductionPage[];
  departments: DepartmentLane[];
  editorialCalendar: EditorialCalendarEntry[];
  activityWall: ActivityWallEvent[];
  productionIntelligence: ProductionIntelligenceSignal[];
  orchestrationQueue: OrchestrationAction[];
  talentRouting: TalentRoutingRecommendation[];
  experiments: PageExperiment[];
  assetLineage: AssetLineageEntry[];
  operationalDna: OperationalDnaSection[];
  knowledgeOutputs: KnowledgeProductionOutput[];
  qualityGateLayers: QualityGateLayer[];
  selectedPageId: string | null;
};
