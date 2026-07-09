import type {
  ErDecisionStatus,
  ErFutureCategory,
  ErLegacyCategory,
  ErMeetingStage,
  ErRoomPath,
  ErSessionStatus,
} from './constants';

export type ErBriefSection = {
  sectionId: string;
  title: string;
  headline: string;
  evidence: string[];
  interpretation: string;
  recommendation: string;
  uncertainty?: string;
  founderDecisionNeeded: boolean;
  sourceSystems: string[];
};

export type ErExecutiveEvolutionBrief = {
  briefId: string;
  monthLabel: string;
  generatedAt: string;
  orbGreeting: string;
  sections: ErBriefSection[];
  executiveSummary: string;
};

export type ErFounderTimelineEntry = {
  entryId: string;
  date: string;
  title: string;
  category: 'decision' | 'habit' | 'reflection' | 'milestone' | 'stress' | 'focus';
  summary: string;
  evidence: string[];
  sentiment: 'positive' | 'neutral' | 'concern';
};

export type ErLaunchStackProgressItem = {
  systemId: string;
  officialName: string;
  status: string;
  progressPercent: number;
  validationLevel: string;
  blockedReason?: string;
  nextAction: string;
};

export type ErGenesisProposalQueueItem = {
  proposalId: string;
  title: string;
  status: string;
  signalSummary: string;
  evidenceQuality: string;
  proposedGenesisChange: string;
  systemIds: string[];
  createdAt: string;
};

export type ErLegacyTimelineEntry = {
  entryId: string;
  date: string;
  title: string;
  category: ErLegacyCategory;
  narrative: string;
  preservedBy?: string;
  sessionId?: string;
};

export type ErFutureOpportunity = {
  opportunityId: string;
  title: string;
  category: ErFutureCategory;
  description: string;
  evidence: string[];
  confidence: number;
  priority: 'high' | 'medium' | 'low';
  suggestedMonth?: string;
};

export type ErAutomationSuggestion = {
  suggestionId: string;
  title: string;
  repeatedTask: string;
  estimatedMinutesSaved: number;
  confidence: number;
  riskLevel: 'low' | 'medium' | 'high';
  approvalRequired: boolean;
};

export type ErStrategicPriority = {
  priorityId: string;
  title: string;
  rationale: string;
  sourceStage: ErMeetingStage;
  status: ErDecisionStatus;
  targetMonth: string;
};

export type ErCouncilAgendaItem = {
  agendaId: string;
  topic: string;
  orbPosition: string;
  evidence: string[];
  founderNotes?: string;
  recommendation: string;
  status: ErDecisionStatus;
};

export type ErFounderDecision = {
  decisionId: string;
  title: string;
  evidenceCited: string[];
  founderRationale?: string;
  systemsAffected: string[];
  genesisImpact: string;
  nextAction: string;
  reviewDate?: string;
  canonStatus: 'none' | 'proposal' | 'accepted-later';
  status: ErDecisionStatus;
  decidedAt?: string;
};

export type ErActionItem = {
  actionId: string;
  title: string;
  owner: 'founder' | 'orb' | 'studio-os';
  dueHint: string;
  source: string;
  completed: boolean;
};

export type ErKnowledgeUpdate = {
  updateId: string;
  title: string;
  kind: 'new-artifact' | 'stale-knowledge' | 'retrieval-gap' | 'brain-growth';
  summary: string;
  suggestedAction: string;
};

export type ErMissionRecommendation = {
  recommendationId: string;
  title: string;
  missionTheme: string;
  rationale: string;
  confidence: number;
};

export type ErSessionOutputs = {
  executiveSummary: string;
  actionItems: ErActionItem[];
  genesisImprovementProposals: string[];
  missionRecommendations: ErMissionRecommendation[];
  knowledgeUpdates: ErKnowledgeUpdate[];
  futureLaunchStackSuggestions: string[];
};

export type ErEvolutionSession = {
  sessionId: string;
  monthLabel: string;
  status: ErSessionStatus;
  currentStage: ErMeetingStage;
  startedAt?: string;
  completedAt?: string;
  archivedAt?: string;
  brief?: ErExecutiveEvolutionBrief;
  councilAgenda: ErCouncilAgendaItem[];
  founderDecisions: ErFounderDecision[];
  outputs?: ErSessionOutputs;
  orbPresentationMode: boolean;
};

export type ErArchivedSession = {
  archiveId: string;
  sessionId: string;
  monthLabel: string;
  sealedAt: string;
  executiveSummary: string;
  decisionCount: number;
  legacyEntriesAdded: number;
  futureItemsAdded: number;
};

export type ErStore = {
  version: string;
  sessions: ErEvolutionSession[];
  archivedSessions: ErArchivedSession[];
  legacyWall: ErLegacyTimelineEntry[];
  futureWall: ErFutureOpportunity[];
  founderTimeline: ErFounderTimelineEntry[];
  strategicPriorities: ErStrategicPriority[];
  automationSuggestions: ErAutomationSuggestion[];
  activeSessionId?: string;
  lastOpenedAt?: string;
  seededAt?: string;
  bootstrappedAt?: string;
};

export type ErPlatformStats = {
  sessionCount: number;
  archivedSessionCount: number;
  legacyEntryCount: number;
  futureOpportunityCount: number;
  queuedGenesisProposals: number;
  launchStackProgressPercent: number;
  strategicPriorityCount: number;
  automationSuggestionCount: number;
  currentMonthLabel: string;
};

export type ErReadyView = {
  activeRoom: ErRoomPath;
  activeSession: ErEvolutionSession | null;
  stats: ErPlatformStats;
  brief: ErExecutiveEvolutionBrief | null;
  founderTimeline: ErFounderTimelineEntry[];
  launchStackProgress: ErLaunchStackProgressItem[];
  genesisProposalQueue: ErGenesisProposalQueueItem[];
  legacyTimeline: ErLegacyTimelineEntry[];
  futureOpportunities: ErFutureOpportunity[];
  automationSuggestions: ErAutomationSuggestion[];
  strategicPriorities: ErStrategicPriority[];
  councilAgenda: ErCouncilAgendaItem[];
  meetingStages: ErMeetingStage[];
  archivedSessions: ErArchivedSession[];
};

export type ErRuntimeInput = {
  pathname?: string;
  founderDisplayName?: string;
  companyName?: string;
};
