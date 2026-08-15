import { Link } from 'react-router-dom';
import { useDemoStore } from '../../demo/useDemoStore';
import { getOrganizationId } from '../../demo/vaultActions';
import { updateDemoStore } from '../../demo/demoStore';
import type { NotificationCategory } from '../../notifications/notificationTypes';
import { DEFAULT_NOTIFICATION_PREFERENCES } from '../../notifications/notificationTypes';
import { aioPaths } from '../../utils/paths';

const CATEGORY_LABELS: Record<NotificationCategory, string> = {
  road_ready: 'Road Ready',
  documents: 'Documents',
  renewals: 'Renewals',
  messages: 'Messages',
  operations: 'Operations',
  dispatch: 'Dispatch',
  factoring: 'Factoring',
  brokerage: 'Brokerage',
};

export function NotificationSettingsPage() {
  const store = useDemoStore();
  const orgId = getOrganizationId(store);
  const prefs = store.notificationPreferences?.length
    ? store.notificationPreferences
    : DEFAULT_NOTIFICATION_PREFERENCES;

  const toggleInApp = (category: NotificationCategory) => {
    updateDemoStore((s) => {
      const list = s.notificationPreferences?.length ? s.notificationPreferences : [...DEFAULT_NOTIFICATION_PREFERENCES];
      const row = list.find((p) => p.category === category);
      if (row) row.inApp = !row.inApp;
      else list.push({ category, inApp: true, emailFuture: false, smsFuture: false });
      s.notificationPreferences = list;
      return s;
    });
  };

  return (
    <div className="aio-notifications aio-notification-settings">
      <Link to={aioPaths.portalNotifications} className="aio-rr-link">← Notifications</Link>
      <header>
        <h1>Notification Preferences</h1>
        <p>Manage in-app categories for {orgId}. Critical operational notices may still appear when required.</p>
      </header>

      <ul className="aio-notification-prefs">
        {prefs.map((p) => (
          <li key={p.category} className="aio-notification-pref-row">
            <div>
              <strong>{CATEGORY_LABELS[p.category]}</strong>
              <p>In-app · Email — coming later · SMS — coming later</p>
            </div>
            <label>
              <input
                type="checkbox"
                checked={p.inApp}
                onChange={() => toggleInApp(p.category)}
                aria-label={`In-app notifications for ${CATEGORY_LABELS[p.category]}`}
              />
              In-app
            </label>
          </li>
        ))}
      </ul>

      <p className="aio-prototype-note">
        Email and SMS delivery require provider configuration and are disabled in this preview.
      </p>
    </div>
  );
}
