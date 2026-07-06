import type { BRIEFING_TYPES, MONITORING_CATEGORIES } from './constants';

export type MonitoringCategory = (typeof MONITORING_CATEGORIES)[number];
export type BriefingType = (typeof BRIEFING_TYPES)[number];

export type WorldKnowledgeSignal = {
  id: string;
  category: MonitoringCategory;
  headline: string;
  summary: string;
  whyItMatters: string;
  relevancePct: number;
  publishedAt: string;
  sourceLabel: string;
  impact: 'opportunity' | 'risk' | 'neutral';
  industrySpecific: boolean;
};

export type ExecutiveBriefing = {
  id: string;
  type: BriefingType;
  title: string;
  generatedAt: string;
  summary: string;
  whyItMatters: string;
  highlights: string[];
  relatedSignalIds: string[];
};

export type OrganizationWorldKnowledgeProfile = {
  organizationId: string;
  companyName: string;
  industryId: string;
  updatedAt: string;
  worldKnowledgeScore: number;
  signalsMonitored: number;
  signalsSurfaced: number;
  filteredSignals: WorldKnowledgeSignal[];
  briefings: ExecutiveBriefing[];
  industryFilterSummary: string;
  dockWorldLine: string;
  intelligentResearchPartner: true;
  syncedSources: string[];
};

export type WorldKnowledgeEngineStore = {
  version: string;
  profiles: OrganizationWorldKnowledgeProfile[];
};

export type WorldKnowledgeEngineDockAdvice = {
  response: string;
  concierge: string;
  worldKnowledgeScore?: number;
  signalsSurfaced?: number;
};
