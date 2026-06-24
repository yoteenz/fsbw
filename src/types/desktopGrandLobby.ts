/** Percentage rect on the Grand Lobby hero image (0–100). */
export type DesktopGrandLobbyPercentRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type DesktopGrandLobbyPanelRegionId =
  | 'membershipAccess'
  | 'mansionEconomy'
  | 'mansionDirectory'
  | 'welcomeMansion'
  | 'houseInformation';

export type DesktopGrandLobbyLayout = {
  rects: Record<DesktopGrandLobbyPanelRegionId, DesktopGrandLobbyPercentRect>;
};
