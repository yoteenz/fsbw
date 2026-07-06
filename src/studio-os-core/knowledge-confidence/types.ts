import type { CONFIDENCE_DIMENSIONS } from './constants';

export type ConfidenceDimension = (typeof CONFIDENCE_DIMENSIONS)[number];

export type DimensionScore = {
  dimension: ConfidenceDimension;
  label: string;
  scorePct: number;
  status: 'strong' | 'adequate' | 'needs-teaching';
};

export type ProfessionBrainConfidenceProfile = {
  brainId: string;
  brainLabel: string;
  shortLabel: string;
  overallConfidenceScore: number;
  dimensionScores: DimensionScore[];
  strongestDimension: string;
  weakestDimension: string;
  lastAssessedAt: string;
};

export type LearningRecommendation = {
  id: string;
  brainId: string;
  brainLabel: string;
  trigger: string;
  recommendation: string;
  targetModule: 'profession-brain' | 'studio-institute' | 'both';
  priority: 'high' | 'medium' | 'low';
  dimension: ConfidenceDimension;
};

export type OrganizationKnowledgeConfidenceProfile = {
  organizationId: string;
  companyName: string;
  industryId: string;
  updatedAt: string;
  overallConfidenceScore: number;
  brainsAssessed: number;
  brainsNeedingTeaching: number;
  brainProfiles: ProfessionBrainConfidenceProfile[];
  learningRecommendations: LearningRecommendation[];
  syncedSources: string[];
};

export type KnowledgeConfidenceStore = {
  version: string;
  profiles: OrganizationKnowledgeConfidenceProfile[];
};

export type KnowledgeConfidenceDockAdvice = {
  response: string;
  concierge: string;
  overallConfidenceScore?: number;
  brainLabel?: string;
};
