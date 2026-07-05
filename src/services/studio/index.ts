export { requestStudioAssetGeneration, requestStudioAssetReplace } from './assetGeneration/api';
export type { StudioGenerateAssetResponse, StudioReplaceAssetResponse } from './assetGeneration/api';
export { studioServiceNotConnected, studioServicePhase2 } from './types';

export { openaiStudioService } from './openai';
export type { OpenAICompletionInput, OpenAICompletionOutput } from './openai';

export { falStudioService } from './fal';
export type { FalImageInput, FalImageOutput } from './fal';

export { resendStudioService } from './resend';
export type { ResendEmailInput, ResendEmailOutput } from './resend';

export { psaKnowledgeStudioService } from './psaKnowledge';
export type { PsaKnowledgeQueryInput, PsaKnowledgeQueryOutput } from './psaKnowledge';

export { publishingStudioService } from './publishing';
export type { PublishingTarget, PublishingJobOutput } from './publishing';

export { schedulingStudioService } from './scheduling';
export type { ScheduleSlotInput, ScheduleSlotOutput } from './scheduling';

export { distributionStudioService } from './distribution';
export type { DistributionDispatchInput, DistributionDispatchOutput } from './distribution';

export { contentBrainStudioService } from './contentBrain';
export type { ContentBrainQueryInput, ContentBrainQueryOutput } from './contentBrain';

export { creativeDirectorStudioService } from './creativeDirector/service';
export type { CreativeDirectorAssembleInput, CreativeDirectorAssembleOutput } from './creativeDirector/service';
export type { CreativeDirectorSession, EditorReviewAction } from './creativeDirector';
export {
  buildCreativeDirectorPackage,
  recommendShowForTopic,
  syncSessionFromRecommendation,
  applyEditorReviewAction,
} from './creativeDirector';

export { intelligenceEngineStudioService, buildIntelligenceSnapshot, buildCreativeDirectorFeed } from './intelligenceEngine';
export type { IntelligenceEngineSnapshot, CreativeDirectorIntelligenceFeed, ConnectorStateMap } from './intelligenceEngine';

export { aiOrchestratorStudioService, planOrchestratorRun, createEmptyPack } from './orchestrator';
export type { OrchestratedContentPack } from './orchestrator';

export { showBibleStudioService, getShowSnapshot, inheritForEpisode, validateProductionChecklist } from './showBible/service';
export type { ShowBibleSnapshot, ShowBibleEpisodeInheritance, ShowBibleChecklistValidation } from './showBible/service';

export { studioLotStudioService, getStudioSnapshot, inheritForGeneration } from './studioLot/service';
export type { StudioLotSnapshot, StudioLotInheritance } from './studioLot/service';

export { talentAgencyStudioService, getTalentSnapshot, inheritForGeneration as inheritTalentForGeneration } from './talentAgency/service';
export type { TalentAgencySnapshot, TalentInheritance } from './talentAgency/service';

export { castingStudioService, validateCastApproval, getCastingInheritance } from './casting/service';
export type { CastingSnapshot, CastingApprovalValidation, CastingInheritance } from './casting/service';

export { productionStudioService, validateProductionReadiness, getPackContext, PRODUCTION_QA_ITEMS } from './production/service';
export type { ProductionSnapshot, ProductionReadiness, ProductionPackContext } from './production/service';

export { aiProductionEngineStudioService, AI_PRODUCTION_INHERITANCE_CHAIN, AI_PRODUCTION_QUALITY_THRESHOLD } from './aiProductionEngine/service';
export type { AiProductionEngineSnapshot, AiProductionRunReadiness } from './aiProductionEngine/service';

export { distributionNetworkStudioService, DISTRIBUTION_INHERITANCE_CHAIN } from './distributionNetwork/service';
export type { DistributionNetworkSnapshot, DistributionPackValidation } from './distributionNetwork/service';

export { audienceBrainStudioService, AUDIENCE_FEEDBACK_LOOP_TARGETS, AUDIENCE_INHERITANCE_CHAIN, confidenceLabel } from './audienceBrain/service';
export type { AudienceBrainSnapshot, AudienceBrainFeed } from './audienceBrain/service';

export { growthNetworkStudioService, GROWTH_INHERITANCE_CHAIN, getGrowthExecutivesForWorkspace } from './growthNetwork/service';
export type { GrowthNetworkSnapshot, GrowthNetworkStudioService } from './growthNetwork/service';

export { labsStudioService, LABS_INHERITANCE_CHAIN, getLabsExecutivesForWorkspace } from './labs/service';
export type { LabsSnapshot, LabsStudioService } from './labs/service';

