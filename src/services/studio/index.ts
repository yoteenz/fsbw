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

import { openaiStudioService } from './openai';
import { falStudioService } from './fal';
import { resendStudioService } from './resend';
import { psaKnowledgeStudioService } from './psaKnowledge';
import { publishingStudioService } from './publishing';
import { schedulingStudioService } from './scheduling';
import { distributionStudioService } from './distribution';
import type { StudioServiceStub } from './types';

/** Registry of all Studio service stubs — Phase 2 integration entry points. */
export const STUDIO_SERVICE_REGISTRY: StudioServiceStub[] = [
  openaiStudioService,
  falStudioService,
  resendStudioService,
  psaKnowledgeStudioService,
  publishingStudioService,
  schedulingStudioService,
  distributionStudioService,
];
