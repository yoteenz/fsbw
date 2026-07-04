/** Product Asset Factory admin demo config (Brand Assets). */

import {
  FACTORY_CROP_TEMPLATES,
  FACTORY_POC_DERIVATIVE_OUTPUTS,
} from '../studio-os/product-photography/FactoryCropTemplates';
import {
  PRODUCT_ASSET_FACTORY_POC_UNIT,
  PRODUCT_ASSET_FACTORY_STAGES,
  PRODUCT_ASSET_FACTORY_STAGE_LABELS,
  productAssetFactoryStageLabel,
  productAssetSupabasePath,
  DERIVATIVE_BLOCKED_MESSAGE,
} from '../studio-os/product-photography/ProductAssetFactory';

export const BRAND_ASSETS_ASSET_FACTORY_SUBTITLE =
  'CREATIVE DNA v1.0 → GENERATE MASTER HERO → APPROVAL → BACKGROUND REMOVAL → SMART ASSETS · SOFT WAVE POC';

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
  'Creative DNA v1.0 + Product Reference',
  'Generate NEW Master Hero Portrait (Fal)',
  'Preview Generated Hero',
  'Approval Queue',
  'Remove Background (Generated Hero Only)',
  'Transparent Master',
  'Derivative Crops / Smart Assets',
  'Supabase Upload',
  'Asset Registry',
  'Ready For Review',
] as const;

export function getAssetFactoryTabBody(tabId: BrandAssetsAssetFactoryTabId): string {
  switch (tabId) {
    case 'overview':
      return 'Website product images are reference inputs only. Asset Factory generates a NEW Master Hero Portrait from Creative DNA v1.0 before any background removal or smart asset crops. Derivative processing is blocked until the generated master is approved.';
    case 'processing-queue':
      return 'Jobs progress through hero generation, approval, background removal, smart assets, and upload. Retry from failed derivative steps without regenerating the approved master.';
    case 'derivative-engine':
      return `${FACTORY_POC_DERIVATIVE_OUTPUTS.length} smart asset gallery slots with per-tile preview, filters, and Supabase proof — runs only after generated master approval.`;
    case 'crop-templates':
      return `${FACTORY_CROP_TEMPLATES.length} factory crop templates with aspect ratio, dimensions, anchor, padding, scale, transparency, format.`;
    case 'asset-registry':
      return 'Every uploaded asset registered with Supabase URL, crop template, dimensions, and review status.';
    case 'production-log':
      return 'Timestamped pipeline events per stage — hero generation, approval, background removal, smart assets, upload, registry.';
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
  productAssetFactoryStageLabel,
  productAssetSupabasePath,
  DERIVATIVE_BLOCKED_MESSAGE,
  FACTORY_CROP_TEMPLATES,
  FACTORY_POC_DERIVATIVE_OUTPUTS,
};
