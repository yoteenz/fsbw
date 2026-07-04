export type { StudioServicePhase, StudioServiceResult, StudioServiceStub, StudioServiceFailureReason } from './types';
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

export { socialPublishingStudioService } from './socialPublishing/service';
export type { SocialPublishingSnapshot } from './socialPublishing/service';

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
import { executiveCommandCenterStudioService } from './executiveCommandCenter/service';
import { legacySystemStudioService } from './legacySystem/service';
import { assetDirectorStudioService } from './assetDirector/service';
import { productionBuilderStudioService } from './productionBuilder/service';
import { directorModeStudioService } from './directorMode/service';
import { executiveAiDirectorStudioService } from './executiveAiDirector/service';
import { campaignOrchestratorStudioService } from './campaignOrchestrator/service';
import { socialPublishingStudioService } from './socialPublishing/service';
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
  executiveCommandCenterStudioService,
  legacySystemStudioService,
  assetDirectorStudioService,
  productionBuilderStudioService,
  directorModeStudioService,
  executiveAiDirectorStudioService,
  campaignOrchestratorStudioService,
  socialPublishingStudioService,
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
