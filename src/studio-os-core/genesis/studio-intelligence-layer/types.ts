import type {
  XsilCanonClass,
  XsilConsumerSystem,
  XsilDemoCompanyId,
  XsilRoomPath,
} from './constants';

export type { XsilCanonClass };

export type XsilScaleProfile = {
  label: string;
  value: number;
  context?: string;
};

export type XsilCompanyRecord = {
  companyId: string;
  companyName: string;
  operatingPhilosophy: string;
  mission: string;
  version: string;
  status: 'draft' | 'canonical';
  updatedAt: string;
};

export type XsilOperatingManualRecord = {
  manualId: string;
  companyId: string;
  version: string;
  operatingPhilosophy: string;
  executivePrinciples: string[];
  departmentPlaybooks: { departmentId: string; purpose: string; cadence: string }[];
  sops: { sopId: string; title: string; owner: string }[];
  approvalWorkflows: { workflowId: string; domain: string; requiresFounder: boolean }[];
  qualityStandards: string[];
  automationRules: { ruleId: string; action: string; mode: 'execute' | 'recommend' | 'approve' }[];
  decisionOwnership: { domain: string; owner: string }[];
  escalationPaths: { riskClass: string; path: string }[];
  canonStatus: 'draft' | 'approved' | 'canonical';
  updatedAt: string;
};

export type XsilDecisionDnaRecord = {
  decisionDnaId: string;
  companyId: string;
  founderId: string;
  version: string;
  riskTolerance: XsilScaleProfile;
  speedQualityBias: XsilScaleProfile;
  luxuryAffordabilityBias: XsilScaleProfile;
  innovationConventionBias: XsilScaleProfile;
  leadershipStyle: string[];
  platformPhilosophy: string;
  learnedPrinciples: string[];
  antiPatterns: string[];
  decisionHistory: XsilDecisionRecord[];
  updatedAt: string;
};

export type XsilDecisionRecord = {
  decisionId: string;
  summary: string;
  rationale: string;
  confidence: number;
  outcome?: string;
  createdAt: string;
};

export type XsilTasteGenomeRecord = {
  tasteGenomeId: string;
  companyId: string;
  version: string;
  typography: string[];
  layout: string[];
  photography: string[];
  luxuryLevel: number;
  motion: string[];
  copywriting: string[];
  approvedPatterns: { patternId: string; label: string; confidence: number }[];
  rejectedPatterns: { patternId: string; label: string; rationale: string }[];
  updatedAt: string;
};

export type XsilCanonCandidate = {
  candidateId: string;
  companyId: string;
  title: string;
  summary: string;
  proposedClass: XsilCanonClass;
  source: string;
  confidence: number;
  status: 'pending' | 'approved' | 'rejected' | 'revision';
  founderReviewRequired: boolean;
  createdAt: string;
};

export type XsilAudienceDnaRecord = {
  audienceDnaId: string;
  companyId: string;
  version: string;
  segmentName: string;
  demographics: string;
  psychographics: string;
  emotionalTriggers: string[];
  buyingMotivations: string[];
  luxuryExpectations: string;
  painPoints: string[];
  desiredTransformation: string;
  updatedAt: string;
};

export type XsilProductDnaRecord = {
  productDnaId: string;
  companyId: string;
  version: string;
  productName: string;
  purpose: string;
  emotionalPromise: string;
  lifecycle: 'new' | 'flagship' | 'evergreen' | 'seasonal' | 'limited';
  packagingRules: string;
  launchStrategy: string;
  audienceFit: string;
  updatedAt: string;
};

export type XsilCreativeNode = {
  nodeId: string;
  companyId: string;
  nodeType: 'campaign' | 'photography' | 'packaging' | 'motion' | 'moodboard' | 'asset';
  title: string;
  tags: string[];
  approvalStatus: 'draft' | 'approved' | 'rejected';
  relatedNodeIds: string[];
  updatedAt: string;
};

export type XsilExperienceCompileManifest = {
  manifestId: string;
  companyId: string;
  mission: string;
  role: string;
  device: string;
  layersUsed: string[];
  explainTrace: string[];
  compiledAt: string;
};

export type XsilExecutiveRecommendation = {
  recommendationId: string;
  companyId: string;
  summary: string;
  recommendedAction: string;
  alternatives: string[];
  brandImpact: string;
  audienceImpact: string;
  productImpact: string;
  financialImpact: string;
  operationalImpact: string;
  platformImpact: string;
  confidence: number;
  requiresFounderApproval: boolean;
  rationale: string[];
};

export type XsilPlaygroundSelection = {
  companyId: XsilDemoCompanyId;
  audienceSegmentId?: string;
  productId?: string;
  creativeNodeId?: string;
};

export type XsilStore = {
  version: string;
  companyRegistry: XsilCompanyRecord[];
  operatingManualRegistry: XsilOperatingManualRecord[];
  decisionRegistry: XsilDecisionDnaRecord[];
  tasteRegistry: XsilTasteGenomeRecord[];
  audienceRegistry: XsilAudienceDnaRecord[];
  productRegistry: XsilProductDnaRecord[];
  creativeRegistry: XsilCreativeNode[];
  canonRegistry: XsilCanonCandidate[];
  experienceRegistry: XsilExperienceCompileManifest[];
  playground: XsilPlaygroundSelection;
  constitutionLocked: boolean;
  seededAt?: string;
  bootstrappedAt?: string;
  lastOpenedAt?: string;
};

export type XsilReadyView = {
  activeRoom: XsilRoomPath;
  activeCompany: XsilCompanyRecord;
  operatingManual: XsilOperatingManualRecord;
  decisionDna: XsilDecisionDnaRecord;
  tasteGenome: XsilTasteGenomeRecord;
  audienceDna: XsilAudienceDnaRecord;
  productDna: XsilProductDnaRecord;
  creativeNodes: XsilCreativeNode[];
  canonCandidates: XsilCanonCandidate[];
  compileManifest: XsilExperienceCompileManifest;
  executiveRecommendation: XsilExecutiveRecommendation;
  consumerBindings: { system: XsilConsumerSystem; status: string }[];
  demoCompanyIds: XsilDemoCompanyId[];
  foundationTraits: string[];
  orbNote: string;
  constitutionLocked: boolean;
};

export type XsilRuntimeInput = {
  pathname?: string;
  companyId?: string;
  playground?: Partial<XsilPlaygroundSelection>;
};

export type XsilIntelligenceQuery = {
  companyId: string;
  mission: string;
  artifactSummary?: string;
};
