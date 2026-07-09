/**
 * Business Discovery™ — Studio OS signature onboarding architecture.
 *
 * Not a setup wizard. A premium strategy session that produces the Company's Genome™.
 */

export type BusinessDiscoveryPhaseId =
  | 'founder-discovery'
  | 'company-discovery'
  | 'relationship-discovery'
  | 'knowledge-discovery'
  | 'business-genome'
  | 'headquarters-generation';

export type BusinessDiscoveryQuestion = {
  id: string;
  prompt: string;
  intent: string;
};

export type BusinessDiscoveryPhaseDefinition = {
  id: BusinessDiscoveryPhaseId;
  number: number;
  title: string;
  purpose: string;
  questionsAsked: BusinessDiscoveryQuestion[];
  informationCollected: string[];
  objectsCreated: string[];
  systemsUpdated: string[];
  aiReasoning: string[];
  founderExperience: string;
  visualExperience: string;
  successCriteria: string[];
  orbRole: string;
  founderMoments: string[];
};

export type BusinessGenomeOutput = {
  id: string;
  title: string;
  description: string;
  sourcePhaseIds: BusinessDiscoveryPhaseId[];
  powersSystems: string[];
};

export type HeadquartersGenerationProposal = {
  id: string;
  title: string;
  description: string;
  genomeInputs: string[];
  createdSystems: string[];
};

export type BusinessDiscoveryArchitecture = {
  id: 'business-discovery';
  title: 'Business Discovery™';
  mission: string;
  objective: string;
  phases: BusinessDiscoveryPhaseDefinition[];
  genomeOutputs: BusinessGenomeOutput[];
  headquartersProposals: HeadquartersGenerationProposal[];
  orbPrinciples: string[];
  experiencePrinciples: string[];
};

// ─── Runtime implementation types ───────────────────────────────────────────

export type DiscoverySessionStatus =
  | 'not-started'
  | 'in-progress'
  | 'genome-ready'
  | 'headquarters-ready'
  | 'complete';

export type DiscoveryResponse = {
  questionId: string;
  phaseId: BusinessDiscoveryPhaseId;
  answer: string;
  answeredAt: string;
  wordCount: number;
};

export type DiscoveryFounderProfile = {
  founderId: string;
  displayName: string;
  vision?: string;
  mission?: string;
  values: string[];
  goals: string[];
  longTermAmbition?: string;
  decisionStyle?: string;
  leadershipStyle?: string;
  successDefinition?: string;
};

export type DiscoveryCompanyProfile = {
  companyId: string;
  companyName: string;
  industryId: string;
  businessModel?: string;
  offers: string[];
  customerSegments: string[];
  market?: string;
  revenueSources: string[];
  pricingLogic?: string;
  operationsSummary?: string;
  teamSummary?: string;
  technologyStack: string[];
  brandStandards?: string;
};

export type DiscoveryPhaseProgress = {
  phaseId: BusinessDiscoveryPhaseId;
  answeredCount: number;
  totalCount: number;
  percentComplete: number;
  status: 'not-started' | 'in-progress' | 'complete';
  lastActivityAt?: string;
};

export type DiscoveredSystem = {
  id: string;
  name: string;
  category: 'sales' | 'delivery' | 'support' | 'finance' | 'knowledge' | 'leadership' | 'growth' | 'operations';
  description: string;
  owner?: string;
  sourcePhaseId: BusinessDiscoveryPhaseId;
  confidence: number;
};

export type BusinessRelationship = {
  id: string;
  fromSystemId: string;
  toSystemId: string;
  relationshipType: 'feeds' | 'depends-on' | 'approves' | 'reports-to' | 'delivers-to' | 'informs';
  label: string;
  sourcePhaseId: BusinessDiscoveryPhaseId;
};

export type BusinessDependency = {
  id: string;
  workflowName: string;
  requiredInputs: string[];
  requiredApprovals: string[];
  owner?: string;
  bottleneckRisk: 'low' | 'medium' | 'high';
  sourcePhaseId: BusinessDiscoveryPhaseId;
};

export type DiscoveryInsight = {
  id: string;
  title: string;
  summary: string;
  category: 'founder' | 'company' | 'relationship' | 'knowledge' | 'genome' | 'headquarters';
  sourcePhaseId: BusinessDiscoveryPhaseId;
  confidence: number;
  founderMoment?: string;
  generatedAt: string;
};

export type DiscoveryRecommendation = {
  id: string;
  title: string;
  reasoning: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  category: 'quick-win' | 'risk-reduction' | 'growth' | 'knowledge' | 'automation' | 'headquarters';
  estimatedImpact: 'transformative' | 'high' | 'moderate' | 'low';
  sourcePhaseId: BusinessDiscoveryPhaseId;
};

export type BusinessRisk = {
  id: string;
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  category: 'bottleneck' | 'ownership' | 'knowledge' | 'revenue' | 'founder-dependency' | 'workflow';
  mitigation?: string;
  sourcePhaseId: BusinessDiscoveryPhaseId;
};

export type AutomationOpportunity = {
  id: string;
  title: string;
  description: string;
  workflowName: string;
  readinessScore: number;
  shadowModePhase: 'observe' | 'recommend' | 'assist' | 'automate';
  awaitingApproval: true;
  sourcePhaseId: BusinessDiscoveryPhaseId;
};

export type GeneratedDiscoveryObject = {
  id: string;
  title: string;
  objectType: string;
  sourcePhaseId: BusinessDiscoveryPhaseId;
  generatedAt: string;
};

