import { DESKTOP_GRAND_LOBBY_LAYOUT_SEED, desktopGrandLobbyRectToImageRect } from './desktopGrandLobbyLayout';
import { DESKTOP_NOTIFICATIONS_LAYOUT_SEED } from './desktopNotificationsLayout';
import { PENTHOUSE_SUITE_PANEL_RECTS, type PenthouseSuitePanelId } from './desktopPenthouseSuite';
import {
  ACCOUNT_PANEL_TO_PERSPECTIVE_PANEL,
  ALERTS_REGION_TO_PERSPECTIVE_PANEL,
  BOOKING_SUITE_CIRCLE_TO_PERSPECTIVE_PANEL,
  BOOKING_SUITE_RECT_TO_PERSPECTIVE_PANEL,
  GRAND_LOBBY_REGION_TO_PERSPECTIVE_PANEL,
  RECEPTION_PANEL_TO_PERSPECTIVE_PANEL,
  type PerspectivePanelId,
} from './perspectivePanelIds';
import {
  RECEPTION_DASHBOARD_PANEL_RECTS,
  type ReceptionDashboardPanelId,
} from './desktopReceptionDashboard';
import { TRANSFORMATION_SUITE_LAYOUT_SEED } from './transformationSuiteLayout';
import type { DesktopGrandLobbyPanelRegionId } from '../types/desktopGrandLobby';
import type { DesktopNotificationsRectRegionId } from '../types/desktopNotifications';
import type { PerspectivePanelDefinition, PerspectivePanelQuad } from '../types/perspectivePanel';
import type { TransformationSuiteCircleRegionId, TransformationSuiteRectRegionId } from '../types/transformationSuite';
import { desktopNotificationsRectToImageRect } from '../utils/desktopNotificationsLayoutMath';
import { transformationSuiteRectToImageRect } from '../utils/transformationSuiteLayoutMath';
import { rectToPerspectivePanelQuad } from '../utils/perspectivePanelQuad';

export {
  ACCOUNT_PANEL_TO_PERSPECTIVE_PANEL,
  ALERTS_REGION_TO_PERSPECTIVE_PANEL,
  BOOKING_SUITE_CIRCLE_TO_PERSPECTIVE_PANEL,
  BOOKING_SUITE_RECT_TO_PERSPECTIVE_PANEL,
  GRAND_LOBBY_REGION_TO_PERSPECTIVE_PANEL,
  RECEPTION_PANEL_TO_PERSPECTIVE_PANEL,
};

export function defaultGrandLobbyRegionPerspectiveQuad(
  regionId: DesktopGrandLobbyPanelRegionId,
): PerspectivePanelQuad {
  return rectToPerspectivePanelQuad(desktopGrandLobbyRectToImageRect(DESKTOP_GRAND_LOBBY_LAYOUT_SEED.rects[regionId]));
}

export function defaultAlertsRegionPerspectiveQuad(
  regionId: DesktopNotificationsRectRegionId,
): PerspectivePanelQuad {
  return rectToPerspectivePanelQuad(
    desktopNotificationsRectToImageRect(DESKTOP_NOTIFICATIONS_LAYOUT_SEED.rects[regionId]),
  );
}

export function defaultBookingSuiteRectPerspectiveQuad(
  regionId: TransformationSuiteRectRegionId,
): PerspectivePanelQuad {
  return rectToPerspectivePanelQuad(
    transformationSuiteRectToImageRect(TRANSFORMATION_SUITE_LAYOUT_SEED.rects[regionId]),
  );
}

export function defaultBookingSuiteCirclePerspectiveQuad(
  regionId: TransformationSuiteCircleRegionId,
): PerspectivePanelQuad {
  const circle = TRANSFORMATION_SUITE_LAYOUT_SEED.circles[regionId];
  const aspect = 1915 / 821;
  const radiusY = circle.radius * aspect;
  return rectToPerspectivePanelQuad({
    left: (circle.centerX - circle.radius) / 100,
    top: (circle.centerY - radiusY) / 100,
    width: (circle.radius * 2) / 100,
    height: (radiusY * 2) / 100,
  });
}

export function defaultAccountPanelPerspectiveQuad(panelId: PenthouseSuitePanelId): PerspectivePanelQuad {
  return rectToPerspectivePanelQuad(PENTHOUSE_SUITE_PANEL_RECTS[panelId]);
}

export function defaultReceptionPanelPerspectiveQuad(
  panelId: ReceptionDashboardPanelId,
): PerspectivePanelQuad {
  return rectToPerspectivePanelQuad(RECEPTION_DASHBOARD_PANEL_RECTS[panelId]);
}

const GRAND_LOBBY_LABELS: Record<DesktopGrandLobbyPanelRegionId, string> = {
  membershipAccess: 'Membership Access',
  mansionEconomy: 'Mansion Economy',
  mansionDirectory: 'Mansion Directory',
  welcomeMansion: 'Welcome Mansion',
  houseInformation: 'House Information',
};

