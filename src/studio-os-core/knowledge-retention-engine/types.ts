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

export type RetentionCertificationStatus =
  | 'not-applicable'
  | 'current'
  | 'expiring-soon'
  | 'expired'
  | 'renewal-due';

export type RefresherModeId =
  | 'memory-spark'
  | 'tldr-review'
  | 'interactive-scenario'
  | 'simulation-replay'
  | 'mentor-walkthrough'
  | 'quick-assessment'
  | 'certification-renewal'
  | 'industry-update';

/** @deprecated Use RefresherModeId — kept for graph ingest and legacy references. */
export type LegacyRefresherModeId =
  | 'skill-refresh'
  | 'interactive-simulation'
  | 'mentor-demonstration'
  | 'client-scenario'
  | 'challenge-mode';

export type RefresherMode = {
  id: RefresherModeId;
  label: string;
  durationLabel: string;
  depth: 'micro' | 'short' | 'applied' | 'deep' | 'credential';
  description: string;
};

export type ReviewTriggerId =
  | 'time-elapsed'
  | 'low-confidence'
  | 'repeated-mistakes'
  | 'industry-standard-update'
  | 'upcoming-simulation'
  | 'career-goal'
  | 'certification-deadline';

export type KnowledgeRetentionProfile = {
  /** Concept ID — durable professional memory identifier. */
  id: string;
  brainId: string;
  conceptTitle: string;
  profession: string;
  domain: RetentionDomain;
  learnedAt: string;
  lastPracticed?: string;
  lastSimulated?: string;
  /** Last real-world application (alias for lastPracticed when sourced from work). */
  lastRealUsageAt?: string;
  confidenceScore: number;
  recallScore: number;
  applicationsCompleted: number;
  mistakesMade: number;
  industryVersion: string;
  industryUpdateCount: number;
  certificationStatus: RetentionCertificationStatus;
  certificationRelevance: number;
  careerRelevance: number;
  difficulty: RetentionDifficulty;
  careerGoalIds: string[];
  upcomingSimulationIds: string[];
  upcomingProjectIds: string[];
};

export type KnowledgeIndustryUpdate = {
  id: string;
  conceptId: string;
  brainId: string;
  title: string;
  changedAt: string;
  industryVersion: string;
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
  triggers: ReviewTriggerId[];
  recommendedModes: RefresherMode[];
  orbMentorLine: string;
  reasons: string[];
};

export type RetentionPlan = {
  organizationId: string;
  learnerId: string;
  generatedAt: string;
  evaluations: RetentionEvaluation[];
  priorityQueue: RetentionEvaluation[];
  updateImpacts: LivingKnowledgeImpact[];
  scheduledReviewAt?: string;
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

export type RefresherExperienceSpec = {
  id: string;
  profileId: string;
  modeId: RefresherModeId;
  conceptTitle: string;
  headline: string;
  mentorIntro: string;
  estimatedMinutes: number;
  optional: true;
  completionCriteria: string[];
  payload: Record<string, unknown>;
};

export type OrbRetentionReminder = {
  id: string;
  profileId: string;
  conceptTitle: string;
  line: string;
  context: 'before-appointment' | 'time-since' | 'industry-update' | 'mastered-refresh' | 'simulation-prep' | 'certification';
  optional: true;
  suggestedModeId: RefresherModeId;
  priority: 'low' | 'medium' | 'high';
};

export type RetentionReviewRecord = {
  id: string;
  profileId: string;
  modeId: RefresherModeId;
  completedAt: string;
  durationMinutes: number;
  confidenceDelta: number;
  recallDelta: number;
};

export type RetentionAnalyticsSnapshot = {
  learnerId: string;
  organizationId: string;
  generatedAt: string;
  profileCount: number;
  averageRetention: number;
  averageConfidence: number;
  averageMastery: number;
  reviewCompletionRate: number;
  knowledgeGrowthScore: number;
  conceptDecayRisk: number;
  profilesNeedingRefresh: number;
  industryUpdatesPending: number;
};

export type KnowledgeRetentionStore = {
  version: string;
  organizationId: string;
  learnerId: string;
  profiles: KnowledgeRetentionProfile[];
  industryUpdates: KnowledgeIndustryUpdate[];
  reviewHistory: RetentionReviewRecord[];
  queuedRefreshers: RefresherExperienceSpec[];
  lastSchedulerRunAt?: string;
  scheduledReviewAt?: string;
  updatedAt: string;
};
