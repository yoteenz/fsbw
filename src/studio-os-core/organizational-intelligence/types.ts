/** Organizational Intelligence V1.0 — collective mind of the company (Milestone 66). */

export type OrganizationalIntelligenceWorkspaceId = 'ndxbook' | 'frontal-slayer' | 'studio-os' | 'portfolio';

export type ObservedEvent = {
  id: string;
  source: string;
  event: string;
  category: string;
  capturedAt: string;
};

export type OrganizationalReasoningItem = {
  id: string;
  question: string;
  answer: string;
  confidence: number;
};

export type CrossSystemInsight = {
  id: string;
  fromSystem: string;
  toSystem: string;
  insight: string;
};

export type CuriosityQuestion = {
  id: string;
  question: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
};

export type DecisionIntelligenceBrief = {
  id: string;
  decision: string;
  historicalContext: string;
  evidence: string;
  alternatives: string;
  tradeoffs: string;
  confidence: number;
  longTermImpact: string;
};

export type OrganizationalReflection = {
  id: string;
  period: 'weekly' | 'monthly' | 'quarterly' | 'annual';
  title: string;
  lessons: string[];
  breakthroughs: string[];
  mistakes: string[];
  priorities: string[];
};

export type WisdomElevation = {
  id: string;
  level: 'information' | 'knowledge' | 'understanding' | 'wisdom';
  example: string;
  context: string;
};

export type InstitutionalMemoryEntry = {
  id: string;
  category: string;
  memory: string;
  preservedAt: string;
};

export type OrganizationalForecast = {
  id: string;
  dimension: string;
  prediction: string;
  confidence: number;
  uncertainty: string;
};

export type IntelligenceCenterElement = {
  id: string;
  element: string;
  description: string;
  location: string;
};

export type ExecutiveIntegrationSupport = {
  id: string;
  executive: string;
  support: string;
  insight: string;
};

export type FounderIntelligenceItem = {
  id: string;
  question: string;
  insight: string;
};

export type OrganizationalIntelligenceStore = {
  version: string;
  lastUpdatedAt: string;
  activeWorkspaceId: OrganizationalIntelligenceWorkspaceId;
  companyName: string;
  dashboard: {
    summary: string;
    wisdomPct: number;
    learningVelocityPct: number;
    knowledgeMaturityPct: number;
    eventsObserved: number;
    activeQuestions: number;
    forecastsActive: number;
    memoryEntries: number;
  };
  intelligencePhilosophy: string[];
  continuousLearning: ObservedEvent[];
  organizationalReasoning: OrganizationalReasoningItem[];
  crossSystemIntelligence: CrossSystemInsight[];
  organizationalCuriosity: CuriosityQuestion[];
  decisionIntelligence: DecisionIntelligenceBrief[];
  organizationalReflection: OrganizationalReflection[];
  organizationalWisdom: WisdomElevation[];
  institutionalMemory: InstitutionalMemoryEntry[];
  organizationalForecasting: OrganizationalForecast[];
  intelligenceCenter: IntelligenceCenterElement[];
  executiveIntegration: ExecutiveIntegrationSupport[];
  founderIntelligence: FounderIntelligenceItem[];
  recommendedNextSteps: string[];
  futureOpportunities: string[];
};
