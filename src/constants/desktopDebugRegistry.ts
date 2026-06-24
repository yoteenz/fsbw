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
import { DESKTOP_NOTIFICATIONS_IMAGE } from './desktopNotifications';
import {
  DESKTOP_NOTIFICATIONS_DEBUG_PANELS,
  DESKTOP_NOTIFICATIONS_LAYOUT_SEED,
} from './desktopNotificationsLayout';
import {
  DESKTOP_PSA_SUITE_ART_HEIGHT,
  DESKTOP_PSA_SUITE_ART_WIDTH,
  DESKTOP_PSA_SUITE_HOLOGRAM_HIT_REGION,
} from './desktopPsaSuiteLayout';
import {
  DESKTOP_LOUNGE_ART_HEIGHT,
  DESKTOP_LOUNGE_ART_WIDTH,
  DESKTOP_LOUNGE_TV_HIT_REGION,
} from './desktopLoungeTvLayout';
import {
  EXTENSIONS_BOUTIQUE_ART_HEIGHT,
  EXTENSIONS_BOUTIQUE_ART_WIDTH,
  EXTENSIONS_WALL_HOTSPOT_RECT,
} from './desktopExtensionsBoutique';
import {
  PENTHOUSE_SUITE_IMAGE,
  PENTHOUSE_SUITE_PANEL_RECTS,
  type PenthouseSuitePanelId,
} from './desktopPenthouseSuite';
import {
  RECEPTION_DASHBOARD_IMAGE,
  RECEPTION_DASHBOARD_PANEL_RECTS,
  type ReceptionDashboardPanelId,
} from './desktopReceptionDashboard';
import {
  DESKTOP_ROOM_HERO_ART_HEIGHT,
  DESKTOP_ROOM_HERO_ART_WIDTH,
} from './desktopRoomHeroArt';
import { DESKTOP_SHOPPING_BAG_IMAGE } from './desktopShoppingBag';
import {
  ACQUISITION_REGION_TO_PERSPECTIVE_PANEL,
  SHOPPING_BAG_REGION_TO_PERSPECTIVE_PANEL,
} from './desktopShoppingBagPerspectivePanels';
import {
  DESKTOP_SHOPPING_BAG_LAYOUT_SEED,
  desktopShoppingBagRectToImageRect,
} from './desktopShoppingBagLayout';
import { TRANSFORMATION_SUITE_IMAGE } from './transformationSuite';
import {
  TRANSFORMATION_SUITE_CIRCLE_DEBUG_PANELS,
  TRANSFORMATION_SUITE_LAYOUT_SEED,
  TRANSFORMATION_SUITE_RECT_DEBUG_PANELS,
} from './transformationSuiteLayout';
import type { FinalSceneHitRect } from './finalLobbySceneAssets';
import type { DesktopGrandLobbyPanelRegionId } from '../types/desktopGrandLobby';
import type { DesktopNotificationsRectRegionId } from '../types/desktopNotifications';
import type { DesktopShoppingBagRegionId } from '../types/desktopShoppingBagLayout';
import type {
  MansionDebugBounds,
  MansionDebugCategory,
  MansionDebugFilterGroup,
  MansionDebugPageId,
  MansionDebugRegion,
  MansionDebugRegionType,
} from '../types/desktopMansionDebug';
import type { TransformationSuiteCircleRegionId, TransformationSuiteRectRegionId } from '../types/transformationSuite';

type PercentRect = { x: number; y: number; width: number; height: number };

const STANDARD_HERO_IMAGE = {
  width: DESKTOP_ROOM_HERO_ART_WIDTH,
  height: DESKTOP_ROOM_HERO_ART_HEIGHT,
} as const;

const ZONE_PLACEHOLDER_RECT: FinalSceneHitRect = {
  left: 0.3,
  top: 0.25,
  width: 0.4,
  height: 0.5,
};

const TRANSFORMATION_SUITE_ASPECT =
  TRANSFORMATION_SUITE_IMAGE.width / TRANSFORMATION_SUITE_IMAGE.height;

function percentToImageRect(rect: PercentRect) {
  return {
    left: rect.x / 100,
    top: rect.y / 100,
    width: rect.width / 100,
    height: rect.height / 100,
  };
}