const ALERTS_LABELS: Record<DesktopNotificationsRectRegionId, string> = {
  recentNotification1: 'Recent Notification 1',
  recentNotification2: 'Recent Notification 2',
  recentNotification3: 'Recent Notification 3',
  recentNotification4: 'Recent Notification 4',
  recentNotification5: 'Recent Notification 5',
  recentActivityButton: 'Recent Activity CTA',
  featuredNotificationPanel: 'Featured Notification',
  priorityAlert1: 'Priority Alert 1',
  priorityAlert2: 'Priority Alert 2',
  priorityAlert3: 'Priority Alert 3',
  priorityAlert4: 'Priority Alert 4',
  priorityAlert5: 'Priority Alert 5',
  priorityAlertsButton: 'Priority Alerts CTA',
};

const ACCOUNT_LABELS: Record<PenthouseSuitePanelId, string> = {
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

const RECEPTION_ROW_LABELS: Record<ReceptionDashboardPanelId, string> = {
  loungeContent: 'Lounge Content',
  slayCamUploads: 'Slay Cam Uploads',
  newCollectible: 'New Collectible',
  bawTrends: 'BAW Trends',
  communitySpotlight: 'Community Spotlight',
  featuredExperience: 'Featured Experience',
  hairAnalysisLab: 'Hair Analysis Lab',
  bawAtelier: 'BAW Atelier',
  theLounge: 'Cinema Suite',
  rewardsGallery: 'Rewards Gallery',
  slayCam: 'Slay Cam',
};

export function buildDesktopPagePerspectivePanelDefinitions(): PerspectivePanelDefinition[] {
  const grandLobby = (Object.keys(GRAND_LOBBY_REGION_TO_PERSPECTIVE_PANEL) as DesktopGrandLobbyPanelRegionId[]).map(
    (regionId) => ({
      id: GRAND_LOBBY_REGION_TO_PERSPECTIVE_PANEL[regionId] as PerspectivePanelId,
      label: GRAND_LOBBY_LABELS[regionId],
      page: 'grand-lobby' as const,
      points: defaultGrandLobbyRegionPerspectiveQuad(regionId),
    }),
  );

  const alerts = (Object.keys(ALERTS_REGION_TO_PERSPECTIVE_PANEL) as DesktopNotificationsRectRegionId[]).map(
    (regionId) => ({
      id: ALERTS_REGION_TO_PERSPECTIVE_PANEL[regionId] as PerspectivePanelId,
      label: ALERTS_LABELS[regionId],
      page: 'alerts' as const,
      points: defaultAlertsRegionPerspectiveQuad(regionId),
    }),
  );

  const bookingRects = (
    Object.keys(BOOKING_SUITE_RECT_TO_PERSPECTIVE_PANEL) as TransformationSuiteRectRegionId[]
  ).map((regionId) => ({
    id: BOOKING_SUITE_RECT_TO_PERSPECTIVE_PANEL[regionId] as PerspectivePanelId,
    label: regionId.replace(/DEBUG_/g, '').replace(/_/g, ' '),
    page: 'booking-suite' as const,
    points: defaultBookingSuiteRectPerspectiveQuad(regionId),
  }));

  const bookingCircles = (
    Object.keys(BOOKING_SUITE_CIRCLE_TO_PERSPECTIVE_PANEL) as TransformationSuiteCircleRegionId[]
  ).map((regionId) => ({
    id: BOOKING_SUITE_CIRCLE_TO_PERSPECTIVE_PANEL[regionId] as PerspectivePanelId,
    label: regionId.replace(/DEBUG_/g, '').replace(/_/g, ' '),
    page: 'booking-suite' as const,
    points: defaultBookingSuiteCirclePerspectiveQuad(regionId),
  }));

  const account = (Object.keys(ACCOUNT_PANEL_TO_PERSPECTIVE_PANEL) as PenthouseSuitePanelId[]).map((panelId) => ({
    id: ACCOUNT_PANEL_TO_PERSPECTIVE_PANEL[panelId] as PerspectivePanelId,
    label: ACCOUNT_LABELS[panelId],
    page: 'account' as const,
    points: defaultAccountPanelPerspectiveQuad(panelId),
  }));

  const receptionRows = (
    Object.keys(RECEPTION_PANEL_TO_PERSPECTIVE_PANEL) as ReceptionDashboardPanelId[]
  ).map((panelId) => ({
    id: RECEPTION_PANEL_TO_PERSPECTIVE_PANEL[panelId] as PerspectivePanelId,
    label: RECEPTION_ROW_LABELS[panelId],
    page: 'reception' as const,
    points: defaultReceptionPanelPerspectiveQuad(panelId),
  }));

  return [...grandLobby, ...alerts, ...bookingRects, ...bookingCircles, ...account, ...receptionRows];
}
