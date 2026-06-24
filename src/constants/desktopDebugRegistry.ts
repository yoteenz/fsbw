import {
  DESKTOP_CONCIERGE_PATH,
  DESKTOP_GALLERY_PATH,
  DESKTOP_LOBBY_PATH,
  DESKTOP_PENTHOUSE_PATH,
} from './desktopFloors';
import { DESKTOP_GRAND_LOBBY_IMAGE } from './desktopGrandLobby';
import {
  DESKTOP_GRAND_LOBBY_LAYOUT_SEED,
  desktopGrandLobbyRectToImageRect,
} from './desktopGrandLobbyLayout';
import { DESKTOP_SHOPPING_BAG_IMAGE } from './desktopShoppingBag';
import {
  DESKTOP_SHOPPING_BAG_LAYOUT_SEED,
  desktopShoppingBagRectToImageRect,
} from './desktopShoppingBagLayout';
import type { DesktopGrandLobbyPanelRegionId } from '../types/desktopGrandLobby';
import type { DesktopShoppingBagRegionId } from '../types/desktopShoppingBagLayout';
import type {
  MansionDebugBounds,
  MansionDebugCategory,
  MansionDebugFilterGroup,
  MansionDebugPageId,
  MansionDebugRegion,
  MansionDebugRegionType,
} from '../types/desktopMansionDebug';

function grandLobbyBounds(regionId: DesktopGrandLobbyPanelRegionId): MansionDebugBounds {
  const rect = DESKTOP_GRAND_LOBBY_LAYOUT_SEED.rects[regionId];
  return {
    image: DESKTOP_GRAND_LOBBY_IMAGE,
    imageRect: desktopGrandLobbyRectToImageRect(rect),
  };
}

function shoppingBagBounds(regionId: DesktopShoppingBagRegionId): MansionDebugBounds {
  const rect = DESKTOP_SHOPPING_BAG_LAYOUT_SEED.rects[regionId];
  return {
    image: DESKTOP_SHOPPING_BAG_IMAGE,
    imageRect: desktopShoppingBagRectToImageRect(rect),
  };
}

function shoppingBagRegion(
  id: string,
  regionId: DesktopShoppingBagRegionId,
  label: string,
  category: MansionDebugCategory,
  type: MansionDebugRegionType,
  component: string,
  dataSource?: string,
  route?: string,
): MansionDebugRegion {
  return {
    id,
    page: 'shopping-bag',
    category,
    type,
    filterGroup: 'room-hotspots',
    label,
    component,
    route,
    dataSource,
    bounds: shoppingBagBounds(regionId),
  };
}

function lobbyPanel(
  id: string,
  regionId: DesktopGrandLobbyPanelRegionId,
  label: string,
  filterGroup: MansionDebugFilterGroup,
  category: MansionDebugCategory,
  type: MansionDebugRegionType,
  component: string,
  dataSource: string,
  route?: string,
): MansionDebugRegion {
  return {
    id,
    page: 'lobby',
    pageZone: 'grand-lobby',
    category,
    type,
    filterGroup,
    label,
    component,
    route,
    dataSource,
    bounds: grandLobbyBounds(regionId),
  };
}

