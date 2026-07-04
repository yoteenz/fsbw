/**
 * studio os provider adapters — platform-level provider registry contracts.
 */

import type { AiProductionProviderId } from '../types/production';
import type { AssetFactoryProvider, AssetFactoryProviderId } from '../types/asset';
import type { ProviderAdapterState } from '../services/interfaces';

export type AiProductionProviderAdapter = {
  id: AiProductionProviderId;
  label: string;
  interchangeable: boolean;
};

export type AssetFactoryProviderAdapter = AssetFactoryProvider;

export function createDefaultAiProviderStates(): Record<AiProductionProviderId, ProviderAdapterState> {
  return {
    openai: { id: 'openai', enabled: true, statusMessage: 'READY · NOT CONNECTED', lastCall: null },
    fal: { id: 'fal', enabled: true, statusMessage: 'READY · NOT CONNECTED', lastCall: null },
    openart: { id: 'openart', enabled: true, statusMessage: 'READY · NOT CONNECTED', lastCall: null },
    voice: { id: 'voice', enabled: true, statusMessage: 'READY · NOT CONNECTED', lastCall: null },
    resend: { id: 'resend', enabled: true, statusMessage: 'READY · NOT CONNECTED', lastCall: null },
    future: { id: 'future', enabled: false, statusMessage: 'RESERVED · NOT CONNECTED', lastCall: null },
  };
}

export function isAssetFactoryProviderId(id: string): id is AssetFactoryProviderId {
  return ['fal', 'openart', 'runway', 'flux', 'imagen', 'veo', 'gpt-image', 'internal'].includes(id);
}

export function normalizeProviderStatus(provider: AssetFactoryProviderAdapter): AssetFactoryProviderAdapter {
  return provider;
}
