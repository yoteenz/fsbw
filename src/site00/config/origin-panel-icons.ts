/**
 * SITE 00 Origin homepage — approved collapsed panel icons (desktop).
 * Supabase live-preview/site00/
 */

import { resolveSite00PublicAsset } from '../components/loader/site00LoaderConfig';

export const SITE00_ORIGIN_IDNTY_PANEL_ICON_PATH = 'A97879A2-FFEA-4BD5-AC0A-74359620A851.png';

export const SITE00_ORIGIN_BLDR_PANEL_ICON_PATH = '0C81A5FC-35AD-4C8B-A292-5BF88E14193E.png';

export function site00OriginIdntyPanelIconUrl(): string {
  return resolveSite00PublicAsset(SITE00_ORIGIN_IDNTY_PANEL_ICON_PATH);
}

export function site00OriginBldrPanelIconUrl(): string {
  return resolveSite00PublicAsset(SITE00_ORIGIN_BLDR_PANEL_ICON_PATH);
}
