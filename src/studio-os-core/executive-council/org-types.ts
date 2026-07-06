/** Milestone 99 — Executive Council™ V2.0 org-scoped collaborative leadership types. */

export type DigitalExecutiveSource = 'core' | 'department-pack';

export type DigitalExecutive = {
  id: string;
  name: string;
  title: string;
  department: string;
  focus: string;
  source: DigitalExecutiveSource;
  packId?: string;
  active: boolean;
};

export type ExecutiveContribution = {
  id: string;
  executiveId: string;
  executiveName: string;
  department: string;
  analysis: string;
  evidence: string[];
  concerns: string[];
  opportunities: string[];
  confidencePct: number;
  stance: 'support' | 'caution' | 'oppose' | 'neutral';
};

export type ExecutiveBriefing = {
  id: string;
  query: string;
  createdAt: string;
  summary: string;
  recommendations: string[];
  risks: string[];
  tradeoffs: string[];
  departmentsAffected: string[];
  expectedOutcomes: string[];
  confidenceLevels: { area: string; confidencePct: number }[];
  actionPlan: string[];
  participants: string[];
  chiefConciergeSummary: string;
  contributions: ExecutiveContribution[];
};

export type CouncilDecisionRecord = {
  id: string;
  decision: string;
  reasoning: string;
  participants: string[];
  outcome: 'pending' | 'approved' | 'declined' | 'deferred';
  lessonsLearned: string[];
  briefingId: string;
  query: string;
  recordedAt: string;
  resolvedAt?: string;
};

export type OrganizationExecutiveCouncilProfile = {
  organizationId: string;
  companyName: string;
  industryId: string;
  updatedAt: string;
  councilHealthPct: number;
  activeExecutives: number;
  pendingDecisions: number;
  meetingsHeld: number;
  digitalExecutives: DigitalExecutive[];
  latestBriefing: ExecutiveBriefing | null;
  decisionHistory: CouncilDecisionRecord[];
  syncedSources: string[];
};

export type ExecutiveCouncilOrgStore = {
  version: string;
  profiles: OrganizationExecutiveCouncilProfile[];
};

export type ExecutiveCouncilDockAdvice = {
  response: string;
  concierge: string;
  briefing?: ExecutiveBriefing;
  participantCount?: number;
};

export type CouncilMeetingResult = {
  briefing: ExecutiveBriefing;
  decisionRecord: CouncilDecisionRecord;
};
