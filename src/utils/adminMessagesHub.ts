import { getAdminBrandContactInquiries, getAdminPriorityMessages } from './api';
import { loadBrandContactInquiriesLocal } from './brandContactInquiries';
import { loadBrandFaqQuestionsLocal, type BrandFaqQuestionRecord } from './brandFaqQuestions';
import {
  countPendingMockReviews,
  listPendingMockReviewsVisible,
  type PendingMockReview,
} from './adminPendingMockQueues';

export type AdminMessagesTab = 'INBOX' | 'FAQ' | 'CONTACT' | 'REVIEWS';

export type AdminConciergePriorityMessage = {
  id: string;
  userId: string;
  userName: string;
  message: string;
  timestamp: string;
  status: string;
};

export type AdminHubMessageRow = {
  id: string;
  tab: AdminMessagesTab;
  title: string;
  subtitle: string;
  body: string;
  timestampLabel: string;
  sortTime: number;
  unread: boolean;
  isPriority: boolean;
  clientEmail?: string;
  meta?: string;
  /** Product review tab only (for rating sorts). */
  rating?: number;
};

const READ_IDS_KEY = 'adminHubReadMessageIds';

function loadReadIds(): Set<string> {
  try {
    const raw = localStorage.getItem(READ_IDS_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return new Set(Array.isArray(arr) ? arr.map(String) : []);
  } catch {
    return new Set();
  }
}

export function markAdminHubMessageRead(id: string): void {
  const ids = loadReadIds();
  ids.add(id);
  localStorage.setItem(READ_IDS_KEY, JSON.stringify([...ids]));
  window.dispatchEvent(new CustomEvent('adminMessagesHubUpdated'));
}

export function loadConciergePriorityMessages(): AdminConciergePriorityMessage[] {
  try {
    const raw = localStorage.getItem('adminPriorityMessages');
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? (parsed as AdminConciergePriorityMessage[]) : [];
  } catch {
    return [];
  }
}

function formatRelativeTime(isoOrLabel: string): { label: string; sortTime: number } {
  const d = new Date(isoOrLabel);
  if (!Number.isNaN(d.getTime())) {
    const diffMs = Date.now() - d.getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return { label: 'JUST NOW', sortTime: d.getTime() };
    if (mins < 60) return { label: `${mins} MIN AGO`, sortTime: d.getTime() };
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return { label: `${hrs} HOUR${hrs === 1 ? '' : 'S'} AGO`, sortTime: d.getTime() };
    return {
      label: d
        .toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
        .toUpperCase(),
      sortTime: d.getTime(),
    };
  }
  return { label: isoOrLabel.toUpperCase(), sortTime: 0 };
}

function inboxRowsFromPriorityRecords(
  records: Array<{
    id: string;
    client_email: string;
    client_name: string | null;
    message: string;
    created_at: string;
    status: string;
  }>,
  readIds: Set<string>
): AdminHubMessageRow[] {
  return records.map((m) => {
    const id = `inbox-${m.id}`;
    const { label, sortTime } = formatRelativeTime(m.created_at);
    const unread = m.status === 'new' && !readIds.has(id);
    return {
      id,
      tab: 'INBOX' as const,
      title: (m.client_name || 'CLIENT').toUpperCase(),
      subtitle: (m.client_email || '').toUpperCase(),
      body: m.message,
      timestampLabel: label,
      sortTime,
      unread,
      isPriority: true,
      clientEmail: m.client_email,
      meta: 'CONCIERGE PRIORITY',
    };
  });
}

function inboxRows(readIds: Set<string>): AdminHubMessageRow[] {
  return loadConciergePriorityMessages().map((m) => {
    const id = `inbox-${m.id}`;
    const { label, sortTime } = formatRelativeTime(m.timestamp);
    const unread = m.status === 'new' && !readIds.has(id);
    return {
      id,
      tab: 'INBOX' as const,
      title: (m.userName || 'CLIENT').toUpperCase(),
      subtitle: (m.userId || '').toUpperCase(),
      body: m.message,
      timestampLabel: label,
      sortTime,
      unread,
      isPriority: true,
      clientEmail: m.userId,
      meta: 'CONCIERGE PRIORITY',
    };
  });
}

function faqRows(readIds: Set<string>): AdminHubMessageRow[] {
  return loadBrandFaqQuestionsLocal().map((q: BrandFaqQuestionRecord) => {
    const id = `faq-${q.id}`;
    const { label, sortTime } = formatRelativeTime(q.timestamp);
    const unread = q.status === 'new' && !readIds.has(id);
    return {
      id,
      tab: 'FAQ' as const,
      title: q.name.toUpperCase(),
      subtitle: q.email.toUpperCase(),
      body: q.question,
      timestampLabel: label,
      sortTime,
      unread,
      isPriority: false,
      clientEmail: q.email,
      meta: 'BRAND FAQ',
    };
  });
}

function contactRowsFromRecords(
  records: Array<{
    id: string;
    name: string;
    email: string;
    message: string;
    timestamp: string;
    status: string;
    isOrderRelated?: 'yes' | 'no' | boolean;
    orderNumber?: string;
  }>,
  readIds: Set<string>
): AdminHubMessageRow[] {
  return records.map((c) => {
    const id = `contact-${c.id}`;
    const { label, sortTime } = formatRelativeTime(c.timestamp);
    const unread = c.status === 'new' && !readIds.has(id);
    const orderRelated = c.isOrderRelated === 'yes' || c.isOrderRelated === true;
    const orderBit = orderRelated && c.orderNumber ? ` · ${c.orderNumber.toUpperCase()}` : '';
    return {
      id,
      tab: 'CONTACT' as const,
      title: c.name.toUpperCase(),
      subtitle: `${c.email.toUpperCase()}${orderBit}`,
      body: c.message,
      timestampLabel: label,
      sortTime,
      unread,
      isPriority: orderRelated,
      clientEmail: c.email,
      meta: orderRelated ? 'BRAND CONTACT · ORDER' : 'BRAND CONTACT',
    };
  });
}

function reviewRows(readIds: Set<string>): AdminHubMessageRow[] {
  return listPendingMockReviewsVisible().map((r: PendingMockReview) => {
    const id = `review-${r.id}`;
    const { label, sortTime } = formatRelativeTime(r.submittedAtIso || r.date);
    const unread = !readIds.has(id);
    return {
      id,
      tab: 'REVIEWS' as const,
      title: r.client.toUpperCase(),
      subtitle: r.product.toUpperCase(),
      body: r.excerpt,
      timestampLabel: label || r.date,
      sortTime,
      unread,
      isPriority: false,
      clientEmail: r.email,
      meta: `★ ${r.rating}/5 · PENDING APPROVAL`,
      rating: r.rating,
    };
  });
}

export async function loadAdminMessagesHubRows(): Promise<AdminHubMessageRow[]> {
  const readIds = loadReadIds();
  let priorityInbox: AdminHubMessageRow[] = [];
  try {
    const remote = await getAdminPriorityMessages();
    if (remote.storageAvailable) {
      priorityInbox = inboxRowsFromPriorityRecords(remote.messages, readIds);
    } else {
      priorityInbox = inboxRows(readIds);
    }
  } catch {
    priorityInbox = inboxRows(readIds);
  }

  const rows: AdminHubMessageRow[] = [
    ...priorityInbox,
    ...faqRows(readIds),
    ...reviewRows(readIds),
  ];

  try {
    const remote = await getAdminBrandContactInquiries();
    const contactSource = remote.storageAvailable
      ? remote.inquiries
      : [
          ...remote.inquiries,
          ...loadBrandContactInquiriesLocal().filter((l) => !remote.inquiries.some((r) => r.id === l.id)),
        ];
    rows.push(...contactRowsFromRecords(contactSource, readIds));
  } catch {
    rows.push(...contactRowsFromRecords(loadBrandContactInquiriesLocal(), readIds));
  }

  return rows.sort((a, b) => b.sortTime - a.sortTime);
}

export function computeAdminMessagesPanelCounts(rows: AdminHubMessageRow[]) {
  const unreadPriority = rows.filter((r) => r.unread && r.isPriority).length;
  const totalUnread = rows.filter((r) => r.unread).length;
  return { unreadPriority, totalUnread };
}

export function filterAdminMessagesByTab(rows: AdminHubMessageRow[], tab: AdminMessagesTab): AdminHubMessageRow[] {
  return rows.filter((r) => r.tab === tab);
}

export function countPendingProductReviewsForMessagesHub(): number {
  return countPendingMockReviews();
}
