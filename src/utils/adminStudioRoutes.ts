/** Modular Studio routing — canonical paths and built-section registry. */

import type { AdminStudioSectionId } from './adminStudioDemo';

export const ADMIN_STUDIO_BASE_PATH = '/admin/studio';

export type AdminStudioBuiltSectionId = Extract<
  AdminStudioSectionId,
  | 'shows'
  | 'content-packs'
  | 'ai-studio'
  | 'prompt-library'
  | 'asset-library'
  | 'publishing-queue'
  | 'analytics'
  | 'content-brain'
  | 'creative-director'
  | 'intelligence-engine'
  | 'ai-orchestrator'
  | 'show-bible'
  | 'studio-lot'
  | 'talent-agency'
  | 'casting'
  | 'production'
  | 'ai-production-engine'
  | 'distribution-network'
  | 'audience-brain'
  | 'growth-network'
  | 'labs'
  | 'ai-media-network'
  | 'ndxbook'
  | 'talent-network'
  | 'marketplace'
  | 'business-model-engine'
  | 'ecosystem'
  | 'governance'
  | 'studio-intelligence'
  | 'simulation-engine'
  | 'vision-engine'
  | 'executive-command-center'
  | 'mission-control'
  | 'chief-of-staff'
  | 'executive-organization'
  | 'organizational-inheritance'
  | 'legacy-system'
  | 'asset-director'
  | 'blueprint-manager'
  | 'asset-factory'
  | 'production-builder'
  | 'director-mode'
  | 'executive-ai-director'
  | 'campaign-orchestrator'
  | 'knowledge-hub'
  | 'memory-bible'
  | 'leadership-dna'
  | 'brand-assets'
>;

export const ADMIN_STUDIO_BUILT_SECTIONS: readonly AdminStudioBuiltSectionId[] = [
  'shows',
  'content-packs',
  'ai-studio',
  'prompt-library',
  'asset-library',
  'publishing-queue',
  'analytics',
  'content-brain',
  'creative-director',
  'intelligence-engine',
  'ai-orchestrator',
  'show-bible',
  'studio-lot',
  'talent-agency',
  'casting',
  'production',
  'ai-production-engine',
  'distribution-network',
  'audience-brain',
  'growth-network',
  'labs',
  'ai-media-network',
  'ndxbook',
  'talent-network',
  'marketplace',
  'business-model-engine',
  'ecosystem',
  'governance',
  'vision-engine',
  'executive-command-center',
  'mission-control',
  'chief-of-staff',
  'executive-organization',
  'organizational-inheritance',
  'legacy-system',
  'asset-director',
  'blueprint-manager',
  'asset-factory',
  'production-builder',
  'director-mode',
  'executive-ai-director',
  'campaign-orchestrator',
  'knowledge-hub',
  'memory-bible',
  'leadership-dna',
  'brand-assets',
] as const;

export const ADMIN_STUDIO_BUILT_SECTION_SET = new Set<string>(ADMIN_STUDIO_BUILT_SECTIONS);

