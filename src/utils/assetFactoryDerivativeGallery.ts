import {
  DERIVATIVE_GALLERY_SLOTS,
  type DerivativeGalleryFilter,
  type DerivativeGalleryItem,
  type DerivativeGalleryItemStatus,
} from '../studio-os/product-photography/DerivativeGalleryCatalog';
import { getFactoryCropTemplate } from '../studio-os/product-photography/FactoryCropTemplates';
import type { ProductAssetFactoryJobRecord, ProductAssetRegistryRecord } from '../studio-os/product-photography/ProductAssetFactory';

function deriveItemStatus(
  registry: ProductAssetRegistryRecord | undefined,
  jobFailed: boolean
): DerivativeGalleryItemStatus {
  if (registry?.status === 'failed') return 'failed';
  if (registry?.status === 'published') return 'published';
  if (registry?.status === 'approved') return 'approved';
  if (registry?.status === 'ready-for-review') return 'needs-review';
  if (registry?.supabaseUrl) return 'generated';
  if (jobFailed) return 'failed';
  return 'pending';
}

export function buildDerivativeGalleryItems(opts: {
  registry: ProductAssetRegistryRecord[];
  productSlug: string;
  version: string;
  job?: ProductAssetFactoryJobRecord;
}): DerivativeGalleryItem[] {
  const { registry, productSlug, version, job } = opts;
  const jobFailed = job?.stage === 'failed' && job.failedStage === 'generating-smart-assets';
  const byType = new Map<string, ProductAssetRegistryRecord>();
  for (const r of registry) {
    if (r.productSlug === productSlug && !r.assetType.startsWith('master')) {
      byType.set(r.assetType, r);
    }
  }

  return DERIVATIVE_GALLERY_SLOTS.map((slot) => {
    const reg = byType.get(slot.assetType);
    const template = getFactoryCropTemplate(slot.templateId);
    const status = deriveItemStatus(reg, jobFailed && !reg);

    return {
      slot,
      templateLabel: template?.label ?? slot.templateId,
      dimensions: reg?.dimensions ?? {
        width: template?.outputWidth ?? 0,
        height: template?.outputHeight ?? 0,
      },
      aspectRatio: reg?.aspectRatio ?? template?.aspectRatio ?? '—',
      transparency: reg?.transparency ?? template?.transparency ?? true,
      version: reg?.version ?? version,
      status,
      registryStatus: reg?.status?.toUpperCase() ?? 'NOT REGISTERED',
      supabaseStatus: reg?.supabaseUrl ? (reg.status === 'failed' ? 'failed' : 'uploaded') : 'missing',
      previewSrc: reg?.supabaseUrl,
      supabaseUrl: reg?.supabaseUrl,
      storagePath: reg?.storagePath,
      lastUpdated: reg?.lastUpdated,
      registryId: reg?.id,
    };
  });
}

export function filterDerivativeGalleryItems(
  items: DerivativeGalleryItem[],
  filter: DerivativeGalleryFilter
): DerivativeGalleryItem[] {
  if (filter === 'all') return items;
  return items.filter((item) => item.status === filter);
}

export function derivativeGallerySummary(items: DerivativeGalleryItem[]): {
  total: number;
  pending: number;
  generated: number;
  needsReview: number;
  approved: number;
  published: number;
  failed: number;
} {
  const counts = {
    total: items.length,
    pending: 0,
    generated: 0,
    needsReview: 0,
    approved: 0,
    published: 0,
    failed: 0,
  };
  for (const item of items) {
    if (item.status === 'pending') counts.pending++;
    else if (item.status === 'generated') counts.generated++;
    else if (item.status === 'needs-review') counts.needsReview++;
    else if (item.status === 'approved') counts.approved++;
    else if (item.status === 'published') counts.published++;
    else if (item.status === 'failed') counts.failed++;
  }
  return counts;
}

export function derivativeStatusColor(status: DerivativeGalleryItemStatus): string {
  switch (status) {
    case 'published':
    case 'approved':
      return '#16a34a';
    case 'generated':
    case 'needs-review':
      return '#ca8a04';
    case 'failed':
      return '#EB1C24';
    default:
      return '#888';
  }
}
