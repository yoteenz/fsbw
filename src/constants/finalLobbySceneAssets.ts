/**
 * Final LP composite lobby + lounge (928×1680). Art is baked in; UI uses transparent hit regions only.
 * Sources: Supabase `live-preview/Final LP/`.
 */

export const FINAL_SCENE_ART_WIDTH = 928;
export const FINAL_SCENE_ART_HEIGHT = 1680;

const FINAL_LP_BASE =
  'https://hyycomvcaqxxvyrfupes.supabase.co/storage/v1/object/public/live-preview/Final%20LP';

export const FINAL_LOBBY_BACKGROUND_VERSION = 'H3Ur5bEB-v1';
export const FINAL_LOUNGE_BACKGROUND_VERSION = 'NTJxpr8v-v1';

export const FINAL_LOBBY_BACKGROUND_SRC_REMOTE = `${FINAL_LP_BASE}/H3Ur5bEBWTePrHQX6_Ai3_z0TUpWwh.png`;
export const FINAL_LOUNGE_BACKGROUND_SRC_REMOTE = `${FINAL_LP_BASE}/_NTJxpr8v5m3R_9miAOYu_JRUYgHe0.png`;

export const FINAL_LOBBY_BACKGROUND_SRC = `/assets/final-lobby.png?v=${FINAL_LOBBY_BACKGROUND_VERSION}`;
export const FINAL_LOUNGE_BACKGROUND_SRC = `/assets/final-lounge.png?v=${FINAL_LOUNGE_BACKGROUND_VERSION}`;

/** Normalized hit rect (0–1) on the composite slide. Tune after QA on device. */
export type FinalSceneHitRect = {
  left: number;
  top: number;
  width: number;
  height: number;
};

export const FINAL_LOBBY_HIT_REGIONS = {
  /** Main neon logo → home shop */
  logo: { left: 0.2, top: 0.19, width: 0.6, height: 0.15 },
  navShop: { left: 0.12, top: 0.328, width: 0.24, height: 0.05 },
  navTools: { left: 0.38, top: 0.328, width: 0.24, height: 0.05 },
  navBooking: { left: 0.64, top: 0.328, width: 0.24, height: 0.05 },
  shelfHdLace: { left: 0.16, top: 0.43, width: 0.68, height: 0.065 },
  shelfBundles: { left: 0.16, top: 0.495, width: 0.68, height: 0.065 },
  shelfCustomUnits: { left: 0.16, top: 0.56, width: 0.68, height: 0.065 },
  caseRegister: { left: 0.24, top: 0.71, width: 0.14, height: 0.09 },
  casePhone: { left: 0.6, top: 0.71, width: 0.16, height: 0.09 },
} as const satisfies Record<string, FinalSceneHitRect>;

/** Acrylic display case on `final-lobby.png` (register + phone); slots in `lobbyDisplayCaseLayout.ts`. */
export const FINAL_LOBBY_DISPLAY_CASE_RECT: FinalSceneHitRect = {
  left: 0.22,
  top: 0.68,
  width: 0.56,
  height: 0.14,
};

/** Lounge slide hotspots on `final-lounge.png` (928×1680). */
export const FINAL_LOUNGE_HIT_REGIONS = {
  /** Ceiling chandelier → account concierge (928×1680; +36px down from prior tune). */
  chandelier: { left: 0.3206, top: 0.1288, width: 0.3588, height: 0.14 },
} as const satisfies Record<string, FinalSceneHitRect>;

/** Semi-transparent hit box over chandelier — off in production; `?sceneHitDebug=1` for QA. */
export const LOUNGE_CHANDELIER_HIT_DEBUG_OVERLAY = false;

/**
 * Colored shelf QA overlays only — production tap layout uses `LOBBY_SHELF_HIT_LAYOUT_*`.
 * Toggle via `/lobby?sceneHitDebug=1` (see `sceneHitDebug.ts`).
 */
