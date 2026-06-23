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

export type PerspectivePanelId =
  | 'reception-left'
  | 'reception-center'
  | 'reception-right'
  | 'curator-tablet'
  | 'checkout-tablet'
  | 'signin-tablet'
  | 'tv-lounge-screen'
  | 'psa-hologram-screen'
  | 'extensions-boutique-wall';

export type PerspectivePanelPage =
  | 'reception'
  | 'shopping-bag'
  | 'acquisition'
  | 'sign-in'
  | 'lounge'
  | 'psa-suite'
  | 'penthouse-boutique';

export type PerspectivePanelDefinition = {
  id: PerspectivePanelId;
  label: string;
  page: PerspectivePanelPage;
  points: PerspectivePanelQuad;
};

export type PerspectivePanelMap = Partial<Record<PerspectivePanelId, PerspectivePanelQuad>>;
