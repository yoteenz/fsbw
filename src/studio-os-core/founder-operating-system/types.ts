import type {
  COACHING_CATEGORIES,
  FOCUS_PROTECTION_TARGETS,
  FOUNDER_INTELLIGENCE_DIMENSIONS,
} from './constants';

export type FounderIntelligenceDimension = (typeof FOUNDER_INTELLIGENCE_DIMENSIONS)[number];
export type CoachingCategory = (typeof COACHING_CATEGORIES)[number];
export type FocusProtectionTarget = (typeof FOCUS_PROTECTION_TARGETS)[number];

export type FounderIntelligenceSnapshot = {
  dimension: FounderIntelligenceDimension;
  label: string;
  insight: string;
  scorePct: number;
  trend: 'rising' | 'stable' | 'declining';
};

export type ExecutiveCoachingInsight = {
  id: string;
  category: CoachingCategory;
  headline: string;
  observation: string;
  recommendation: string;
  confidencePct: number;
};

export type FocusProtectionAction = {
  id: string;
  target: FocusProtectionTarget;
  label: string;
  action: string;
  protected: boolean;
  scheduledBlock?: string;
};

export type PersonalDashboardMetrics = {
  leadershipGrowthPct: number;
  focusScorePct: number;
  decisionLoadPct: number;
  executiveHealthPct: number;
  learningProgressPct: number;
  delegationOpportunities: number;
  meetingEffectivenessPct: number;
  strategicTimePct: number;
  burnoutRiskPct: number;
  creativeMomentumPct: number;
};

export type OrganizationFounderOperatingSystemProfile = {
  organizationId: string;
  companyName: string;
  industryId: string;
  updatedAt: string;
  founderEffectivenessScore: number;
  founderIntelligence: FounderIntelligenceSnapshot[];
  coachingInsights: ExecutiveCoachingInsight[];
  focusActions: FocusProtectionAction[];
  personalDashboard: PersonalDashboardMetrics;
  dockFounderLine: string;
  operatesTheFounder: true;
  syncedSources: string[];
};

export type FounderOperatingSystemStore = {
  version: string;
  profiles: OrganizationFounderOperatingSystemProfile[];
};

export type FounderOperatingSystemDockAdvice = {
  response: string;
  concierge: string;
  founderEffectivenessScore?: number;
  focusScorePct?: number;
};
