import { resolveArtifactIntent, validatorExistsForIntent } from '../creative-production/artifact-intent';
import { validateAndResolveModelRouting } from './model-routing-validation';
import type { SceneStackLayerId } from '../scene-stack/types';

export type PreflightFailureCode =
  | 'NO_VALIDATOR_FOR_ARTIFACT_INTENT'
  | 'UNREACHABLE_COMPLETION_STATE'
  | 'MISSING_ARTIFACT_INTENT'
  | 'WORLD_INTENT_REQUIRES_NBP'
  | 'ASSET_INTENT_REQUIRES_NB2'
  | 'CLEANUP_INTENT_REQUIRES_BIREFNET'
  | 'WORLD_WORKER_ASSET_VIOLATION'
  | 'ASSET_WORKER_ROOM_VIOLATION'
  | 'SURFACE_WORKER_MISMATCH'
  | 'UNKNOWN_ARTIFACT_INTENT';

export type GenerationPreflightResult =
  | { ok: true; artifactIntent: string; routingDecision?: string }
  | { ok: false; code: PreflightFailureCode; message: string };

export function runGenerationArtifactPreflight(input: {
  layerId: SceneStackLayerId;
  creativeStudioStackMode?: boolean;
  validateModelRouting?: boolean;
}): GenerationPreflightResult {
  const intent = resolveArtifactIntent({
    layerId: input.layerId,
    creativeStudioStackMode: input.creativeStudioStackMode,
  });
  if (!intent) {
    return { ok: false, code: 'MISSING_ARTIFACT_INTENT', message: 'Artifact intent could not be resolved.' };
  }
  if (!validatorExistsForIntent(intent)) {
    return {
      ok: false,
      code: 'NO_VALIDATOR_FOR_ARTIFACT_INTENT',
      message: `No validator registered for artifact intent ${intent}.`,
    };
  }

  if (input.validateModelRouting !== false) {
    const routing = validateAndResolveModelRouting({ artifactIntent: intent, surface: 'scene-stack' });
    if (!routing.ok) {
      return { ok: false, code: routing.code, message: routing.message };
    }
    return {
      ok: true,
      artifactIntent: intent,
      routingDecision: `${routing.decision.workerFamily}:${routing.decision.routeId}`,
    };
  }

  return { ok: true, artifactIntent: intent };
}
