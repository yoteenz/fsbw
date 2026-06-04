import {
  FINAL_LOBBY_DISPLAY_CASE_RECT,
  FINAL_LOBBY_HIT_REGIONS,
  type FinalSceneHitRect,
} from './finalLobbySceneAssets';

export { FINAL_LOBBY_DISPLAY_CASE_RECT };

/** Map a child rect in image space into 0–1 coordinates inside {@link FINAL_LOBBY_DISPLAY_CASE_RECT}. */
export function lobbyDisplayCaseSlotRect(child: FinalSceneHitRect): FinalSceneHitRect {
  const parent = FINAL_LOBBY_DISPLAY_CASE_RECT;
  return {
    left: (child.left - parent.left) / parent.width,
    top: (child.top - parent.top) / parent.height,
    width: child.width / parent.width,
    height: child.height / parent.height,
  };
}

export const LOBBY_DISPLAY_CASE_REGISTER_SLOT = lobbyDisplayCaseSlotRect(
  FINAL_LOBBY_HIT_REGIONS.caseRegister,
);

export const LOBBY_DISPLAY_CASE_PHONE_SLOT = lobbyDisplayCaseSlotRect(
  FINAL_LOBBY_HIT_REGIONS.casePhone,
);

/**
 * Cover-map nudge for the whole display case (register + phone move together).
 * Midpoint of legacy per-prop offsets in `finalLobbyCasePropOverlays.ts`.
 */
export const LOBBY_DISPLAY_CASE_LAYOUT_OFFSET = { x: 12, y: -31 } as const;