export { aiMediaNetworkStudioService, AI_MEDIA_NETWORK_INHERITANCE_CHAIN, ADMIN_STUDIO_AI_MEDIA_NETWORK_SUBTITLE } from './aiMediaNetwork/service';
export type { AiMediaNetworkSnapshot, AiMediaNetworkStudioService } from './aiMediaNetwork/service';
export { ndxbookStudioService, NDXBOOK_INHERITANCE_CHAIN, ADMIN_STUDIO_NDXBOOK_SUBTITLE } from './ndxbook/service';
export type { NdxbookSnapshot, NdxbookStudioService } from './ndxbook/service';

export { talentNetworkStudioService, TALENT_NETWORK_INHERITANCE_CHAIN, ADMIN_STUDIO_TALENT_NETWORK_SUBTITLE } from './talentNetwork/service';
export type { TalentNetworkSnapshot, TalentNetworkStudioService } from './talentNetwork/service';

export { marketplaceStudioService, MARKETPLACE_INHERITANCE_CHAIN, ADMIN_STUDIO_MARKETPLACE_SUBTITLE } from './marketplace/service';
export type { MarketplaceSnapshot, MarketplaceStudioService } from './marketplace/service';

export { businessModelEngineStudioService, BME_INHERITANCE_CHAIN, ADMIN_STUDIO_BME_SUBTITLE } from './businessModelEngine/service';
export type { BusinessModelEngineSnapshot, BusinessModelEngineStudioService } from './businessModelEngine/service';

export { ecosystemStudioService, ECOSYSTEM_INHERITANCE_CHAIN, ADMIN_STUDIO_ECOSYSTEM_SUBTITLE } from './ecosystem/service';
export type { EcosystemSnapshot, EcosystemStudioService } from './ecosystem/service';

export { governanceStudioService, GOVERNANCE_INHERITANCE_CHAIN, ADMIN_STUDIO_GOVERNANCE_SUBTITLE } from './governance/service';
export type { GovernanceSnapshot, GovernanceStudioService } from './governance/service';

export { studioIntelligenceStudioService, STUDIO_INTELLIGENCE_INHERITANCE_CHAIN, ADMIN_STUDIO_STUDIO_INTELLIGENCE_SUBTITLE } from './studio-intelligence/service';
export type { StudioIntelligenceSnapshot, StudioIntelligenceStudioService } from './studio-intelligence/service';

export { simulationEngineStudioService, SIMULATION_ENGINE_INHERITANCE_CHAIN, ADMIN_STUDIO_SIMULATION_ENGINE_SUBTITLE } from './simulation-engine/service';
export type { SimulationEngineSnapshot, SimulationEngineStudioService } from './simulation-engine/service';

export { visionEngineStudioService, VISION_ENGINE_INHERITANCE_CHAIN } from './visionEngine/service';
export type { VisionEngineSnapshot } from './visionEngine/service';

export { executiveCommandCenterStudioService, EXECUTIVE_REPORTING_CHAIN } from './executiveCommandCenter/service';
export type { ExecutiveCommandCenterSnapshot, ExecutiveSummary } from './executiveCommandCenter/service';

export { legacySystemStudioService, LEGACY_CONTRIBUTION_CHAIN } from './legacySystem/service';
export type { LegacySystemSnapshot, LegacyMuseumSummary } from './legacySystem/service';

export { assetDirectorStudioService, ASSET_DIRECTOR_INHERITANCE_CHAIN } from './assetDirector/service';
export type { AssetDirectorSnapshot, AssetDirectorSummary } from './assetDirector/service';

export { productionBuilderStudioService, PRODUCTION_BUILDER_INHERITANCE_CHAIN } from './productionBuilder/service';
export type { ProductionBuilderSnapshot, ProductionBuilderSummary } from './productionBuilder/service';

export { directorModeStudioService, DIRECTOR_MODE_INHERITANCE_CHAIN } from './directorMode/service';
export type { DirectorModeSnapshot, DirectorModeSummary } from './directorMode/service';

export { executiveAiDirectorStudioService, EXECUTIVE_AI_DIRECTOR_INHERITANCE_CHAIN } from './executiveAiDirector/service';
export type { ExecutiveAiDirectorSnapshot, ExecutiveAiDirectorSummary } from './executiveAiDirector/service';

export { campaignOrchestratorStudioService, CAMPAIGN_ORCHESTRATOR_INHERITANCE_CHAIN } from './campaignOrchestrator/service';
export type { CampaignOrchestratorSnapshot, CampaignOrchestratorSummary } from './campaignOrchestrator/service';

export { missionControlStudioService, MISSION_CONTROL_INHERITANCE_CHAIN } from './missionControl/service';
export type { MissionControlSnapshot, MissionControlSummary } from './missionControl/service';

export { chiefOfStaffStudioService, CHIEF_OF_STAFF_INHERITANCE_CHAIN } from './chiefOfStaff/service';
export type { ChiefOfStaffSnapshot } from './chiefOfStaff/service';

