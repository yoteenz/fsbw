import type { DesktopRoomTitlePlacement } from '../constants/desktopRoomTitlePlacement';
import {
  DESKTOP_ROOM_TITLE_DEFAULT_PLACEMENT,
  DESKTOP_ROOM_TITLE_PLACEMENT,
} from '../constants/desktopRoomTitlePlacement';
import type { DesktopRoomTitleViewportProfile } from './desktopRoomTitlePlacementDebug';
import { getDesktopRoomTitleViewportProfile } from './desktopRoomTitlePlacementDebug';

export const DESKTOP_ROOM_TITLE_PLACEMENT_OVERRIDES_KEY = 'baw_desktop_room_title_placement_overrides';

export type DesktopRoomTitlePlacementPatch = Partial<
  Pick<
    DesktopRoomTitlePlacement,
    | 'titleTopPct'
    | 'centerOffsetPct'
    | 'subtitleGapPx'
    | 'textScale'
    | 'titleTextScale'
    | 'subtitleTextScale'
  >
>;

export type DesktopRoomTitlePlacementProfileOverrides = Record<string, DesktopRoomTitlePlacementPatch>;

export type DesktopRoomTitlePlacementOverridesFile = {
  updatedAt?: number;
  desktop?: DesktopRoomTitlePlacementProfileOverrides;
  tablet?: DesktopRoomTitlePlacementProfileOverrides;
};

export function loadDesktopRoomTitlePlacementOverrides(): DesktopRoomTitlePlacementOverridesFile {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(DESKTOP_ROOM_TITLE_PLACEMENT_OVERRIDES_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as DesktopRoomTitlePlacementOverridesFile;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

export function saveDesktopRoomTitlePlacementOverrides(overrides: DesktopRoomTitlePlacementOverridesFile): void {
  localStorage.setItem(
    DESKTOP_ROOM_TITLE_PLACEMENT_OVERRIDES_KEY,
    JSON.stringify({ ...overrides, updatedAt: Date.now() }, null, 2),
  );
}

export function clearDesktopRoomTitlePlacementOverrides(): void {
  localStorage.removeItem(DESKTOP_ROOM_TITLE_PLACEMENT_OVERRIDES_KEY);
}

function mergePlacementPatch(
  base: DesktopRoomTitlePlacement,
  patch?: DesktopRoomTitlePlacementPatch,
): DesktopRoomTitlePlacement {
  if (!patch) return base;
  return {
    ...base,
    ...patch,
    notes: base.notes,
  };
}

export function getEffectiveDesktopRoomTitlePlacement(
  zoneId: string,
  options?: {
    draft?: DesktopRoomTitlePlacementOverridesFile;
    profile?: DesktopRoomTitleViewportProfile | null;
  },
): DesktopRoomTitlePlacement {
  const base = DESKTOP_ROOM_TITLE_PLACEMENT[zoneId] ?? DESKTOP_ROOM_TITLE_DEFAULT_PLACEMENT;
  const profile = options?.profile ?? getDesktopRoomTitleViewportProfile();
  if (!profile) return base;

  const saved = loadDesktopRoomTitlePlacementOverrides();
  const savedPatch = saved[profile]?.[zoneId];
  const draftPatch = options?.draft?.[profile]?.[zoneId];

  return mergePlacementPatch(mergePlacementPatch(base, savedPatch), draftPatch);
}

export function formatDesktopRoomTitleOverridesForCopy(
  overrides: DesktopRoomTitlePlacementOverridesFile,
): string {
  return JSON.stringify(overrides, null, 2);
}
