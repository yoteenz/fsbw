import type { ATTENTION_MODES, COGNITIVE_FACTORS, FILTERING_ACTIONS, LOAD_STATES } from './constants';

export type CognitiveFactor = (typeof COGNITIVE_FACTORS)[number];
export type AttentionMode = (typeof ATTENTION_MODES)[number];
export type FilteringAction = (typeof FILTERING_ACTIONS)[number];
export type LoadState = (typeof LOAD_STATES)[number];

export type CognitiveFactorSnapshot = {
  factor: CognitiveFactor;
  label: string;
  demandPct: number;
  status: 'low' | 'moderate' | 'high' | 'critical';
  summary: string;
};

export type IntelligentFilterSnapshot = {
  action: FilteringAction;
  label: string;
  active: boolean;
  description: string;
};

export type AttentionModeSnapshot = {
  mode: AttentionMode;
  label: string;
  detected: boolean;
  communicationStyle: string;
};

export type ExecutiveAssistanceAction = {
  id: string;
  message: string;
  category: 'postponed' | 'batched' | 'delegated' | 'hidden' | 'summarized';
  appliedAt: string;
};

export type OrganizationFounderCognitiveLoadProfile = {
  organizationId: string;
  companyName: string;
  industryId: string;
  updatedAt: string;
  cognitiveDemandPct: number;
  focusProtectionPct: number;
  loadState: LoadState;
  activeAttentionMode: AttentionMode;
  factorSnapshots: CognitiveFactorSnapshot[];
  activeFilters: IntelligentFilterSnapshot[];
  attentionModes: AttentionModeSnapshot[];
  executiveAssistance: ExecutiveAssistanceAction[];
  dockHeadline: string;
  syncedSources: string[];
};

export type FounderCognitiveLoadStore = {
  version: string;
  profiles: OrganizationFounderCognitiveLoadProfile[];
};

export type FounderCognitiveLoadDockAdvice = {
  response: string;
  concierge: string;
  cognitiveDemandPct?: number;
  focusProtectionPct?: number;
  loadState?: LoadState;
};
