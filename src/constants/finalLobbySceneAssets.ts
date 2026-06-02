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

/** Wall-mounted TV on lounge composite — measured on `final-lounge.png` (928×1680). */
export const FINAL_LOUNGE_TV_HIT_REGION: FinalSceneHitRect = {
  left: 0.277,
  top: 0.16,
  width: 0.501,
  height: 0.299,
};

/** In-screen play — normalized on source image (928×1680), mapped via {@link mapImageRectToCoverContainer}. */
export const FINAL_LOUNGE_TV_PLAY_IMAGE_RECT: FinalSceneHitRect = {
  left: 0.47,
  top: 0.218,
  width: 0.12,
  height: 0.08,
};

/** @deprecated Use {@link FINAL_LOUNGE_TV_PLAY_IMAGE_RECT} + cover hit map. */
export const FINAL_LOUNGE_TV_PLAY_HIT_REGION = FINAL_LOUNGE_TV_PLAY_IMAGE_RECT;
