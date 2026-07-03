import { buildDistributionRecommendations } from './qualityGate';
import { buildDecisionRecommendation } from './decisionEngine';
import { evaluateBrandAlignment } from './brandValidation';
import { evaluateContentScore } from './contentScoring';
import { evaluateQualityGate } from './qualityGate';
import { assembleMasterPrompt } from './promptAssembler';
import type { CreativeDirectorDecisionPackage, CreativeDirectorSession } from './types';

export function buildCreativeDirectorPackage(session: CreativeDirectorSession): CreativeDirectorDecisionPackage {
  return {
    session,
    recommendation: buildDecisionRecommendation(session),
    brandAlignment: evaluateBrandAlignment(session),
    contentScore: evaluateContentScore(session),
    qualityGate: evaluateQualityGate(session),
    promptAssembly: assembleMasterPrompt(session),
    distribution: buildDistributionRecommendations(session),
  };
}

export {
  buildDecisionRecommendation,
  recommendShowForTopic,
  syncSessionFromRecommendation,
} from './decisionEngine';
export { evaluateBrandAlignment } from './brandValidation';
export { evaluateContentScore } from './contentScoring';
export { evaluateQualityGate, buildDistributionRecommendations } from './qualityGate';
export { assembleMasterPrompt } from './promptAssembler';
export { applyEditorReviewAction, canProceedToPublishing, blockAutoPublish } from './approvalLogic';
export type { EditorReviewAction } from './approvalLogic';
export { creativeDirectorStudioService } from './service';
export type { CreativeDirectorAssembleInput, CreativeDirectorAssembleOutput } from './service';
export type * from './types';