export { leadershipDnaStudioService, LEADERSHIP_DNA_INHERITANCE_CHAIN } from './leadershipDna/service';
export type { LeadershipDnaSnapshot } from './leadershipDna/service';

export { ndxbookNewsroomStudioService, NDXBOOK_NEWSROOM_INHERITANCE_CHAIN } from './ndxbookNewsroom/service';
export type { NdxbookNewsroomSnapshot } from './ndxbookNewsroom/service';

export { executiveOrganizationStudioService, EXECUTIVE_ORGANIZATION_INHERITANCE_CHAIN } from './executiveOrganization/service';
export type { ExecutiveOrganizationSnapshot } from './executiveOrganization/service';

export { organizationalInheritanceStudioService, ORGANIZATIONAL_INHERITANCE_CHAIN } from './organizationalInheritance/service';
export type { OrganizationalInheritanceSnapshot } from './organizationalInheritance/service';

export { strategyEngineStudioService, STRATEGY_ENGINE_INHERITANCE_CHAIN } from './strategyEngine/service';
export type { StrategyEngineSnapshot } from './strategyEngine/service';

export { campaignEngineStudioService, CAMPAIGN_ENGINE_CHAIN } from './campaignEngine/service';
export type { CampaignEngineSnapshot } from './campaignEngine/service';

export { workOrchestrationStudioService, WORK_ORCHESTRATION_CHAIN } from './workOrchestration/service';
export type { WorkOrchestrationSnapshot } from './workOrchestration/service';

export { distributionEngineStudioService, DISTRIBUTION_ENGINE_CHAIN } from './distributionEngine/service';
export type { DistributionEngineSnapshot } from './distributionEngine/service';

export { readerGraphStudioService, READER_GRAPH_CHAIN } from './readerGraph/service';
export type { ReaderGraphSnapshot } from './readerGraph/service';

export { blueprintManagerStudioService, BLUEPRINT_MANAGER_INHERITANCE_CHAIN } from './blueprintManager/service';
export type { BlueprintManagerSnapshot, BlueprintManagerSummary } from './blueprintManager/service';

export { assetFactoryStudioService, ASSET_FACTORY_INHERITANCE_CHAIN } from './assetFactory/service';
export type { AssetFactorySnapshot, AssetFactorySummary } from './assetFactory/service';

export { knowledgeHubStudioService } from './knowledgeHub/service';
export type { KnowledgeHubQueryInput, KnowledgeHubQueryOutput } from './knowledgeHub/service';

export {
  productPhotographyBibleStudioService,
  getPhotographyBibleSnapshot,
  inheritPhotographyForNewProduct,
  PHOTOGRAPHY_BIBLE_INHERITANCE_CHAIN_EXPORT,
} from './productPhotographyBible/service';
export type { ProductPhotographyBibleSnapshot, ProductPhotographyInheritance } from './productPhotographyBible/service';

export {
  photographyDerivativeEngineStudioService,
  getPhotographyDerivativeEngineSnapshot,
  runHeroApprovalDerivativePipeline,
  resolveSiteAssetFromDerivatives,
} from './photographyDerivativeEngine/service';
export type { PhotographyDerivativeEngineSnapshot } from './photographyDerivativeEngine/service';

export {
  brandAssetsProductAssetFactoryStudioService,
  getBrandAssetsProductAssetFactorySnapshot,
} from './brandAssetsProductAssetFactory/service';
export type { BrandAssetsProductAssetFactorySnapshot } from './brandAssetsProductAssetFactory/service';

export {
  photographyCreativeDnaStudioService,
  getPhotographyCreativeDnaSnapshot,
} from './photographyCreativeDna/service';
export type { PhotographyCreativeDnaSnapshot } from './photographyCreativeDna/service';

export { tutorialOsStudioService } from './tutorialOs/service';
export type { MemoryBibleBuildInput, MemoryBibleBuildOutput } from './memoryBible/service';

export { memoryBibleStudioService } from './memoryBible/service';

