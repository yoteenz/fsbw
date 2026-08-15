import { Link } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { useDemoStore } from '../../demo/useDemoStore';
import {
  getOrganizationId,
  getPortalNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '../../demo/vaultActions';
import type { NotificationCategory } from '../../notifications/notificationTypes';
import { aioPaths } from '../../utils/paths';

const CATEGORY_FILTERS: { id: '' | NotificationCategory; label: string }[] = [
  { id: '', label: 'All' },
  { id: 'road_ready', label: 'Road Ready' },
  { id: 'documents', label: 'Documents' },
  { id: 'renewals', label: 'Renewals' },
  { id: 'messages', label: 'Messages' },
  { id: 'operations', label: 'Operations' },
];

export function NotificationsPage() {
  const store = useDemoStore();
  const orgId = getOrganizationId(store);
  const [filter, setFilter] = useState<'' | NotificationCategory>('');
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  const notifications = useMemo(() => {
    let list = getPortalNotifications(orgId, store);
    if (filter) list = list.filter((n) => n.category === filter);
    if (showUnreadOnly) list = list.filter((n) => !n.read);
    return list;
  }, [orgId, filter, showUnreadOnly, store.notifications]);

  const unreadCount = getPortalNotifications(orgId, store).filter((n) => !n.read).length;

  return (
    <div className="aio-notifications">
      <header className="aio-notifications__header">
        <h1>Notifications</h1>
        <p>In-app reminders for documents, renewals, deadlines, and service updates.</p>
        {unreadCount > 0 && (
          <button type="button" className="aio-btn aio-btn--outline aio-btn--sm" onClick={() => markAllNotificationsRead(orgId)}>
            Mark all read ({unreadCount})
          </button>
        )}
      </header>

      <div className="aio-notifications-toolbar">
        <div className="aio-calendar-view-tabs">
          {CATEGORY_FILTERS.map((c) => (
            <button
              key={c.id || 'all'}
              type="button"
              className={filter === c.id ? 'aio-calendar-view-tabs__active' : ''}
              onClick={() => setFilter(c.id)}
            >
              {c.label}
            </button>
          ))}
        </div>
        <label className="aio-notifications-unread-toggle">
          <input type="checkbox" checked={showUnreadOnly} onChange={(e) => setShowUnreadOnly(e.target.checked)} />
          Unread only
        </label>
        <Link to={aioPaths.portalNotificationSettings} className="aio-rr-link">Preferences →</Link>
      </div>

      {notifications.length === 0 ? (
        <div className="aio-empty-state">
          <p className="aio-empty-state__text">{showUnreadOnly ? 'No unread notifications.' : 'No notifications yet.'}</p>
        </div>
      ) : (
        <ul className="aio-notifications-list">
          {notifications.map((n) => (
            <li key={n.id} className={`aio-notification-item ${n.read ? '' : 'aio-notification-item--unread'}`}>
              <div>
                <strong>{n.title}</strong>
                <p>{n.body}</p>
                <time dateTime={n.createdAt}>{new Date(n.createdAt).toLocaleString()}</time>
              </div>
              <div className="aio-notification-item__actions">
                {n.link && (
                  <Link
                    to={n.link}
                    className="aio-btn aio-btn--gold aio-btn--sm"
                    onClick={() => !n.read && markNotificationRead(n.id)}
                  >
                    Open
                  </Link>
                )}
                {!n.read && (
                  <button type="button" className="aio-btn aio-btn--outline aio-btn--sm" onClick={() => markNotificationRead(n.id)}>
                    Mark read
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
