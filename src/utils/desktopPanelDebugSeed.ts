import type { FinalSceneHitRect } from '../constants/finalLobbySceneAssets';
import { PENTHOUSE_SUITE_PANEL_RECTS } from '../constants/desktopPenthouseSuite';
import { RECEPTION_DASHBOARD_PANEL_RECTS } from '../constants/desktopReceptionDashboard';
import type { PanelDebugMap, PanelDebugSceneId } from '../types/desktopPanelDebug';
import { imageRectToPercentRect } from './desktopPanelDebugMode';

/** Maps production rect keys to panel-debug export ids where they differ. */
const PENTHOUSE_RECT_KEY_BY_DEBUG_ID: Record<string, keyof typeof PENTHOUSE_SUITE_PANEL_RECTS> = {
  hero: 'hero',
  diamondPoints: 'loyaltyPoints',
  slayTickets: 'slayTickets',
  vouchers: 'vouchers',
  digitalCash: 'digitalCash',
  myOrders: 'myOrders',
  rewardsCollection: 'rewardsCollection',
  referrals: 'referrals',
  wishlist: 'wishlist',
  myActivity: 'myActivity',
  affiliate: 'affiliate',
  accountSettings: 'accountSettings',
};

function seedFromProductionRects(
  sceneId: PanelDebugSceneId,
  panelIds: string[],
): PanelDebugMap {
  const map: PanelDebugMap = {};

  if (sceneId === 'penthouse') {
    for (const id of panelIds) {
      const rectKey = PENTHOUSE_RECT_KEY_BY_DEBUG_ID[id];
      const rect = rectKey ? PENTHOUSE_SUITE_PANEL_RECTS[rectKey] : undefined;
      if (rect) map[id] = imageRectToPercentRect(rect);
    }
    return map;
  }

  for (const id of panelIds) {
    const rect = RECEPTION_DASHBOARD_PANEL_RECTS[id as keyof typeof RECEPTION_DASHBOARD_PANEL_RECTS];
    if (rect) map[id] = imageRectToPercentRect(rect);
  }
  return map;
}

export function resolvePanelDebugMap(
  sceneId: PanelDebugSceneId,
  panelIds: string[],
  stored: PanelDebugMap | null,
): PanelDebugMap {
  const seed = seedFromProductionRects(sceneId, panelIds);
  if (!stored) return seed;

  const merged: PanelDebugMap = { ...seed };
  for (const id of panelIds) {
    if (stored[id]) merged[id] = stored[id];
  }
  return merged;
}

export function percentRectFromImageRect(rect: FinalSceneHitRect) {
  return imageRectToPercentRect(rect);
}
