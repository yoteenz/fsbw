import type {
  CONFIDENCE_ENGINE_PHILOSOPHY,
  CONFIDENCE_LEVELS,
  LOW_CONFIDENCE_MESSAGES,
  RECOMMENDATION_CATEGORIES,
  RISK_LEVELS,
} from './constants';

export type ConfidenceLevel = (typeof CONFIDENCE_LEVELS)[number];
export type RecommendationCategory = (typeof RECOMMENDATION_CATEGORIES)[number];
export type ConfidenceRiskLevel = (typeof RISK_LEVELS)[number];
export type ConfidenceEnginePhilosophyLine = (typeof CONFIDENCE_ENGINE_PHILOSOPHY)[number];
export type LowConfidenceMessage = (typeof LOW_CONFIDENCE_MESSAGES)[number];

export type ConfidenceRecommendation = {
  id: string;
  category: RecommendationCategory;
  categoryLabel: string;
  recommendation: string;
  conversationalExplanation: string;
  confidenceScore: number;
  confidenceLevel: ConfidenceLevel;
  confidenceLevelLabel: string;
  supportingEvidence: string[];
  reasoningSummary: string;
  knowledgeSources: string[];
  recentValidation: string[];
  simulationResults: string[];
  relatedHistoricalOutcomes: string[];
  riskLevel: ConfidenceRiskLevel;
  whatWeKnow: string[];
  whatWeDontKnow: string[];
  lowConfidenceDisclaimer: string | null;
  recommendedAt: string;
};

export type ConfidenceExplorerEntry = {
  id: string;
  recommendationId: string;
  label: string;
  previousScore: number;
  currentScore: number;
  delta: number;
  previousLevel: ConfidenceLevel;
  currentLevel: ConfidenceLevel;
  changeReasons: string[];
  changedAt: string;
};

export type OrganizationConfidenceEngineProfile = {
  organizationId: string;
  companyName: string;
  updatedAt: string;
  overallConfidenceScore: number;
  averageRecommendationConfidence: number;
  recommendationsActive: number;
  lowConfidenceCount: number;
  explorerEntries: number;
  recommendations: ConfidenceRecommendation[];
  explorerHistory: ConfidenceExplorerEntry[];
  selectedRecommendationId: string | null;
  dockConfidenceLine: string;
  confidenceIsConversation: true;
  lastSyncedAt: string;
};

export type ConfidenceEngineStore = {
  version: string;
  profiles: OrganizationConfidenceEngineProfile[];
};

export type ConfidenceEngineDockAdvice = {
  response: string;
  concierge: string;
  overallConfidenceScore?: number;
  confidenceLevel?: ConfidenceLevel;
};

export type ConfidenceEngineSearchHit = {
  type: 'recommendation' | 'explorer';
  id: string;
  label: string;
  score: number;
  matchReason: string;
};
