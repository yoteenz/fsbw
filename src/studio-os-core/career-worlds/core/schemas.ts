/**
 * Career Worlds™ — canonical persistent schemas.
 * Every profession plugs into these interfaces; no profession-specific hardcoding here.
 */

import type { CareerWorldId, CareerWorldProgressPhase } from '../types';

export type CareerWorldSeason = 'spring' | 'summer' | 'autumn' | 'winter';

export type WorldClockGranularity = 'daily' | 'weekly' | 'monthly' | 'yearly';

/** Persistent world state — economy, trends, companies, jobs, events, seasons. */
export type CareerWorldState = {
  worldId: CareerWorldId;
  simulatedDay: number;
  simulatedWeek: number;
  simulatedMonth: number;
  simulatedYear: number;
  season: CareerWorldSeason;
  economyIndex: number;
  industryTrend: string;
  companyGrowthIndex: number;
  activeTrends: string[];
  openJobs: CareerWorldJobPosting[];
  activeProjects: CareerWorldProject[];
  clientHistory: CareerWorldClientRecord[];
  worldEvents: CareerWorldEventInstance[];
  communityChallenges: CareerWorldCommunityChallenge[];
  seasonalContent: string[];
  npcRelationshipSummary: Record<string, number>;
  lastTickAt: string;
};

export type CareerWorldJobPosting = {
  id: string;
  title: string;
  company: string;
  district: string;
  postedDay: number;
  urgency: 'low' | 'medium' | 'high';
};

export type CareerWorldProject = {
  id: string;
  name: string;
  client: string;
  status: 'planning' | 'active' | 'review' | 'complete';
  dueDay: number;
};

export type CareerWorldClientRecord = {
  id: string;
  name: string;
  trust: number;
  lastInteractionDay: number;
  projectsCompleted: number;
};

export type CareerWorldEventInstance = {
  id: string;
  templateId: string;
  title: string;
  category: CareerWorldEventCategory;
  startsDay: number;
  endsDay: number;
  status: 'scheduled' | 'active' | 'resolved';
  impactSummary?: string;
};

export type CareerWorldEventCategory =
  | 'industry-conference'
  | 'client-emergency'
  | 'product-launch'
  | 'competition'
  | 'economic-shift'
  | 'trend-change'
  | 'certification-exam'
  | 'community-collaboration'
  | 'technology-change'
  | 'seasonal-challenge';

export type CareerWorldCommunityChallenge = {
  id: string;
  title: string;
  progress: number;
  target: number;
  reward: string;
  expiresDay: number;
};

/** World clock — schedules conferences, competitions, technology shifts. */
export type WorldClockState = {
  currentDay: number;
  currentWeek: number;
  currentMonth: number;
  currentYear: number;
  season: CareerWorldSeason;
  scheduledEvents: WorldClockScheduleEntry[];
  lastAdvancedAt: string;
};

export type WorldClockScheduleEntry = {
  id: string;
  title: string;
  granularity: WorldClockGranularity;
  scheduledDay: number;
  category: CareerWorldEventCategory;
  recurring?: boolean;
};

/** Long-term player / learner professional identity. */
export type CareerPlayerProfile = {
  learnerId: string;
  worldId: CareerWorldId;
  careerTitle: string;
  currentPhase: CareerWorldProgressPhase;
  experience: number;
  skills: CareerSkillRecord[];
  certifications: CareerCertificationRecord[];
  income: number;
  businessOwnership: CareerBusinessOwnership | null;
  employees: number;
  professionalReputation: number;
  mentorshipRelationships: CareerMentorshipRecord[];
  awards: string[];
  publishedWork: CareerPublishedWork[];
  portfolioItemIds: string[];
  promotionHistory: CareerPromotionRecord[];
  createdAt: string;
  updatedAt: string;
};

export type CareerSkillRecord = {
  id: string;
  name: string;
  level: number;
  maxLevel: number;
};

export type CareerCertificationRecord = {
  id: string;
  name: string;
  issuedDay: number;
  issuer: string;
};

export type CareerBusinessOwnership = {
  businessName: string;
  foundedDay: number;
  locations: number;
  revenue: number;
};

export type CareerMentorshipRecord = {
  npcId: string;
  npcName: string;
  role: 'mentor' | 'mentee' | 'peer';
  trust: number;
  lastSessionDay: number;
};

export type CareerPromotionRecord = {
  id: string;
  fromTitle: string;
  toTitle: string;
  day: number;
  reason: string;
};

export type CareerPublishedWork = {
  id: string;
  title: string;
  type: 'research' | 'article' | 'talk' | 'product' | 'technique';
  publishedDay: number;
};

/** Persistent AI professional with memory. */
export type CareerNpcProfile = {
  id: string;
  name: string;
  archetype: string;
  role: 'mentor' | 'coworker' | 'client' | 'competitor' | 'supplier' | 'employer';
  trust: number;
  reputation: number;
  conversationHistory: CareerNpcConversationRecord[];
  projectsCompleted: string[];
  recommendations: string[];
  employmentHistory: string[];
  teachingHistory: string[];
  lastInteractionDay: number;
};

export type CareerNpcConversationRecord = {
  id: string;
  day: number;
  summary: string;
  sentiment: 'positive' | 'neutral' | 'negative';
};

export type CareerPortfolioItem = {
  id: string;
  title: string;
  description: string;
  completedDay: number;
  client?: string;
  tags: string[];
  featured: boolean;
};

export type CareerAwardRecord = {
  id: string;
  title: string;
  issuer: string;
  awardedDay: number;
  category: string;
};

export type CareerHistoryEntry = {
  id: string;
  day: number;
  type: 'role-change' | 'project' | 'certification' | 'award' | 'publication' | 'mentorship';
  title: string;
  summary: string;
};

/** Full persistent save — one learner in one Career World. */
export type CareerWorldSave = {
  saveId: string;
  worldId: CareerWorldId;
  learnerId: string;
  worldState: CareerWorldState;
  playerProfile: CareerPlayerProfile;
  npcs: CareerNpcProfile[];
  clock: WorldClockState;
  portfolio: CareerPortfolioItem[];
  awards: CareerAwardRecord[];
  careerHistory: CareerHistoryEntry[];
  lastSeenAt: string;
  updatedAt: string;
};

export type CareerWorldStore = {
  version: string;
  saves: CareerWorldSave[];
};
