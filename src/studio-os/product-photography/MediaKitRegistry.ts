/**
 * Media kit folder registry — empty architecture per Signature unit.
 */

import type { SignatureCollectionUnitSlug } from './SignatureCollectionRegistry';

export type MediaKitAssetType =
  | 'hero-portrait'
  | 'three-quarter-portrait'
  | 'detail-portrait'
  | 'transparent-png'
  | 'website-crop'
  | 'email-crop'
  | 'mobile-crop'
  | 'desktop-crop'
  | 'studioos-preview'
  | 'advertising'
  | 'video-turntable'
  | 'future-assets';

export type MediaKitAssetSlot = {
  id: MediaKitAssetType;
  label: string;
  description: string;
};

export const MEDIA_KIT_ASSET_SLOTS: readonly MediaKitAssetSlot[] = [
  { id: 'hero-portrait', label: 'Hero Portrait', description: '4096×4096 master · pure white studio' },
  { id: 'three-quarter-portrait', label: 'Three Quarter Portrait', description: 'Editorial angle variant' },
  { id: 'detail-portrait', label: 'Detail Portrait', description: 'Lace · texture · hairline study' },
  { id: 'transparent-png', label: 'Transparent PNG', description: 'Compositing cutout' },
  { id: 'website-crop', label: 'Website Crop', description: 'Shop PDP derivative' },
  { id: 'email-crop', label: 'Email Crop', description: 'Transactional & promo email' },
  { id: 'mobile-crop', label: 'Mobile Crop', description: 'Mobile PDP surfaces' },
  { id: 'desktop-crop', label: 'Desktop Crop', description: 'Desktop hero surfaces' },
  { id: 'studioos-preview', label: 'StudioOS Preview', description: 'Admin card thumbnails' },
  { id: 'advertising', label: 'Advertising', description: 'Campaign composites' },
  { id: 'video-turntable', label: 'Video Turntable', description: 'Future 360 / motion' },
  { id: 'future-assets', label: 'Future Assets', description: 'Reserved expansion slot' },
] as const;

const MEDIA_KIT_ROOT = 'studio-os/product-photography/media-kits/signature-collection';

export function mediaKitFolderPath(unitSlug: SignatureCollectionUnitSlug, assetType: MediaKitAssetType): string {
  return `${MEDIA_KIT_ROOT}/${unitSlug}/${assetType}`;
}

export function buildMediaKitForUnit(unitSlug: SignatureCollectionUnitSlug): Array<MediaKitAssetSlot & { folderPath: string }> {
  return MEDIA_KIT_ASSET_SLOTS.map((slot) => ({
    ...slot,
    folderPath: mediaKitFolderPath(unitSlug, slot.id),
  }));
}

export function listAllMediaKitFolderPaths(units: SignatureCollectionUnitSlug[]): string[] {
  return units.flatMap((slug) => MEDIA_KIT_ASSET_SLOTS.map((slot) => mediaKitFolderPath(slug, slot.id)));
}
