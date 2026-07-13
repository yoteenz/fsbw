import type { ArtifactIntent } from '../artifact-intent';
import type { ModelAssetClass } from '../model-registry/types';

export const PROMPT_ROUTER_VERSION = 'prompt-router.v1' as const;

export type VersionedPromptEntry = {
  promptBuilderId: string;
  promptVersion: string;
  artifactIntent: ArtifactIntent | null;
  assetClass: ModelAssetClass | null;
  description: string;
  workerFamily: 'world-architect' | 'asset-manufacturer' | 'background-cleanup' | 'any';
};

export type PromptRoutingDecision = {
  routerVersion: typeof PROMPT_ROUTER_VERSION;
  promptBuilderId: string;
  promptVersion: string;
  artifactIntent: ArtifactIntent;
  assetClass: ModelAssetClass;
};

export type ResolvePromptRoutingInput = {
  artifactIntent: ArtifactIntent;
  assetClass?: ModelAssetClass;
};
