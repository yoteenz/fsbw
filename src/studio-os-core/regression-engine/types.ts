import type {
  REGRESSION_CATEGORIES,
  REGRESSION_ENGINE_PHILOSOPHY,
  REGRESSION_REPLAYS,
  REGRESSION_RISK_LEVELS,
  REGRESSION_SEVERITIES,
} from './constants';

export type RegressionCategory = (typeof REGRESSION_CATEGORIES)[number];
export type RegressionReplay = (typeof REGRESSION_REPLAYS)[number];
export type RegressionRiskLevel = (typeof REGRESSION_RISK_LEVELS)[number];
export type RegressionSeverity = (typeof REGRESSION_SEVERITIES)[number];
export type RegressionPhilosophyLine = (typeof REGRESSION_ENGINE_PHILOSOPHY)[number];

export type BrokenFeature = {
  id: string;
  featureId: string;
  featureLabel: string;
  category: RegressionCategory;
  categoryLabel: string;
  severity: RegressionSeverity;
  description: string;
  unexpectedChange: string;
  affectedSystems: string[];
  rootCause: string;
  suggestedFix: string;
  rollbackRecommendation: string;
};

export type BuildRegressionReport = {
  id: string;
  buildId: string;
  buildLabel: string;
  regressionScore: number;
  brokenFeatures: string[];
  unexpectedChanges: string[];
  affectedSystems: string[];
  rootCauseAnalysis: string;
  riskLevel: RegressionRiskLevel;
  suggestedFixes: string[];
  rollbackRecommendation: string;
  regressionVerdict: string;
  brokenFeaturesCount: number;
  generatedAt: string;
};

export type RegressionReplayResult = {
  id: string;
  replay: RegressionReplay;
  replayLabel: string;
  category: RegressionCategory;
  categoryLabel: string;
  systemsTested: string[];
  passed: boolean;
  regressionScore: number;
  stepsReplayed: number;
  summary: string;
};

export type CategoryRegressionScore = {
  category: RegressionCategory;
  label: string;
  score: number;
  status: 'stable' | 'watch' | 'regressed';
  summary: string;
  regressionsCount: number;
};

export type HistoricalMemoryEntry = {
  id: string;
  discoveredAt: string;
  category: RegressionCategory;
  categoryLabel: string;
  featureLabel: string;
  description: string;
  rootCause: string;
  recurrenceCount: number;
  studioIntelligencePattern: string;
  status: 'resolved' | 'open' | 'recurring';
};

export type OrganizationRegressionEngineProfile = {
  organizationId: string;
  companyName: string;
  updatedAt: string;
  overallRegressionScore: number;
  buildsTested: number;
  brokenFeaturesOpen: number;
  regressionsInHistory: number;
  recurringPatterns: number;
  categoryScores: CategoryRegressionScore[];
  brokenFeatures: BrokenFeature[];
  buildReports: BuildRegressionReport[];
  replayResults: RegressionReplayResult[];
  historicalMemory: HistoricalMemoryEntry[];
  selectedBuildId: string | null;
  dockRegressionLine: string;
  neverRepeatMistakes: true;
  lastSyncedAt: string;
};

export type RegressionEngineStore = {
  version: string;
  profiles: OrganizationRegressionEngineProfile[];
};

export type RegressionEngineDockAdvice = {
  response: string;
  concierge: string;
  overallRegressionScore?: number;
  brokenFeaturesOpen?: number;
};

export type RegressionEngineSearchHit = {
  type: 'broken-feature' | 'report' | 'replay' | 'category' | 'memory';
  id: string;
  label: string;
  score: number;
  matchReason: string;
};
