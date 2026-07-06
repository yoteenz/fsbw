import type {
  CULTURE_ACHIEVEMENTS,
  ENGINEERING_EXCELLENCE_PHILOSOPHY,
  ENGINEERING_KPIS,
  EXCELLENCE_PERIODS,
  HEALTH_PILLARS,
} from './constants';

export type HealthPillar = (typeof HEALTH_PILLARS)[number];
export type EngineeringKpi = (typeof ENGINEERING_KPIS)[number];
export type ExcellencePeriod = (typeof EXCELLENCE_PERIODS)[number];
export type CultureAchievement = (typeof CULTURE_ACHIEVEMENTS)[number];
export type EngineeringExcellencePhilosophyLine = (typeof ENGINEERING_EXCELLENCE_PHILOSOPHY)[number];

export type HealthPillarScore = {
  pillar: HealthPillar;
  label: string;
  score: number;
  status: 'excellent' | 'healthy' | 'watch' | 'at-risk';
  trend: 'improving' | 'stable' | 'declining';
  summary: string;
  sourceSystem: string;
};

export type EngineeringKpiMetric = {
  kpi: EngineeringKpi;
  label: string;
  value: string;
  numericScore: number;
  status: 'excellent' | 'healthy' | 'watch' | 'at-risk';
  trend: 'improving' | 'stable' | 'declining';
  summary: string;
};

export type ExecutiveEngineeringBrief = {
  id: string;
  engineeringAchievements: string[];
  currentPriorities: string[];
  growingRisks: string[];
  improvingSystems: string[];
  suggestedInvestments: string[];
  upcomingReleaseReadiness: string;
  studioIntelligenceSummary: string;
  briefedAt: string;
};

export type HistoricalExcellencePoint = {
  id: string;
  period: ExcellencePeriod;
  periodLabel: string;
  engineeringScore: number;
  deltaFromPrior: number;
  summary: string;
  recordedAt: string;
};

export type CultureCelebration = {
  id: string;
  achievement: CultureAchievement;
  achievementLabel: string;
  title: string;
  description: string;
  celebratedAt: string;
  impactSummary: string;
};

export type OrganizationEngineeringExcellenceProfile = {
  organizationId: string;
  companyName: string;
  updatedAt: string;
  overallEngineeringScore: number;
  technicalDebtIndex: number;
  openRisksCount: number;
  criticalIssuesCount: number;
  averageReleaseConfidence: number;
  productionStabilityScore: number;
  healthPillars: HealthPillarScore[];
  engineeringKpis: EngineeringKpiMetric[];
  executiveBrief: ExecutiveEngineeringBrief;
  historicalExcellence: HistoricalExcellencePoint[];
  cultureCelebrations: CultureCelebration[];
  selectedPeriod: ExcellencePeriod;
  dockExcellenceLine: string;
  excellenceIsMindset: true;
  lastSyncedAt: string;
};

export type EngineeringExcellenceStore = {
  version: string;
  profiles: OrganizationEngineeringExcellenceProfile[];
};

export type EngineeringExcellenceDockAdvice = {
  response: string;
  concierge: string;
  overallEngineeringScore?: number;
};

export type EngineeringExcellenceSearchHit = {
  type: 'pillar' | 'kpi' | 'brief' | 'history' | 'culture';
  id: string;
  label: string;
  score: number;
  matchReason: string;
};
