import type { GETTING_STARTED_PHASES } from './constants';

export type GettingStartedPhase = (typeof GETTING_STARTED_PHASES)[number];

export type DocumentationSystemEntry = {
  id: string;
  label: string;
  moduleId?: string;
  docPath: string;
  milestone?: string;
  purpose: string;
  overview: string;
  capabilities: string[];
  howItWorks: string;
  whenUsed: string[];
  relatedSystems: string[];
  exampleWorkflows: string[];
  aliases: string[];
  searchKeywords: string[];
  route?: string;
};

export type SemanticSearchCluster = {
  id: string;
  triggers: string[];
  relatedSystemIds: string[];
  naturalLanguageQuestions: string[];
};

export type DocumentationFaqEntry = {
  id: string;
  question: string;
  answer: string;
  relatedSystemIds: string[];
  moduleId?: string;
  category: 'getting-started' | 'intelligence' | 'operations' | 'trust' | 'legacy' | 'general';
};

export type GettingStartedStep = {
  phase: GettingStartedPhase;
  title: string;
  summary: string;
  moduleId?: string;
  routeSegment?: string;
  unlockAfterPhases: GettingStartedPhase[];
  order: number;
};

export type DocumentationSyncSurface = {
  surface: 'manual' | 'search' | 'walkthrough' | 'help-center' | 'faq' | 'graph' | 'contextual-help';
  synced: boolean;
  systemCount: number;
  lastSyncedAt: string;
};

export type OrganizationDocumentationSyncProfile = {
  organizationId: string;
  companyName: string;
  updatedAt: string;
  syncScore: number;
  systemsDocumented: number;
  surfaces: DocumentationSyncSurface[];
  gettingStartedProgressPct: number;
  searchClusters: number;
  faqEntries: number;
  dockDocumentationLine: string;
  selfUpdatingReady: true;
  syncedSources: string[];
};

export type DocumentationSyncStore = {
  version: string;
  profiles: OrganizationDocumentationSyncProfile[];
};

export type DocumentationSyncDockAdvice = {
  response: string;
  concierge: string;
  syncScore?: number;
};
