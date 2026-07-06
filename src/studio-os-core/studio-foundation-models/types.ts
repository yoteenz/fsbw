import type {
  ENTERPRISE_DEPLOYMENT_MODES,
  FOUNDATION_MODEL_CAPABILITIES,
  HYBRID_INTELLIGENCE_LAYERS,
  MOAT_SOURCES,
  PROFESSION_MODEL_IDS,
  ROADMAP_PHASES,
  TRAINING_SOURCES,
} from './constants';

export type RoadmapPhase = (typeof ROADMAP_PHASES)[number];
export type FoundationModelCapability = (typeof FOUNDATION_MODEL_CAPABILITIES)[number];
export type ProfessionModelId = (typeof PROFESSION_MODEL_IDS)[number];
export type TrainingSource = (typeof TRAINING_SOURCES)[number];
export type HybridIntelligenceLayer = (typeof HYBRID_INTELLIGENCE_LAYERS)[number];
export type EnterpriseDeploymentMode = (typeof ENTERPRISE_DEPLOYMENT_MODES)[number];
export type MoatSource = (typeof MOAT_SOURCES)[number];

export type RoadmapPhaseStatus = {
  phase: RoadmapPhase;
  label: string;
  status: 'complete' | 'active' | 'planned';
  detail: string;
  progressPct: number;
};

export type FoundationCapabilityStatus = {
  capability: FoundationModelCapability;
  label: string;
  readinessPct: number;
  detail: string;
  studioOwned: boolean;
};

export type ProfessionModelProfile = {
  id: ProfessionModelId;
  label: string;
  industryFit: string;
  reasoningFocus: string;
  professionBrainLinked: boolean;
  knowledgeFabricLinked: boolean;
  trustFrameworkLinked: boolean;
  hybridReady: true;
  readinessPct: number;
};

export type TrainingSourceStatus = {
  source: TrainingSource;
  label: string;
  approved: boolean;
  consentRequired: boolean;
  detail: string;
};

export type HybridIntelligenceLayerStatus = {
  layer: HybridIntelligenceLayer;
  label: string;
  role: string;
  active: boolean;
  example: string;
};

export type EnterpriseDeploymentProfile = {
  mode: EnterpriseDeploymentMode;
  label: string;
  available: boolean;
  detail: string;
  regulatedIndustryReady: boolean;
};

export type MoatSourceStatus = {
  source: MoatSource;
  label: string;
  contributionPct: number;
  compoundsIntelligence: true;
  detail: string;
};

export type HybridIntelligenceRequest = {
  id: string;
  professionModelId: ProfessionModelId;
  workflow: string;
  studioModelRole: string;
  externalModelRole: string;
  knowledgeFabricContext: string;
  trustValidation: string;
  processedAt: string;
};

export type OrganizationStudioFoundationModelsProfile = {
  organizationId: string;
  companyName: string;
  industryId: string;
  updatedAt: string;
  foundationScore: number;
  currentRoadmapPhase: RoadmapPhase;
  roadmapPhases: RoadmapPhaseStatus[];
  foundationCapabilities: FoundationCapabilityStatus[];
  professionModels: ProfessionModelProfile[];
  trainingSources: TrainingSourceStatus[];
  hybridLayers: HybridIntelligenceLayerStatus[];
  enterpriseDeployments: EnterpriseDeploymentProfile[];
  moatSources: MoatSourceStatus[];
  recentHybridRequests: HybridIntelligenceRequest[];
  dockFoundationModelsLine: string;
  hybridIntelligenceLine: string;
  moatLine: string;
  modelOrchestratorLinked: true;
  externalModelsBridge: true;
  neverTrainWithoutConsent: true;
  syncedSources: string[];
};

export type StudioFoundationModelsStore = {
  version: string;
  profiles: OrganizationStudioFoundationModelsProfile[];
};

export type StudioFoundationModelsDockAdvice = {
  response: string;
  concierge: string;
  foundationScore?: number;
  currentRoadmapPhase?: RoadmapPhase;
};
