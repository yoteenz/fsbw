import type {
  CONTEXT_ENGINE_SOURCES,
  INTELLIGENCE_LAYER_STEPS,
  INTELLIGENCE_STACK_SYSTEMS,
  KNOWLEDGE_FABRIC_NODE_TYPES,
  MODEL_GATEWAY_PROVIDERS,
} from './constants';

export type IntelligenceStackSystem = (typeof INTELLIGENCE_STACK_SYSTEMS)[number];
export type KnowledgeFabricNodeType = (typeof KNOWLEDGE_FABRIC_NODE_TYPES)[number];
export type ContextEngineSource = (typeof CONTEXT_ENGINE_SOURCES)[number];
export type IntelligenceLayerStep = (typeof INTELLIGENCE_LAYER_STEPS)[number];
export type ModelGatewayProvider = (typeof MODEL_GATEWAY_PROVIDERS)[number];

export type KnowledgeFabricNode = {
  id: string;
  type: KnowledgeFabricNodeType;
  typeLabel: string;
  label: string;
  summary: string;
  connectionCount: number;
  trustPct: number;
  sourceSystem: string;
};

export type KnowledgeFabricEdge = {
  id: string;
  fromNodeId: string;
  toNodeId: string;
  relationship: string;
  strengthPct: number;
};

export type ContextBundleItem = {
  source: ContextEngineSource;
  sourceLabel: string;
  summary: string;
  relevancePct: number;
  trustPct: number;
  included: boolean;
};

export type IntelligencePipelineStep = {
  step: IntelligenceLayerStep;
  label: string;
  status: 'complete' | 'active' | 'pending';
  detail: string;
};

export type ModelGatewayRoute = {
  provider: ModelGatewayProvider;
  providerLabel: string;
  role: 'reasoning' | 'writing' | 'summarization' | 'execution';
  active: boolean;
  modelAgnostic: true;
};

export type IntelligenceStackSnapshot = {
  systemId: IntelligenceStackSystem;
  label: string;
  connected: boolean;
  vitalityPct: number;
  insight: string;
};

export type StudioIntelligenceRequest = {
  id: string;
  query: string;
  organizationKnowsFirst: string;
  modelReasoningSecond: string;
  contextSourcesUsed: number;
  pipelineStepsComplete: number;
  validated: boolean;
  providerUsed: ModelGatewayProvider;
  processedAt: string;
};

export type OrganizationStudioIntelligenceArchitectureProfile = {
  organizationId: string;
  companyName: string;
  industryId: string;
  updatedAt: string;
  architectureScore: number;
  knowledgeFabricNodes: number;
  contextSourcesReady: number;
  pipelineHealthPct: number;
  modelAgnostic: true;
  directVendorCallsBlocked: true;
  knowledgeFabricNodesList: KnowledgeFabricNode[];
  knowledgeFabricEdges: KnowledgeFabricEdge[];
  contextBundle: ContextBundleItem[];
  pipelineSteps: IntelligencePipelineStep[];
  modelGatewayRoutes: ModelGatewayRoute[];
  intelligenceStack: IntelligenceStackSnapshot[];
  recentRequests: StudioIntelligenceRequest[];
  dockArchitectureLine: string;
  knowledgeVsReasoningLine: string;
  syncedSources: string[];
};

export type StudioIntelligenceArchitectureStore = {
  version: string;
  profiles: OrganizationStudioIntelligenceArchitectureProfile[];
};

export type StudioIntelligenceArchitectureDockAdvice = {
  response: string;
  concierge: string;
  architectureScore?: number;
  pipelineHealthPct?: number;
};
