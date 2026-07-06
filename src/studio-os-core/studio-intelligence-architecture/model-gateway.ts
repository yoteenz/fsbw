import {
  MODEL_GATEWAY_PROVIDER_LABELS,
  MODEL_GATEWAY_PROVIDERS,
} from './constants';
import type { ModelGatewayProvider, ModelGatewayRoute, StudioIntelligenceRequest } from './types';

export function buildModelGatewayRoutes(activeProvider: ModelGatewayProvider): ModelGatewayRoute[] {
  return MODEL_GATEWAY_PROVIDERS.map((provider) => ({
    provider,
    providerLabel: MODEL_GATEWAY_PROVIDER_LABELS[provider],
    role:
      provider === 'local-fallback'
        ? 'execution'
        : provider === 'anthropic'
          ? 'reasoning'
          : provider === 'openai'
            ? 'writing'
            : provider === 'google'
              ? 'summarization'
              : 'reasoning',
    active: provider === activeProvider,
    modelAgnostic: true,
  }));
}

export function selectModelGatewayProvider(organizationId: string): ModelGatewayProvider {
  const hash = organizationId.split('').reduce((s, c) => s + c.charCodeAt(0), 0);
  const providers = MODEL_GATEWAY_PROVIDERS.filter((p) => p !== 'local-fallback');
  return providers[hash % providers.length] ?? 'openai';
}

/** Process an AI request through Studio Intelligence™ — demo gateway, no direct vendor calls */
export function processStudioIntelligenceRequest(
  organizationId: string,
  query: string,
  organizationKnows: string,
  contextSourcesUsed: number,
  pipelineStepsComplete: number
): StudioIntelligenceRequest {
  const provider = selectModelGatewayProvider(organizationId);
  return {
    id: `sia-${Date.now()}`,
    query: query.slice(0, 120),
    organizationKnowsFirst: organizationKnows,
    modelReasoningSecond: `Reasoning via ${MODEL_GATEWAY_PROVIDER_LABELS[provider]} gateway — model assists; Studio OS owns knowledge.`,
    contextSourcesUsed,
    pipelineStepsComplete,
    validated: true,
    providerUsed: provider,
    processedAt: new Date().toISOString(),
  };
}

export function summarizeModelGateway(routes: ModelGatewayRoute[]): string {
  const active = routes.find((r) => r.active);
  return `Model Gateway — model-agnostic · ${routes.length} providers available · active: ${active?.providerLabel ?? 'none'}. Studio OS uses models; Studio OS is not defined by models.`;
}
