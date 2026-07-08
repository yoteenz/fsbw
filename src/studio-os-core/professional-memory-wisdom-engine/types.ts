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
  | 'knowledge-breakthrough';

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
  id: string;
  learnerId: string;
  profession: string;
  title: string;
  memoryClass: ProfessionalMemoryClass;
  occurredAt: string;
  signals: ProfessionalMemorySignal[];
  summary: string;
  wisdomExtracted: string;
  emotionalTone: ProfessionalMemoryEmotionalTone;
  relatedConceptIds: string[];
  relatedSimulationIds: string[];
  relatedCareerGoalIds: string[];
  relatedBusinessIds: string[];
  relatedMentorshipIds: string[];
  impactScore: number;
  masteryDelta: number;
  visibleToOrb: boolean;
};

export type ProfessionalTimeline = {
  learnerId: string;
  profession: string;
  generatedAt: string;
  memories: ProfessionalMemoryRecord[];
  milestoneCount: number;
  wisdomScore: number;
  dominantSignals: ProfessionalMemorySignal[];
};

export type MemoryReflectionModeId =
  | 'career-recap'
  | 'year-in-review'
  | 'five-year-journey'
  | 'mastery-timeline'
  | 'business-growth-replay'
  | 'industry-impact';

export type MemoryReflectionMode = {
  id: MemoryReflectionModeId;
  label: string;
  horizon: 'session' | 'year' | 'multi-year' | 'lifetime' | 'business' | 'industry';
  description: string;
};

export type WisdomSource =
  | 'profession-brain'
  | 'professional-memory'
  | 'career-history'
  | 'simulation-outcomes'
  | 'mentorship'
  | 'industry-updates'
  | 'community-contributions';

export type WisdomContext = {
  learnerId: string;
  profession: string;
  currentQuestion: string;
  activeCareerGoalIds: string[];
  sourceWeights: Record<WisdomSource, number>;
  memoryIds: string[];
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

export type OrbMemoryRecall = {
  id: string;
  memoryId: string;
  line: string;
  tone: 'mentor' | 'celebration' | 'reflection' | 'guidance';
  optional: true;
};
