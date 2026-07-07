/**
 * Studio OS Release Channel System™ — constitutional platform capability (CA-001).
 */

export const RELEASE_CHANNEL_IDS = ['stable', 'preview', 'beta', 'experimental'] as const;

export type ReleaseChannelId = (typeof RELEASE_CHANNEL_IDS)[number];

export const RELEASE_CHANNEL_ORDER: Record<ReleaseChannelId, number> = {
  stable: 1,
  preview: 2,
  beta: 3,
  experimental: 4,
};

/** Default channel assignments per workspace — mirrors release-channel-system.yaml */
export const DEFAULT_ORGANIZATION_RELEASE_CHANNELS: Record<string, ReleaseChannelId> = {
  'frontal-slayer': 'stable',
  'ai-media': 'beta',
  sandbox: 'experimental',
};

export const RELEASE_CHANNEL_LABELS: Record<ReleaseChannelId, string> = {
  stable: 'Stable',
  preview: 'Preview',
  beta: 'Beta',
  experimental: 'Experimental',
};

/** Minimum channel required before a module may expose functionality */
export const MODULE_MINIMUM_RELEASE_CHANNELS: Partial<Record<string, ReleaseChannelId>> = {
  'studio-intelligence': 'stable',
  'qa-headquarters': 'stable',
  'studio-orb': 'preview',
  'experience-engine': 'preview',
  marketplace: 'beta',
  'website-builder': 'preview',
  'executive-strategy-floor': 'experimental',
};

export const RELEASE_CHANNEL_SYSTEM_VERSION = '1.1.0';
export const RELEASE_CHANNEL_MILESTONE = 'M127.14';
