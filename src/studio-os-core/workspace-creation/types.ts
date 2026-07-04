/**
 * Workspace Creation Engine v1.0 — platform types.
 */

export type WorkspaceType = 'production' | 'pilot' | 'internal' | 'archived';

export type DeploymentStage =
  | 'planning'
  | 'provisioning'
  | 'active-development'
  | 'pilot'
  | 'production'
  | 'maintenance'
  | 'archived';

export type BlueprintModuleId =
  | 'dashboard'
  | 'memory-bible'
  | 'creative-dna'
  | 'writing-bible'
  | 'knowledge-graph'
  | 'interactive-manual'
  | 'onboarding-tutorial'
  | 'prompt-library'
  | 'automation'
  | 'storage'
  | 'analytics'
  | 'approval-workflows'
  | 'asset-folders'
  | 'ai-directors'
  | 'documentation'
  | 'workflow-templates'
  | 'reporting-dashboards'
  | 'content-pipeline'
  | 'campaigns'
  | 'asset-factory'
  | 'distribution'
  | 'revenue'
  | 'growth-network'
  | 'labs'
  | 'ai-media-network'
  | 'talent-network'
  | 'marketplace'
  | 'social-accounts'
  | 'system-health'
  | 'promotion-center'
  | 'executive-ai-director';

export type WorkspaceBranding = {
  theme: string;
  typography: string;
  primaryColor: string;
  secondaryColor: string;
  glassStyle: string;
  buttonStyle: string;
  panelStyle: string;
};

export type WorkspaceRegistryRecord = {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  coverImage: string;
  accentColor: string;
  owner: string;
  blueprintId: string;
  workspaceType: WorkspaceType;
  deploymentStage: DeploymentStage;
  version: string;
  createdAt: string;
  updatedAt: string;
  branding: WorkspaceBranding;
  enabledModules: BlueprintModuleId[];
  requiredModules: BlueprintModuleId[];
  isReferencePilot: boolean;
  executiveTeamId: string;
  logoSrc: string;
};

export type BlueprintDefinition = {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  version: string;
  requiredModules: BlueprintModuleId[];
  optionalModules: BlueprintModuleId[];
  provisioningPackages: string[];
  defaultAccentColor: string;
  defaultBranding?: Partial<WorkspaceBranding>;
  executiveRoleIds: string[];
  tags: string[];
};

export type BlueprintVersionRecord = {
  blueprintId: string;
  version: string;
  createdAt: string;
  changelog: string;
};

export type ExecutiveRole = {
  id: string;
  title: string;
  department: string;
  mandate: string;
  inherits: string[];
  collaboratesWith: string[];
};

export type ExecutiveTeamMember = ExecutiveRole & {
  workspaceId: string;
  status: 'active' | 'standby';
};

export type ProvisioningStep = {
  id: string;
  label: string;
  durationMs: number;
};

export type WorkspaceCreationDraft = {
  blueprintId: string;
  name: string;
  description: string;
  logoSrc: string;
  icon: string;
  coverImage: string;
  accentColor: string;
  workspaceType: WorkspaceType;
  enabledOptionalModules: BlueprintModuleId[];
  branding: WorkspaceBranding;
};

export type PromotionStage =
  | 'develop'
  | 'deploy-pilot'
  | 'production-testing'
  | 'analytics'
  | 'bug-fixes'
  | 'approval'
  | 'promote-production'
  | 'release-all-workspaces';

export type PromotionPipelineItem = {
  id: string;
  featureName: string;
  description: string;
  currentStage: PromotionStage;
  pilotWorkspaceId: string;
  productionWorkspaceId: string;
  updatedAt: string;
};

export type WorkspaceCreationEngineStore = {
  workspaces: WorkspaceRegistryRecord[];
  blueprintVersions: BlueprintVersionRecord[];
  promotionPipeline: PromotionPipelineItem[];
  seededPilotWorkspaceIds: string[];
};
