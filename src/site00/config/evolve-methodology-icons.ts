/**
 * EVOLVE Origin expanded panel — methodology icon asset slots (AUDIT / INTERVENE / ADVANCE).
 * Final geometric family assets will replace null entries without component changes.
 */

import { resolveSite00PublicAsset } from '../components/loader/site00LoaderConfig';
import { IMMUNE_PRODUCTION_PROJECT_REF } from '../../studio-os-core/immune-system/constants';

export type EvolveMethodologyIconId = 'audit' | 'intervene' | 'advance';

/** null = render empty slot until production asset is supplied */
export const SITE00_EVOLVE_METHODOLOGY_ICON_PATHS: Record<EvolveMethodologyIconId, string | null> = {
  audit: null,
  intervene: null,
  advance: null,
};

const SITE00_EVOLVE_METHODOLOGY_ICON_BASE =
  'https://' + IMMUNE_PRODUCTION_PROJECT_REF + '.supabase.co/storage/v1/object/public/live-preview/site00/';

export function site00EvolveMethodologyIconUrl(id: EvolveMethodologyIconId): string | null {
  const path = SITE00_EVOLVE_METHODOLOGY_ICON_PATHS[id];
  if (!path) return null;
  const resolved = resolveSite00PublicAsset(path);
  if (resolved.includes('/storage/v1/')) return resolved;
  return `${SITE00_EVOLVE_METHODOLOGY_ICON_BASE}${path}`;
}
