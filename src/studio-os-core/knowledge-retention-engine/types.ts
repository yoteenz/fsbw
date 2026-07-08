/**
 * ARTICLE-E03 — Knowledge Retention Engine™
 *
 * Studio World preserves mastery through professional memories, not course review.
 */

export type RetentionDomain =
  | 'technical-skill'
  | 'client-judgment'
  | 'chemistry'
  | 'color-theory'
  | 'installation'
  | 'consultation'
  | 'operations'
  | 'marketing'
  | 'finance'
  | 'leadership'
  | 'compliance';

export type RetentionDifficulty = 'foundational' | 'intermediate' | 'advanced' | 'expert';

export type RetentionStatus =
  | 'fresh'
  | 'warming'
  | 'needs-refresh'
  | 'critical'
  | 'changed';

export type RefresherModeId =
  | 'memory-spark'
  | 'skill-refresh'
  | 'interactive-simulation'
  | 'mentor-demonstration'
  | 'client-scenario'
  | 'industry-update'
  | 'challenge-mode'
  | 'certification-renewal';

export type RefresherMode = {
  id: RefresherModeId;
  label: string;
  durationLabel: string;
  depth: 'micro' | 'short' | 'applied' | 'deep' | 'credential';
  description: string;
};

export type KnowledgeRetentionProfile = {
  id: string;
  brainId: string;
  conceptTitle: string;
  domain: RetentionDomain;
  learnedAt: string;
  successfulApplications: number;
  lastRealUsageAt?: string;
  confidenceScore: number;
  recallStrength: number;
  industryUpdateCount: number;
  certificationRelevance: number;
  difficulty: RetentionDifficulty;
  careerGoalIds: string[];
  upcomingSimulationIds: string[];
  upcomingProjectIds: string[];
};

export type KnowledgeIndustryUpdate = {
  id: string;
  conceptId: string;
  title: string;
  changedAt: string;
  summary: string;
  whyItChanged: string;
  workImpact: string;
  severity: 'minor' | 'moderate' | 'major' | 'certification';
};

export type RetentionEvaluation = {
  profileId: string;
  conceptTitle: string;
  status: RetentionStatus;
  daysSinceLearned: number;
  daysSinceRealUsage: number | null;
  decayRiskScore: number;
  masteryScore: number;
  recommendedModes: RefresherMode[];
  orbMentorLine: string;
  reasons: string[];
};

export type RetentionPlan = {
  organizationId: string;
  generatedAt: string;
  evaluations: RetentionEvaluation[];
  priorityQueue: RetentionEvaluation[];
  updateImpacts: LivingKnowledgeImpact[];
};

export type LivingKnowledgeImpact = {
  updateId: string;
  conceptId: string;
  conceptTitle: string;
  affectedLearnerReason: string;
  orbExplanation: {
    whatChanged: string;
    whyItChanged: string;
    howItAffectsWork: string;
  };
  recommendedMode: RefresherMode;
};
