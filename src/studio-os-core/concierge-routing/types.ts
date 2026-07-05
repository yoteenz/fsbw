import type { ConciergeRoutingId } from './constants';

export type { ConciergeRoutingId };

export type RoutingIntent =
  | 'schedule-change'
  | 'campaign-change'
  | 'content-production'
  | 'publishing-change'
  | 'personal-life'
  | 'workflow-dependency'
  | 'technology'
  | 'brand-creative'
  | 'customer-journey'
  | 'knowledge'
  | 'approval-deferral'
  | 'general';

export type RoutingUrgency = 'critical' | 'high' | 'medium' | 'low';
export type RoutingRiskLevel = 'high' | 'medium' | 'low';
export type OrganizationInference = 'explicit' | 'workspace-default' | 'portfolio-ambiguous' | 'inferred';

export type TimelineOrganizationId =
  | 'frontal-slayer'
  | 'ndxbook'
  | 'vxd-inc'
  | 'all-in-one-enterprise'
  | 'portfolio';

export type RoutingImpactPreview = {
  primaryAction: string;
  affectedEventIds: string[];
  affectedEventTitles: string[];
  affectedDependencies: string[];
  conciergesInvolved: string[];
  executivesInvolved: string[];
  risks: string[];
  recommendedAdjustments: string[];
  confidencePct: number;
  requiresFounderApproval: boolean;
  wouldCreateEvents: boolean;
  explanation?: string;
};

export type FounderCommandRoute = {
  id: string;
  rawText: string;
  intent: RoutingIntent;
  organizationId: TimelineOrganizationId | null;
  organizationInference: OrganizationInference;
  timelineLayer?: string;
  urgency: RoutingUrgency;
  affectedDates?: string[];
  affectedPeople?: string[];
  affectedProjects?: string[];
  affectedContent?: string[];
  affectedCampaigns?: string[];
  affectedApprovals?: string[];
  primaryConciergeId: ConciergeRoutingId;
  primaryConcierge: string;
  supportingConciergeIds: ConciergeRoutingId[];
  supportingConcierges: string[];
  riskLevel: RoutingRiskLevel;
  requiresFounderApproval: boolean;
  confidencePct: number;
  primaryAction: string;
  routingNote: string;
  chiefConciergeFallback: boolean;
  clarificationQuestion?: string;
  impactPreview?: RoutingImpactPreview;
  status: 'pending-approval' | 'approved' | 'adjusted' | 'cancelled' | 'applied';
  createdAt: string;
};

export type RoutingPreference = {
  id: string;
  intent: RoutingIntent;
  preferredConciergeId: ConciergeRoutingId;
  learnedFrom: string;
  confidenceBoost: number;
};

export type ConciergeTrustScore = {
  conciergeId: ConciergeRoutingId;
  trustPct: number;
  successfulRoutes: number;
};

export type ConciergeRoutingStore = {
  version: string;
  lastUpdatedAt: string;
  philosophy: string[];
  routingPreferences: RoutingPreference[];
  conciergeTrust: ConciergeTrustScore[];
  commandHistory: FounderCommandRoute[];
  pendingRoute: FounderCommandRoute | null;
  lastRoutingNote?: string;
  universalCommandInput: string;
};

export type RouteCommandContext = {
  workspaceId: string;
  activeOrganizationId?: TimelineOrganizationId;
  events?: Array<{
    id: string;
    title: string;
    organizationId: string;
    layerId: string;
    priority: string;
    assignedConcierge?: string;
    assignedExecutive?: string;
    relatedProjects: string[];
    relatedContent: string[];
    blocks: string[];
    dependencies: Array<{ label: string; category: string }>;
  }>;
  selectedEventId?: string | null;
};
