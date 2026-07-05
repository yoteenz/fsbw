/** Organizational Governance & Safeguards V1.0 — constitutional stewardship (Milestone 71). */

export type OrganizationalGovernanceSafeguardsWorkspaceId = 'ndxbook' | 'frontal-slayer' | 'studio-os' | 'portfolio';

export type ConstitutionalElement = {
  id: string;
  element: string;
  source: string;
  status: 'active' | 'evolving' | 'foundational';
};

export type GovernancePolicy = {
  id: string;
  domain: string;
  policy: string;
  status: 'active' | 'draft' | 'review';
};

export type DecisionSafeguard = {
  id: string;
  decision: string;
  approvalStatus: 'approved' | 'pending' | 'escalated' | 'blocked';
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  recommendedAction: string;
  evaluations: string[];
};

export type ExecutiveSafeguard = {
  id: string;
  executive: string;
  discipline: string;
  protects: string;
  currentStatus: string;
};

export type EthicalPrinciple = {
  id: string;
  category: string;
  principle: string;
};

export type RiskIntelligence = {
  id: string;
  riskType: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  preventativeAction: string;
};

export type GovernanceSimulation = {
  id: string;
  decision: string;
  legalImplications: string;
  ethicalImplications: string;
  organizationalImpact: string;
  customerImpact: string;
  brandImplications: string;
  futureScenarios: string;
  confidence: number;
};

export type ApprovalLevel = {
  id: string;
  action: string;
  level: string;
  autoEscalate: boolean;
};

export type GovernanceTransparency = {
  id: string;
  action: string;
  reasoning: string;
  executives: string[];
  approvalPathway: string;
  policiesReferenced: string[];
  expectedOutcome: string;
  actualOutcome?: string;
};

export type ContinuousGovernance = {
  id: string;
  learningSource: string;
  evolution: string;
  principlesPreserved: boolean;
};

export type OrganizationalGovernanceSafeguardsStore = {
  version: string;
  lastUpdatedAt: string;
  activeWorkspaceId: OrganizationalGovernanceSafeguardsWorkspaceId;
  companyName: string;
  dashboard: {
    summary: string;
    organizationalTrustPct: number;
    policyHealthPct: number;
    activeSafeguards: number;
    pendingApprovals: number;
    riskAlerts: number;
    organizationalResiliencePct: number;
  };
  governancePhilosophy: string[];
  constitutionalElements: ConstitutionalElement[];
  governancePolicies: GovernancePolicy[];
  decisionSafeguards: DecisionSafeguard[];
  executiveSafeguards: ExecutiveSafeguard[];
  ethicalPrinciples: EthicalPrinciple[];
  riskIntelligence: RiskIntelligence[];
  governanceSimulations: GovernanceSimulation[];
  approvalLevels: ApprovalLevel[];
  governanceTransparency: GovernanceTransparency[];
  continuousGovernance: ContinuousGovernance[];
  recommendedNextSteps: string[];
  futureOpportunities: string[];
};
