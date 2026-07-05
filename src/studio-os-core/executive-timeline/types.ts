import type { TIMELINE_LAYERS, TIMELINE_ORGANIZATIONS, TIMELINE_VIEWS } from './constants';

export type TimelineLayerId = (typeof TIMELINE_LAYERS)[number]['id'];
export type TimelineViewId = (typeof TIMELINE_VIEWS)[number]['id'];
export type TimelineOrganizationId = (typeof TIMELINE_ORGANIZATIONS)[number]['id'];

export type TimelineEventStatus = 'scheduled' | 'in-progress' | 'at-risk' | 'completed' | 'blocked' | 'proposed';
export type TimelinePriority = 'critical' | 'high' | 'medium' | 'low';

export type TimelineDependency = {
  id: string;
  label: string;
  category: 'content' | 'production' | 'rendering' | 'campaign' | 'meeting' | 'inventory' | 'review' | 'email' | 'publishing' | 'photoshoot' | 'concierge' | 'executive';
  eventId?: string;
  impactLevel: 'high' | 'medium' | 'low';
};

export type TimelineEvent = {
  id: string;
  organizationId: TimelineOrganizationId;
  title: string;
  layerId: TimelineLayerId;
  startAt: string;
  endAt: string;
  priority: TimelinePriority;
  status: TimelineEventStatus;
  confidencePct: number;
  estimatedEffortMins: number;
  assignedConcierge?: string;
  assignedExecutive?: string;
  relatedProjects: string[];
  relatedContent: string[];
  relatedMeetings: string[];
  dependsOn: string[];
  blocks: string[];
  dependencies: TimelineDependency[];
  personalLifeTag?: string;
  notes?: string;
};

export type TimelineImpactAnalysis = {
  eventId: string;
  proposedChange: string;
  affectedEventIds: string[];
  affectedCategories: string[];
  conflictCount: number;
  recommendation: string;
  autoReorganizeAvailable: boolean;
  requiresFounderApproval: boolean;
  summary: string;
};

export type ConciergeTimelineCommand = {
  id: string;
  concierge: string;
  rawText: string;
  parsedIntent: string;
  targetEventId?: string;
  proposedAction: string;
  status: 'parsed' | 'pending-approval' | 'applied' | 'declined';
  impact?: TimelineImpactAnalysis;
  createdAt: string;
};

export type MorningBriefing = {
  generatedAt: string;
  todaysPriorities: string[];
  upcomingDeadlines: string[];
  executiveMeetings: string[];
  publishingSchedule: string[];
  travel: string[];
  personalCommitments: string[];
  recommendedAdjustments: string[];
  potentialConflicts: string[];
  organizationalHealth: string;
  chiefConciergeSummary: string;
};

export type ProactiveRecommendation = {
  id: string;
  insight: string;
  reasoning: string;
  suggestedAction: string;
  requiresApproval: boolean;
  dismissed?: boolean;
};

export type TimelineMemoryPreference = {
  id: string;
  category: string;
  preference: string;
  learnedFrom: string;
  confidencePct: number;
};

export type ExecutiveTimelineStore = {
  version: string;
  lastUpdatedAt: string;
  activeOrganizationId: TimelineOrganizationId;
  activeView: TimelineViewId;
  visibleLayerIds: TimelineLayerId[];
  selectedEventId: string | null;
  philosophy: string[];
  events: TimelineEvent[];
  morningBriefing: MorningBriefing;
  conciergeCommands: ConciergeTimelineCommand[];
  proactiveRecommendations: ProactiveRecommendation[];
  timelineMemory: TimelineMemoryPreference[];
  pendingImpact?: TimelineImpactAnalysis | null;
  conversationalInput: string;
  lastConciergeResponse?: string;
};
