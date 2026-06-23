import { DESKTOP_SHOPPING_BAG_TABLET_QUAD } from './desktopShoppingBag';
import { DESKTOP_LOUNGE_TV_HIT_REGION } from './desktopLoungeTvLayout';
import { DESKTOP_PSA_SUITE_HOLOGRAM_HIT_REGION } from './desktopPsaSuiteLayout';
import { EXTENSIONS_WALL_HOTSPOT_RECT } from './desktopExtensionsBoutique';
import type {
  PerspectivePanelDefinition,
  PerspectivePanelId,
  PerspectivePanelPage,
} from '../types/perspectivePanel';
import {
  quad4ToPerspectivePanelQuad,
  rectToPerspectivePanelQuad,
} from '../utils/perspectivePanelQuad';

/** Reception wall columns — axis-aligned seed quads; tune with PANEL DEBUG. */
const RECEPTION_LEFT_RECT = {
  left: 0.062,
  top: 0.128,
  width: 0.158,
  height: 0.748,
} as const;

const RECEPTION_CENTER_RECT = {
  left: 0.248,
  top: 0.142,
  width: 0.504,
  height: 0.568,
} as const;

const RECEPTION_RIGHT_RECT = {
  left: 0.78,
  top: 0.128,
  width: 0.158,
  height: 0.748,
} as const;

/** Sign-in acrylic tablet — seed rect until art is tuned. */
const SIGNIN_TABLET_RECT = {
  left: 0.22,
  top: 0.12,
  width: 0.56,
  height: 0.76,
} as const;

export const PERSPECTIVE_PANEL_DEFINITIONS: PerspectivePanelDefinition[] = [
  {
    id: 'reception-left',
    label: 'Reception Left',
    page: 'reception',
    points: rectToPerspectivePanelQuad(RECEPTION_LEFT_RECT),
  },
  {
    id: 'reception-center',
    label: 'Reception Center',
    page: 'reception',
    points: rectToPerspectivePanelQuad(RECEPTION_CENTER_RECT),
  },
  {
    id: 'reception-right',
    label: 'Reception Right',
    page: 'reception',
    points: rectToPerspectivePanelQuad(RECEPTION_RIGHT_RECT),
  },
  {
    id: 'curator-tablet',
    label: 'Curator Tablet',
    page: 'shopping-bag',
    points: quad4ToPerspectivePanelQuad(DESKTOP_SHOPPING_BAG_TABLET_QUAD),
  },
  {
    id: 'checkout-tablet',
    label: 'Checkout Tablet',
    page: 'acquisition',
    points: quad4ToPerspectivePanelQuad(DESKTOP_SHOPPING_BAG_TABLET_QUAD),
  },
  {
    id: 'signin-tablet',
    label: 'Sign In Tablet',
    page: 'sign-in',
    points: rectToPerspectivePanelQuad(SIGNIN_TABLET_RECT),
  },
  {
    id: 'tv-lounge-screen',
    label: 'TV Lounge Screen',
    page: 'lounge',
    points: rectToPerspectivePanelQuad(DESKTOP_LOUNGE_TV_HIT_REGION),
  },
  {
    id: 'psa-hologram-screen',
    label: 'PSA Hologram Screen',
    page: 'psa-suite',
    points: rectToPerspectivePanelQuad(DESKTOP_PSA_SUITE_HOLOGRAM_HIT_REGION),
  },
  {
    id: 'extensions-boutique-wall',
    label: 'Extensions Boutique Wall',
    page: 'penthouse-boutique',
    points: rectToPerspectivePanelQuad(EXTENSIONS_WALL_HOTSPOT_RECT),
  },
];

export const PERSPECTIVE_PANEL_BY_ID: Record<PerspectivePanelId, PerspectivePanelDefinition> =
  PERSPECTIVE_PANEL_DEFINITIONS.reduce(
    (acc, panel) => {
      acc[panel.id] = panel;
      return acc;
    },
    {} as Record<PerspectivePanelId, PerspectivePanelDefinition>,
  );

export function getPerspectivePanelsForPage(page: PerspectivePanelPage): PerspectivePanelDefinition[] {
  return PERSPECTIVE_PANEL_DEFINITIONS.filter((panel) => panel.page === page);
}

export function defaultPerspectivePanelQuad(id: PerspectivePanelId) {
  return PERSPECTIVE_PANEL_BY_ID[id].points;
}