function boundsFromPercent(image: MansionDebugBounds['image'], rect: PercentRect): MansionDebugBounds {
  return { image, imageRect: percentToImageRect(rect) };
}

function boundsFromFinalScene(
  image: MansionDebugBounds['image'],
  rect: FinalSceneHitRect,
): MansionDebugBounds {
  return {
    image,
    imageRect: { left: rect.left, top: rect.top, width: rect.width, height: rect.height },
  };
}

function circleToBoundingImageRect(circle: { centerX: number; centerY: number; radius: number }) {
  const radiusY = circle.radius * TRANSFORMATION_SUITE_ASPECT;
  return {
    left: (circle.centerX - circle.radius) / 100,
    top: (circle.centerY - radiusY) / 100,
    width: (circle.radius * 2) / 100,
    height: (radiusY * 2) / 100,
  };
}

function metaFromColorGroup(colorGroup: string): {
  category: MansionDebugCategory;
  filterGroup: MansionDebugFilterGroup;
  type: MansionDebugRegionType;
} {
  switch (colorGroup) {
    case 'blue':
      return { category: 'information-panel', filterGroup: 'membership-panels', type: 'panel' };
    case 'green':
      return { category: 'information-panel', filterGroup: 'economy-panels', type: 'panel' };
    case 'purple':
      return { category: 'information-panel', filterGroup: 'welcome-panels', type: 'panel' };
    case 'cyan':
      return { category: 'information-panel', filterGroup: 'directory-panels', type: 'panel' };
    case 'red':
      return { category: 'navigation', filterGroup: 'navigation-areas', type: 'nav' };
    case 'yellow':
      return { category: 'room-hotspot', filterGroup: 'room-hotspots', type: 'hotspot' };
    default:
      return { category: 'information-panel', filterGroup: 'membership-panels', type: 'panel' };
  }
}

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
    perspectivePanelId: SHOPPING_BAG_REGION_TO_PERSPECTIVE_PANEL[regionId],
    bounds: shoppingBagBounds(regionId),
  };
}

function acquisitionRegion(
  id: string,
  regionId: DesktopShoppingBagRegionId,
  label: string,
  category: MansionDebugCategory,
  type: MansionDebugRegionType,
  component: string,
  dataSource?: string,
): MansionDebugRegion {
  const perspectivePanelId = ACQUISITION_REGION_TO_PERSPECTIVE_PANEL[regionId];
  return {
    id,
    page: 'acquisition',
    category,
    type,
    filterGroup: 'room-hotspots',
    label,
    component,
    dataSource,
    perspectivePanelId,
    bounds: shoppingBagBounds(regionId),
  };
}

function alertsRegion(
  regionId: DesktopNotificationsRectRegionId,
  label: string,
  colorGroup: string,
): MansionDebugRegion {
  const meta = metaFromColorGroup(colorGroup);
  return {
    id: `alerts-${regionId}`,
    page: 'alerts',
    category: meta.category,
    type: meta.type,
    filterGroup: meta.filterGroup,
    label,
    component: 'DesktopNotificationsScene',
    dataSource: `DESKTOP_NOTIFICATIONS_LAYOUT_SEED.rects.${regionId}`,
    bounds: boundsFromPercent(
      DESKTOP_NOTIFICATIONS_IMAGE,
      DESKTOP_NOTIFICATIONS_LAYOUT_SEED.rects[regionId],
    ),
  };
}

function bookingSuiteRectRegion(
  regionId: TransformationSuiteRectRegionId,
  label: string,
  colorGroup: string,
): MansionDebugRegion {
  const meta = metaFromColorGroup(colorGroup);
  return {
    id: `booking-suite-${regionId}`,
    page: 'booking-suite',
    category: meta.category,
    type: meta.type,
    filterGroup: meta.filterGroup,
    label,
    component: 'TransformationSuiteScene',
    dataSource: `TRANSFORMATION_SUITE_LAYOUT_SEED.rects.${regionId}`,
    bounds: boundsFromPercent(
      TRANSFORMATION_SUITE_IMAGE,
      TRANSFORMATION_SUITE_LAYOUT_SEED.rects[regionId],
    ),
  };
}

