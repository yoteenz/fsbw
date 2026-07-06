import type {
  EXECUTIVE_TRUST_DASHBOARD_PHILOSOPHY,
  TRUST_DASHBOARD_SYSTEMS,
  TRUST_HISTORY_PERIODS,
  TRUST_RISK_LEVELS,
  TRUST_TRENDS,
} from './constants';

export type TrustDashboardSystemId = (typeof TRUST_DASHBOARD_SYSTEMS)[number];
export type TrustTrend = (typeof TRUST_TRENDS)[number];
export type TrustRiskLevel = (typeof TRUST_RISK_LEVELS)[number];
export type TrustHistoryPeriod = (typeof TRUST_HISTORY_PERIODS)[number];
export type TrustDashboardPhilosophyLine = (typeof EXECUTIVE_TRUST_DASHBOARD_PHILOSOPHY)[number];

export type SystemTrustIndicator = {
  systemId: TrustDashboardSystemId;
  label: string;
  trustScore: number;
  healthScore: number;
  confidence: number;
  trend: TrustTrend;
  riskLevel: TrustRiskLevel;
  recentIssues: number;
  lastValidation: string;
  lastSimulation: string;
  recommendedAction: string;
  status: 'trusted' | 'monitoring' | 'at-risk';
};

export type ExecutiveTrustSummary = {
  overallOrganizationalTrust: number;
  confidenceTrend: TrustTrend;
  systemsRequiringAttention: string[];
  highestOperationalRisks: string[];
  recentImprovements: string[];
  suggestedPriorities: string[];
  studioIntelligenceBriefing: string;
};

export type TrustHistoryPoint = {
  period: TrustHistoryPeriod;
  label: string;
  trustScore: number;
  recordedAt: string;
  deltaFromPrior: number;
};

export type OrganizationExecutiveTrustDashboardProfile = {
  organizationId: string;
  companyName: string;
  updatedAt: string;
  overallTrustScore: number;
  overallHealthScore: number;
  overallConfidence: number;
  trustTrend: TrustTrend;
  systemsAtRisk: number;
  totalRecentIssues: number;
  systemIndicators: SystemTrustIndicator[];
  executiveSummary: ExecutiveTrustSummary;
  trustHistory: TrustHistoryPoint[];
  dockTrustLine: string;
  trustIsFirstClassMetric: true;
  lastSyncedAt: string;
};

export type ExecutiveTrustDashboardStore = {
  version: string;
  profiles: OrganizationExecutiveTrustDashboardProfile[];
};

export type ExecutiveTrustDashboardDockAdvice = {
  response: string;
  concierge: string;
  overallTrustScore?: number;
};

export type TrustDashboardSearchHit = {
  type: 'system' | 'risk' | 'history';
  id: string;
  label: string;
  score: number;
  matchReason: string;
};
