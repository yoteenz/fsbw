/**
 * Reusable crop definitions — normalized regions on the 4096×4096 master hero.
 * Coordinates are ratios (0–1), never hardcoded per product or unit.
 */

export type DerivativeCropCategory =
  | 'wishlist'
  | 'cart'
  | 'search'
  | 'collection'
  | 'product'
  | 'desktop'
  | 'mobile'
  | 'studio'
  | 'email'
  | 'social'
  | 'thumbnail'
  | 'master'
  | 'marketing';

/** Crop window relative to master hero (0–1 space). */
export type NormalizedCropRegion = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type DerivativeCropTemplate = {
  id: string;
  category: DerivativeCropCategory;
  label: string;
  purpose: string;
  outputWidth: number;
  outputHeight: number;
  aspectRatio: string;
  cropRegion: NormalizedCropRegion;
};

const FULL_MASTER: NormalizedCropRegion = { x: 0, y: 0, width: 1, height: 1 };

/** Bust-forward product framing — shared across PDP, cards, grids. */
const BUST_CENTER: NormalizedCropRegion = { x: 0.14, y: 0.04, width: 0.72, height: 0.82 };

/** Tighter bust for thumbnails and mini surfaces. */
const BUST_TIGHT: NormalizedCropRegion = { x: 0.2, y: 0.06, width: 0.6, height: 0.78 };

/** Head-and-shoulders for story / vertical social. */
const BUST_VERTICAL: NormalizedCropRegion = { x: 0.22, y: 0.02, width: 0.56, height: 0.88 };