export const LOBBY_SHELF_HIT_DEBUG_OVERLAY = false;

/** Production shelf tap targets — tuned with colored QA overlays (see `SceneHitRegion` layout props). */
export const LOBBY_SHELF_HIT_LAYOUT_WIDTH_SCALE = 0.7;
export const LOBBY_SHELF_HIT_LAYOUT_HEIGHT_SCALE = 0.4;

/** Subtract from each shelf hit height (px), after cover map. */
export const LOBBY_SHELF_HIT_LAYOUT_HEIGHT_TRIM_PX = 20;

export const LOBBY_SHELF_HIT_LAYOUT_OFFSET_X_PX = 5;
export const LOBBY_SHELF_HIT_LAYOUT_HD_LACE_OFFSET_Y_PX = 12;
export const LOBBY_SHELF_HIT_LAYOUT_BUNDLES_OFFSET_Y_PX = 41;
export const LOBBY_SHELF_HIT_LAYOUT_CUSTOM_UNITS_OFFSET_Y_PX = 70;

/** Wall-mounted TV on lounge composite — measured on `final-lounge.png` (928×1680). */
export const FINAL_LOUNGE_TV_HIT_REGION: FinalSceneHitRect = {
  left: 0.277,
  top: 0.16,
  width: 0.501,
  height: 0.299,
};

/** Production + QA — blue baked TV (QA + anchor). */
export const LOUNGE_TV_BAKED_HIT_LAYOUT = {
  layoutOffsetX: 18,
  layoutOffsetY: 220,
  layoutHeightExtraPx: -80,
} as const;

/** Production + QA — green play tap: nudge box down/right to baked PRESS TO PLAY text. */
export const LOUNGE_TV_PLAY_TAP_LAYOUT = {
  layoutWidthExtraPx: 10,
  layoutHeightExtraPx: -36,
  layoutOffsetX: 12,
  layoutOffsetY: 46,
} as const;

/** In-screen play icon — center of gray triangle on TV glass (`final-lounge.png`, 928×1680). */
export const FINAL_LOUNGE_TV_PLAY_IMAGE_CENTER = { x: 0.528, y: 0.31 } as const;

/** Transparent tap over baked play icon — mapped on {@link sceneCarouselViewportStageStyle}. */
export const FINAL_LOUNGE_TV_PLAY_TAP_RECT: FinalSceneHitRect = {
  left: FINAL_LOUNGE_TV_PLAY_IMAGE_CENTER.x - 0.045,
  top: FINAL_LOUNGE_TV_PLAY_IMAGE_CENTER.y - 0.035,
  width: 0.09,
  height: 0.07,
};

/**
 * Screen-space nudge for lounge TV play **container** (after cover mapping).
 * Applied via `coverMappedRectScreenOffsetStyle` (`calc(% + px)` on the button box).
 */
export const FINAL_LOUNGE_TV_PLAY_SCREEN_OFFSET_X_PX = 10;
export const FINAL_LOUNGE_TV_PLAY_SCREEN_OFFSET_Y_PX = 120;

/** Screen-space nudge for lounge TV **label** only (container / hit box unchanged). */
export const FINAL_LOUNGE_TV_PLAY_LABEL_OFFSET_X_PX = 0;
export const FINAL_LOUNGE_TV_PLAY_LABEL_OFFSET_Y_PX = 0;

/** @deprecated Use {@link FINAL_LOUNGE_TV_PLAY_TAP_RECT}. */
export const FINAL_LOUNGE_TV_PLAY_IMAGE_RECT = FINAL_LOUNGE_TV_PLAY_TAP_RECT;

/** @deprecated Use {@link FINAL_LOUNGE_TV_PLAY_TAP_RECT}. */
export const FINAL_LOUNGE_TV_PLAY_HIT_REGION = FINAL_LOUNGE_TV_PLAY_TAP_RECT;
