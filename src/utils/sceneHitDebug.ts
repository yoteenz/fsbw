import {
  LOBBY_SHELF_HIT_DEBUG_OVERLAY,
  LOUNGE_CHANDELIER_HIT_DEBUG_OVERLAY,
} from '../constants/finalLobbySceneAssets';

/** `?sceneHitDebug=1` on `/lobby` or `/lobby/lounge` — shows colored shelf / chandelier hit boxes. */
export function isSceneHitDebugQueryEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  return new URLSearchParams(window.location.search).get('sceneHitDebug') === '1';
}

/** Chandelier hit-box QA overlay — constant and/or {@link isSceneHitDebugQueryEnabled}. */
export function isLoungeChandelierHitDebugEnabled(): boolean {
  if (LOUNGE_CHANDELIER_HIT_DEBUG_OVERLAY) return true;
  return isSceneHitDebugQueryEnabled();
}

/** Lobby mannequin shelf hit boxes — constant and/or {@link isSceneHitDebugQueryEnabled}. */
export function isLobbyShelfHitDebugEnabled(): boolean {
  if (LOBBY_SHELF_HIT_DEBUG_OVERLAY) return true;
  return isSceneHitDebugQueryEnabled();
}
