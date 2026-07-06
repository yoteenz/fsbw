import type { AWARENESS_LAYERS } from './constants';

export type AwarenessLayer = (typeof AWARENESS_LAYERS)[number];

export type AwarenessLayerSnapshot = {
  layer: AwarenessLayer;
  label: string;
  summary: string;
  status: 'active' | 'stable' | 'attention';
  confidencePct: number;
};

export type DepartmentAwarenessSnapshot = {
  departmentId: string;
  departmentName: string;
  currentFocus: string;
  collaboratingWith: string[];
  momentum: 'rising' | 'steady' | 'strained';
};

export type IntelligentContextSnapshot = {
  activeOrganization: string;
  founderFocus: string;
  recentConversationTheme: string;
  waitingProjects: string[];
  unresolvedDecisions: string[];
  shouldAskQuestions: false;
};

export type DailyExecutiveBriefing = {
  id: string;
  generatedAt: string;
  greeting: string;
  briefingLines: string[];
  topPriority: string;
  fullBriefing: string;
};

export type OrganizationAmbientAwarenessProfile = {
  organizationId: string;
  companyName: string;
  industryId: string;
  updatedAt: string;
  awarenessScore: number;
  presentNotReactive: true;
  dailyBriefing: DailyExecutiveBriefing;
  layerSnapshots: AwarenessLayerSnapshot[];
  departmentSnapshots: DepartmentAwarenessSnapshot[];
  intelligentContext: IntelligentContextSnapshot;
  syncedSources: string[];
};

export type AmbientAwarenessStore = {
  version: string;
  profiles: OrganizationAmbientAwarenessProfile[];
};

export type AmbientAwarenessDockAdvice = {
  response: string;
  concierge: string;
  briefing?: DailyExecutiveBriefing;
  awarenessScore?: number;
};
