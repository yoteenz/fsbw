/**
 * Priority messages and order issues for Alerts sort and AdminHeader.
 * Alerts sort: Premium clients with unread priority messages OR any client with order-related
 * issues (missing order form, refund request, shipping delay, etc.), ordered by most recent.
 */

const PRIORITY_MESSAGES_KEY = 'adminPriorityMessagesByClient';
const ORDER_ISSUES_KEY = 'adminOrderIssuesByClient';

export type PriorityMessageByClient = {
  clientEmail: string;
  lastUnreadAt: string;
  unreadCount: number;
};

/** Get stored priority message data per client */
export function getPriorityMessagesByClient(): Record<string, { lastUnreadAt: string; unreadCount: number }> {
  try {
    const raw = localStorage.getItem(PRIORITY_MESSAGES_KEY);
    const obj = raw ? JSON.parse(raw) : {};
    return typeof obj === 'object' && obj !== null ? obj : {};
  } catch {
    return {};
  }
}

/** Get stored order-issue data per client (missing form, refund, shipping delay, etc.) */
export function getOrderIssuesByClient(): Record<string, { lastIssueAt: string }> {
  try {
    const raw = localStorage.getItem(ORDER_ISSUES_KEY);
    const obj = raw ? JSON.parse(raw) : {};
    return typeof obj === 'object' && obj !== null ? obj : {};
  } catch {
    return {};
  }
}

/** Check if a client has unread priority messages */
export function getClientUnreadPriorityMessage(client: Record<string, unknown>): { lastUnreadAt: string; unreadCount: number } | null {
  const lastAt = client.lastUnreadPriorityMessageAt as string | undefined;
  const count = (client.alertCount ?? client.unreadPriorityMessageCount ?? 0) as number;
  if (lastAt && count > 0) return { lastUnreadAt: lastAt, unreadCount: count };

  const emailVal = client.email;
  const email = (emailVal == null ? '' : String(emailVal)).trim().toLowerCase();
  if (!email) return null;
  const byClient = getPriorityMessagesByClient();
  const data = byClient[email];
  if (data && data.unreadCount > 0 && data.lastUnreadAt) return data;
  return null;
}

/** Check if a client has order-related issues (missing form, refund, shipping delay, etc.) */
export function getClientOrderIssue(client: Record<string, unknown>): { lastIssueAt: string } | null {
  const lastAt = client.lastOrderIssueAt as string | undefined;
  if (lastAt) return { lastIssueAt: lastAt };

  const emailVal = client.email;
  const email = (emailVal == null ? '' : String(emailVal)).trim().toLowerCase();
  if (!email) return null;
  const byClient = getOrderIssuesByClient();
  const data = byClient[email];
  if (data?.lastIssueAt) return data;
  return null;
}

/** Whether client qualifies for Alerts: Premium + unread priority messages OR has order-related issue OR has new orders (in progress) */
export function clientHasUnreadPriorityMessages(client: Record<string, unknown>): boolean {
  const membership = ((client.membershipType || 'STANDARD') + '').toUpperCase();
  const hasMessages = membership === 'PREMIUM' && getClientUnreadPriorityMessage(client) !== null;
  const hasOrderIssue = getClientOrderIssue(client) !== null;
  const hasNewOrders = getClientNewOrdersCount(client) > 0;
  return hasMessages || hasOrderIssue || hasNewOrders;
}

/** Get count of new orders (in progress, not yet delivered) */
function getClientNewOrdersCount(client: Record<string, unknown>): number {
  const count = (client.newCount ?? 0) as number;
  if (count > 0) return count;
  const emailVal = client.email;
  const email = (emailVal == null ? '' : String(emailVal)).trim().toLowerCase();
  if (!email) return 0;
  try {
    const raw = localStorage.getItem(`userOrders_${email}`);
    const data = raw ? JSON.parse(raw) : null;
    const active = data?.activeOrders || [];
    const past = data?.pastOrders || [];
    const all = [...active, ...past];
    const notDelivered = all.filter(
      (o: Record<string, unknown>) =>
        (String(o.status || '').toUpperCase() !== 'DELIVERED' && !o.deliveredAt) &&
        (String(o.status || '').toUpperCase() !== 'CANCELED' && !o.canceledAt)
    );
    return notDelivered.length;
  } catch {
    return 0;
  }
}

/** Get timestamp of most recent new order (in progress) for sorting */
function getLastNewOrderTime(client: Record<string, unknown>): number {
  const lastAt = client.lastNewOrderAt as string | undefined;
  if (lastAt) {
    try {
      return new Date(lastAt).getTime();
    } catch {
      // ignore
    }
  }
  const emailVal = client.email;
  const email = (emailVal == null ? '' : String(emailVal)).trim().toLowerCase();
  if (!email) return 0;
  try {
    const raw = localStorage.getItem(`userOrders_${email}`);
    const data = raw ? JSON.parse(raw) : null;
    const active = data?.activeOrders || [];
    const past = data?.pastOrders || [];
    const all = [...active, ...past];
    const notDelivered = all.filter(
      (o: Record<string, unknown>) =>
        (String(o.status || '').toUpperCase() !== 'DELIVERED' && !o.deliveredAt) &&
        (String(o.status || '').toUpperCase() !== 'CANCELED' && !o.canceledAt)
    );
    if (notDelivered.length === 0) return 0;
    let maxTime = 0;
    for (const o of notDelivered) {
      const d = (o.placedAt ?? o.date ?? o.createdAt) as string | undefined;
      if (d) {
        try {
          const t = new Date(d).getTime();
          if (!isNaN(t)) maxTime = Math.max(maxTime, t);
        } catch {
          // ignore
        }
      }
    }
    return maxTime;
  } catch {
    return 0;
  }
}

/** Get most recent alert timestamp for sorting (priority message or order issue, whichever is newer) */
export function getLastUnreadPriorityMessageTime(client: Record<string, unknown>): number {
  let maxTime = 0;
  const msg = getClientUnreadPriorityMessage(client);
  if (msg?.lastUnreadAt) {
    try {
      maxTime = Math.max(maxTime, new Date(msg.lastUnreadAt).getTime());
    } catch {
      // ignore
    }
  }
  const issue = getClientOrderIssue(client);
  if (issue?.lastIssueAt) {
    try {
      maxTime = Math.max(maxTime, new Date(issue.lastIssueAt).getTime());
    } catch {
      // ignore
    }
  }
  return maxTime;
}
