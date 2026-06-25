export type PerspectivePanelPoint = {
  x: number;
  y: number;
};

/** Four corners in normalized hero image space (0–1). */
export type PerspectivePanelQuad = {
  topLeft: PerspectivePanelPoint;
  topRight: PerspectivePanelPoint;
  bottomRight: PerspectivePanelPoint;
  bottomLeft: PerspectivePanelPoint;
};

export type PerspectivePanelCornerId = keyof PerspectivePanelQuad;

export type PerspectivePanelDefinition = {
  id: import('../constants/perspectivePanelIds').PerspectivePanelId;
  label: string;
  page: import('../constants/perspectivePanelIds').PerspectivePanelPage;
  points: PerspectivePanelQuad;
};

export type PerspectivePanelMap = Partial<
  Record<import('../constants/perspectivePanelIds').PerspectivePanelId, PerspectivePanelQuad>
>;
