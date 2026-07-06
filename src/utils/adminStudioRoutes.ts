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
  | 'strategy-engine'
  | 'campaign-engine'
  | 'work-orchestration'
  | 'distribution-engine'
  | 'reader-graph'
  | 'relationship-engine'
  | 'creator-marketplace'
  | 'ecosystem-marketplace'
  | 'knowledge-asset-engine'
  | 'company-maturity-engine'
  | 'brand-architect'
  | 'experience-architect'
  | 'digital-architect'
  | 'growth-architect'
  | 'company-genome'
  | 'architect-studio'
  | 'campus-evolution-engine'
  | 'founder-walk'
  | 'remembrance-garden'
  | 'founders-promise'
  | 'executive-framework'
  | 'leadership-manifesto-framework'
  | 'chief-brand-officer'
  | 'chief-experience-officer'
  | 'chief-digital-officer'
  | 'chief-technology-officer'
  | 'chief-growth-officer'
  | 'executive-council'
  | 'organizational-intelligence'
  | 'organizational-autonomy-framework'
  | 'organizational-delegation-engine'
  | 'organizational-workflow-orchestration'
  | 'organizational-self-improvement'
  | 'organizational-governance-safeguards'
  | 'organizational-maturity-model'
  | 'leadership-modes'
  | 'company-onboarding-intelligence'
  | 'arrival-experience'
  | 'executive-apprenticeship-founder-calibration'
  | 'studio-institute'
  | 'organizational-apprenticeship'
  | 'concierge-layer'
  | 'production-studio'
  | 'render-queue'
  | 'screening-room'
  | 'concierge-approval-flow'
  | 'design-dna-canon'
  | 'design-genome'
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
  'strategy-engine',
  'campaign-engine',
  'work-orchestration',
  'distribution-engine',
  'reader-graph',
  'relationship-engine',
  'creator-marketplace',
  'ecosystem-marketplace',
  'knowledge-asset-engine',
  'company-maturity-engine',
  'brand-architect',
  'experience-architect',
  'digital-architect',
  'growth-architect',
  'company-genome',
  'architect-studio',
  'campus-evolution-engine',
  'founder-walk',
  'remembrance-garden',
  'founders-promise',
  'executive-framework',
  'leadership-manifesto-framework',
  'chief-brand-officer',
  'chief-experience-officer',
  'chief-digital-officer',
  'chief-technology-officer',
  'chief-growth-officer',
  'executive-council',
  'organizational-intelligence',
  'organizational-autonomy-framework',
  'organizational-delegation-engine',
  'organizational-workflow-orchestration',
  'organizational-self-improvement',
  'organizational-governance-safeguards',
  'organizational-maturity-model',
  'leadership-modes',
  'company-onboarding-intelligence',
  'arrival-experience',
  'executive-apprenticeship-founder-calibration',
  'studio-institute',
  'organizational-apprenticeship',
  'concierge-layer',
  'production-studio',
  'render-queue',
  'screening-room',
  'concierge-approval-flow',
  'design-dna-canon',
  'design-genome',
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
  strategyEngine: 'studio/strategy-engine',
  campaignEngine: 'studio/campaign-engine',
  workOrchestration: 'studio/work-orchestration',
  distributionEngine: 'studio/distribution-engine',
  readerGraph: 'studio/reader-graph',
  relationshipEngine: 'studio/relationship-engine',
  creatorMarketplace: 'studio/creator-marketplace',
  ecosystemMarketplace: 'studio/ecosystem-marketplace',
  knowledgeAssetEngine: 'studio/knowledge-asset-engine',
  companyMaturityEngine: 'studio/company-maturity-engine',
  brandArchitect: 'studio/brand-architect',
  experienceArchitect: 'studio/experience-architect',
  digitalArchitect: 'studio/digital-architect',
  growthArchitect: 'studio/growth-architect',
  companyGenome: 'studio/company-genome',
  architectStudio: 'studio/architect-studio',
  campusEvolutionEngine: 'studio/campus-evolution-engine',
  founderWalk: 'studio/founder-walk',
  remembranceGarden: 'studio/remembrance-garden',
  foundersPromise: 'studio/founders-promise',
  executiveFramework: 'studio/executive-framework',
  leadershipManifestoFramework: 'studio/leadership-manifesto-framework',
  chiefBrandOfficer: 'studio/chief-brand-officer',
  chiefExperienceOfficer: 'studio/chief-experience-officer',
  chiefDigitalOfficer: 'studio/chief-digital-officer',
  chiefTechnologyOfficer: 'studio/chief-technology-officer',
  chiefGrowthOfficer: 'studio/chief-growth-officer',
  executiveCouncil: 'studio/executive-council',
  organizationalIntelligence: 'studio/organizational-intelligence',
  organizationalAutonomyFramework: 'studio/organizational-autonomy-framework',
  organizationalDelegationEngine: 'studio/organizational-delegation-engine',
  organizationalWorkflowOrchestration: 'studio/organizational-workflow-orchestration',
  organizationalSelfImprovement: 'studio/organizational-self-improvement',
  organizationalGovernanceSafeguards: 'studio/organizational-governance-safeguards',
  organizationalMaturityModel: 'studio/organizational-maturity-model',
  leadershipModes: 'studio/leadership-modes',
  companyOnboardingIntelligence: 'studio/company-onboarding-intelligence',
  arrivalExperience: 'studio/arrival-experience',
  executiveApprenticeshipFounderCalibration: 'studio/executive-apprenticeship-founder-calibration',
  studioInstitute: 'studio/studio-institute',
  organizationalApprenticeship: 'studio/organizational-apprenticeship',
  conciergeLayer: 'studio/concierge-layer',
  productionStudio: 'studio/production-studio',
  renderQueue: 'studio/render-queue',
  screeningRoom: 'studio/screening-room',
  conciergeApprovalFlow: 'studio/concierge-approval-flow',
  designDnaCanon: 'studio/design-dna-canon',
  designGenome: 'studio/design-genome',
  executiveTimeline: 'studio/executive-timeline',
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