function bookingSuiteCircleRegion(
  regionId: TransformationSuiteCircleRegionId,
  label: string,
  colorGroup: string,
): MansionDebugRegion {
  const meta = metaFromColorGroup(colorGroup);
  const circle = TRANSFORMATION_SUITE_LAYOUT_SEED.circles[regionId];
  return {
    id: `booking-suite-${regionId}`,
    page: 'booking-suite',
    category: meta.category,
    type: meta.type,
    filterGroup: meta.filterGroup,
    label,
    component: 'TransformationSuiteScene',
    dataSource: `TRANSFORMATION_SUITE_LAYOUT_SEED.circles.${regionId}`,
    bounds: {
      image: TRANSFORMATION_SUITE_IMAGE,
      imageRect: circleToBoundingImageRect(circle),
    },
  };
}

const PENTHOUSE_SUITE_LABELS: Record<PenthouseSuitePanelId, string> = {
  hero: 'Account Hero',
  loyaltyPoints: 'Loyalty Points',
  slayTickets: 'Slay Tickets',
  vouchers: 'Vouchers',
  digitalCash: 'Digital Cash',
  myOrders: 'My Orders',
  rewardsCollection: 'Rewards Collection',
  referrals: 'Referrals',
  wishlist: 'Wishlist',
  myActivity: 'My Activity',
  affiliate: 'Affiliate',
  accountSettings: 'Account Settings',
};

function accountRegion(panelId: PenthouseSuitePanelId): MansionDebugRegion {
  return {
    id: `account-${panelId}`,
    page: 'account',
    category: 'information-panel',
    type: 'panel',
    filterGroup: 'membership-panels',
    label: PENTHOUSE_SUITE_LABELS[panelId],
    component: 'DesktopPenthouseSuiteScene',
    dataSource: `PENTHOUSE_SUITE_PANEL_RECTS.${panelId}`,
    bounds: boundsFromFinalScene(PENTHOUSE_SUITE_IMAGE, PENTHOUSE_SUITE_PANEL_RECTS[panelId]),
  };
}

const RECEPTION_PANEL_LABELS: Record<ReceptionDashboardPanelId, string> = {
  loungeContent: 'Lounge Content',
  slayCamUploads: 'Slay Cam Uploads',
  newCollectible: 'New Collectible',
  bawTrends: 'BAW Trends',
  communitySpotlight: 'Community Spotlight',
  featuredExperience: 'Featured Experience',
  hairAnalysisLab: 'Hair Analysis Lab',
  bawAtelier: 'BAW Atelier',
  theLounge: 'The Lounge',
  rewardsGallery: 'Rewards Gallery',
  slayCam: 'Slay Cam',
};

function receptionRegion(panelId: ReceptionDashboardPanelId): MansionDebugRegion {
  return {
    id: `reception-${panelId}`,
    page: 'concierge',
    pageZone: 'reception',
    category: 'information-panel',
    type: 'panel',
    filterGroup: 'directory-panels',
    label: RECEPTION_PANEL_LABELS[panelId],
    component: 'ReceptionDashboard',
    dataSource: `RECEPTION_DASHBOARD_PANEL_RECTS.${panelId}`,
    bounds: boundsFromFinalScene(RECEPTION_DASHBOARD_IMAGE, RECEPTION_DASHBOARD_PANEL_RECTS[panelId]),
  };
}

function zonePlaceholder(
  page: MansionDebugPageId,
  pageZone: string,
  label: string,
  image: MansionDebugBounds['image'] = STANDARD_HERO_IMAGE,
): MansionDebugRegion {
  return {
    id: `${page}-${pageZone}-hero`,
    page,
    pageZone,
    category: 'room-hotspot',
    type: 'hotspot',
    filterGroup: 'room-hotspots',
    label: `${label} Hero`,
    component: 'DesktopZoneRoomScene',
    bounds: boundsFromFinalScene(image, ZONE_PLACEHOLDER_RECT),
  };
}

const GRAND_LOBBY_REGIONS: MansionDebugRegion[] = [
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
];

const SHOPPING_BAG_REGIONS: MansionDebugRegion[] = [
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
];

