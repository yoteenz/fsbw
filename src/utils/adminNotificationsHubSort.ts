import type { AdminHubNotificationRow } from './adminNotificationsHub';
import type { AdminNotificationHubTab } from './adminHeaderNotificationsData';

const ALERTS_SORT_OPTIONS = [
  'Most recent',
  'Oldest first',
  'Unread first',
  'Urgent first',
  'By category',
  'A to Z',
] as const;

const ORDERS_SORT_OPTIONS = ['Most recent', 'Oldest first', 'Unread first', 'Urgent first', 'A to Z', 'Z to A'] as const;

const SYSTEM_SORT_OPTIONS = ['Most recent', 'Oldest first', 'Unread first', 'By category', 'A to Z', 'Z to A'] as const;

export type AdminNotificationsSortOption =
  | (typeof ALERTS_SORT_OPTIONS)[number]
  | (typeof ORDERS_SORT_OPTIONS)[number]
  | (typeof SYSTEM_SORT_OPTIONS)[number];

const OPTIONS_BY_TAB: Record<AdminNotificationHubTab, readonly AdminNotificationsSortOption[]> = {
  ALERTS: ALERTS_SORT_OPTIONS,
  ORDERS: ORDERS_SORT_OPTIONS,
  SYSTEM: SYSTEM_SORT_OPTIONS,
};

export function adminNotificationsSortOptionsForTab(
  tab: AdminNotificationHubTab
): readonly AdminNotificationsSortOption[] {
  return OPTIONS_BY_TAB[tab];
}

export const ADMIN_NOTIFICATIONS_DEFAULT_SORT: AdminNotificationsSortOption = 'Most recent';

function compareTimeDesc(a: AdminHubNotificationRow, b: AdminHubNotificationRow): number {
  return b.sortTime - a.sortTime;
}

function compareTimeAsc(a: AdminHubNotificationRow, b: AdminHubNotificationRow): number {
  return a.sortTime - b.sortTime;
}

function compareTextAsc(a: AdminHubNotificationRow, b: AdminHubNotificationRow): number {
  return a.text.localeCompare(b.text, undefined, { sensitivity: 'base' });
}

export function sortAdminNotificationsByOption(
  rows: AdminHubNotificationRow[],
  sortOption: AdminNotificationsSortOption
): AdminHubNotificationRow[] {
  const sorted = [...rows];
  switch (sortOption) {
    case 'Oldest first':
      sorted.sort(compareTimeAsc);
      return sorted;
    case 'Unread first':
      sorted.sort((a, b) => {
        if (a.isUnread !== b.isUnread) return a.isUnread ? -1 : 1;
        return compareTimeDesc(a, b);
      });
      return sorted;
    case 'Urgent first':
      sorted.sort((a, b) => {
        if (a.urgent !== b.urgent) return a.urgent ? -1 : 1;
        if (a.isUnread !== b.isUnread) return a.isUnread ? -1 : 1;
        return compareTimeDesc(a, b);
      });
      return sorted;
    case 'By category':
      sorted.sort((a, b) => {
        const cat = a.category.localeCompare(b.category, undefined, { sensitivity: 'base' });
        if (cat !== 0) return cat;
        return compareTimeDesc(a, b);
      });
      return sorted;
    case 'A to Z':
      sorted.sort(compareTextAsc);
      return sorted;
    case 'Z to A':
      sorted.sort((a, b) => compareTextAsc(b, a));
      return sorted;
    case 'Most recent':
    default:
      sorted.sort(compareTimeDesc);
      return sorted;
  }
}
