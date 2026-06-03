import { FINAL_LOBBY_HIT_REGIONS, type FinalSceneHitRect } from './finalLobbySceneAssets';

const FINAL_LP_BASE =
  'https://hyycomvcaqxxvyrfupes.supabase.co/storage/v1/object/public/live-preview/Final%20LP';

export const FINAL_LOBBY_REGISTER_OPEN_OVERLAY_VERSION = '524y401-chroma-v2';
export const FINAL_LOBBY_PHONE_OPEN_OVERLAY_VERSION = '8f5ce48-chroma-v2';

/** Open-state cash register — chroma-keyed; sized to closed tap box on `final-lobby.png`. */
export const FINAL_LOBBY_REGISTER_OPEN_OVERLAY_SRC_REMOTE = `${FINAL_LP_BASE}/524y401iPlVoR0f6uT0OP_AvC0J19z%20(1).png`;

export const FINAL_LOBBY_REGISTER_OPEN_OVERLAY_SRC = `/assets/final-lobby-register-open.png?v=${FINAL_LOBBY_REGISTER_OPEN_OVERLAY_VERSION}`;

/** Open-state phone — chroma-keyed; sized to closed tap box on `final-lobby.png`. */
export const FINAL_LOBBY_PHONE_OPEN_OVERLAY_SRC_REMOTE = `${FINAL_LP_BASE}/8f5ce48Q8jlQ2BvEy5I-m_pkBqVvGQ-1.png`;

export const FINAL_LOBBY_PHONE_OPEN_OVERLAY_SRC = `/assets/final-lobby-phone-open.png?v=${FINAL_LOBBY_PHONE_OPEN_OVERLAY_VERSION}`;

/** Same cover-map box as closed register hit target (`FINAL_LOBBY_HIT_REGIONS.caseRegister`). */
export const FINAL_LOBBY_REGISTER_OPEN_OVERLAY_RECT: FinalSceneHitRect =
  FINAL_LOBBY_HIT_REGIONS.caseRegister;

/** Same cover-map box as closed phone hit target (`FINAL_LOBBY_HIT_REGIONS.casePhone`). */
export const FINAL_LOBBY_PHONE_OPEN_OVERLAY_RECT: FinalSceneHitRect = FINAL_LOBBY_HIT_REGIONS.casePhone;

/** Open-state register/phone PNG scale (popover cards unchanged). */
export const LOBBY_CASE_PROP_OPEN_OVERLAY_SCALE = 0.75;

/** Shrink overlay rect from bottom-center (matches `object-position: center bottom`). */
export function scaleLobbyCasePropOpenOverlayRect(
  rect: FinalSceneHitRect,
  scale = LOBBY_CASE_PROP_OPEN_OVERLAY_SCALE,
): FinalSceneHitRect {
  const width = rect.width * scale;
  const height = rect.height * scale;
  return {
    left: rect.left + (rect.width - width) / 2,
    top: rect.top + (rect.height - height),
    width,
    height,
  };
}

/** Tandem nudge: open PNG + popover wrapper (register — up 8px, right 8px). */
export const LOBBY_CASE_PROP_REGISTER_LAYOUT_OFFSET = { x: 8, y: -8 } as const;

/** Tandem nudge: open PNG + popover wrapper (phone — up 3px, left 3px). */
export const LOBBY_CASE_PROP_PHONE_LAYOUT_OFFSET = { x: -3, y: -3 } as const;

export function lobbyCasePropLayoutTransform(offset: { x: number; y: number }): string | undefined {
  if (!offset.x && !offset.y) return undefined;
  return `translate(${offset.x}px, ${offset.y}px)`;
}

export const FINAL_LOBBY_CASE_PROP_OPEN_OVERLAY_SRCS = [
  FINAL_LOBBY_REGISTER_OPEN_OVERLAY_SRC,
  FINAL_LOBBY_PHONE_OPEN_OVERLAY_SRC,
] as const;
