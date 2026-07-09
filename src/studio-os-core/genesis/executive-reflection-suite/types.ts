import type {
  ErsHealthLens,
  ErsLessonCategory,
  ErsRoomPath,
  ErsSessionType,
} from './constants';

export type ErsHealthReading = {
  lens: ErsHealthLens;
  score: number;
  trend: 'up' | 'down' | 'flat';
  summary: string;
  evidence: string[];
  evaluatedAt: string;
};

export type ErsVictoryArtifact = {
  artifactId: string;
  title: string;
  category: 'launch' | 'product' | 'campaign' | 'customer' | 'award' | 'milestone' | 'platform' | 'knowledge' | 'architecture';
  narrative: string;
  impact: string;
  date: string;
  evidence: string[];
};

export type ErsLessonArtifact = {
  lessonId: string;
  title: string;
  category: ErsLessonCategory;
  context: string;
  whatHappened: string;
  whatWorked: string;
  whatFailed: string;
  recommendation: string;
  confidence: number;
  recordedAt: string;
  relatedSystems: string[];
};

export type ErsFailureStudy = {
  studyId: string;
  title: string;
  assumption: string;
  whatHappened: string;
  lessonExtracted: string;
  shameRemoved: boolean;
  recordedAt: string;
};

export type ErsInnovationIdea = {
  ideaId: string;
  title: string;
  problem: string;
  opportunity: string;
  evidence: string[];
  confidence: number;
  status: 'spark' | 'researching' | 'validating' | 'approved' | 'archived';
};

export type ErsDecisionTimelineEntry = {
  entryId: string;
  title: string;
  decisionClass: 'operational' | 'strategic' | 'constitutional' | 'genesis';
  rationale: string;
  outcome?: string;
  agedWell?: boolean;
  decidedAt: string;
  reviewDate?: string;
};

export type ErsBoardroomPacket = {
  packetId: string;
  title: string;
  decisionClass: string;
  evidence: string[];
  tradeoffs: string[];
  precedents: string[];
  alternativePaths: string[];
  risks: string[];
  benefits: string[];
  longTermImplications: string[];
  dissentingArgument: string;
  founderJudgmentQuestions: string[];
  status: 'draft' | 'presented' | 'decided' | 'archived';
  createdAt: string;
};

export type ErsFutureScenario = {
  scenarioId: string;
  title: string;
  mode: 'road-ahead' | 'bold-future' | 'risk-future' | 'quiet-future' | 'founder-future' | 'genesis-future';
  narrative: string;
  assumptions: string[];
  confidence: number;
  recommendations: string[];
};

export type ErsOpportunitySignal = {
  signalId: string;
  title: string;
  category: string;
  description: string;
  evidence: string[];
  confidence: number;
  timingWindow: string;
  priority: 'high' | 'medium' | 'low';
};

export type ErsDelightMoment = {
  momentId: string;
  roomPath: ErsRoomPath;
  title: string;
  emotionalTags: string[];
  memorable: boolean;
  recordedAt: string;
};

export type ErsExecutiveSession = {
  sessionId: string;
  sessionType: ErsSessionType;
  roomPath: ErsRoomPath;
  status: 'scheduled' | 'in-progress' | 'completed' | 'archived';
  startedAt?: string;
  completedAt?: string;
  orbPresentationMode: boolean;
  outputs?: ErsSessionOutputs;
};

export type ErsSessionOutputs = {
  executiveSummary: string;
  founderReflections: string[];
  strategicPriorities: string[];
  missionRecommendations: string[];
  knowledgeUpdates: string[];
  genesisImprovementProposals: string[];
  futureOpportunities: string[];
  decisionLog: string[];
  historicalArchiveRef?: string;
};

export type ErsSummitCapsule = {
  capsuleId: string;
  yearLabel: string;
  originalVision: string;
  yearStory: string;
  milestones: string[];
  lessons: string[];
  breakthroughs: string[];
  genesisEvolution: string;
  platformEvolution: string;
  founderEvolution: string;
  futureVision: string;
  nextChapterInvitation: string;
  sealedAt?: string;
};

export type ErsRetreatPacket = {
  packetId: string;
  quarterLabel: string;
  strategicTheme: string;
  strategicBets: string[];
  stoppedItems: string[];
  founderHealthCommitment: string;
  knowledgeGoal: string;
  generatedAt: string;
};

export type ErsStore = {
  version: string;
  sessions: ErsExecutiveSession[];
  archivedSessions: ErsExecutiveSession[];
  victories: ErsVictoryArtifact[];
  lessons: ErsLessonArtifact[];
  failureStudies: ErsFailureStudy[];
  innovationIdeas: ErsInnovationIdea[];
  decisionTimeline: ErsDecisionTimelineEntry[];
  boardroomPackets: ErsBoardroomPacket[];
  futureScenarios: ErsFutureScenario[];
  opportunitySignals: ErsOpportunitySignal[];
  delightMoments: ErsDelightMoment[];
  summitCapsules: ErsSummitCapsule[];
  retreatPackets: ErsRetreatPacket[];
  activeSessionId?: string;
  lastOpenedAt?: string;
  seededAt?: string;
  bootstrappedAt?: string;
};

export type ErsPlatformStats = {
  sessionCount: number;
  victoryCount: number;
  lessonCount: number;
  opportunityCount: number;
  boardroomPacketCount: number;
  executiveHealthScore: number;
  delightScore: number;
  launchStackHealth: number;
};

export type ErsReadyView = {
  activeRoom: ErsRoomPath;
  activeSession: ErsExecutiveSession | null;
  stats: ErsPlatformStats;
  healthReadings: ErsHealthReading[];
  victories: ErsVictoryArtifact[];
  lessons: ErsLessonArtifact[];
  failureStudies: ErsFailureStudy[];
  innovationIdeas: ErsInnovationIdea[];
  decisionTimeline: ErsDecisionTimelineEntry[];
  boardroomPackets: ErsBoardroomPacket[];
  futureScenarios: ErsFutureScenario[];
  opportunitySignals: ErsOpportunitySignal[];
  delightMoments: ErsDelightMoment[];
  summitCapsule: ErsSummitCapsule | null;
  retreatPacket: ErsRetreatPacket | null;
  founderDiaryPrompts: import('../live-validation-system/types').LvsDiaryPrompt[];
  founderDiaryAnswers: import('../live-validation-system/types').LvsDiaryAnswer[];
  escapePatterns: import('../live-validation-system/types').LvsEscapePattern[];
  genesisProposals: import('../live-validation-system/types').LvsGenesisImprovementProposal[];
  launchStackProgress: import('../evolution-room/types').ErLaunchStackProgressItem[];
  founderTimeline: import('../evolution-room/types').ErFounderTimelineEntry[];
  legacyTimeline: import('../evolution-room/types').ErLegacyTimelineEntry[];
  councilAgenda: import('../evolution-room/types').ErCouncilAgendaItem[];
  evolutionBrief: import('../evolution-room/types').ErExecutiveEvolutionBrief | null;
  withdrawalTests: { systemId: string; officialName: string; indispensable: boolean; score: number }[];
  replacementTests: { systemId: string; officialName: string; replaced: boolean; remainingDependencies: string[] }[];
};

export type ErsRuntimeInput = {
  pathname?: string;
  founderDisplayName?: string;
  companyName?: string;
};
