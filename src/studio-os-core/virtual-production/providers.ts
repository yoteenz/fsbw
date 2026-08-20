/**
 * Production provider abstraction — Studio World owns canon; providers execute tasks.
 */

import type { ProductionErrorCategory, VirtualProductionMode } from './types';

/** Capability categories providers may declare */
export type ProductionCapability =
  | 'image_generation'
  | 'image_edit'
  | 'image_to_video'
  | 'text_to_video'
  | 'start_end_frame_video'
  | 'character_reference'
  | 'multi_reference'
  | 'lip_sync'
  | 'voice'
  | 'audio'
  | 'upscale'
  | 'interpolation'
  | 'background_removal'
  | 'directed_multi_scene'
  | 'external_manual';

export type ProductionProviderId =
  | 'fal'
  | 'openart'
  | 'openart-director'
  | 'manual'
  | 'upload';

export type IntegrationMode = 'api' | 'external_manual' | 'upload';

export type ProductionProvider = {
  id: ProductionProviderId;
  label: string;
  capabilities: ProductionCapability[];
  integrationMode: IntegrationMode;
  enabled: boolean;
  /** Human-readable integration status — never contains secrets */
  statusMessage: string;
};

export type ProductionRequest = {
  orgId: string;
  campaignId?: string;
  shotId?: string;
  capability: ProductionCapability;
  providerId: ProductionProviderId;
  modelId?: string;
  prompt?: string;
  settings?: Record<string, unknown>;
  sourceReferences?: unknown[];
  productionMode: VirtualProductionMode;
};

export type ProductionJobRecord = {
  jobKey: string;
  providerId: ProductionProviderId;
  capability: ProductionCapability;
  status: 'queued' | 'running' | 'complete' | 'failed' | 'cancelled';
  errorCategory?: ProductionErrorCategory;
  errorMessage?: string;
  governedJobId?: string;
};

export type ProductionResult = {
  success: boolean;
  assetUrl?: string;
  assetId?: string;
  providerId: ProductionProviderId;
  modelId?: string;
  errorCategory?: ProductionErrorCategory;
  errorMessage?: string;
  /** Technical detail for server logs only */
  debugDetail?: string;
};

/** Registered production providers — extend here for new providers */
export const PRODUCTION_PROVIDERS: ProductionProvider[] = [
  {
    id: 'fal',
    label: 'FAL',
    capabilities: [
      'image_generation',
      'image_edit',
      'image_to_video',
      'text_to_video',
      'start_end_frame_video',
      'character_reference',
      'multi_reference',
      'background_removal',
      'upscale',
    ],
    integrationMode: 'api',
    enabled: true,
    statusMessage: 'WIRED — governed generation gateway',
  },
  {
    id: 'openart',
    label: 'OpenArt Models',
    capabilities: [
      'image_generation',
      'image_edit',
      'image_to_video',
      'text_to_video',
      'multi_reference',
    ],
    integrationMode: 'api',
    enabled: true,
    statusMessage: 'PARTIAL — MCP model API available; no Director API',
  },
  {
    id: 'openart-director',
    label: 'OpenArt Director',
    capabilities: ['directed_multi_scene', 'external_manual'],
    integrationMode: 'external_manual',
    enabled: true,
    statusMessage: 'EXTERNAL/MANUAL — production package export only',
  },
  {
    id: 'manual',
    label: 'Manual / External Production',
    capabilities: ['external_manual', 'image_generation', 'image_to_video'],
    integrationMode: 'external_manual',
    enabled: true,
    statusMessage: 'MANUAL — import results into QC pipeline',
  },
  {
    id: 'upload',
    label: 'Uploaded Footage',
    capabilities: ['external_manual'],
    integrationMode: 'upload',
    enabled: true,
    statusMessage: 'UPLOAD — traditional media import',
  },
];

export function getProductionProvider(id: ProductionProviderId): ProductionProvider | undefined {
  return PRODUCTION_PROVIDERS.find((p) => p.id === id);
}

export function providerSupportsCapability(
  providerId: ProductionProviderId,
  capability: ProductionCapability
): boolean {
  const provider = getProductionProvider(providerId);
  return Boolean(provider?.capabilities.includes(capability));
}

/** Resolve best provider for a capability + mode preference */
export function resolveProviderForCapability(
  capability: ProductionCapability,
  mode: VirtualProductionMode,
  preferredProviderId?: ProductionProviderId
): ProductionProvider | null {
  if (preferredProviderId) {
    const preferred = getProductionProvider(preferredProviderId);
    if (preferred?.enabled && providerSupportsCapability(preferredProviderId, capability)) {
      return preferred;
    }
  }

  if (mode === 'director' && capability === 'directed_multi_scene') {
    return getProductionProvider('openart-director') ?? null;
  }

  const ranked: ProductionProviderId[] =
    mode === 'precision' ? ['fal', 'openart', 'manual'] : ['openart-director', 'fal', 'openart'];

  for (const id of ranked) {
    const p = getProductionProvider(id);
    if (p?.enabled && providerSupportsCapability(id, capability)) return p;
  }

  return PRODUCTION_PROVIDERS.find((p) => p.enabled && p.capabilities.includes(capability)) ?? null;
}

/** Translate raw provider errors to user-facing categories */
export function classifyProductionError(raw: unknown): {
  category: ProductionErrorCategory;
  message: string;
  debugDetail?: string;
} {
  const text = raw instanceof Error ? raw.message : String(raw ?? 'Unknown error');
  const lower = text.toLowerCase();

  if (lower.includes('timeout') || lower.includes('timed out')) {
    return { category: 'generation_timed_out', message: 'Generation timed out.', debugDetail: text };
  }
  if (lower.includes('401') || lower.includes('403') || lower.includes('auth')) {
    return { category: 'authentication_required', message: 'Authentication required.', debugDetail: text };
  }
  if (lower.includes('unsupported') || lower.includes('capability')) {
    return { category: 'unsupported_capability', message: 'Provider does not support this capability.', debugDetail: text };
  }
  if (lower.includes('reference') || lower.includes('invalid image')) {
    return { category: 'invalid_reference', message: 'Invalid reference asset.', debugDetail: text };
  }
  if (lower.includes('unavailable') || lower.includes('503') || lower.includes('502')) {
    return { category: 'provider_unavailable', message: 'Provider unavailable.', debugDetail: text };
  }

  return { category: 'production_failed', message: 'Production failed.', debugDetail: text };
}