/** Route definitions for lazy App.tsx wiring (path relative to /admin). */
export const ADMIN_STUDIO_ROUTE_PATHS = {
  hub: 'studio',
  shows: 'studio/shows',
  showDetail: 'studio/shows/:showId',
  contentPacks: 'studio/content-packs',
  contentPackDetail: 'studio/content-packs/:packId',
  aiStudio: 'studio/ai-studio',
  promptLibrary: 'studio/prompt-library',
  assetLibrary: 'studio/asset-library',
  publishingQueue: 'studio/publishing-queue',
  analytics: 'studio/analytics',
  contentBrain: 'studio/content-brain',
  contentBrainSection: 'studio/content-brain/:sectionId',
  creativeDirector: 'studio/creative-director',
  intelligenceEngine: 'studio/intelligence-engine',
  aiOrchestrator: 'studio/ai-orchestrator',
  showBible: 'studio/show-bible',
  showBibleDetail: 'studio/show-bible/:showId',
  studioLot: 'studio/studio-lot',
  studioLotDetail: 'studio/studio-lot/:studioId',
  talentAgency: 'studio/talent-agency',
  talentAgencyDetail: 'studio/talent-agency/:talentId',
  casting: 'studio/casting',
  castingTalent: 'studio/casting/talent/:talentId',
  castingDetail: 'studio/casting/:castingId',
  production: 'studio/production',
  productionDetail: 'studio/production/:packId',
  aiProductionEngine: 'studio/ai-production-engine',
  aiProductionEngineDetail: 'studio/ai-production-engine/:runId',
  distributionNetwork: 'studio/distribution-network',
  distributionNetworkChannel: 'studio/distribution-network/channel/:channelId',
  distributionNetworkDetail: 'studio/distribution-network/:distributionId',
  audienceBrain: 'studio/audience-brain',
  audienceBrainIntelligence: 'studio/audience-brain/intelligence',
  growthNetwork: 'studio/growth-network',
  labs: 'studio/labs',
  aiMediaNetwork: 'studio/ai-media-network',
  ndxbook: 'studio/ndxbook',
  talentNetwork: 'studio/talent-network',
  marketplace: 'studio/marketplace',
  businessModelEngine: 'studio/business-model-engine',
  ecosystem: 'studio/ecosystem',
  governance: 'studio/governance',
  studioIntelligence: 'studio/studio-intelligence',
  simulationEngine: 'studio/simulation-engine',
  visionEngine: 'studio/vision-engine',
  executiveCommandCenter: 'studio/executive-command-center',
  missionControl: 'studio/mission-control',
  chiefOfStaff: 'studio/chief-of-staff',
  executiveOrganization: 'studio/executive-organization',
  organizationalInheritance: 'studio/organizational-inheritance',
  studioOverview: 'studio/overview',
  studioHub: 'studio/hub',
  socialAccounts: 'studio/social-accounts',
  legacySystem: 'studio/legacy-system',
  legacySystemMuseum: 'studio/legacy-system/museum',
  assetDirector: 'studio/asset-director',
  blueprintManager: 'studio/blueprint-manager',
  blueprintDetail: 'studio/blueprint-manager/:blueprintId',
  assetFactory: 'studio/asset-factory',
  assetDirectorStudios: 'studio/asset-director/studios',
  assetDirectorStudioDetail: 'studio/asset-director/studios/:studioId',
  assetDirectorTalent: 'studio/asset-director/talent',
  assetDirectorTalentDetail: 'studio/asset-director/talent/:talentId',
  assetDirectorSection: 'studio/asset-director/section/:sectionId',
  productionBuilder: 'studio/production-builder',
  directorMode: 'studio/director-mode',
  executiveAiDirector: 'studio/executive-ai-director',
  campaignOrchestrator: 'studio/campaign-orchestrator',
  knowledgeHub: 'studio/knowledge-hub',
  knowledgeHubProfile: 'studio/knowledge-hub/profile/:profileId',
  knowledgeHubWorkflow: 'studio/knowledge-hub/workflow/:workflowId',
  memoryBible: 'studio/memory-bible',
  leadershipDna: 'studio/leadership-dna',
  brandAssets: 'studio/brand-assets',
  photographyBible: 'studio/brand-assets/photography-bible',
  brandAssetsAssetFactory: 'studio/brand-assets/asset-factory',
  sectionPlaceholder: 'studio/:sectionId',
} as const;

export function adminStudioPath(segment: string): string {
  return `${ADMIN_STUDIO_BASE_PATH}/${segment.replace(/^\//, '')}`;
}

export function adminStudioShowPath(showId: string): string {
  return `${ADMIN_STUDIO_BASE_PATH}/shows/${showId}`;
}

export function adminStudioContentPackPath(packId: string): string {
  return `${ADMIN_STUDIO_BASE_PATH}/content-packs/${packId}`;
}

