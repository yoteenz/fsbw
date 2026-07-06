import type { EVENT_BUS_PHILOSOPHY, EVENT_DOMAINS, STANDARD_EVENT_VERBS } from './constants';

export type StandardEventVerb = (typeof STANDARD_EVENT_VERBS)[number];
export type EventDomain = (typeof EVENT_DOMAINS)[number];
export type EventBusPhilosophyLine = (typeof EVENT_BUS_PHILOSOPHY)[number];

export type EventTypeDefinition = {
  eventTypeId: string;
  name: string;
  verb: StandardEventVerb;
  domain: EventDomain;
  description: string;
  payloadSchema: string;
  publishers: string[];
  subscribers: string[];
  platformStandard: boolean;
};

export type EventSubscription = {
  subscriptionId: string;
  subscriberSystem: string;
  eventTypeId: string;
  reaction: string;
  latencyMs: number;
  enabled: boolean;
};

export type EventHistoryEntry = {
  eventId: string;
  eventTypeId: string;
  name: string;
  verb: StandardEventVerb;
  domain: EventDomain;
  publishedAt: string;
  publisher: string;
  payloadSummary: string;
  status: 'delivered' | 'partial' | 'failed';
  latencyMs: number;
  subscriberCount: number;
  chainId?: string;
  replayable: boolean;
};

export type EventChainLink = {
  order: number;
  systemId: string;
  systemLabel: string;
  reaction: string;
  latencyMs: number;
};

export type EventChain = {
  chainId: string;
  triggerEvent: string;
  description: string;
  links: EventChainLink[];
  totalLatencyMs: number;
};

export type EventInspectorMetric = {
  id: string;
  label: string;
  value: string;
  status: 'healthy' | 'warning' | 'critical';
};

export type EventBusGovernanceFinding = {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  systemId?: string;
  message: string;
  recommendation: string;
};

export type EventBusHealthMetric = {
  id: string;
  label: string;
  scorePct: number;
  detail: string;
  status: 'healthy' | 'warning' | 'critical';
};

export type OrganizationEventBusProfile = {
  organizationId: string;
  companyName: string;
  updatedAt: string;
  busScore: number;
  totalEventTypes: number;
  totalSubscriptions: number;
  domainCounts: Record<string, number>;
  eventTypes: EventTypeDefinition[];
  subscriptions: EventSubscription[];
  eventHistory: EventHistoryEntry[];
  eventChains: EventChain[];
  inspectorMetrics: EventInspectorMetric[];
  governanceFindings: EventBusGovernanceFinding[];
  healthMetrics: EventBusHealthMetric[];
  avgLatencyMs: number;
  dockBusLine: string;
  looselyCoupled: true;
  lastSyncedAt: string;
};

export type EventBusStore = {
  version: string;
  profiles: OrganizationEventBusProfile[];
};

export type EventBusDockAdvice = {
  response: string;
  concierge: string;
  busScore?: number;
};

export type EventSearchHit = {
  entry: EventTypeDefinition;
  score: number;
  matchReason: string;
};

export type PublishEventInput = {
  eventTypeId: string;
  publisher: string;
  payloadSummary?: string;
  payload?: Record<string, unknown>;
};

export type EventInspectorFilter = {
  domain?: EventDomain;
  verb?: StandardEventVerb;
  status?: EventHistoryEntry['status'];
  publisher?: string;
  query?: string;
};
