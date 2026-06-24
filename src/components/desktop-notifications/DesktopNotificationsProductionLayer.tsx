import type { RefObject } from 'react';
import { useNavigate } from 'react-router-dom';
import { DESKTOP_PENTHOUSE_PATH } from '../../constants/desktopFloors';
import { buildDesktopDestinationHref } from '../../constants/desktopNavQuickRoutes';
import { DesktopNotificationsAlertSlot } from './DesktopNotificationsAlertSlot';
import { DesktopNotificationsFeaturedPanel } from './DesktopNotificationsFeaturedPanel';
import { DesktopNotificationsLinkCta } from './DesktopNotificationsLinkCta';
import { DesktopNotificationsPanelAnchor } from './DesktopNotificationsPanelAnchor';
import { DesktopNotificationsRecentSlot } from './DesktopNotificationsRecentSlot';

type Props = {
  measureRef: RefObject<HTMLElement | null>;
};

const RECENT_NOTIFICATIONS = [
  {
    regionId: 'recentNotification1' as const,
    title: 'Reward Unlocked',
    body: 'You earned 250 Frontal Coins',
    meta: '2 min ago',
    icon: 'reward' as const,
  },
  {
    regionId: 'recentNotification2' as const,
    title: 'Order Shipped',
    body: 'Order #FS-7824 is on the way',
    meta: '15 min ago',
    icon: 'order' as const,
  },
  {
    regionId: 'recentNotification3' as const,
    title: 'New Lounge Episode',
    body: 'Episode 24 is now live',
    meta: '1 hour ago',
    icon: 'lounge' as const,
  },
  {
    regionId: 'recentNotification4' as const,
    title: 'Appointment Reminder',
    body: 'Transformation Suite May 25, 2025 · 2:00 PM',
    meta: '2 hours ago',
    icon: 'appointment' as const,
  },
  {
    regionId: 'recentNotification5' as const,
    title: 'Analysis In Progress',
    body: 'Your Hair Analysis is almost ready',
    meta: '4 hours ago',
    icon: 'analysis' as const,
  },
];

const PRIORITY_ALERTS = [
  {
    regionId: 'priorityAlert1' as const,
    title: 'Action Required',
    body: 'Confirm your appointment by May 25, 2025',
    priority: 'High' as const,
    icon: 'action' as const,
  },
  {
    regionId: 'priorityAlert2' as const,
    title: 'Low Stock Alert',
    body: '24" Noir Straight is low',
    subline: 'Only 2 left in stock',
    priority: 'High' as const,
    icon: 'stock' as const,
  },
  {
    regionId: 'priorityAlert3' as const,
    title: 'Special Reward',
    body: "You're close to unlocking a rare reward",
    priority: 'Medium' as const,
    icon: 'reward' as const,
  },
  {
    regionId: 'priorityAlert4' as const,
    title: 'New Slay Cam Upload',
    body: 'Your video is ready to view',
    priority: 'Medium' as const,
    icon: 'video' as const,
  },
  {
    regionId: 'priorityAlert5' as const,
    title: 'Maintenance Reminder',
    body: 'Schedule your unit maintenance',
    priority: 'Low' as const,
    icon: 'maintenance' as const,
  },
];

export function DesktopNotificationsProductionLayer({ measureRef }: Props) {
  const navigate = useNavigate();

  return (
    <>
      {RECENT_NOTIFICATIONS.map((item) => (
        <DesktopNotificationsPanelAnchor key={item.regionId} measureRef={measureRef} regionId={item.regionId}>
          <DesktopNotificationsRecentSlot
            title={item.title}
            body={item.body}
            meta={item.meta}
            icon={item.icon}
          />
        </DesktopNotificationsPanelAnchor>
      ))}

      <DesktopNotificationsPanelAnchor measureRef={measureRef} regionId="recentActivityButton">
        <DesktopNotificationsLinkCta
          label="View All Activity"
          onClick={() => navigate('/account/notifications')}
        />
      </DesktopNotificationsPanelAnchor>

      <DesktopNotificationsPanelAnchor measureRef={measureRef} regionId="featuredNotificationPanel" zIndex={9}>
        <DesktopNotificationsFeaturedPanel
          onViewAnalysis={() => navigate(buildDesktopDestinationHref(DESKTOP_PENTHOUSE_PATH, 'analysis-lab'))}
        />
      </DesktopNotificationsPanelAnchor>

      {PRIORITY_ALERTS.map((item) => (
        <DesktopNotificationsPanelAnchor key={item.regionId} measureRef={measureRef} regionId={item.regionId}>
          <DesktopNotificationsAlertSlot
            title={item.title}
            body={item.body}
            subline={item.subline}
            priority={item.priority}
            icon={item.icon}
          />
        </DesktopNotificationsPanelAnchor>
      ))}

      <DesktopNotificationsPanelAnchor measureRef={measureRef} regionId="priorityAlertsButton">
        <DesktopNotificationsLinkCta
          label="View All Alerts"
          onClick={() => navigate('/account/notifications')}
        />
      </DesktopNotificationsPanelAnchor>
    </>
  );
}
