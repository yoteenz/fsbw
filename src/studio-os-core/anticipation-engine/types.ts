import type { ANTICIPATION_CATEGORIES, PREPARATION_TYPES } from './constants';

export type AnticipationCategory = (typeof ANTICIPATION_CATEGORIES)[number];
export type PreparationType = (typeof PREPARATION_TYPES)[number];

export type AnticipationItem = {
  id: string;
  category: AnticipationCategory;
  label: string;
  summary: string;
  urgency: 'critical' | 'high' | 'medium' | 'low';
  predictedWindow: string;
  confidencePct: number;
};

export type ProactivePreparation = {
  id: string;
  type: PreparationType;
  title: string;
  description: string;
  status: 'awaiting-approval';
  preparedAt: string;
  relatedAnticipationId?: string;
};

export type OrganizationalPattern = {
  id: string;
  pattern: string;
  insight: string;
  preparationAction: string;
  confidencePct: number;
};

export type OrganizationAnticipationProfile = {
  organizationId: string;
  companyName: string;
  industryId: string;
  updatedAt: string;
  anticipationScore: number;
  anticipationsIdentified: number;
  preparationsReady: number;
  anticipationItems: AnticipationItem[];
  proactivePreparations: ProactivePreparation[];
  organizationalPatterns: OrganizationalPattern[];
  dockHeadline: string;
  syncedSources: string[];
};

export type AnticipationEngineStore = {
  version: string;
  profiles: OrganizationAnticipationProfile[];
};

export type AnticipationEngineDockAdvice = {
  response: string;
  concierge: string;
  preparationsReady?: number;
  anticipationScore?: number;
};