/** Central registry of mansion interactive regions for dev debug overlays. */
export const DESKTOP_DEBUG_REGISTRY: readonly MansionDebugRegion[] = [
  lobbyPanel(
    'membership-access-panel',
    'membershipAccess',
    'Membership Access Panel',
    'membership-panels',
    'information-panel',
    'panel',
    'GrandLobbyPanels',
    'GRAND_LOBBY_MEMBERSHIP_BENEFITS',
  ),
  lobbyPanel(
    'mansion-economy-panel',
    'mansionEconomy',
    'Mansion Economy Panel',
    'economy-panels',
    'rewards-economy',
    'economy',
    'GrandLobbyPanels',
    'GRAND_LOBBY_ECONOMY_EARN / GRAND_LOBBY_ECONOMY_PROGRESS',
  ),
  lobbyPanel(
    'mansion-directory-panel',
    'mansionDirectory',
    'Mansion Directory Panel',
    'directory-panels',
    'elevator-control',
    'elevator',
    'GrandLobbyPanels',
    'GRAND_LOBBY_DIRECTORY_FLOORS',
    '/desktop/lobby?zone=grand-lobby',
  ),
  lobbyPanel(
    'welcome-to-mansion-panel',
    'welcomeMansion',
    'Welcome to the Mansion Panel',
    'welcome-panels',
    'information-panel',
    'panel',
    'GrandLobbyPanels',
    'GRAND_LOBBY_WELCOME_COPY',
  ),
  lobbyPanel(
    'house-information-panel',
    'houseInformation',
    'House Information Panel',
    'house-information-panels',
    'information-panel',
    'panel',
    'GrandLobbyPanels',
    'GRAND_LOBBY_HOUSE_INFO_LINKS',
    '/brand/about',
  ),
  shoppingBagRegion(
    'curator-tablet-screen',
    'curatorTablet',
    'Curator Tablet Screen',
    'room-hotspot',
    'hotspot',
    'PerspectivePanel',
    'curator-tablet',
  ),
  shoppingBagRegion(
    'collection-header',
    'collectionHeader',
    'Collection Header',
    'information-panel',
    'panel',
    'CuratedCollectionTablet',
    'curated-tablet__header',
  ),
  shoppingBagRegion(
    'cart-gallery',
    'cartGallery',
    'Cart Gallery',
    'clickable-destination',
    'destination',
    'CuratedCartGallery',
    'curated-gallery',
  ),
  shoppingBagRegion(
    'acquisition-summary',
    'acquisitionSummary',
    'Acquisition Summary Bar',
    'navigation',
    'nav',
    'AcquisitionSummaryBar',
    'acquisition-summary-bar',
  ),
  shoppingBagRegion(
    'empty-collection-cta',
    'emptyCollectionCta',
    'Empty Collection CTA',
    'clickable-destination',
    'destination',
    'EmptyCollectionState',
    'curated-tablet__enter-btn',
    '/desktop/penthouse?room=showroom',
  ),
] as const;

export function resolveMansionDebugPageIdFromPath(pathname: string): MansionDebugPageId | null {
  if (pathname.startsWith('/desktop/lobby')) return 'lobby';
  if (pathname.startsWith('/desktop/gallery')) return 'gallery';
  if (pathname.startsWith('/desktop/penthouse')) return 'penthouse';
  if (pathname.startsWith('/desktop/concierge')) return 'concierge';
  if (pathname.startsWith('/desktop/account')) return 'account';
  if (pathname.startsWith('/desktop/alerts') || pathname.startsWith('/desktop/notifications')) return 'alerts';
  if (pathname.startsWith('/desktop/booking-suite')) return 'booking-suite';
  if (pathname.startsWith('/desktop/shopping-bag')) return 'shopping-bag';
  if (pathname.startsWith('/desktop/acquisition')) return 'acquisition';
  return null;
}

export function resolveMansionDebugPageLabel(page: MansionDebugPageId): string {
  switch (page) {
    case 'lobby':
      return 'Lobby';
    case 'gallery':
      return 'Gallery';
    case 'penthouse':
      return 'Penthouse';
    case 'concierge':
      return 'Concierge';
    case 'account':
      return 'Account';
    case 'alerts':
      return 'Alerts';
    case 'booking-suite':
      return 'Booking Suite';
    case 'shopping-bag':
      return 'Shopping Bag';
    case 'acquisition':
      return 'Acquisition';
    default:
      return page;
  }
}

export function resolveMansionDebugPageIdFromFloorPath(floorPath: string): MansionDebugPageId {
  if (floorPath === DESKTOP_LOBBY_PATH) return 'lobby';
  if (floorPath === DESKTOP_GALLERY_PATH) return 'gallery';
  if (floorPath === DESKTOP_PENTHOUSE_PATH) return 'penthouse';
  if (floorPath === DESKTOP_CONCIERGE_PATH) return 'concierge';
  return 'lobby';
}
