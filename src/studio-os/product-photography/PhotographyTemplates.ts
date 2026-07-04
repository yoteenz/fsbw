/**
 * Export & crop templates — Photography System V1.0.
 */

import type { MediaKitAssetType } from './MediaKitRegistry';

export type PhotographyExportTemplate = {
  id: string;
  label: string;
  assetType: MediaKitAssetType;
  width: number;
  height: number;
  aspectRatio: string;
  format: 'png' | 'jpg' | 'webp';
  notes: string;
};

export const PHOTOGRAPHY_EXPORT_TEMPLATES: readonly PhotographyExportTemplate[] = [
  {
    id: 'master-hero',
    label: 'Master Hero Portrait',
    assetType: 'hero-portrait',
    width: 4096,
    height: 4096,
    aspectRatio: '1:1',
    format: 'png',
    notes: 'Locked master — pure white studio',
  },
  {
    id: 'website-pdp',
    label: 'Website PDP Crop',
    assetType: 'website-crop',
    width: 1200,
    height: 1200,
    aspectRatio: '1:1',
    format: 'webp',
    notes: 'Shop unit PDP hero',
  },
  {
    id: 'email-signature',
    label: 'Email Signature Crop',
    assetType: 'email-crop',
    width: 800,
    height: 800,
    aspectRatio: '1:1',
    format: 'png',
    notes: 'Email Signature Collection section',
  },
  {
    id: 'mobile-pdp',
    label: 'Mobile PDP Crop',
    assetType: 'mobile-crop',
    width: 600,
    height: 600,
    aspectRatio: '1:1',
    format: 'webp',
    notes: 'Mobile product surfaces',
  },
  {
    id: 'desktop-hero',
    label: 'Desktop Hero Crop',
    assetType: 'desktop-crop',
    width: 1600,
    height: 1600,
    aspectRatio: '1:1',
    format: 'webp',
    notes: 'Desktop hero modules',
  },
  {
    id: 'transparent-cutout',
    label: 'Transparent PNG',
    assetType: 'transparent-png',
    width: 4096,
    height: 4096,
    aspectRatio: '1:1',
    format: 'png',
    notes: 'Compositing — no background',
  },
  {
    id: 'studioos-card',
    label: 'StudioOS Preview',
    assetType: 'studioos-preview',
    width: 400,
    height: 400,
    aspectRatio: '1:1',
    format: 'png',
    notes: 'Admin Photography Bible cards',
  },
] as const;

export function getExportTemplate(id: string): PhotographyExportTemplate | undefined {
  return PHOTOGRAPHY_EXPORT_TEMPLATES.find((t) => t.id === id);
}