export function adminStudioShowBiblePath(showId: string): string {
  return `${ADMIN_STUDIO_BASE_PATH}/show-bible/${showId}`;
}

export function adminStudioLotPath(studioId: string): string {
  return `${ADMIN_STUDIO_BASE_PATH}/studio-lot/${studioId}`;
}

export function adminStudioTalentPath(talentId: string): string {
  return `${ADMIN_STUDIO_BASE_PATH}/talent-agency/${talentId}`;
}

export function adminStudioCastingPath(castingId: string): string {
  return `${ADMIN_STUDIO_BASE_PATH}/casting/${castingId}`;
}

export function adminStudioCastingTalentPath(talentId: string): string {
  return `${ADMIN_STUDIO_BASE_PATH}/casting/talent/${talentId}`;
}

export function adminStudioProductionPath(packId: string): string {
  return `${ADMIN_STUDIO_BASE_PATH}/production/${packId}`;
}

export function adminStudioAiProductionEnginePath(runId: string): string {
  return `${ADMIN_STUDIO_BASE_PATH}/ai-production-engine/${runId}`;
}

export function adminStudioDistributionNetworkPath(distributionId: string): string {
  return `${ADMIN_STUDIO_BASE_PATH}/distribution-network/${distributionId}`;
}

export function adminStudioDistributionChannelPath(channelId: string): string {
  return `${ADMIN_STUDIO_BASE_PATH}/distribution-network/channel/${channelId}`;
}

export function adminStudioAudienceBrainPath(): string {
  return `${ADMIN_STUDIO_BASE_PATH}/audience-brain`;
}

export function adminStudioExecutiveCommandCenterPath(): string {
  return `${ADMIN_STUDIO_BASE_PATH}/executive-command-center`;
}

export function adminStudioMissionControlPath(): string {
  return `${ADMIN_STUDIO_BASE_PATH}/mission-control`;
}

export function adminStudioChiefOfStaffPath(): string {
  return `${ADMIN_STUDIO_BASE_PATH}/chief-of-staff`;
}

export function adminStudioExecutiveOrganizationPath(): string {
  return `${ADMIN_STUDIO_BASE_PATH}/executive-organization`;
}

export function adminStudioOrganizationalInheritancePath(): string {
  return `${ADMIN_STUDIO_BASE_PATH}/organizational-inheritance`;
}

export function adminStudioOsPath(): string {
  return '/admin/studio-os';
}

export function adminStudioOsCreatePath(): string {
  return '/admin/studio-os/create';
}

export function adminStudioSocialAccountsPath(): string {
  return `${ADMIN_STUDIO_BASE_PATH}/social-accounts`;
}

export function adminStudioLegacySystemPath(): string {
  return `${ADMIN_STUDIO_BASE_PATH}/legacy-system`;
}

export function adminStudioLegacySystemMuseumPath(): string {
  return `${ADMIN_STUDIO_BASE_PATH}/legacy-system/museum`;
}

export function adminStudioAssetDirectorPath(): string {
  return `${ADMIN_STUDIO_BASE_PATH}/asset-director`;
}

export function adminStudioBlueprintManagerPath(): string {
  return `${ADMIN_STUDIO_BASE_PATH}/blueprint-manager`;
}

export function adminStudioBlueprintDetailPath(blueprintId: string): string {
  return `${ADMIN_STUDIO_BASE_PATH}/blueprint-manager/${encodeURIComponent(blueprintId)}`;
}

export function adminStudioAssetFactoryPath(): string {
  return `${ADMIN_STUDIO_BASE_PATH}/asset-factory`;
}

export function adminStudioAssetDirectorStudioPath(studioId: string): string {
  return `${ADMIN_STUDIO_BASE_PATH}/asset-director/studios/${studioId}`;
}

export function adminStudioAssetDirectorTalentPath(talentId: string): string {
  return `${ADMIN_STUDIO_BASE_PATH}/asset-director/talent/${talentId}`;
}

