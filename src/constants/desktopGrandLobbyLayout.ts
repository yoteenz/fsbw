import type {
  DesktopGrandLobbyLayout,
  DesktopGrandLobbyPanelRegionId,
  DesktopGrandLobbyPercentRect,
} from '../types/desktopGrandLobby';

/**
 * Default alignment for Grand Lobby glass panels on the Panels hero.
 * Tune with `?grandLobbyDebug=1` on `/desktop/lobby?zone=grand-lobby`.
 */
export const DESKTOP_GRAND_LOBBY_LAYOUT_SEED: DesktopGrandLobbyLayout = {
  rects: {
    membershipAccess: { x: 4.2, y: 10.5, width: 13.8, height: 30.5 },
    mansionEconomy: { x: 4.2, y: 43.5, width: 13.8, height: 38.5 },
    mansionDirectory: { x: 43.2, y: 7.5, width: 13.6, height: 78 },
    welcomeMansion: { x: 82.2, y: 10.5, width: 13.8, height: 30.5 },
    houseInformation: { x: 82.2, y: 43.5, width: 13.8, height: 38.5 },
  },
};

export const DESKTOP_GRAND_LOBBY_DEBUG_PANELS = [
  { id: 'membershipAccess' as const, label: 'MEMBERSHIP', color: '#3b82f6' },
  { id: 'mansionEconomy' as const, label: 'ECONOMY', color: '#22c55e' },
  { id: 'mansionDirectory' as const, label: 'DIRECTORY', color: '#a855f7' },
  { id: 'welcomeMansion' as const, label: 'WELCOME', color: '#f59e0b' },
  { id: 'houseInformation' as const, label: 'HOUSE INFO', color: '#ef4444' },
] as const;

export function getDesktopGrandLobbyRect(
  layout: DesktopGrandLobbyLayout,
  id: DesktopGrandLobbyPanelRegionId,
): DesktopGrandLobbyPercentRect {
  return layout.rects[id] ?? DESKTOP_GRAND_LOBBY_LAYOUT_SEED.rects[id];
}

export function desktopGrandLobbyRectToImageRect(rect: DesktopGrandLobbyPercentRect) {
  return {
    left: rect.x / 100,
    top: rect.y / 100,
    width: rect.width / 100,
    height: rect.height / 100,
  };
}