const ACQUISITION_REGIONS: MansionDebugRegion[] = [
  acquisitionRegion(
    'acquisition-checkout-tablet',
    'curatorTablet',
    'Checkout Tablet Screen',
    'room-hotspot',
    'hotspot',
    'PerspectivePanel',
    'checkout-tablet',
  ),
  acquisitionRegion(
    'acquisition-collection-list',
    'cartGallery',
    'Checkout Collection List',
    'clickable-destination',
    'destination',
    'CuratedAcquisitionCartList',
    'curated-acquisition-list',
  ),
  acquisitionRegion(
    'acquisition-summary-panel',
    'acquisitionSummary',
    'Acquisition Summary Panel',
    'information-panel',
    'panel',
    'CuratorAcquisitionSummaryPanel',
    'curator-acquisition-summary',
  ),
];

const ALERTS_REGIONS: MansionDebugRegion[] = DESKTOP_NOTIFICATIONS_DEBUG_PANELS.map((panel) =>
  alertsRegion(panel.id, panel.label, panel.colorGroup),
);

const BOOKING_SUITE_REGIONS: MansionDebugRegion[] = [
  ...TRANSFORMATION_SUITE_RECT_DEBUG_PANELS.map((panel) =>
    bookingSuiteRectRegion(panel.id, panel.label, panel.colorGroup),
  ),
  ...TRANSFORMATION_SUITE_CIRCLE_DEBUG_PANELS.map((panel) =>
    bookingSuiteCircleRegion(panel.id, panel.label, panel.colorGroup),
  ),
];

const ACCOUNT_REGIONS: MansionDebugRegion[] = (
  Object.keys(PENTHOUSE_SUITE_LABELS) as PenthouseSuitePanelId[]
).map((panelId) => accountRegion(panelId));

const RECEPTION_REGIONS: MansionDebugRegion[] = (
  Object.keys(RECEPTION_PANEL_LABELS) as ReceptionDashboardPanelId[]
).map((panelId) => receptionRegion(panelId));

const FLOOR_ZONE_REGIONS: MansionDebugRegion[] = [
  zonePlaceholder('lobby', 'build-a-wig-atelier', 'Build-A-Wig Atelier'),
  {
    id: 'lobby-lounge-tv',
    page: 'lobby',
    pageZone: 'lounge',
    category: 'room-hotspot',
    type: 'hotspot',
    filterGroup: 'room-hotspots',
    label: 'Lounge TV Screen',
    component: 'DesktopLoungeSlayCinemaPlay',
    dataSource: 'DESKTOP_LOUNGE_TV_HIT_REGION',
    bounds: boundsFromFinalScene(
      { width: DESKTOP_LOUNGE_ART_WIDTH, height: DESKTOP_LOUNGE_ART_HEIGHT },
      DESKTOP_LOUNGE_TV_HIT_REGION,
    ),
  },
  zonePlaceholder('gallery', 'slay-cam-gallery', 'Slay Cam Gallery'),
  zonePlaceholder('gallery', 'members-lounge', 'Members Lounge'),
  zonePlaceholder('gallery', 'rewards-gallery', 'Rewards Gallery'),
  zonePlaceholder('concierge', 'founder-suite', 'Founder Suite'),
  {
    id: 'concierge-psa-hologram',
    page: 'concierge',
    pageZone: 'psa-suite',
    category: 'room-hotspot',
    type: 'hotspot',
    filterGroup: 'room-hotspots',
    label: 'PSA Hologram',
    component: 'PsaAssistantWidget',
    dataSource: 'DESKTOP_PSA_SUITE_HOLOGRAM_HIT_REGION',
    bounds: boundsFromFinalScene(
      { width: DESKTOP_PSA_SUITE_ART_WIDTH, height: DESKTOP_PSA_SUITE_ART_HEIGHT },
      DESKTOP_PSA_SUITE_HOLOGRAM_HIT_REGION,
    ),
  },
  zonePlaceholder('penthouse', 'showroom', 'Hair Showroom'),
  zonePlaceholder('penthouse', 'analysis-lab', 'Hair Analysis Lab'),
  {
    id: 'penthouse-boutique-extensions-wall',
    page: 'penthouse',
    pageZone: 'boutique',
    category: 'room-hotspot',
    type: 'hotspot',
    filterGroup: 'room-hotspots',
    label: 'Extensions Wall',
    component: 'ExtensionsBoutiqueExperience',
    dataSource: 'EXTENSIONS_WALL_HOTSPOT_RECT',
    bounds: boundsFromFinalScene(
      { width: EXTENSIONS_BOUTIQUE_ART_WIDTH, height: EXTENSIONS_BOUTIQUE_ART_HEIGHT },
      EXTENSIONS_WALL_HOTSPOT_RECT,
    ),
  },
];

