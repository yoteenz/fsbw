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
import type { StudioServiceStub } from './types';

/** Registry of all Studio service stubs — Phase 2 integration entry points. */
export const STUDIO_SERVICE_REGISTRY: StudioServiceStub[] = [
  contentBrainStudioService,
  creativeDirectorStudioService,
  showBibleStudioService,
  studioLotStudioService,
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
