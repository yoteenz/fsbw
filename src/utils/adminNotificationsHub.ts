import { isAdminFounderAccount } from './adminAuth';
import {
  ADMIN_HEADER_NOTIFICATIONS,
  adminNotificationHubTabForCategory,
  type AdminHeaderNotification,
  type AdminNotificationHubTab,
} from './adminHeaderNotificationsData';
import { parseAdminHubTimestampLabel } from './adminHubTimestampSort';

export type AdminHubNotificationRow = AdminHeaderNotification & {
  hubId: string;
  hubTab: AdminNotificationHubTab;
  isUnread: boolean;
  sortTime: number;
};

const READ_IDS_KEY = 'adminHubReadNotificationIds';

function loadReadIds(): Set<string> {
  try {
    const raw = localStorage.getItem(READ_IDS_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return new Set(Array.isArray(arr) ? arr.map(String) : []);
  } catch {
    return new Set();
  }
}

export function markAdminHubNotificationRead(hubId: string): void {
  const ids = loadReadIds();
  ids.add(hubId);
  localStorage.setItem(READ_IDS_KEY, JSON.stringify([...ids]));
  window.dispatchEvent(new CustomEvent('adminNotificationsHubUpdated'));
}

function buildFounderConsultRow(): AdminHeaderNotification | null {
  let email: string | null = null;
  try {
    const raw = localStorage.getItem('currentUser');
    const u = raw ? JSON.parse(raw) : null;
    email = (u?.email || '').trim().toLowerCase() || null;
  } catch {
    /* ignore */
  }
  if (!isAdminFounderAccount({ email: email ?? undefined })) return null;
  return {
    id: 62,
    text: 'ACCOUNT ALERT - CONSULT QUOTE (VIEW QUOTE)',
    urgent: false,
    unread: true,
    timestamp: 'JUST NOW',
    category: 'ALERTS',
  };
}

export function loadAdminNotificationsHubRows(): AdminHubNotificationRow[] {
  const readIds = loadReadIds();
  const base = [...ADMIN_HEADER_NOTIFICATIONS];
  const founderRow = buildFounderConsultRow();
  if (founderRow && !base.some((n) => n.id === founderRow.id)) {
    const afterAffiliate = base.findIndex((n) => n.id === 61);
    if (afterAffiliate >= 0) base.splice(afterAffiliate + 1, 0, founderRow);
    else base.unshift(founderRow);
  }

  return base.map((n) => {
    const hubId = `notif-${n.id}`;
    const isUnread = n.unread && !readIds.has(hubId);
    return {
      ...n,
      hubId,
      hubTab: adminNotificationHubTabForCategory(n.category),
      isUnread,
      sortTime: parseAdminHubTimestampLabel(n.timestamp),
    };
  });
}

export function computeAdminNotificationsPanelCounts(rows: AdminHubNotificationRow[]) {
  const totalUrgent = rows.filter((r) => r.isUnread && r.urgent).length;
  const totalOrders = rows.filter((r) => r.isUnread && r.hubTab === 'ORDERS').length;
  return { totalUrgent, totalOrders };
}

export function filterAdminNotificationsByTab(
  rows: AdminHubNotificationRow[],
  tab: AdminNotificationHubTab
): AdminHubNotificationRow[] {
  return rows.filter((r) => r.hubTab === tab);
}
