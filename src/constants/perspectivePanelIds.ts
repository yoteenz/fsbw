import type { DesktopGrandLobbyPanelRegionId } from '../types/desktopGrandLobby';
import type { DesktopNotificationsRectRegionId } from '../types/desktopNotifications';
import type { PenthouseSuitePanelId } from './desktopPenthouseSuite';
import type { ReceptionDashboardPanelId } from './desktopReceptionDashboard';
import type { TransformationSuiteCircleRegionId, TransformationSuiteRectRegionId } from '../types/transformationSuite';

function camelToKebab(value: string): string {
  return value.replace(/([a-z])([A-Z])/g, '$1-$2').replace(/_/g, '-').toLowerCase();
}

const NOTIFICATIONS_REGION_IDS = [
  'recentNotification1',
  'recentNotification2',
  'recentNotification3',
  'recentNotification4',
  'recentNotification5',
  'recentActivityButton',
  'featuredNotificationPanel',
  'priorityAlert1',
  'priorityAlert2',
  'priorityAlert3',
  'priorityAlert4',
  'priorityAlert5',
  'priorityAlertsButton',
] as const satisfies readonly DesktopNotificationsRectRegionId[];

const BOOKING_RECT_IDS = [
  'DEBUG_CONSULT_1',
  'DEBUG_CONSULT_2',
  'DEBUG_CONSULT_3',
  'DEBUG_CONSULT_4',
  'DEBUG_FEATURED_EXPERIENCE',
  'DEBUG_CIRCLE_HEADER',
  'DEBUG_SERVICE_GRID',
  'DEBUG_DATE_PICKER',
  'DEBUG_TIME_PICKER',
  'DEBUG_BOOK_BUTTON',
  'DEBUG_SERVICE_1',
  'DEBUG_SERVICE_2',
  'DEBUG_SERVICE_3',
  'DEBUG_SERVICE_4',
] as const satisfies readonly TransformationSuiteRectRegionId[];

const BOOKING_CIRCLE_IDS = ['DEBUG_CIRCLE_BOUNDARY'] as const satisfies readonly TransformationSuiteCircleRegionId[];

const ACCOUNT_PANEL_IDS = [
  'hero',
  'loyaltyPoints',
  'slayTickets',
  'vouchers',
  'digitalCash',
  'myOrders',
  'rewardsCollection',
  'referrals',
  'wishlist',
  'myActivity',
  'affiliate',
  'accountSettings',
] as const satisfies readonly PenthouseSuitePanelId[];

const RECEPTION_PANEL_IDS = [
  'loungeContent',
  'slayCamUploads',
  'newCollectible',
  'bawTrends',
  'communitySpotlight',
  'featuredExperience',
  'hairAnalysisLab',
  'bawAtelier',
  'theLounge',
  'rewardsGallery',
  'slayCam',
] as const satisfies readonly ReceptionDashboardPanelId[];

export const GRAND_LOBBY_REGION_TO_PERSPECTIVE_PANEL = {
  membershipAccess: 'grand-lobby-membership-access',
  mansionEconomy: 'grand-lobby-mansion-economy',
  mansionDirectory: 'grand-lobby-mansion-directory',
  welcomeMansion: 'grand-lobby-welcome-mansion',
  houseInformation: 'grand-lobby-house-information',
} as const satisfies Record<DesktopGrandLobbyPanelRegionId, string>;

export const ALERTS_REGION_TO_PERSPECTIVE_PANEL = Object.fromEntries(
  NOTIFICATIONS_REGION_IDS.map((id) => [id, `alerts-${camelToKebab(id)}`]),
) as Record<DesktopNotificationsRectRegionId, string>;

export const BOOKING_SUITE_RECT_TO_PERSPECTIVE_PANEL = Object.fromEntries(
  BOOKING_RECT_IDS.map((id) => [id, `booking-suite-${camelToKebab(id)}`]),
) as Record<TransformationSuiteRectRegionId, string>;

export const BOOKING_SUITE_CIRCLE_TO_PERSPECTIVE_PANEL = Object.fromEntries(
  BOOKING_CIRCLE_IDS.map((id) => [id, `booking-suite-${camelToKebab(id)}`]),
) as Record<TransformationSuiteCircleRegionId, string>;

export const ACCOUNT_PANEL_TO_PERSPECTIVE_PANEL = Object.fromEntries(
  ACCOUNT_PANEL_IDS.map((id) => [id, `account-${camelToKebab(id)}`]),
) as Record<PenthouseSuitePanelId, string>;

export const RECEPTION_PANEL_TO_PERSPECTIVE_PANEL = Object.fromEntries(
  RECEPTION_PANEL_IDS.map((id) => [id, `reception-${camelToKebab(id)}`]),
) as Record<ReceptionDashboardPanelId, string>;

export const SHOPPING_BAG_LEGACY_PANEL_IDS = {
  curatorTablet: 'curator-tablet',
  collectionHeader: 'shopping-bag-collection-header',
  cartGallery: 'shopping-bag-cart-gallery',
  acquisitionSummary: 'shopping-bag-acquisition-summary',
  emptyCollectionCta: 'shopping-bag-empty-cta',
  checkoutTablet: 'checkout-tablet',
  acquisitionCollectionList: 'acquisition-collection-list',
  acquisitionSummaryPanel: 'acquisition-summary-panel',
} as const;

export const CORE_PERSPECTIVE_PANEL_IDS = {
  receptionLeft: 'reception-left',
  receptionCenter: 'reception-center',
  receptionRight: 'reception-right',
  signinTablet: 'signin-tablet',
  tvLoungeScreen: 'tv-lounge-screen',
  psaHologramScreen: 'psa-hologram-screen',
  extensionsBoutiqueWall: 'extensions-boutique-wall',
  ...SHOPPING_BAG_LEGACY_PANEL_IDS,
} as const;

export type PerspectivePanelId =
  | (typeof CORE_PERSPECTIVE_PANEL_IDS)[keyof typeof CORE_PERSPECTIVE_PANEL_IDS]
  | (typeof GRAND_LOBBY_REGION_TO_PERSPECTIVE_PANEL)[keyof typeof GRAND_LOBBY_REGION_TO_PERSPECTIVE_PANEL]
  | (typeof ALERTS_REGION_TO_PERSPECTIVE_PANEL)[keyof typeof ALERTS_REGION_TO_PERSPECTIVE_PANEL]
  | (typeof BOOKING_SUITE_RECT_TO_PERSPECTIVE_PANEL)[keyof typeof BOOKING_SUITE_RECT_TO_PERSPECTIVE_PANEL]
  | (typeof BOOKING_SUITE_CIRCLE_TO_PERSPECTIVE_PANEL)[keyof typeof BOOKING_SUITE_CIRCLE_TO_PERSPECTIVE_PANEL]
  | (typeof ACCOUNT_PANEL_TO_PERSPECTIVE_PANEL)[keyof typeof ACCOUNT_PANEL_TO_PERSPECTIVE_PANEL]
  | (typeof RECEPTION_PANEL_TO_PERSPECTIVE_PANEL)[keyof typeof RECEPTION_PANEL_TO_PERSPECTIVE_PANEL];

export type PerspectivePanelPage =
  | 'reception'
  | 'shopping-bag'
  | 'acquisition'
  | 'sign-in'
  | 'lounge'
  | 'psa-suite'
  | 'penthouse-boutique'
  | 'grand-lobby'
  | 'alerts'
  | 'booking-suite'
  | 'account';
