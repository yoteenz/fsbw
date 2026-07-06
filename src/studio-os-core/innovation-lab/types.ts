import type {
  COLLABORATIVE_DEPARTMENTS,
  IDEA_CATEGORIES,
  INNOVATION_SOURCES,
  PIPELINE_STAGES,
} from './constants';

export type InnovationSourceId = (typeof INNOVATION_SOURCES)[number];
export type IdeaCategory = (typeof IDEA_CATEGORIES)[number];
export type PipelineStage = (typeof PIPELINE_STAGES)[number];
export type CollaborativeDepartment = (typeof COLLABORATIVE_DEPARTMENTS)[number];

export type InnovationSourceContribution = {
  sourceId: InnovationSourceId;
  label: string;
  active: boolean;
  contributionCount: number;
  latestInsight: string;
};

export type IdeaWorkbench = {
  executiveSummary: string;
  problemBeingSolved: string;
  opportunityAnalysis: string;
  potentialCustomers: string;
  revenuePotential: string;
  difficulty: 'low' | 'medium' | 'high';
  risk: 'low' | 'medium' | 'high';
  requiredDepartments: string[];
  prototypeStatus: string;
  research: string;
  executiveCouncilFeedback: string;
  founderNotes: string;
  supportingFiles: string[];
  innovationTimeline: string[];
};

export type CollaborativeReview = {
  department: CollaborativeDepartment;
  label: string;
  evaluation: string;
  scorePct: number;
  recommendation: string;
};

export type InnovationIdea = {
  id: string;
  title: string;
  category: IdeaCategory;
  categoryLabel: string;
  sourceId: InnovationSourceId;
  sourceLabel: string;
  stage: PipelineStage;
  stageLabel: string;
  confidencePct: number;
  revenuePotentialScore: number;
  workbench: IdeaWorkbench;
  collaborativeReviews: CollaborativeReview[];
  chiefConciergeRecommendation: string;
  searchable: true;
  archived: boolean;
};

export type InnovationPipelineSummary = {
  stage: PipelineStage;
  label: string;
  count: number;
  ideaIds: string[];
};

export type OrganizationInnovationLabProfile = {
  organizationId: string;
  companyName: string;
  industryId: string;
  updatedAt: string;
  innovationCapabilityScore: number;
  activeSources: number;
  ideasGenerated: number;
  ideasInPipeline: number;
  revenueOpportunitiesDiscovered: number;
  sourceContributions: InnovationSourceContribution[];
  ideas: InnovationIdea[];
  pipelineSummary: InnovationPipelineSummary[];
  dockInnovationLine: string;
  permanentInnovationCapability: true;
  syncedSources: string[];
};

export type InnovationLabStore = {
  version: string;
  profiles: OrganizationInnovationLabProfile[];
};

export type InnovationLabDockAdvice = {
  response: string;
  concierge: string;
  innovationCapabilityScore?: number;
  ideasGenerated?: number;
};
