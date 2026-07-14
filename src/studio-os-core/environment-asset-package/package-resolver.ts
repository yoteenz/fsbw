import type {
  EnvironmentAssetPackage,
  EnvironmentOutputFormatId,
  EnvironmentPackageDrawerModel,
  EnvironmentPackageLazyLoadRequest,
  EnvironmentVariantId,
  EnvironmentVariantRecord,
} from './types';

export function resolvePackageVariant(
  pkg: EnvironmentAssetPackage,
  variantId: EnvironmentVariantId
): EnvironmentVariantRecord | null {
  return pkg.variants.find((v) => v.id === variantId) ?? null;
}

export function resolveVariantOutputUrl(
  variant: EnvironmentVariantRecord,
  formatId: EnvironmentOutputFormatId
): string | null {
  const output = variant.outputs.find((o) => o.formatId === formatId);
  if (!output || output.status === 'pending' || output.status === 'failed') return null;
  return output.url;
}

/** Experience Lab viewport — prefers mobile output from unified package (same design, responsive framing). */
export function resolveViewportEnvironmentFromPackage(
  pkg: EnvironmentAssetPackage,
  variantId: EnvironmentVariantId,
  preferMobile: boolean
): string | null {
  const variant = resolvePackageVariant(pkg, variantId);
  if (!variant) return null;
  const format: EnvironmentOutputFormatId = preferMobile ? 'mobile-9-16' : 'desktop-21-9';
  return resolveVariantOutputUrl(variant, format)
    ?? resolveVariantOutputUrl(variant, 'preview-card')
    ?? resolveVariantOutputUrl(variant, 'thumbnail-square');
}

export function countVariantOutputs(variant: EnvironmentVariantRecord) {
  const generated = variant.outputs.filter((o) => o.status === 'ready' || o.status === 'cached').length;
  const pending = variant.outputs.filter((o) => o.status === 'pending' || o.status === 'generating').length;
  return { generated, pending, total: variant.outputs.length };
}

export function buildPackageDrawerModel(
  pkg: EnvironmentAssetPackage,
  variantId: EnvironmentVariantId
): EnvironmentPackageDrawerModel | null {
  const variant = resolvePackageVariant(pkg, variantId);
  if (!variant) return null;
  const counts = countVariantOutputs(variant);
  const blueprint = variant.productionAssets.find((a) => a.kind === 'blueprint');
  const construction = variant.productionAssets.find((a) => a.kind === 'construction-plan');
  const lighting = variant.productionAssets.find((a) => a.kind === 'lighting-profile');
  const materials = variant.productionAssets.find((a) => a.kind === 'materials-profile');

  return {
    environmentName: pkg.metadata.displayName,
    variantName: variant.name,
    variantId: variant.id,
    packageStatus: pkg.status,
    desktopPreviewUrl: resolveVariantOutputUrl(variant, 'desktop-21-9'),
    mobilePreviewUrl: resolveVariantOutputUrl(variant, 'mobile-9-16'),
    tabletPreviewUrl: resolveVariantOutputUrl(variant, 'tablet-4-3'),
    outputsGenerated: counts.generated,
    outputsPending: counts.pending,
    assetCount: variant.productionAssets.filter((a) => a.status === 'ready' || a.status === 'cached').length,
    generationCostUsd: variant.estimatedCostUsd,
    provider: variant.provider,
    seed: variant.seed,
    promptVersion: variant.promptHash,
    blueprintReady: blueprint?.status === 'ready' || blueprint?.status === 'cached',
    constructionReady: construction?.status === 'ready' || construction?.status === 'cached',
    lightingReady: lighting?.status === 'ready' || lighting?.status === 'cached',
    materialReady: materials?.status === 'ready' || materials?.status === 'cached',
    marketplaceReady: pkg.marketplaceReady,
  };
}

/** Lazy-load hook point — marks output generating without UI changes. */
export function requestLazyOutputLoad(
  pkg: EnvironmentAssetPackage,
  request: EnvironmentPackageLazyLoadRequest
): EnvironmentAssetPackage {
  const variant = resolvePackageVariant(pkg, request.variantId);
  if (!variant) return pkg;
  const outputs = variant.outputs.map((output) =>
    output.formatId === request.formatId && output.lazy && output.status === 'pending'
      ? { ...output, status: 'generating' as const }
      : output
  );
  return {
    ...pkg,
    variants: pkg.variants.map((v) => (v.id === request.variantId ? { ...v, outputs } : v)),
  };
}

export function promotePackageVariant(
  pkg: EnvironmentAssetPackage,
  variantId: EnvironmentVariantId
): EnvironmentAssetPackage {
  return {
    ...pkg,
    promotedVariantId: variantId,
    status: 'production-ready',
    stage: 'production-package',
    metadata: {
      ...pkg.metadata,
      approvalDate: new Date().toISOString(),
    },
    revisionHistory: [
      ...pkg.revisionHistory,
      {
        revision: pkg.metadata.revision,
        promotedVariantId: variantId,
        status: 'production-ready',
        changedAt: new Date().toISOString(),
        reason: 'founder-promoted-variant',
      },
    ],
    variants: pkg.variants.map((v) => ({
      ...v,
      vaultStatus: v.id === variantId ? 'active' : 'archived',
      stage: v.id === variantId ? 'production-package' : v.stage,
    })),
  };
}
