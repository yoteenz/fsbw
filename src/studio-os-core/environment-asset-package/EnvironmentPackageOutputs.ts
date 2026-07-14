/**
 * Environment Package Output Registry — every package owns canonical outputs.
 * Desktop/mobile/tablet are outputs of one approved variant, not separate designs.
 */

export type EnvironmentPackageOutputStatus =
  | 'pending'
  | 'generating'
  | 'generated'
  | 'failed'
  | 'cached';

export type EnvironmentPackageOutputKey =
  | 'desktop'
  | 'mobile'
  | 'tablet'
  | 'heroLandscape'
  | 'heroPortrait'
  | 'squareThumbnail'
  | 'wideThumbnail'
  | 'blueprint'
  | 'constructionPlan'
  | 'lightingProfile'
  | 'materialsProfile'
  | 'assetManifest'
  | 'metadata'
  | 'futureDepthMap'
  | 'futureMasks'
  | 'future3D'
  | 'futureVR';

export type EnvironmentPackageOutputEntry = {
  key: EnvironmentPackageOutputKey;
  aspectRatio: string;
  status: EnvironmentPackageOutputStatus;
  url: string | null;
  width: number | null;
  height: number | null;
  byteSize: number | null;
  generatedAt: string | null;
  provider: string | null;
  lazy: boolean;
};

export type EnvironmentPackageOutputRegistry = Record<
  EnvironmentPackageOutputKey,
  EnvironmentPackageOutputEntry
>;

const OUTPUT_SPECS: Array<{
  key: EnvironmentPackageOutputKey;
  aspectRatio: string;
  lazyDefault: boolean;
}> = [
  { key: 'desktop', aspectRatio: '21:9', lazyDefault: false },
  { key: 'mobile', aspectRatio: '9:16', lazyDefault: false },
  { key: 'tablet', aspectRatio: '4:3', lazyDefault: true },
  { key: 'heroLandscape', aspectRatio: '16:9', lazyDefault: true },
  { key: 'heroPortrait', aspectRatio: '9:16', lazyDefault: true },
  { key: 'squareThumbnail', aspectRatio: '1:1', lazyDefault: false },
  { key: 'wideThumbnail', aspectRatio: '16:9', lazyDefault: true },
  { key: 'blueprint', aspectRatio: 'match-source', lazyDefault: true },
  { key: 'constructionPlan', aspectRatio: 'match-source', lazyDefault: true },
  { key: 'lightingProfile', aspectRatio: 'match-source', lazyDefault: true },
  { key: 'materialsProfile', aspectRatio: 'match-source', lazyDefault: true },
  { key: 'assetManifest', aspectRatio: 'n/a', lazyDefault: true },
  { key: 'metadata', aspectRatio: 'n/a', lazyDefault: false },
  { key: 'futureDepthMap', aspectRatio: 'match-source', lazyDefault: true },
  { key: 'futureMasks', aspectRatio: 'match-source', lazyDefault: true },
  { key: 'future3D', aspectRatio: 'n/a', lazyDefault: true },
  { key: 'futureVR', aspectRatio: 'n/a', lazyDefault: true },
];

export const ENVIRONMENT_PACKAGE_OUTPUT_KEYS = OUTPUT_SPECS.map((s) => s.key);

export function buildEmptyOutputRegistry(lazy = true): EnvironmentPackageOutputRegistry {
  const registry = {} as EnvironmentPackageOutputRegistry;
  for (const spec of OUTPUT_SPECS) {
    registry[spec.key] = {
      key: spec.key,
      aspectRatio: spec.aspectRatio,
      status: 'pending',
      url: null,
      width: null,
      height: null,
      byteSize: null,
      generatedAt: null,
      provider: null,
      lazy: lazy ? spec.lazyDefault : false,
    };
  }
  return registry;
}

export function resolveOutputUrl(
  registry: EnvironmentPackageOutputRegistry,
  key: EnvironmentPackageOutputKey
): string | null {
  const entry = registry[key];
  if (!entry || entry.status === 'pending' || entry.status === 'failed') return null;
  return entry.url;
}

export function countOutputRegistry(registry: EnvironmentPackageOutputRegistry) {
  const generated = Object.values(registry).filter(
    (o) => o.status === 'generated' || o.status === 'cached'
  ).length;
  const pending = Object.values(registry).filter(
    (o) => o.status === 'pending' || o.status === 'generating'
  ).length;
  return { generated, pending, total: Object.keys(registry).length };
}

export function setOutputCached(
  registry: EnvironmentPackageOutputRegistry,
  key: EnvironmentPackageOutputKey,
  url: string,
  provider = 'preview-cache'
): EnvironmentPackageOutputRegistry {
  return {
    ...registry,
    [key]: {
      ...registry[key],
      status: 'cached',
      url,
      provider,
      generatedAt: new Date().toISOString(),
      lazy: false,
    },
  };
}

/** Viewport resolves mobile or desktop output from package registry. */
export function resolveViewportOutputUrl(
  registry: EnvironmentPackageOutputRegistry,
  preferMobile: boolean
): string | null {
  const primary = preferMobile ? 'mobile' : 'desktop';
  return (
    resolveOutputUrl(registry, primary)
    ?? resolveOutputUrl(registry, 'squareThumbnail')
    ?? resolveOutputUrl(registry, 'metadata')
  );
}
