import {
  DESKTOP_ROOM_HERO_ART_HEIGHT,
  DESKTOP_ROOM_HERO_ART_WIDTH,
} from './desktopRoomHeroArt';
import type { FinalSceneHitRect } from './finalLobbySceneAssets';

/** Full-bleed 21:9 Curator's Tablet shopping bag room — do not crop or edit. */
export const DESKTOP_SHOPPING_BAG_BACKGROUND_URL =
  'https://hyycomvcaqxxvyrfupes.supabase.co/storage/v1/object/public/live-preview/Desktop/NO%20TEXT%20BG/527324F7-2F45-4700-9BFA-DFF05672E8B8.png';

export const DESKTOP_SHOPPING_BAG_IMAGE = {
  width: DESKTOP_ROOM_HERO_ART_WIDTH,
  height: DESKTOP_ROOM_HERO_ART_HEIGHT,
} as const;

/** Acrylic tablet screen on the hero — tune with `?shoppingBagDebug=1` (drag/resize, Save Layout, export). Saved layout persists in localStorage on this device. */
export const DESKTOP_SHOPPING_BAG_TABLET_RECT: FinalSceneHitRect = {
  left: 0.198,
  top: 0.092,
  width: 0.604,
  height: 0.824,
};

export function isDesktopShoppingBagDebugEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return new URLSearchParams(window.location.search).get('shoppingBagDebug') === '1';
  } catch {
    return false;
  }
}
