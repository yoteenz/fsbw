/** Product Asset Factory admin demo config (Brand Assets). */

import {
  FACTORY_CROP_TEMPLATES,
  FACTORY_POC_DERIVATIVE_OUTPUTS,
} from '../studio-os/product-photography/FactoryCropTemplates';
import {
  PRODUCT_ASSET_FACTORY_POC_UNIT,
  PRODUCT_ASSET_FACTORY_STAGES,
  PRODUCT_ASSET_FACTORY_STAGE_LABELS,
  productAssetSupabasePath,
} from '../studio-os/product-photography/ProductAssetFactory';

export const BRAND_ASSETS_ASSET_FACTORY_SUBTITLE =
  'PHOTOGRAPHY BIBLE → ASSET FACTORY · MASTER HERO TO PRODUCTION LIBRARY · SOFT WAVE POC';

export type BrandAssetsAssetFactoryTabId =
  | 'overview'
  | 'processing-queue'
  | 'derivative-engine'
  | 'crop-templates'
  | 'asset-registry'
  | 'production-log'
  | 'settings'
  | 'documentation';

export const BRAND_ASSETS_ASSET_FACTORY_TABS: Array<{ id: BrandAssetsAssetFactoryTabId; label: string }> = [
  { id: 'overview', label: 'OVERVIEW' },
  { id: 'processing-queue', label: 'PROCESSING QUEUE' },
  { id: 'derivative-engine', label: 'DERIVATIVE ENGINE' },
  { id: 'crop-templates', label: 'CROP TEMPLATES' },
  { id: 'asset-registry', label: 'ASSET REGISTRY' },
  { id: 'production-log', label: 'PRODUCTION LOG' },
  { id: 'settings', label: 'SETTINGS' },
  { id: 'documentation', label: 'DOCUMENTATION' },
];

export const ASSET_FACTORY_WORKFLOW = [
  'Photography Bible',
  'Creative DNA v1.0',
  'Approved Master Hero Portrait',
  'Asset Factory',
  'Background Removal (Ideogram)',
  'Transparent Master',
  'Derivative Generation',
  'Supabase Upload',
  'Asset Registry',
  'Ready For Review',
] as const;

export function getAssetFactoryTabBody(tabId: BrandAssetsAssetFactoryTabId): string {
  switch (tabId) {
    case 'overview':
      return 'Centralized production pipeline — Creative DNA v1.0 rules loaded before processing. Approved master hero portraits become website-ready asset libraries. POC: SOFT WAVE only.';
    case 'processing-queue':
      return 'Jobs awaiting or running through pipeline stages. Retry from failed step without restarting completed work.';
    case 'derivative-engine':
      return `${FACTORY_POC_DERIVATIVE_OUTPUTS.length} derivative outputs per unit using reusable crop templates — no manual cropping.`;
    case 'crop-templates':
      return `${FACTORY_CROP_TEMPLATES.length} factory crop templates with aspect ratio, dimensions, anchor, padding, scale, transparency, format.`;
    case 'asset-registry':
      return 'Every uploaded asset registered with Supabase URL, crop template, dimensions, and review status.';
    case 'production-log':
      return 'Timestamped pipeline events per stage — background removal, derivatives, upload, registry.';
    case 'settings':
      return 'POC unit lock, bucket prefix, Ideogram model (fal-ai/ideogram/remove-background).';
    case 'documentation':
      return 'docs/frontal-slayer/asset-factory/';
    default:
      return '';
  }
}

export {
  PRODUCT_ASSET_FACTORY_POC_UNIT,
  PRODUCT_ASSET_FACTORY_STAGES,
  PRODUCT_ASSET_FACTORY_STAGE_LABELS,
  productAssetSupabasePath,
  FACTORY_CROP_TEMPLATES,
  FACTORY_POC_DERIVATIVE_OUTPUTS,
};