export function adminStudioStrategyEnginePath(): string {
  return `${ADMIN_STUDIO_BASE_PATH}/strategy-engine`;
}

export function adminStudioCampaignEnginePath(): string {
  return `${ADMIN_STUDIO_BASE_PATH}/campaign-engine`;
}

export function adminStudioWorkOrchestrationPath(): string {
  return `${ADMIN_STUDIO_BASE_PATH}/work-orchestration`;
}

export function adminStudioDistributionEnginePath(): string {
  return `${ADMIN_STUDIO_BASE_PATH}/distribution-engine`;
}

export function adminStudioReaderGraphPath(): string {
  return `${ADMIN_STUDIO_BASE_PATH}/reader-graph`;
}

export function adminStudioRelationshipEnginePath(): string {
  return `${ADMIN_STUDIO_BASE_PATH}/relationship-engine`;
}

export function adminStudioCreatorMarketplacePath(): string {
  return `${ADMIN_STUDIO_BASE_PATH}/creator-marketplace`;
}

export function adminStudioEcosystemMarketplacePath(): string {
  return `${ADMIN_STUDIO_BASE_PATH}/ecosystem-marketplace`;
}

export function adminStudioKnowledgeAssetEnginePath(): string {
  return `${ADMIN_STUDIO_BASE_PATH}/knowledge-asset-engine`;
}

export function adminStudioCompanyMaturityEnginePath(): string {
  return `${ADMIN_STUDIO_BASE_PATH}/company-maturity-engine`;
}

export function adminStudioBrandArchitectPath(): string {
  return `${ADMIN_STUDIO_BASE_PATH}/brand-architect`;
}

export function adminStudioExperienceArchitectPath(): string {
  return `${ADMIN_STUDIO_BASE_PATH}/experience-architect`;
}

export function adminStudioDigitalArchitectPath(): string {
  return `${ADMIN_STUDIO_BASE_PATH}/digital-architect`;
}

export function adminStudioGrowthArchitectPath(): string {
  return `${ADMIN_STUDIO_BASE_PATH}/growth-architect`;
}

export function adminStudioCompanyGenomePath(): string {
  return `${ADMIN_STUDIO_BASE_PATH}/company-genome`;
}

export function adminStudioArchitectStudioPath(): string {
  return `${ADMIN_STUDIO_BASE_PATH}/architect-studio`;
}

export function adminStudioCampusEvolutionEnginePath(): string {
  return `${ADMIN_STUDIO_BASE_PATH}/campus-evolution-engine`;
}

export function adminStudioFounderWalkPath(): string {
  return `${ADMIN_STUDIO_BASE_PATH}/founder-walk`;
}

export function adminStudioRemembranceGardenPath(): string {
  return `${ADMIN_STUDIO_BASE_PATH}/remembrance-garden`;
}

export function adminStudioFoundersPromisePath(): string {
  return `${ADMIN_STUDIO_BASE_PATH}/founders-promise`;
}

export function adminStudioExecutiveFrameworkPath(): string {
  return `${ADMIN_STUDIO_BASE_PATH}/executive-framework`;
}

export function adminStudioLeadershipManifestoFrameworkPath(): string {
  return `${ADMIN_STUDIO_BASE_PATH}/leadership-manifesto-framework`;
}

export function adminStudioChiefBrandOfficerPath(): string {
  return `${ADMIN_STUDIO_BASE_PATH}/chief-brand-officer`;
}

export function adminStudioChiefExperienceOfficerPath(): string {
  return `${ADMIN_STUDIO_BASE_PATH}/chief-experience-officer`;
}

export function adminStudioChiefDigitalOfficerPath(): string {
  return `${ADMIN_STUDIO_BASE_PATH}/chief-digital-officer`;
}

