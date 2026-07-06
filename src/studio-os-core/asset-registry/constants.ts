/** Milestone 140 — Asset Registry™ V1.0 */

export const ASSET_REGISTRY_STORAGE_KEY = 'studioOsAssetRegistry_v1';
export const ASSET_REGISTRY_VERSION = '1.0.0';
export const STUDIO_OS_ASSET_REGISTRY_UPDATED = 'studio-os-asset-registry-updated';

export const ASSET_REGISTRY_ACCENT = '#B45309';

export const ASSET_REGISTRY_PHILOSOPHY = [
  'Assets should never become scattered across folders — every organizational asset is a managed platform resource.',
  'Never overwrite assets — complete versioning with approval history and restore capability.',
  'Assets become discoverable, reusable, versioned, and intelligently connected to Studio OS.',
  'The Asset Registry™ transforms media into organizational knowledge.',
] as const;

export const ASSET_CATEGORIES = [
  'images',
  'videos',
  'audio',
  'logos',
  'brand-kits',
  'documents',
  'pdfs',
  'templates',
  'presentations',
  'icons',
  'illustrations',
  '3d-models',
  'animations',
  'marketing-assets',
  'training-assets',
  'knowledge-assets',
  'academy-resources',
  'marketplace-resources',
  'documentation-assets',
] as const;

export const ASSET_METADATA_FIELDS = [
  'unique-id',
  'name',
  'category',
  'owner',
  'organization',
  'department',
  'version',
  'tags',
  'keywords',
  'description',
  'usage',
  'related-systems',
  'associated-workflows',
  'brand-guidelines',
  'license',
  'storage-location',
  'last-modified',
  'usage-history',
] as const;

export const VERSIONING_CAPABILITIES = [
  'current-version',
  'previous-versions',
  'approval-history',
  'change-log',
  'archive',
  'restore',
  'comparison',
] as const;

export const ASSET_HEALTH_CHECKS = [
  'broken-links',
  'unused-assets',
  'duplicate-assets',
  'missing-alt-text',
  'brand-compliance',
  'resolution',
  'performance',
  'accessibility',
  'recommended-updates',
] as const;