export const DERIVATIVE_CROP_TEMPLATES: readonly DerivativeCropTemplate[] = [
  {
    id: 'master-hero-full',
    category: 'master',
    label: 'Master Hero Full Frame',
    purpose: 'Approved 4096×4096 hero portrait — single source of truth',
    outputWidth: 4096,
    outputHeight: 4096,
    aspectRatio: '1:1',
    cropRegion: FULL_MASTER,
  },
  {
    id: 'master-transparent-full',
    category: 'master',
    label: 'Transparent Master',
    purpose: 'Cutout master for compositing and holographic displays',
    outputWidth: 4096,
    outputHeight: 4096,
    aspectRatio: '1:1',
    cropRegion: FULL_MASTER,
  },
  {
    id: 'wishlist-standard',
    category: 'wishlist',
    label: 'Wishlist Crop',
    purpose: 'Wishlist list rows and saved looks',
    outputWidth: 400,
    outputHeight: 520,
    aspectRatio: '10:13',
    cropRegion: BUST_CENTER,
  },
  {
    id: 'wishlist-mini',
    category: 'wishlist',
    label: 'Mini Wishlist Crop',
    purpose: 'Compact wishlist thumbs and inline chips',
    outputWidth: 120,
    outputHeight: 156,
    aspectRatio: '10:13',
    cropRegion: BUST_TIGHT,
  },
  {
    id: 'cart-dropdown',
    category: 'cart',
    label: 'Cart Dropdown Crop',
    purpose: 'Cart dropdown line-item thumbnail',
    outputWidth: 96,
    outputHeight: 128,
    aspectRatio: '3:4',
    cropRegion: BUST_TIGHT,
  },
  {
    id: 'product-card',
    category: 'product',
    label: 'Product Card Crop',
    purpose: 'Shop grid and collection cards',
    outputWidth: 600,
    outputHeight: 600,
    aspectRatio: '1:1',
    cropRegion: BUST_CENTER,
  },
  {
    id: 'product-page',
    category: 'product',
    label: 'Product Page Crop',
    purpose: 'Unit PDP primary hero',
    outputWidth: 1200,
    outputHeight: 1200,
    aspectRatio: '1:1',
    cropRegion: BUST_CENTER,
  },
  {
    id: 'collection-grid',
    category: 'collection',
    label: 'Collection Grid Crop',
    purpose: 'Signature Collection and category grids',
    outputWidth: 800,
    outputHeight: 800,
    aspectRatio: '1:1',
    cropRegion: BUST_CENTER,
  },
  {
    id: 'search-result',
    category: 'search',
    label: 'Search Result Crop',
    purpose: 'Shop search results grid',
    outputWidth: 320,
    outputHeight: 320,
    aspectRatio: '1:1',
    cropRegion: BUST_TIGHT,
  },
  {
    id: 'email-signature',
    category: 'email',
    label: 'Email Crop',
    purpose: 'Email Signature Collection and promos',
    outputWidth: 800,
    outputHeight: 800,
    aspectRatio: '1:1',
    cropRegion: BUST_CENTER,
  },
  {
    id: 'desktop-hero',
    category: 'desktop',
    label: 'Desktop Crop',
    purpose: 'Desktop hero modules and landing bands',
    outputWidth: 1600,
    outputHeight: 1600,
    aspectRatio: '1:1',
    cropRegion: BUST_CENTER,
  },
  {
    id: 'mobile-pdp',
    category: 'mobile',
    label: 'Mobile Crop',
    purpose: 'Mobile PDP and shop surfaces',
    outputWidth: 600,
    outputHeight: 600,
    aspectRatio: '1:1',
    cropRegion: BUST_CENTER,
  },
  {
    id: 'studioos-preview',
    category: 'studio',
    label: 'StudioOS Crop',
    purpose: 'StudioOS admin cards and previews',
    outputWidth: 400,
    outputHeight: 400,
    aspectRatio: '1:1',
    cropRegion: BUST_TIGHT,
  },
  {
    id: 'social-square',
    category: 'social',
    label: 'Social Square',
    purpose: 'Instagram square and paid social tiles',
    outputWidth: 1080,
    outputHeight: 1080,
    aspectRatio: '1:1',
    cropRegion: BUST_CENTER,
  },
  {
    id: 'story-portrait',
    category: 'social',
    label: 'Story Portrait',
    purpose: 'Stories and vertical social placements',
    outputWidth: 1080,
    outputHeight: 1920,
    aspectRatio: '9:16',
    cropRegion: BUST_VERTICAL,
  },
  {
    id: 'thumbnail-standard',
    category: 'thumbnail',
    label: 'Thumbnail',
    purpose: 'Global thumb surfaces and nav chips',
    outputWidth: 200,
    outputHeight: 200,
    aspectRatio: '1:1',
    cropRegion: BUST_TIGHT,
  },
  {
    id: 'holographic-display',
    category: 'marketing',
    label: 'Holographic Display Crop',
    purpose: 'Email holographic showcase and acrylic exhibits',
    outputWidth: 900,
    outputHeight: 900,
    aspectRatio: '1:1',
    cropRegion: BUST_CENTER,
  },
  {
    id: 'marketing-composite-slot',
    category: 'marketing',
    label: 'Marketing Composite Placeholder',
    purpose: 'Reserved slot for campaign composites — no crop until art direction',
    outputWidth: 4096,
    outputHeight: 4096,
    aspectRatio: '1:1',
    cropRegion: FULL_MASTER,
  },
] as const;

export function getCropTemplate(templateId: string): DerivativeCropTemplate | undefined {
  return DERIVATIVE_CROP_TEMPLATES.find((t) => t.id === templateId);
}

export function listCropTemplatesByCategory(category: DerivativeCropCategory): DerivativeCropTemplate[] {
  return DERIVATIVE_CROP_TEMPLATES.filter((t) => t.category === category);
}

export function resolveCropPixels(
  region: NormalizedCropRegion,
  masterSize = 4096
): { x: number; y: number; width: number; height: number } {
  return {
    x: Math.round(region.x * masterSize),
    y: Math.round(region.y * masterSize),
    width: Math.round(region.width * masterSize),
    height: Math.round(region.height * masterSize),
  };
}
