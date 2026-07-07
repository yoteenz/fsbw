import type {
  IDENTITY_TIMELINE_DOMAINS,
  IDENTITY_TIMELINE_EVENT_TYPES,
  IDENTITY_TIMELINE_PHILOSOPHY,
} from './constants';

export type IdentityTimelinePhilosophyLine = (typeof IDENTITY_TIMELINE_PHILOSOPHY)[number];
export type IdentityTimelineEventType = (typeof IDENTITY_TIMELINE_EVENT_TYPES)[number];
export type IdentityTimelineDomain = (typeof IDENTITY_TIMELINE_DOMAINS)[number];

export type IdentityTimelineEvent = {
  id: string;
  eventType: IdentityTimelineEventType;
  eventTypeLabel: string;
  title: string;
  description: string;
  occurredAt: string;
  impactScore: number;
  permanent: true;
};

export type IdentityTimelineStats = {
  mentorshipCount: number;
  knowledgeAssetsPublished: number;
  promotions: number;
  awards: number;
  expertSessions: number;
  marketplaceContributions: number;
  brainContributions: number;
  trainingCompleted: number;
  leadershipRoles: number;
  projectsDelivered: number;
  departmentsServed: number;
};

export type PersonIdentityTimeline = {
  id: string;
  personId: string;
  displayName: string;
  headline: string;
  department: string;
  role: string;
  journeyScore: number;
  eventsCount: number;
  stats: IdentityTimelineStats;
  events: IdentityTimelineEvent[];
  topContributorThisYear: boolean;
  permanentRecord: true;
};

export type IdentityTimelineInsight = {
  id: string;
  insight: string;
  personName: string;
  category: 'mentorship' | 'knowledge' | 'recognition' | 'growth' | 'milestone';
  severity: 'info' | 'watch' | 'celebration';
  recommendedAction: string;
};

export type IdentityTimelineDomainStatus = {
  domain: IdentityTimelineDomain;
  label: string;
  score: number;
  count: number;
  summary: string;
};

export type OrganizationIdentityTimelineProfile = {
  organizationId: string;
  companyName: string;
  updatedAt: string;
  timelineScore: number;
  peopleWithTimelines: number;
  totalEvents: number;
  permanentRecords: number;
  topContributorName: string;
  mentorshipTotal: number;
  knowledgeAssetsTotal: number;
  timelines: PersonIdentityTimeline[];
  insights: IdentityTimelineInsight[];
  domainStatuses: IdentityTimelineDomainStatus[];
  selectedPersonId: string | null;
  dockTimelineLine: string;
  preservesIndividualStory: true;
  syncedSources: string[];
  lastSyncedAt: string;
};

export type IdentityTimelineStore = {
  version: string;
  profiles: OrganizationIdentityTimelineProfile[];
};

export type IdentityTimelineDockAdvice = {
  response: string;
  concierge: string;
  timelineScore?: number;
  peopleWithTimelines?: number;
};

export type IdentityTimelineSearchHit = {
  type: 'person' | 'event' | 'insight';
  id: string;
  label: string;
  score: number;
  matchReason: string;
};
