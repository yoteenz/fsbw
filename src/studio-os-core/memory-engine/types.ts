import type {
  MEMORY_OUTCOMES,
  MEMORY_RECORD_TYPES,
  PROJECT_ARTIFACT_SECTIONS,
  RECALL_RECOMMENDATIONS,
} from './constants';

export type MemoryRecordType = (typeof MEMORY_RECORD_TYPES)[number];
export type MemoryOutcome = (typeof MEMORY_OUTCOMES)[number];
export type RecallRecommendation = (typeof RECALL_RECOMMENDATIONS)[number];
export type ProjectArtifactSection = (typeof PROJECT_ARTIFACT_SECTIONS)[number];

export type MemoryRecord = {
  id: string;
  type: MemoryRecordType;
  title: string;
  summary: string;
  outcome: MemoryOutcome;
  occurredAt: string;
  tags: string[];
  brainId?: string;
  sourceModule?: string;
  metrics?: { label: string; value: string }[];
  wouldRepeat?: boolean;
};

export type ProjectCompletionArtifact = {
  projectId: string;
  projectTitle: string;
  completedAt: string;
  outcome: MemoryOutcome;
  lessonsLearned: string[];
  bestPractices: string[];
  mistakesToAvoid: string[];
  recommendations: string[];
  futureImprovements: string[];
};

export type MemoryRecallResult = {
  query: string;
  hasPriorExperience: boolean;
  matchCount: number;
  whatHappened: string;
  recommendation: RecallRecommendation;
  recommendationReason: string;
  relatedRecords: MemoryRecord[];
  priorArtifacts: ProjectCompletionArtifact[];
};

export type CompoundingRecommendation = {
  id: string;
  title: string;
  rationale: string;
  basedOnRecordIds: string[];
  confidencePct: number;
  category: 'repeat-success' | 'avoid-failure' | 'apply-lesson' | 'improve-workflow';
};

export type OrganizationMemoryProfile = {
  organizationId: string;
  companyName: string;
  industryId: string;
  updatedAt: string;
  brainSyncedAt?: string;
  records: MemoryRecord[];
  projectArtifacts: ProjectCompletionArtifact[];
  compoundingRecommendations: CompoundingRecommendation[];
  memoryDepthScore: number;
  totalProjectsArchived: number;
  totalLessonsCaptured: number;
};

export type MemoryEngineStore = {
  version: string;
  profiles: OrganizationMemoryProfile[];
};

export type MemoryEngineDockAdvice = {
  response: string;
  concierge: string;
  recall?: MemoryRecallResult;
};
