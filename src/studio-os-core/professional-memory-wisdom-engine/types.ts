/**
 * ARTICLE-E04 — Professional Memory™ / The Wisdom Engine™
 *
 * Knowledge teaches HOW. Wisdom teaches WHEN.
 */

export type ProfessionalMemoryClass =
  | 'career-memory'
  | 'client-memory'
  | 'simulation-memory'
  | 'teaching-memory'
  | 'innovation-memory'
  | 'business-memory'
  | 'leadership-memory'
  | 'community-memory'
  | 'historical-memory';

/** Alias for memory model category field. */
export type MemoryCategory = ProfessionalMemoryClass;

export type ProfessionalMemorySignal =
  | 'achievement'
  | 'mistake'
  | 'discovery'
  | 'career-milestone'
  | 'business'
  | 'mentorship'
  | 'project'
  | 'industry-event'
  | 'competition'
  | 'community-contribution'
  | 'certification'
  | 'knowledge-breakthrough'
  | 'promotion'
  | 'award'
  | 'industry-contribution';

export type TimelineEntryKind =
  | 'career-milestone'
  | 'business'
  | 'promotion'
  | 'project'
  | 'mentorship'
  | 'award'
  | 'community-event'
  | 'competition'
  | 'industry-contribution';

export type ProfessionalMemoryEmotionalTone =
  | 'proud'
  | 'humbled'
  | 'resilient'
  | 'curious'
  | 'trusted'
  | 'recognized'
  | 'responsible'
  | 'legacy-building';

export type ProfessionalMemoryRecord = {
  /** Memory ID */
  id: string;
  learnerId: string;
  /** Career World or profession blueprint id — never hardcoded to a single world. */
  worldId?: string;
  profession: string;
  category: MemoryCategory;
  title: string;
  occurredAt: string;
  sceneId?: string;
  sceneLabel?: string;
  simulationId?: string;
  careerLevel?: string;
  importance: number;
  participants: string[];
  relatedSkillIds: string[];
  relatedBrainConceptIds: string[];
  relatedCertificationIds: string[];
  reflectionSummary: string;
  signals: ProfessionalMemorySignal[];
  summary: string;
  wisdomExtracted: string;
  emotionalTone: ProfessionalMemoryEmotionalTone;
  relatedCareerGoalIds: string[];
  relatedBusinessIds: string[];
  relatedMentorshipIds: string[];
  impactScore: number;
  masteryDelta: number;
  visibleToOrb: boolean;
};

export type TimelineEntry = {
  id: string;
  memoryId: string;
  kind: TimelineEntryKind;
  title: string;
  occurredAt: string;
  profession: string;
  worldId?: string;
  importance: number;
  summary: string;
};

export type ProfessionalTimeline = {
  learnerId: string;
  profession: string;
  worldId?: string;
  generatedAt: string;
  entries: TimelineEntry[];
  memories: ProfessionalMemoryRecord[];
  milestoneCount: number;
  wisdomScore: number;
  dominantSignals: ProfessionalMemorySignal[];
};

export type MemoryReflectionModeId =
  | 'career-timeline'
  | 'year-in-review'
  | 'mastery-replay'
  | 'business-timeline'
  | 'knowledge-evolution'
  | 'skill-growth'
  | 'mentorship-journey';

/** @deprecated Architecture sprint reflection ids — mapped in constants. */
export type LegacyMemoryReflectionModeId =
  | 'career-recap'
  | 'five-year-journey'
  | 'mastery-timeline'
  | 'business-growth-replay'
  | 'industry-impact';

export type MemoryReflectionMode = {
  id: MemoryReflectionModeId;
  label: string;
  horizon: 'session' | 'year' | 'multi-year' | 'lifetime' | 'business' | 'industry' | 'skills';
  description: string;
};

export type MemoryReflectionSpec = {
  id: string;
  modeId: MemoryReflectionModeId;
  learnerId: string;
  profession: string;
  headline: string;
  mentorIntro: string;
  memoryIds: string[];
  highlights: string[];
  estimatedMinutes: number;
};

export type WisdomSource =
  | 'profession-brain'
  | 'professional-memory'
  | 'knowledge-retention'
  | 'career-world'
  | 'world-graph'
  | 'simulation-outcomes'
  | 'mentorship'
  | 'industry-updates'
  | 'community-contributions';

export type WisdomContext = {
  learnerId: string;
  organizationId: string;
  profession: string;
  worldId?: string;
  currentQuestion: string;
  activeCareerGoalIds: string[];
  sourceWeights: Record<WisdomSource, number>;
  memoryIds: string[];
  retentionProfileIds: string[];
  simulationOutcomeIds: string[];
  industryUpdateIds: string[];
  mentorshipIds: string[];
  communityContributionIds: string[];
};

export type WisdomRecommendation = {
  id: string;
  learnerId: string;
  generatedAt: string;
  question: string;
  recommendation: string;
  whyNow: string;
  recalledMemories: ProfessionalMemoryRecord[];
  sourceSummary: Record<WisdomSource, string>;
  confidenceScore: number;
  suggestedNextStep: string;
};

export type OrbMemoryRecallContext =
  | 'anniversary'
  | 'milestone'
  | 'promotion-anniversary'
  | 'certification-anniversary'
  | 'industry-relevance'
  | 'personal-growth';

export type OrbMemoryRecall = {
  id: string;
  memoryId: string;
  line: string;
  context: OrbMemoryRecallContext;
  tone: 'mentor' | 'celebration' | 'reflection' | 'guidance';
  optional: true;
  priority: 'low' | 'medium' | 'high';
};

export type ProfessionalCareerHistoryEntry = {
  id: string;
  learnerId: string;
  profession: string;
  worldId?: string;
  kind: TimelineEntryKind;
  title: string;
  occurredAt: string;
  careerLevel?: string;
  businessId?: string;
  projectId?: string;
  mentorshipId?: string;
  summary: string;
};

export type AchievementRecord = {
  id: string;
  learnerId: string;
  profession: string;
  worldId?: string;
  title: string;
  earnedAt: string;
  category: 'certification' | 'award' | 'promotion' | 'competition' | 'community' | 'milestone';
  importance: number;
  memoryId?: string;
  summary: string;
};

export type ProfessionalMemoryStore = {
  version: string;
  organizationId: string;
  learnerId: string;
  profession: string;
  worldId?: string;
  memories: ProfessionalMemoryRecord[];
  careerHistory: ProfessionalCareerHistoryEntry[];
  achievements: AchievementRecord[];
  orbSurfacedMemoryIds: string[];
  lastOrbRecallAt?: string;
  updatedAt: string;
};

export type ProfessionalMemoryState = {
  store: ProfessionalMemoryStore;
  timeline: ProfessionalTimeline;
  wisdomRecommendation: WisdomRecommendation | null;
};

export type MemoryEventRegistration = {
  worldId: string;
  profession: string;
  eventType: string;
  description: string;
};

export type MemoryEventPayload = {
  worldId: string;
  profession: string;
  eventType: string;
  title: string;
  occurredAt?: string;
  sceneId?: string;
  simulationId?: string;
  careerLevel?: string;
  importance?: number;
  participants?: string[];
  relatedSkillIds?: string[];
  relatedBrainConceptIds?: string[];
  relatedCertificationIds?: string[];
  reflectionSummary?: string;
  summary?: string;
  signals?: ProfessionalMemorySignal[];
  category?: MemoryCategory;
};