/** Central registry of mansion interactive regions for dev debug overlays. */
export const DESKTOP_DEBUG_REGISTRY: readonly MansionDebugRegion[] = [
  ...GRAND_LOBBY_REGIONS,
  ...SHOPPING_BAG_REGIONS,
  ...ACQUISITION_REGIONS,
  ...ALERTS_REGIONS,
  ...BOOKING_SUITE_REGIONS,
  ...ACCOUNT_REGIONS,
  ...RECEPTION_REGIONS,
  ...FLOOR_ZONE_REGIONS,
] as const;

/** Map alerts layout keys to mansion debug region ids (for export). */
export const ALERTS_LAYOUT_KEY_TO_DEBUG_ID: Record<DesktopNotificationsRectRegionId, string> = {
  recentNotification1: 'alerts-recentNotification1',
  recentNotification2: 'alerts-recentNotification2',
  recentNotification3: 'alerts-recentNotification3',
  recentNotification4: 'alerts-recentNotification4',
  recentNotification5: 'alerts-recentNotification5',
  recentActivityButton: 'alerts-recentActivityButton',
  featuredNotificationPanel: 'alerts-featuredNotificationPanel',
  priorityAlert1: 'alerts-priorityAlert1',
  priorityAlert2: 'alerts-priorityAlert2',
  priorityAlert3: 'alerts-priorityAlert3',
  priorityAlert4: 'alerts-priorityAlert4',
  priorityAlert5: 'alerts-priorityAlert5',
  priorityAlertsButton: 'alerts-priorityAlertsButton',
};

/** Map booking-suite rect keys to mansion debug region ids (for export). */
export const BOOKING_SUITE_RECT_KEY_TO_DEBUG_ID: Record<TransformationSuiteRectRegionId, string> = {
  DEBUG_CONSULT_1: 'booking-suite-DEBUG_CONSULT_1',
  DEBUG_CONSULT_2: 'booking-suite-DEBUG_CONSULT_2',
  DEBUG_CONSULT_3: 'booking-suite-DEBUG_CONSULT_3',
  DEBUG_CONSULT_4: 'booking-suite-DEBUG_CONSULT_4',
  DEBUG_FEATURED_EXPERIENCE: 'booking-suite-DEBUG_FEATURED_EXPERIENCE',
  DEBUG_SERVICE_1: 'booking-suite-DEBUG_SERVICE_1',
  DEBUG_SERVICE_2: 'booking-suite-DEBUG_SERVICE_2',
  DEBUG_SERVICE_3: 'booking-suite-DEBUG_SERVICE_3',
  DEBUG_SERVICE_4: 'booking-suite-DEBUG_SERVICE_4',
  DEBUG_CIRCLE_HEADER: 'booking-suite-DEBUG_CIRCLE_HEADER',
  DEBUG_SERVICE_GRID: 'booking-suite-DEBUG_SERVICE_GRID',
  DEBUG_DATE_PICKER: 'booking-suite-DEBUG_DATE_PICKER',
  DEBUG_TIME_PICKER: 'booking-suite-DEBUG_TIME_PICKER',
  DEBUG_BOOK_BUTTON: 'booking-suite-DEBUG_BOOK_BUTTON',
};

/** Map account panel keys to mansion debug region ids (for export). */
export const ACCOUNT_PANEL_KEY_TO_DEBUG_ID: Record<PenthouseSuitePanelId, string> = {
  hero: 'account-hero',
  loyaltyPoints: 'account-loyaltyPoints',
  slayTickets: 'account-slayTickets',
  vouchers: 'account-vouchers',
  digitalCash: 'account-digitalCash',
  myOrders: 'account-myOrders',
  rewardsCollection: 'account-rewardsCollection',
  referrals: 'account-referrals',
  wishlist: 'account-wishlist',
  myActivity: 'account-myActivity',
  affiliate: 'account-affiliate',
  accountSettings: 'account-accountSettings',
};

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