export type GeneratedHeadquarters = {
  id: string;
  title: string;
  description: string;
  maturityLevel: 'draft' | 'proposed' | 'ready';
  generatedAt: string;
};

export type GeneratedDepartment = {
  id: string;
  name: string;
  wing: string;
  rationale: string;
  priority: 'essential' | 'recommended' | 'future';
};

export type GeneratedRoom = {
  id: string;
  name: string;
  departmentId: string;
  purpose: string;
  workspaceType: 'strategy' | 'production' | 'knowledge' | 'finance' | 'customer' | 'operations';
};

export type GeneratedMission = {
  id: string;
  title: string;
  objective: string;
  priority: 'critical' | 'high' | 'medium';
  sourceRiskId?: string;
};

export type DiscoveryOrbConfiguration = {
  strategistTone: 'executive' | 'consultative' | 'mentor';
  briefingCadence: 'proactive' | 'on-demand' | 'milestone-only';
  escalationStyle: 'founder-first' | 'delegated' | 'collaborative';
  proactiveInsights: boolean;
  milestoneLanguage: boolean;
};

export type CompanyGenomeGraphNode = {
  id: string;
  label: string;
  nodeType: 'system' | 'workflow' | 'knowledge' | 'customer' | 'revenue' | 'decision';
  metadata?: Record<string, string | number | boolean>;
};

export type CompanyGenomeGraphEdge = {
  id: string;
  from: string;
  to: string;
  edgeType: 'depends-on' | 'feeds' | 'owns' | 'delivers' | 'decides';
  label?: string;
};

export type CompanyGenome = {
  id: string;
  sessionId: string;
  organizationId: string;
  version: string;
  generatedAt: string;
  completionPercent: number;
  businessSystems: DiscoveredSystem[];
  dependencies: BusinessDependency[];
  operationalGraph: { nodes: CompanyGenomeGraphNode[]; edges: CompanyGenomeGraphEdge[] };
  knowledgeGraph: { nodes: CompanyGenomeGraphNode[]; edges: CompanyGenomeGraphEdge[] };
  customerJourney: string[];
  revenueGraph: { nodes: CompanyGenomeGraphNode[]; edges: CompanyGenomeGraphEdge[] };
  decisionGraph: { nodes: CompanyGenomeGraphNode[]; edges: CompanyGenomeGraphEdge[] };
  automationOpportunities: AutomationOpportunity[];
  aiOpportunities: DiscoveryRecommendation[];
  operationalRisks: BusinessRisk[];
};

export type DiscoverySession = {
  id: string;
  organizationId: string;
  status: DiscoverySessionStatus;
  founder: DiscoveryFounderProfile;
  company: DiscoveryCompanyProfile;
  progress: DiscoveryPhaseProgress[];
  responses: DiscoveryResponse[];
  discoveredSystems: DiscoveredSystem[];
  relationships: BusinessRelationship[];
  dependencies: BusinessDependency[];
  insights: DiscoveryInsight[];
  recommendations: DiscoveryRecommendation[];
  risks: BusinessRisk[];
  generatedObjects: GeneratedDiscoveryObject[];
  generatedHeadquarters: GeneratedHeadquarters | null;
  generatedDepartments: GeneratedDepartment[];
  generatedRooms: GeneratedRoom[];
  generatedMissions: GeneratedMission[];
  orbConfiguration: DiscoveryOrbConfiguration;
  companyGenome: CompanyGenome | null;
  currentPhaseId: BusinessDiscoveryPhaseId;
  overallProgressPercent: number;
  genomeCompletionPercent: number;
  founderMomentsCelebrated: string[];
  startedAt: string;
  updatedAt: string;
  completedAt?: string;
};

export type BusinessDiscoveryStore = {
  version: string;
  sessions: DiscoverySession[];
  updatedAt: string;
};

export type DiscoveryTimelineEntry = {
  id: string;
  kind: 'phase-started' | 'phase-completed' | 'insight' | 'founder-moment' | 'genome-generated' | 'headquarters-ready';
  phaseId?: BusinessDiscoveryPhaseId;
  title: string;
  summary: string;
  occurredAt: string;
};

export type DiscoveryVisualExperience = {
  discoveryTimeline: DiscoveryTimelineEntry[];
  interactiveProgress: DiscoveryPhaseProgress[];
  businessGenomePreview: CompanyGenome | null;
  dependencyGraph: { nodes: CompanyGenomeGraphNode[]; edges: CompanyGenomeGraphEdge[] };
  founderJourney: Array<{ phaseId: BusinessDiscoveryPhaseId; title: string; status: string; highlight?: string }>;
  genomeCompletionPercent: number;
  headquartersPreview: GeneratedHeadquarters | null;
};

export type BusinessDiscoveryState = {
  session: DiscoverySession;
  visualExperience: DiscoveryVisualExperience;
  nextQuestions: BusinessDiscoveryQuestion[];
  topInsight: DiscoveryInsight | null;
};

export type DiscoveryQuestionContext = {
  session: DiscoverySession;
  phaseId: BusinessDiscoveryPhaseId;
  industryId?: string;
};

export type DiscoveryEngineSyncOptions = {
  organizationId: string;
  founderId?: string;
  companyName?: string;
  industryId?: string;
  recordResponse?: {
    questionId: string;
    phaseId: BusinessDiscoveryPhaseId;
    answer: string;
  };
  advancePhase?: boolean;
};
