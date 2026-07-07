import type {
  PROFILE_DOMAINS,
  PROFESSIONAL_PROFILE_PHILOSOPHY,
  TIMELINE_EVENT_TYPES,
} from './constants';

export type ProfessionalPhilosophyLine = (typeof PROFESSIONAL_PROFILE_PHILOSOPHY)[number];
export type TimelineEventType = (typeof TIMELINE_EVENT_TYPES)[number];
export type ProfileDomain = (typeof PROFILE_DOMAINS)[number];

export type ProfessionalExperience = {
  id: string;
  title: string;
  organization: string;
  period: string;
  summary: string;
  highlights: string[];
};

export type ProfessionalCertification = {
  id: string;
  name: string;
  issuer: string;
  earnedAt: string;
  status: 'earned' | 'in-progress' | 'available';
};

export type ProfessionBrainLink = {
  brainId: string;
  label: string;
  maturityPct: number;
  knowledgeCount: number;
  role: 'creator' | 'contributor' | 'steward';
};

export type ProfessionalProject = {
  id: string;
  title: string;
  period: string;
  outcome: string;
  skillsApplied: string[];
};

export type AcademyProgressEntry = {
  id: string;
  title: string;
  type: 'course' | 'lesson' | 'certification' | 'learning-path';
  progressPct: number;
  status: 'available' | 'in-progress' | 'earned';
};

export type MentorshipRecord = {
  id: string;
  role: 'mentor' | 'mentee';
  counterpart: string;
  focus: string;
  since: string;
};

export type ProfessionalRecommendation = {
  id: string;
  from: string;
  relationship: string;
  excerpt: string;
  receivedAt: string;
};

export type LeadershipHistoryEntry = {
  id: string;
  title: string;
  scope: string;
  period: string;
  impact: string;
};

export type PortfolioItem = {
  id: string;
  title: string;
  type: 'project' | 'product' | 'brain' | 'course' | 'publication';
  summary: string;
  url?: string;
};

export type WorkPreference = {
  id: string;
  category: string;
  preference: string;
};

export type ProfessionalTimelineEvent = {
  id: string;
  eventType: TimelineEventType;
  eventTypeLabel: string;
  title: string;
  description: string;
  occurredAt: string;
  impactScore: number;
};

export type LivingProfessionalProfile = {
  id: string;
  personId: string;
  displayName: string;
  headline: string;
  careerSummary: string;
  currentRole: string;
  department: string;
  evolutionScore: number;
  timelineEventCount: number;
  experience: ProfessionalExperience[];
  skills: string[];
  certifications: ProfessionalCertification[];
  professionBrains: ProfessionBrainLink[];
  projects: ProfessionalProject[];
  achievements: string[];
  learning: string[];
  coursesCompleted: string[];
  academyProgress: AcademyProgressEntry[];
  knowledgeContributions: string[];
  mentorship: MentorshipRecord[];
  recommendations: ProfessionalRecommendation[];
  leadershipHistory: LeadershipHistoryEntry[];
  portfolio: PortfolioItem[];
  industries: string[];
  languages: string[];
  communicationStyle: string[];
  workPreferences: WorkPreference[];
  professionalTimeline: ProfessionalTimelineEvent[];
  lastEvolvedAt: string;
  livingNotStatic: true;
};

export type ProfileDomainStatus = {
  domain: ProfileDomain;
  label: string;
  score: number;
  count: number;
  summary: string;
};

export type OrganizationProfessionalProfilesProfile = {
  organizationId: string;
  companyName: string;
  updatedAt: string;
  registryScore: number;
  profilesCount: number;
  timelineEventsTotal: number;
  brainsLinked: number;
  certificationsEarned: number;
  profiles: LivingProfessionalProfile[];
  domainStatuses: ProfileDomainStatus[];
  selectedProfileId: string | null;
  dockProfessionalLine: string;
  dynamicNotFrozen: true;
  syncedSources: string[];
  lastSyncedAt: string;
};

export type ProfessionalProfileStore = {
  version: string;
  profiles: OrganizationProfessionalProfilesProfile[];
};

export type ProfessionalProfileDockAdvice = {
  response: string;
  concierge: string;
  registryScore?: number;
  profilesCount?: number;
};

export type ProfessionalProfileSearchHit = {
  type: 'profile' | 'skill' | 'timeline' | 'certification';
  id: string;
  label: string;
  score: number;
  matchReason: string;
};
