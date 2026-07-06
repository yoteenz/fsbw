import type {
  HISTORY_DEPARTMENTS,
  HISTORY_EVENT_TYPES,
  HISTORY_INSIGHT_PATTERNS,
} from './history-constants';

export type ExecutiveHistoryEventType = (typeof HISTORY_EVENT_TYPES)[number];
export type ExecutiveHistoryDepartment = (typeof HISTORY_DEPARTMENTS)[number];
export type TimelineInsightPattern = (typeof HISTORY_INSIGHT_PATTERNS)[number];

export type ExecutiveHistoryEvent = {
  id: string;
  type: ExecutiveHistoryEventType;
  title: string;
  summary: string;
  occurredAt: string;
  year: number;
  department: ExecutiveHistoryDepartment;
  projectId?: string;
  organizationId: string;
  sourceModule: string;
  significance: 'foundational' | 'major' | 'notable' | 'incremental';
  archivedHeadquarters?: boolean;
  historicalDashboardAvailable?: boolean;
  metrics?: { label: string; value: string }[];
};

export type TimelineInsight = {
  id: string;
  pattern: TimelineInsightPattern;
  headline: string;
  narrative: string;
  relatedEventIds: string[];
  yearRange?: string;
  actionable: true;
  confidencePct: number;
};

export type YearSnapshot = {
  year: number;
  eventCount: number;
  majorEventCount: number;
  departmentsActive: ExecutiveHistoryDepartment[];
  growthIndex: number;
  headline: string;
};

export type GrowthComparisonPoint = {
  year: number;
  eventsRecorded: number;
  knowledgeScore: number;
  healthScore: number;
  revenueIndex: number;
};

export type HistoryFilterState = {
  department: ExecutiveHistoryDepartment | 'all';
  projectId: string | 'all';
  organizationId: string | 'all';
  yearFrom: number | null;
  yearTo: number | null;
  eventType: ExecutiveHistoryEventType | 'all';
};

export type OrganizationExecutiveHistoryProfile = {
  organizationId: string;
  companyName: string;
  industryId: string;
  updatedAt: string;
  foundedAt: string;
  historyDepthScore: number;
  totalEvents: number;
  yearsSpan: number;
  events: ExecutiveHistoryEvent[];
  timelineInsights: TimelineInsight[];
  yearSnapshots: YearSnapshot[];
  growthComparison: GrowthComparisonPoint[];
  dockHistoryLine: string;
  anniversaryContext?: string;
  replayAvailable: true;
  syncedSources: string[];
};

export type ExecutiveTimelineHistoryStore = {
  version: string;
  profiles: OrganizationExecutiveHistoryProfile[];
};

export type ExecutiveTimelineHistoryDockAdvice = {
  response: string;
  concierge: string;
  historyDepthScore?: number;
  totalEvents?: number;
};
