/**
 * Asset Factory provider abstraction — studio os orchestrates, providers execute.
 */

export type AssetFactoryProviderId =
  | 'fal'
  | 'openart'
  | 'runway'
  | 'flux'
  | 'imagen'
  | 'veo'
  | 'gpt-image'
  | 'internal';

export type AssetFactoryProviderStatus = 'connected' | 'standby' | 'disconnected';

export type AssetFactoryProvider = {
  id: AssetFactoryProviderId;
  label: string;
  status: AssetFactoryProviderStatus;
  capabilities: string[];
  note: string;
};

export const ASSET_FACTORY_PROVIDERS: AssetFactoryProvider[] = [
  {
    id: 'fal',
    label: 'FAL',
    status: 'standby',
    capabilities: ['IMAGE', 'VIDEO', 'EDIT'],
    note: 'PRIMARY STACK · DEMO MODE — NOT CONNECTED',
  },
  {
    id: 'gpt-image',
    label: 'GPT IMAGE',
    status: 'standby',
    capabilities: ['IMAGE', 'EDIT'],
    note: 'NOIR / PRODUCT PREVIEWS · DEMO',
  },
  {
    id: 'openart',
    label: 'OPENART',
    status: 'disconnected',
    capabilities: ['IMAGE'],
    note: 'FUTURE CONNECTOR',
  },
  {
    id: 'runway',
    label: 'RUNWAY',
    status: 'disconnected',
    capabilities: ['VIDEO'],
    note: 'FUTURE CONNECTOR',
  },
  {
    id: 'flux',
    label: 'FLUX',
    status: 'disconnected',
    capabilities: ['IMAGE'],
    note: 'FUTURE CONNECTOR',
  },
  {
    id: 'imagen',
    label: 'IMAGEN',
    status: 'disconnected',
    capabilities: ['IMAGE'],
    note: 'FUTURE CONNECTOR',
  },
  {
    id: 'veo',
    label: 'VEO',
    status: 'disconnected',
    capabilities: ['VIDEO'],
    note: 'FUTURE CONNECTOR',
  },
  {
    id: 'internal',
    label: 'INTERNAL MODELS',
    status: 'disconnected',
    capabilities: ['IMAGE', 'VIDEO', 'VOICE'],
    note: 'FUTURE VXD MODELS',
  },
];

export function getDefaultProviderForAssetType(assetType: 'image' | 'video' | 'voice'): AssetFactoryProviderId {
  if (assetType === 'video') return 'fal';
  if (assetType === 'voice') return 'internal';
  return 'fal';
}

export function providerStatusColor(status: AssetFactoryProviderStatus): string {
  if (status === 'connected') return '#16A34A';
  if (status === 'standby') return '#CA8A04';
  return '#9CA3AF';
}
