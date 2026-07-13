import { resolveArtifactIntent, validatorExistsForIntent } from '../creative-production/artifact-intent';
import type { SceneStackLayerId } from '../scene-stack/types';

export type PreflightFailureCode =
  | 'NO_VALIDATOR_FOR_ARTIFACT_INTENT'
  | 'UNREACHABLE_COMPLETION_STATE'
  | 'MISSING_ARTIFACT_INTENT';

export type GenerationPreflightResult =
  | { ok: true; artifactIntent: string }
  | { ok: false; code: PreflightFailureCode; message: string };

export function runGenerationArtifactPreflight(input: {
  layerId: SceneStackLayerId;
  creativeStudioStackMode?: boolean;
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
  return { ok: true, artifactIntent: intent };
}
