import { isDesktopArtboardLayoutActive } from './desktopPreview';
import {
  DESKTOP_ROOM_TITLE_DESKTOP_MIN_WIDTH,
  DESKTOP_ROOM_TITLE_TABLET_MIN_WIDTH,
} from './desktopRoomTitlePlacementDebug';

/**
 * Floating crystal particles + vignette on desktop tower room heroes.
 * Active on desktop (≥1024px), tablet (768–1023px), and phone artboard (`/desktop/*` ≤767px).
 */
export function isDesktopRoomAmbientEffectsActive(): boolean {
  if (typeof window === 'undefined') return true;
  if (isDesktopArtboardLayoutActive()) return true;
  return window.innerWidth >= DESKTOP_ROOM_TITLE_TABLET_MIN_WIDTH;
}

export function getDesktopRoomParticleDensity(): number {
  if (typeof window === 'undefined') return 45;
  if (isDesktopArtboardLayoutActive()) return 45;
  if (window.innerWidth >= DESKTOP_ROOM_TITLE_DESKTOP_MIN_WIDTH) return 45;
  if (window.innerWidth >= DESKTOP_ROOM_TITLE_TABLET_MIN_WIDTH) return 42;
  return 0;
}
