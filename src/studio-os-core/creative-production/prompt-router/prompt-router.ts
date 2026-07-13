import type { ArtifactIntent } from '../artifact-intent';
import type { ModelAssetClass } from '../model-registry/types';
import { resolveAssetClassForIntent } from '../model-routing-engine/intent-matrix';
import { VERSIONED_GENERATION_PROMPTS } from './prompt-registry';
import type { PromptRoutingDecision, ResolvePromptRoutingInput } from './types';
import { PROMPT_ROUTER_VERSION } from './types';

const INTENT_PROMPT_MAP: Partial<Record<ArtifactIntent, string>> = {
  'founder-full-room-preview': 'founder-full-room-preview-prompt.v1',
  'experience-environment': 'experience-environment-prompt.v1',
  'world-preview': 'world-preview-prompt.v1',
  'world-expansion': 'world-expansion-prompt.v1',
  'environment-shell': 'environment-shell-prompt.v1',
  'final-scene': 'environment-shell-prompt.v1',
  'final-scene-preview': 'environment-shell-prompt.v1',
  'reception-desk': 'asset-reception-desk-prompt.v1',
  'furniture-asset': 'asset-chair-prompt.v1',
  'object-group': 'furniture-objects-isolated-prompt.v3',
  'landmark-asset': 'signature-landmark-isolated-prompt.v3',
  'isolated-object': 'signature-landmark-isolated-prompt.v3',
  'logo-asset': 'asset-logo-prompt.v1',
  'logo-component': 'asset-logo-prompt.v1',
  'full-logo': 'asset-logo-prompt.v1',
  'campaign-graphic': 'asset-campaign-prompt.v1',
  'campaign-composite': 'asset-campaign-prompt.v1',
  'poster': 'asset-campaign-prompt.v1',
  'packaging-asset': 'asset-packaging-prompt.v1',
  'packaging-composite': 'asset-packaging-prompt.v1',
  'decor-asset': 'asset-decor-prompt.v1',
  'architecture-piece': 'asset-architecture-piece-prompt.v1',
  'fixture': 'asset-fixture-prompt.v1',
  'lighting-object': 'asset-lighting-object-prompt.v1',
  'background-cleanup': 'background-cleanup-prompt.v1',
  'transparent-overlay': 'blend-overlay-prompt.v1',
  'material-map': 'blend-overlay-prompt.v1',
  'campaign-model-replacement': 'asset-campaign-prompt.v1',
};

const ASSET_CLASS_PROMPT_FALLBACK: Partial<Record<ModelAssetClass, string>> = {
  'founder-full-room-preview': 'founder-full-room-preview-prompt.v1',
  'environment-shell': 'environment-shell-prompt.v1',
  'signature-landmark': 'signature-landmark-isolated-prompt.v3',
  'furniture-objects': 'furniture-objects-isolated-prompt.v3',
  'reception-structure': 'asset-reception-desk-prompt.v1',
  'architectural-prop': 'asset-architecture-piece-prompt.v1',
  'decorative-object': 'asset-decor-prompt.v1',
  'background-removal': 'background-cleanup-prompt.v1',
  'material-overlay': 'blend-overlay-prompt.v1',
  'atmosphere-overlay': 'blend-overlay-prompt.v1',
  'motion-overlay': 'blend-overlay-prompt.v1',
  'reflection-overlay': 'blend-overlay-prompt.v1',
};

function resolvePromptBuilderId(intent: ArtifactIntent, assetClass: ModelAssetClass): string {
  return (
    INTENT_PROMPT_MAP[intent] ??
    ASSET_CLASS_PROMPT_FALLBACK[assetClass] ??
    'blend-overlay-prompt.v1'
  );
}

/** PromptRouter™ — selects versioned prompt contracts before any worker executes. */
export function resolvePromptRouting(input: ResolvePromptRoutingInput): PromptRoutingDecision {
  const assetClass = input.assetClass ?? resolveAssetClassForIntent(input.artifactIntent);
  const promptBuilderId = resolvePromptBuilderId(input.artifactIntent, assetClass);
  const entry = VERSIONED_GENERATION_PROMPTS.find((p) => p.promptBuilderId === promptBuilderId);

  return {
    routerVersion: PROMPT_ROUTER_VERSION,
    promptBuilderId,
    promptVersion: entry?.promptVersion ?? promptBuilderId,
    artifactIntent: input.artifactIntent,
    assetClass,
  };
}

export function listVersionedGenerationPrompts(): typeof VERSIONED_GENERATION_PROMPTS {
  return [...VERSIONED_GENERATION_PROMPTS];
}
