import type {
  FORECAST_HORIZONS,
  PREDICTIVE_INTELLIGENCE_DOMAINS,
  PREDICTION_CATEGORIES,
} from './constants';

export type PredictiveIntelligenceDomain = (typeof PREDICTIVE_INTELLIGENCE_DOMAINS)[number];
export type PredictionCategory = (typeof PREDICTION_CATEGORIES)[number];
export type ForecastHorizon = (typeof FORECAST_HORIZONS)[number];

export type PredictiveIntelligenceSnapshot = {
  domain: PredictiveIntelligenceDomain;
  label: string;
  trend: 'rising' | 'stable' | 'declining' | 'volatile';
  summary: string;
  confidencePct: number;
  dataPoints: number;
};

export type OrganizationPrediction = {
  id: string;
  category: PredictionCategory;
  label: string;
  prediction: string;
  reasoning: string;
  recommendedAction: string;
  confidencePct: number;
  predictedWindow: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
};

export type ExecutiveForecast = {
  id: string;
  horizon: ForecastHorizon;
  label: string;
  summary: string;
  probabilityPct: number;
  riskLevel: 'low' | 'moderate' | 'elevated' | 'high';
  improvesWithLearning: true;
};

export type OrganizationPredictiveProfile = {
  organizationId: string;
  companyName: string;
  industryId: string;
  updatedAt: string;
  predictiveScore: number;
  domainsAnalyzed: number;
  predictionsActive: number;
  forecastsReady: number;
  intelligenceSnapshots: PredictiveIntelligenceSnapshot[];
  predictions: OrganizationPrediction[];
  executiveForecasts: ExecutiveForecast[];
  dockPredictionLine: string;
  prepareNotReact: true;
  syncedSources: string[];
};

export type PredictiveOrganizationStore = {
  version: string;
  profiles: OrganizationPredictiveProfile[];
};

export type PredictiveOrganizationDockAdvice = {
  response: string;
  concierge: string;
  predictiveScore?: number;
  predictionsActive?: number;
};