import { openaiStudioService } from './openai';
import { falStudioService } from './fal';
import { resendStudioService } from './resend';
import { psaKnowledgeStudioService } from './psaKnowledge';
import { publishingStudioService } from './publishing';
import { schedulingStudioService } from './scheduling';
import { distributionStudioService } from './distribution';
import { contentBrainStudioService } from './contentBrain';
import { creativeDirectorStudioService } from './creativeDirector/service';
import { intelligenceEngineStudioService } from './intelligenceEngine';
import { aiOrchestratorStudioService } from './orchestrator';
import { showBibleStudioService } from './showBible/service';
import { studioLotStudioService } from './studioLot/service';
import { talentAgencyStudioService } from './talentAgency/service';
import { castingStudioService } from './casting/service';
import { productionStudioService } from './production/service';
import { aiProductionEngineStudioService } from './aiProductionEngine/service';
import { distributionNetworkStudioService } from './distributionNetwork/service';
import { audienceBrainStudioService } from './audienceBrain/service';
import { growthNetworkStudioService } from './growthNetwork/service';
import { labsStudioService } from './labs/service';
import { aiMediaNetworkStudioService } from './aiMediaNetwork/service';
import { ndxbookStudioService } from './ndxbook/service';
import { talentNetworkStudioService } from './talentNetwork/service';
import { marketplaceStudioService } from './marketplace/service';
import { businessModelEngineStudioService } from './businessModelEngine/service';
import { ecosystemStudioService } from './ecosystem/service';
import { governanceStudioService } from './governance/service';
import { studioIntelligenceStudioService } from './studio-intelligence/service';
import { simulationEngineStudioService } from './simulation-engine/service';
import { executiveCommandCenterStudioService } from './executiveCommandCenter/service';
import { legacySystemStudioService } from './legacySystem/service';
import { assetDirectorStudioService } from './assetDirector/service';
import { productionBuilderStudioService } from './productionBuilder/service';
import { directorModeStudioService } from './directorMode/service';
import { executiveAiDirectorStudioService } from './executiveAiDirector/service';
import { campaignOrchestratorStudioService } from './campaignOrchestrator/service';
import { missionControlStudioService } from './missionControl/service';
import { chiefOfStaffStudioService } from './chiefOfStaff/service';
import { leadershipDnaStudioService } from './leadershipDna/service';
import { ndxbookNewsroomStudioService } from './ndxbookNewsroom/service';
import { executiveOrganizationStudioService } from './executiveOrganization/service';
import { organizationalInheritanceStudioService } from './organizationalInheritance/service';
import { strategyEngineStudioService } from './strategyEngine/service';
import { campaignEngineStudioService } from './campaignEngine/service';
import { workOrchestrationStudioService } from './workOrchestration/service';
import { distributionEngineStudioService } from './distributionEngine/service';
import { readerGraphStudioService } from './readerGraph/service';
import { blueprintManagerStudioService } from './blueprintManager/service';
import { assetFactoryStudioService } from './assetFactory/service';
import { socialPublishingStudioService } from './socialPublishing/service';
import { knowledgeHubStudioService } from './knowledgeHub/service';
import { memoryBibleStudioService } from './memoryBible/service';
import { productPhotographyBibleStudioService } from './productPhotographyBible/service';
import { photographyDerivativeEngineStudioService } from './photographyDerivativeEngine/service';
import { brandAssetsProductAssetFactoryStudioService } from './brandAssetsProductAssetFactory/service';
import { photographyCreativeDnaStudioService } from './photographyCreativeDna/service';
import { tutorialOsStudioService } from './tutorialOs/service';
import type { StudioServiceStub } from './types';

/** Registry of all Studio service stubs — Phase 2 integration entry points. */
export const STUDIO_SERVICE_REGISTRY: StudioServiceStub[] = [
  contentBrainStudioService,
  creativeDirectorStudioService,
  showBibleStudioService,
  studioLotStudioService,
  talentAgencyStudioService,
  castingStudioService,
  productionStudioService,
  aiProductionEngineStudioService,
  distributionNetworkStudioService,
  audienceBrainStudioService,
  growthNetworkStudioService,
  labsStudioService,
  aiMediaNetworkStudioService,
  ndxbookStudioService,
  talentNetworkStudioService,
  marketplaceStudioService,
  businessModelEngineStudioService,
  ecosystemStudioService,
  governanceStudioService,
  studioIntelligenceStudioService,
  simulationEngineStudioService,
  executiveCommandCenterStudioService,
  legacySystemStudioService,
  assetDirectorStudioService,
  productionBuilderStudioService,
  directorModeStudioService,
  executiveAiDirectorStudioService,
  campaignOrchestratorStudioService,
  missionControlStudioService,
  chiefOfStaffStudioService,
  leadershipDnaStudioService,
  ndxbookNewsroomStudioService,
  executiveOrganizationStudioService,
  organizationalInheritanceStudioService,
  strategyEngineStudioService,
  campaignEngineStudioService,
  workOrchestrationStudioService,
  distributionEngineStudioService,
  readerGraphStudioService,
  blueprintManagerStudioService,
  assetFactoryStudioService,
  socialPublishingStudioService,
  knowledgeHubStudioService,
  memoryBibleStudioService,
  tutorialOsStudioService,
  productPhotographyBibleStudioService,
  photographyDerivativeEngineStudioService,
  brandAssetsProductAssetFactoryStudioService,
  photographyCreativeDnaStudioService,
  intelligenceEngineStudioService,
  aiOrchestratorStudioService,
  openaiStudioService,
  falStudioService,
  resendStudioService,
  psaKnowledgeStudioService,
  publishingStudioService,
  schedulingStudioService,
  distributionStudioService,
];
