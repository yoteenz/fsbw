/** Digital Architect V2.0 — digital solution architect for complete ecosystems (Milestone 55). */

export type DigitalArchitectWorkspaceId = 'ndxbook' | 'frontal-slayer' | 'studio-os' | 'custom';

export type ExperienceModeId =
  | 'classic'
  | 'luxury'
  | 'immersive'
  | 'editorial'
  | 'community'
  | 'marketplace'
  | 'enterprise'
  | 'saas'
  | 'custom';

export type ExperienceMode = {
  id: ExperienceModeId;
  label: string;
  idealFor: string[];
  capabilities: string[];
  previewLabel: string;
  status: 'available' | 'recommended' | 'selected' | 'hybrid';
};

export type HybridArchitecture = {
  id: string;
  label: string;
  modes: ExperienceModeId[];
  description: string;
  confidencePct: number;
};

export type ExperienceRecommendation = {
  id: string;
  mode: ExperienceModeId | 'hybrid';
  hybridLabel?: string;
  confidencePct: number;
  reasoning: string;
  customerImpact: string;
  businessImpact: string;
  status: 'recommended' | 'accepted' | 'modified' | 'ignored';
};

export type ImmersivePreview = {
  id: string;
  label: string;
  mode: ExperienceModeId;
  description: string;
  explorePath: string;
  capabilities: string[];
};

export type EcosystemProduct = {
  id: string;
  product: string;
  category: string;
  status: 'planned' | 'architecture' | 'ready';
};

export type SolutionArchitecture = {
  businessObjectives: string[];
  userRoles: string[];
  workflows: string[];
  integrations: string[];
  securityNotes: string[];
  performanceNotes: string[];
  scalabilityNotes: string[];
};

export type DesignSystemSpec = {
  id: string;
  component: string;
  tokens: string;
  status: 'generated' | 'inherited' | 'approved';
};

export type ApplicationArchitecture = {
  informationArchitecture: string[];
  navigation: string[];
  featureHierarchy: string[];
  authModel: string;
  permissions: string[];
  databasePlan: string[];
  apiPlan: string[];
  technicalRoadmap: string[];
};

export type AiFeatureRecommendation = {
  id: string;
  feature: string;
  alignment: string;
  priority: 'low' | 'medium' | 'high';
  status: 'recommended' | 'approved' | 'deferred';
};

export type DigitalSimulation = {
  id: string;
  label: string;
  performancePct: number;
  conversionPct: number;
  engagementPct: number;
  accessibilityPct: number;
  complexityPct: number;
  costEstimate: string;
  scalabilityPct: number;
  confidencePct: number;
  recommendations: string[];
};

export type ImplementationMilestone = {
  id: string;
  title: string;
  sequence: number;
  effort: string;
  dependencies: string[];
  engineeringReq: string;
};

export type DeveloperHandoffPackage = {
  id: string;
  artifact: string;
  description: string;
  status: 'draft' | 'ready';
};

export type IntegrationReadiness = {
  id: string;
  platform: string;
  category: string;
  status: 'architecture-ready' | 'planned' | 'connected';
};

export type LaunchArchitectHandoff = {
  status: 'pending' | 'ready' | 'transferred';
  transferredAt: string | null;
  inheritedAssets: string[];
  downstreamTargets: string[];
};

export type ExperienceInheritance = {
  source: string;
  inherited: string[];
  status: 'complete' | 'partial';
};

export type DigitalArchitectDashboard = {
  summary: string;
  architectureHealthPct: number;
  inheritanceCompletenessPct: number;
  designSystemPct: number;
  implementationReadinessPct: number;
  selectedMode: ExperienceModeId | 'hybrid' | null;
  approvalStatus: 'draft' | 'in-review' | 'approved' | 'handed-off';
};

export type DigitalArchitectStore = {
  version: string;
  lastUpdatedAt: string;
  activeWorkspaceId: DigitalArchitectWorkspaceId;
  companyName: string;
  dashboard: DigitalArchitectDashboard;
  digitalPhilosophy: string[];
  experienceModes: ExperienceMode[];
  hybridArchitectures: HybridArchitecture[];
  recommendations: ExperienceRecommendation[];
  immersivePreviews: ImmersivePreview[];
  ecosystemProducts: EcosystemProduct[];
  solutionArchitecture: SolutionArchitecture;
  experienceInheritance: ExperienceInheritance[];
  designSystem: DesignSystemSpec[];
  applicationArchitecture: ApplicationArchitecture;
  aiFeatures: AiFeatureRecommendation[];
  simulations: DigitalSimulation[];
  implementationRoadmap: ImplementationMilestone[];
  developerHandoff: DeveloperHandoffPackage[];
  integrations: IntegrationReadiness[];
  launchHandoff: LaunchArchitectHandoff;
};
