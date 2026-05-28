import type { AdminHubMessageRow, AdminMessagesTab } from './adminMessagesHub';

const INBOX_SORT_OPTIONS = ['Most recent', 'Oldest first', 'Unread first', 'Read first', 'A to Z', 'Z to A'] as const;
const FAQ_SORT_OPTIONS = ['Most recent', 'Oldest first', 'Unread first', 'A to Z', 'Z to A'] as const;
const CONTACT_SORT_OPTIONS = [
  'Most recent',
  'Oldest first',
  'Unread first',
  'Order-related first',
  'A to Z',
  'Z to A',
] as const;
const REVIEWS_SORT_OPTIONS = [
  'Most recent',
  'Oldest first',
  'Unread first',
  'Highest rating',
  'Lowest rating',
  'A to Z',
  'Z to A',
] as const;

export type AdminMessagesSortOption =
  | (typeof INBOX_SORT_OPTIONS)[number]
  | (typeof FAQ_SORT_OPTIONS)[number]
  | (typeof CONTACT_SORT_OPTIONS)[number]
  | (typeof REVIEWS_SORT_OPTIONS)[number];

const OPTIONS_BY_TAB: Record<AdminMessagesTab, readonly AdminMessagesSortOption[]> = {
  INBOX: INBOX_SORT_OPTIONS,
  FAQ: FAQ_SORT_OPTIONS,
  CONTACT: CONTACT_SORT_OPTIONS,
  REVIEWS: REVIEWS_SORT_OPTIONS,
};

export function adminMessagesSortOptionsForTab(tab: AdminMessagesTab): readonly AdminMessagesSortOption[] {
  return OPTIONS_BY_TAB[tab];
}

export const ADMIN_MESSAGES_DEFAULT_SORT: AdminMessagesSortOption = 'Most recent';

function compareTimeDesc(a: AdminHubMessageRow, b: AdminHubMessageRow): number {
  return b.sortTime - a.sortTime;
}

function compareTimeAsc(a: AdminHubMessageRow, b: AdminHubMessageRow): number {
  return a.sortTime - b.sortTime;
}

function compareTitleAsc(a: AdminHubMessageRow, b: AdminHubMessageRow): number {
  return a.title.localeCompare(b.title, undefined, { sensitivity: 'base' });
}

export function sortAdminMessagesByOption(
  rows: AdminHubMessageRow[],
  sortOption: AdminMessagesSortOption
): AdminHubMessageRow[] {
  const sorted = [...rows];
  switch (sortOption) {
    case 'Oldest first':
      sorted.sort(compareTimeAsc);
      return sorted;
    case 'Unread first':
      sorted.sort((a, b) => {
        if (a.unread !== b.unread) return a.unread ? -1 : 1;
        return compareTimeDesc(a, b);
      });
      return sorted;
    case 'Read first':
      sorted.sort((a, b) => {
        if (a.unread !== b.unread) return a.unread ? 1 : -1;
        return compareTimeDesc(a, b);
      });
      return sorted;
    case 'Order-related first':
      sorted.sort((a, b) => {
        if (a.isPriority !== b.isPriority) return a.isPriority ? -1 : 1;
        return compareTimeDesc(a, b);
      });
      return sorted;
    case 'Highest rating':
      sorted.sort((a, b) => {
        const ra = a.rating ?? 0;
        const rb = b.rating ?? 0;
        if (rb !== ra) return rb - ra;
        return compareTimeDesc(a, b);
      });
      return sorted;
    case 'Lowest rating':
      sorted.sort((a, b) => {
        const ra = a.rating ?? 0;
        const rb = b.rating ?? 0;
        if (ra !== rb) return ra - rb;
        return compareTimeDesc(a, b);
      });
      return sorted;
    case 'A to Z':
      sorted.sort(compareTitleAsc);
      return sorted;
    case 'Z to A':
      sorted.sort((a, b) => compareTitleAsc(b, a));
      return sorted;
    case 'Most recent':
    default:
      sorted.sort(compareTimeDesc);
      return sorted;
  }
}