export function adminStudioChiefTechnologyOfficerPath(): string {
  return `${ADMIN_STUDIO_BASE_PATH}/chief-technology-officer`;
}

export function adminStudioChiefGrowthOfficerPath(): string {
  return `${ADMIN_STUDIO_BASE_PATH}/chief-growth-officer`;
}

export function adminStudioExecutiveCouncilPath(): string {
  return `${ADMIN_STUDIO_BASE_PATH}/executive-council`;
}

export function adminStudioOrganizationalIntelligencePath(): string {
  return `${ADMIN_STUDIO_BASE_PATH}/organizational-intelligence`;
}

export function adminStudioOrganizationalAutonomyFrameworkPath(): string {
  return `${ADMIN_STUDIO_BASE_PATH}/organizational-autonomy-framework`;
}

export function adminStudioOrganizationalDelegationEnginePath(): string {
  return `${ADMIN_STUDIO_BASE_PATH}/organizational-delegation-engine`;
}

export function adminStudioOrganizationalWorkflowOrchestrationPath(): string {
  return `${ADMIN_STUDIO_BASE_PATH}/organizational-workflow-orchestration`;
}

export function adminStudioOrganizationalSelfImprovementPath(): string {
  return `${ADMIN_STUDIO_BASE_PATH}/organizational-self-improvement`;
}

export function adminStudioOrganizationalGovernanceSafeguardsPath(): string {
  return `${ADMIN_STUDIO_BASE_PATH}/organizational-governance-safeguards`;
}

export function adminStudioOrganizationalMaturityModelPath(): string {
  return `${ADMIN_STUDIO_BASE_PATH}/organizational-maturity-model`;
}

export function adminStudioLeadershipModesPath(): string {
  return `${ADMIN_STUDIO_BASE_PATH}/leadership-modes`;
}

export function adminStudioCompanyOnboardingIntelligencePath(): string {
  return `${ADMIN_STUDIO_BASE_PATH}/company-onboarding-intelligence`;
}

export function adminStudioArrivalExperiencePath(): string {
  return `${ADMIN_STUDIO_BASE_PATH}/arrival-experience`;
}

export function adminStudioExecutiveApprenticeshipFounderCalibrationPath(): string {
  return `${ADMIN_STUDIO_BASE_PATH}/executive-apprenticeship-founder-calibration`;
}

export function adminStudioStudioInstitutePath(): string {
  return `${ADMIN_STUDIO_BASE_PATH}/studio-institute`;
}

export function adminStudioOrganizationalApprenticeshipPath(): string {
  return `${ADMIN_STUDIO_BASE_PATH}/organizational-apprenticeship`;
}

export function adminStudioConciergeLayerPath(): string {
  return `${ADMIN_STUDIO_BASE_PATH}/concierge-layer`;
}

export function adminStudioProductionStudioPath(): string {
  return `${ADMIN_STUDIO_BASE_PATH}/production-studio`;
}

export function adminStudioRenderQueuePath(): string {
  return `${ADMIN_STUDIO_BASE_PATH}/render-queue`;
}

export function adminStudioScreeningRoomPath(): string {
  return `${ADMIN_STUDIO_BASE_PATH}/screening-room`;
}

export function adminStudioConciergeApprovalFlowPath(): string {
  return `${ADMIN_STUDIO_BASE_PATH}/concierge-approval-flow`;
}

export function adminStudioDesignDnaCanonPath(): string {
  return `${ADMIN_STUDIO_BASE_PATH}/design-dna-canon`;
}

export function adminStudioDesignGenomePath(): string {
  return `${ADMIN_STUDIO_BASE_PATH}/design-genome`;
}

export function adminStudioExecutiveTimelinePath(): string {
  return `${ADMIN_STUDIO_BASE_PATH}/executive-timeline`;
}

export function adminStudioPublishingQueuePath(): string {
  return `${ADMIN_STUDIO_BASE_PATH}/publishing-queue`;
}

export function adminStudioNdxbookNewsroomPath(): string {
  return `${ADMIN_STUDIO_BASE_PATH}/ndxbook?tab=pages`;
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

export function adminStudioNdxbookMissionControlPath(): string {
  return `${ADMIN_STUDIO_BASE_PATH}/ndxbook/mission-control`;
}

/** Distribution network scoped to NDXBOOK (sets ai-media workspace via ?brand=ndxbook). */
export function adminStudioNdxbookDistributionPath(): string {
  return `${ADMIN_STUDIO_BASE_PATH}/distribution-network?brand=ndxbook`;
}

export function adminStudioNdxbookSocialAccountsPath(): string {
  return `${ADMIN_STUDIO_BASE_PATH}/social-accounts?brand=ndxbook`;
}

export function adminStudioNdxbookDistributionPackPath(packId: string): string {
  return `${ADMIN_STUDIO_BASE_PATH}/distribution-network/${packId}?brand=ndxbook`;
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
