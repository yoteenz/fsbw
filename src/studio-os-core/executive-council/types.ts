/** Executive Council V2.0 — highest collaborative leadership body (Milestone 65). */

export type ExecutiveCouncilWorkspaceId = 'ndxbook' | 'frontal-slayer' | 'studio-os' | 'portfolio';

export type CouncilChamberElement = {
  id: string;
  element: string;
  description: string;
  location: string;
};

export type CouncilReviewItem = {
  id: string;
  topic: string;
  category: string;
  status: 'pending' | 'in-session' | 'decided' | 'deferred';
  elevatedAt: string;
};

export type ExecutiveDebateContribution = {
  id: string;
  executive: string;
  discipline: string;
  perspective: string;
  evidence: string;
  concerns: string;
  opportunities: string;
  risks: string;
  alternative: string;
  confidence: number;
  stance: 'support' | 'caution' | 'oppose' | 'neutral';
};

export type HealthyDisagreement = {
  id: string;
  executives: string;
  topic: string;
  disagreement: string;
  outcome: string;
};

export type CosFacilitationItem = {
  id: string;
  responsibility: string;
  status: 'active' | 'complete';
  detail: string;
};

export type DecisionSynthesis = {
  id: string;
  topic: string;
  executiveSummary: string;
  majorAgreements: string[];
  majorDisagreements: string[];
  tradeoffs: string[];
  organizationalRisks: string[];
  organizationalOpportunities: string[];
  alternativePaths: string[];
  recommendedDecision: string;
  confidence: number;
  reasoning: string;
};

export type ExecutiveTransparencyRecord = {
  id: string;
  executive: string;
  reasoning: string;
  evidence: string;
  historicalComparison: string;
  confidence: number;
};

export type CouncilMeetingMode = {
  id: string;
  mode: string;
  description: string;
  typicalParticipants: string[];
};

export type CouncilSimulation = {
  id: string;
  scenario: string;
  status: 'scheduled' | 'in-progress' | 'complete';
  viewpoints: number;
  bestCase: string;
  worstCase: string;
  confidence: number;
};

export type OrganizationalLearningEntry = {
  id: string;
  destination: string;
  contribution: string;
  date: string;
};

export type FounderParticipationOption = {
  id: string;
  action: string;
  description: string;
};

export type CouncilIntelligenceRec = {
  id: string;
  category: string;
  recommendation: string;
  priority: 'low' | 'medium' | 'high';
};

export type ExecutiveCouncilStore = {
  version: string;
  lastUpdatedAt: string;
  activeWorkspaceId: ExecutiveCouncilWorkspaceId;
  companyName: string;
  dashboard: {
    summary: string;
    councilHealthPct: number;
    activeSessions: number;
    pendingDecisions: number;
    healthyDisagreements: number;
    simulationsScheduled: number;
    organizationalWisdomPct: number;
  };
  councilPhilosophy: string[];
  executiveCouncilOath: string[];
  leadershipCulture: string[];
  councilChamber: CouncilChamberElement[];
  councilResponsibilities: CouncilReviewItem[];
  executiveDebate: ExecutiveDebateContribution[];
  healthyDisagreements: HealthyDisagreement[];
  cosFacilitation: CosFacilitationItem[];
  decisionSynthesis: DecisionSynthesis[];
  executiveTransparency: ExecutiveTransparencyRecord[];
  meetingModes: CouncilMeetingMode[];
  councilSimulations: CouncilSimulation[];
  organizationalLearning: OrganizationalLearningEntry[];
  founderParticipation: FounderParticipationOption[];
  councilIntelligence: CouncilIntelligenceRec[];
  recommendedNextSteps: string[];
  futureOpportunities: string[];
};
