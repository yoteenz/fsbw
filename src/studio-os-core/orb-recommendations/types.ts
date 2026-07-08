/** Studio Orb™ Recommendations — proactive Executive Chief of Staff intelligence. */

export type OrbFocusMode =
  | 'executive'
  | 'creative'
  | 'builder'
  | 'explorer'
  | 'growth'
  | 'launch';

export type OrbRecommendationPriority = 'critical' | 'high' | 'medium' | 'low';

export type OrbRecommendationCategory =
  | 'continue-work'
  | 'visit-department'
  | 'approve-generation'
  | 'reuse-asset'
  | 'expand-headquarters'
  | 'start-expedition'
  | 'review-golden-build'
  | 'archive-asset'
  | 'purchase-blueprint'
  | 'generate-department'
  | 'optimize-budget'
  | 'celebrate-milestone'
  | 'surprise-discovery';

export type OrbRecommendationImpact = 'transformative' | 'high' | 'moderate' | 'low';

export type OrbRecommendation = {
  id: string;
  title: string;
  reasoning: string;
  category: OrbRecommendationCategory;
  priority: OrbRecommendationPriority;
  estimatedImpact: OrbRecommendationImpact;
  estimatedMinutes: number;
  estimatedCost: string;
  potentialSavings: string | null;
  departmentsAffected: string[];
  creativeEquityGained: string | null;
  confidenceScore: number;
  targetPath?: string;
  targetNodeId?: string;
  isSurprise?: boolean;
  actionable: boolean;
};

export type OrbDailyBrief = {
  id: string;
  generatedAt: string;
  greeting: string;
  lines: string[];
  topPriorityRecommendationId: string | null;
  highPriorityCount: number;
};

export type OrbExecutiveJourneyStop = {
  order: number;
  displayName: string;
  path: string;
  nodeId?: string;
  purpose: string;
};

export type OrbExecutiveJourney = {
  id: string;
  title: string;
  preparedAt: string;
  stops: OrbExecutiveJourneyStop[];
  estimatedMinutes: number;
  reasoning: string;
};

export type OrbBudgetBehavior = 'conservative' | 'balanced' | 'aggressive';

export type OrbPersonalizationProfile = {
  organizationId: string;
  focusMode: OrbFocusMode;
  preferredWorkHours: { start: number; end: number };
  favoriteWorkspaces: string[];
  favoriteHeadquarters: string[];
  mostVisitedRooms: Record<string, number>;
  mostUsedBlueprints: string[];
  navigationHabits: string[];
  budgetBehavior: OrbBudgetBehavior;
  creativePreferences: string[];
  lastUpdatedAt: string;
  lastDailyBriefAt: string | null;
};

export type OrbWorldSignalKind = 'glow' | 'pulse' | 'beacon' | 'route';

export type OrbWorldSignal = {
  nodeId: string;
  kind: OrbWorldSignalKind;
  recommendationId: string;
  priority: OrbRecommendationPriority;
};

export type OrbCompanyContext = {
  organizationId: string;
  companyName: string;
  founderName: string;
  pathname: string;
  pendingApprovals: number;
  overnightGenerations: number;
  activeExpeditions: number;
  marketplaceOpportunities: number;
  reusableAssets: number;
  unfinishedProjects: number;
  creativeBudgetPct: number;
  goldenBuildsReceived: number;
  blueprintUpdates: number;
  aiActivityLevel: 'high' | 'moderate' | 'low';
  masterPlanCount: number;
  constructionActive: number;
};

export type OrbRecommendationsSnapshot = {
  dailyBrief: OrbDailyBrief;
  recommendations: OrbRecommendation[];
  surpriseDiscoveries: OrbRecommendation[];
  executiveJourney: OrbExecutiveJourney;
  worldSignals: OrbWorldSignal[];
  focusMode: OrbFocusMode;
};
