import type {
  ACTION_PRIORITIES,
  ANALYSIS_SOURCES,
  PATTERN_TRENDS,
  PREDICTION_PATTERN_TYPES,
  PREDICTION_SEVERITIES,
  PREDICTION_STATUSES,
  PREDICTION_TIMELINES,
  PREDICTIVE_QA_PHILOSOPHY,
} from './constants';

export type PredictiveQaPatternType = (typeof PREDICTION_PATTERN_TYPES)[number];
export type PredictiveQaAnalysisSource = (typeof ANALYSIS_SOURCES)[number];
export type PredictiveQaTimeline = (typeof PREDICTION_TIMELINES)[number];
export type PredictiveQaSeverity = (typeof PREDICTION_SEVERITIES)[number];
export type PredictiveQaPredictionStatus = (typeof PREDICTION_STATUSES)[number];
export type PredictiveQaPatternTrend = (typeof PATTERN_TRENDS)[number];
export type PreventativeActionPriority = (typeof ACTION_PRIORITIES)[number];
export type PredictiveQaPhilosophyLine = (typeof PREDICTIVE_QA_PHILOSOPHY)[number];

export type PredictiveQaPrediction = {
  id: string;
  patternType: PredictiveQaPatternType;
  patternLabel: string;
  title: string;
  statement: string;
  confidencePct: number;
  supportingEvidence: string[];
  estimatedTimeline: PredictiveQaTimeline;
  timelineLabel: string;
  businessImpact: string;
  departmentsAffected: string[];
  recommendedPreventativeAction: string;
  analysisSources: PredictiveQaAnalysisSource[];
  severity: PredictiveQaSeverity;
  preventableNow: boolean;
  status: PredictiveQaPredictionStatus;
  predictedAt: string;
};

export type PredictiveQaPattern = {
  id: string;
  patternType: PredictiveQaPatternType;
  label: string;
  description: string;
  signalStrength: number;
  relatedPredictions: number;
  trend: PredictiveQaPatternTrend;
  analysisSources: PredictiveQaAnalysisSource[];
};

export type PreventativeAction = {
  id: string;
  predictionId: string;
  action: string;
  priority: PreventativeActionPriority;
  ownerDepartment: string;
  estimatedEffort: string;
};

export type OrganizationPredictiveQaProfile = {
  organizationId: string;
  companyName: string;
  updatedAt: string;
  predictiveQaScore: number;
  activePredictions: number;
  highRiskPredictions: number;
  patternsDetected: number;
  preventableRisks: number;
  predictions: PredictiveQaPrediction[];
  patterns: PredictiveQaPattern[];
  preventativeActions: PreventativeAction[];
  dockPredictiveQaLine: string;
  protectsTheFuture: true;
  lastSyncedAt: string;
};

export type PredictiveQaStore = {
  version: string;
  profiles: OrganizationPredictiveQaProfile[];
};

export type PredictiveQaDockAdvice = {
  response: string;
  concierge: string;
  activePredictions?: number;
  predictiveQaScore?: number;
};

export type PredictiveQaSearchHit = {
  type: 'prediction' | 'pattern' | 'action';
  id: string;
  label: string;
  score: number;
  matchReason: string;
};