export function adminStudioAssetDirectorSectionPath(sectionId: string): string {
  return `${ADMIN_STUDIO_BASE_PATH}/asset-director/section/${sectionId}`;
}

export function adminStudioProductionBuilderPath(packId?: string): string {
  const base = `${ADMIN_STUDIO_BASE_PATH}/production-builder`;
  return packId ? `${base}?packId=${encodeURIComponent(packId)}` : base;
}

export function adminStudioDirectorModePath(draftId: string, packId?: string): string {
  const params = new URLSearchParams({ draftId });
  if (packId) params.set('packId', packId);
  return `${ADMIN_STUDIO_BASE_PATH}/director-mode?${params.toString()}`;
}

export function adminStudioExecutiveAiDirectorPath(): string {
  return `${ADMIN_STUDIO_BASE_PATH}/executive-ai-director`;
}

export function adminStudioCampaignOrchestratorPath(): string {
  return `${ADMIN_STUDIO_BASE_PATH}/campaign-orchestrator`;
}

export function adminStudioKnowledgeHubPath(): string {
  return `${ADMIN_STUDIO_BASE_PATH}/knowledge-hub`;
}

export function adminStudioKnowledgeHubProfilePath(profileId: string): string {
  return `${ADMIN_STUDIO_BASE_PATH}/knowledge-hub/profile/${encodeURIComponent(profileId)}`;
}

export function adminStudioKnowledgeHubWorkflowPath(workflowId: string): string {
  return `${ADMIN_STUDIO_BASE_PATH}/knowledge-hub/workflow/${encodeURIComponent(workflowId)}`;
}

export function adminStudioMemoryBiblePath(): string {
  return `${ADMIN_STUDIO_BASE_PATH}/memory-bible`;
}

export function adminStudioLeadershipDnaPath(): string {
  return `${ADMIN_STUDIO_BASE_PATH}/leadership-dna`;
}

export function adminStudioGrowthNetworkPath(): string {
  return `${ADMIN_STUDIO_BASE_PATH}/growth-network`;
}

export function adminStudioLabsPath(): string {
  return `${ADMIN_STUDIO_BASE_PATH}/labs`;
}

export function adminStudioNdxbookPath(): string {
  return `${ADMIN_STUDIO_BASE_PATH}/ndxbook`;
}

export function adminStudioAiMediaNetworkPath(): string {
  return `${ADMIN_STUDIO_BASE_PATH}/ai-media-network`;
}

export function adminStudioTalentNetworkPath(): string {
  return `${ADMIN_STUDIO_BASE_PATH}/talent-network`;
}

export function adminStudioMarketplacePath(): string {
  return `${ADMIN_STUDIO_BASE_PATH}/marketplace`;
}

export function adminStudioBusinessModelEnginePath(): string {
  return `${ADMIN_STUDIO_BASE_PATH}/business-model-engine`;
}

export function adminStudioEcosystemPath(): string {
  return `${ADMIN_STUDIO_BASE_PATH}/ecosystem`;
}

export function adminStudioGovernancePath(): string {
  return `${ADMIN_STUDIO_BASE_PATH}/governance`;
}

export function adminStudioStudioIntelligencePath(): string {
  return `${ADMIN_STUDIO_BASE_PATH}/studio-intelligence`;
}

export function adminStudioSimulationEnginePath(): string {
  return `${ADMIN_STUDIO_BASE_PATH}/simulation-engine`;
}

export function adminStudioVisionEnginePath(): string {
  return `${ADMIN_STUDIO_BASE_PATH}/vision-engine`;
}

export function adminStudioBrandAssetsPath(): string {
  return `${ADMIN_STUDIO_BASE_PATH}/brand-assets`;
}

export function adminStudioPhotographyBiblePath(): string {
  return `${ADMIN_STUDIO_BASE_PATH}/brand-assets/photography-bible`;
}

export function adminStudioBrandAssetsAssetFactoryPath(): string {
  return `${ADMIN_STUDIO_BASE_PATH}/brand-assets/asset-factory`;
}
