type AlertUser = {
  email?: string;
  membershipType?: string;
  subscriptionTier?: string;
};

export type AlertOrder = {
  id?: string;
  orderNumber?: string;
  bookingFlowType?: string;
  status?: string;
};

export type StoredNotification = {
  id: string;
  title: string;
  message: string;
  actionText?: string;
  actionRoute?: string;
  date: string;
  isRead: boolean;
  icon: string;
};

const STANDARD_NOTIFICATION_ICON = 'f';

function notificationsKey(email: string): string {
  return `notifications_${email.trim().toLowerCase()}`;
}

function todayMdy(): string {
  const d = new Date();
  return `${d.getMonth() + 1}-${d.getDate()}-${d.getFullYear()}`;
}

function isPremiumLike(user: AlertUser | null | undefined): boolean {
  const membership = String(user?.membershipType || '').trim().toUpperCase();
  return membership === 'PREMIUM' || Boolean(user?.subscriptionTier);
}

function alertRouteForOrder(user: AlertUser | null | undefined, order: AlertOrder): string {
  const orderId = String(order.id || '').trim();
  const isAppointmentOrConsult =
    String(order.bookingFlowType || '').trim().toLowerCase() === 'appointment' ||
    String(order.bookingFlowType || '').trim().toLowerCase() === 'consult';

  if ((isPremiumLike(user) || isAppointmentOrConsult) && orderId) {
    return `/account/concierge?orderId=${encodeURIComponent(orderId)}`;
  }
  if (orderId) {
    return `/account/orders?orderId=${encodeURIComponent(orderId)}`;
  }
  return '/account/orders';
}

function displayOrderNumber(order: AlertOrder): string {
  const raw = String(order.orderNumber || order.id || '').trim();
  const stripped = raw.replace(/^ORDER\s*#?\s*/i, '').replace(/^#/, '').trim();
  return stripped || '—';
}

export function buildOrderReceivedAccountAlert(
  user: AlertUser | null | undefined,
  order: AlertOrder
): StoredNotification | null {
  const email = String(user?.email || '').trim().toLowerCase();
  const orderId = String(order.id || order.orderNumber || '').trim();
  if (!email || !orderId) return null;

  const orderNum = displayOrderNumber(order);
  return {
    id: `order_received_${orderId}`,
    title: "WE'VE RECEIVED YOUR ORDER!",
    message: `ORDER #${orderNum} IS BEING PROCESSED.`,
    actionText: 'VIEW DETAILS',
    actionRoute: alertRouteForOrder(user, order),
    date: todayMdy(),
    isRead: false,
    icon: STANDARD_NOTIFICATION_ICON,
  };
}

export function appendOrderReceivedAccountAlert(
  user: AlertUser | null | undefined,
  order: AlertOrder
): void {
  const email = String(user?.email || '').trim().toLowerCase();
  if (!email) return;
  const next = buildOrderReceivedAccountAlert(user, order);
  if (!next) return;

  try {
    const key = notificationsKey(email);
    const raw = localStorage.getItem(key);
    const existing: StoredNotification[] = raw && Array.isArray(JSON.parse(raw)) ? JSON.parse(raw) : [];
    const merged = [next, ...existing.filter((n) => n.id !== next.id)];
    localStorage.setItem(key, JSON.stringify(merged));
    window.dispatchEvent(new CustomEvent('accountCardAlertsViewed'));
    window.dispatchEvent(new Event('storage'));
  } catch {
    /* ignore */
  }
}

export function getOrderReceivedAccountAlerts(
  user: AlertUser | null | undefined
): StoredNotification[] {
  const email = String(user?.email || '').trim().toLowerCase();
  if (!email || typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(`userOrders_${email}`);
    const data = raw ? JSON.parse(raw) : { activeOrders: [], pastOrders: [] };
    const activeOrders: AlertOrder[] = Array.isArray(data?.activeOrders) ? data.activeOrders : [];
    return activeOrders
      .filter((order) => {
        const status = String(order?.status || '').trim().toUpperCase();
        return (
          status !== 'DELIVERED' &&
          status !== 'COMPLETE' &&
          status !== 'CANCELED' &&
          status !== 'CANCELLED'
        );
      })
      .map((order) => buildOrderReceivedAccountAlert(user, order))
      .filter((notification): notification is StoredNotification => Boolean(notification));
  } catch {
    return [];
  }
}
