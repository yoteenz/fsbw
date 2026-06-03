import { LOUNGE_CHANDELIER_HIT_DEBUG_OVERLAY } from '../constants/finalLobbySceneAssets';

/** Chandelier hit-box QA overlay — constant and/or `?sceneHitDebug=1` on lobby/lounge routes. */
export function isLoungeChandelierHitDebugEnabled(): boolean {
  if (LOUNGE_CHANDELIER_HIT_DEBUG_OVERLAY) return true;
  if (typeof window === 'undefined') return false;
  return new URLSearchParams(window.location.search).get('sceneHitDebug') === '1';
}
