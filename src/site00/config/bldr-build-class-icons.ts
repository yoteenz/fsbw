/**
 * SITE 00 BLDR state page — build class card icons (desktop).
 * Supabase live-preview/site00/BLDR/
 */

import { resolveSite00PublicAsset } from '../components/loader/site00LoaderConfig';
import { IMMUNE_PRODUCTION_PROJECT_REF } from '../../studio-os-core/immune-system/constants';

export const SITE00_BLDR_BUILD_CLASS_ICON_PATHS = {
  site: 'BLDR/33910244-AF13-479A-8861-1CE66A1D68C4.png',
  world: 'BLDR/D5F4496A-52AB-491F-A3C4-7CE01FAF0D05.png',
  enterprise: 'BLDR/5144412A-BD84-4299-950C-48252FE7F4DD.png',
  'not-sure': 'BLDR/CA16B9A4-AA16-445F-9C05-AB24C979BFD0.png',
} as const;

export type BldrBuildClassIconId = keyof typeof SITE00_BLDR_BUILD_CLASS_ICON_PATHS;

const SITE00_BLDR_BUILD_CLASS_ICON_BASE =
  'https://' + IMMUNE_PRODUCTION_PROJECT_REF + '.supabase.co/storage/v1/object/public/live-preview/site00/';

export function site00BldrBuildClassIconUrl(id: BldrBuildClassIconId): string {
  const path = SITE00_BLDR_BUILD_CLASS_ICON_PATHS[id];
  const resolved = resolveSite00PublicAsset(path);
  if (resolved.includes('/storage/v1/')) return resolved;
  return `${SITE00_BLDR_BUILD_CLASS_ICON_BASE}${path}`;
}
