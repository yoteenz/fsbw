/** Admin nav / alerts hub notification feed (shared with AdminHeader dropdown). */
export type AdminHeaderNotification = {
  id: number;
  text: string;
  urgent: boolean;
  unread: boolean;
  timestamp: string;
  category: string;
};

export const ADMIN_HEADER_NOTIFICATIONS: AdminHeaderNotification[] = [
  { id: 1, text: 'LOW INVENTORY - RESTOCK (5) ITEMS', urgent: true, unread: true, timestamp: '2 MIN AGO', category: 'ALERTS' },
  { id: 2, text: 'NEW PURCHASE ORDER - DECEMBER 19TH', urgent: false, unread: true, timestamp: '5 MIN AGO', category: 'ORDERS' },
  { id: 4, text: 'ORDER #17 NEEDS ORDER FORM (24 HOURS)', urgent: true, unread: true, timestamp: '8 MIN AGO', category: 'ALERTS' },
  { id: 50, text: 'ACCOUNT ALERT - VOUCHER (VIEW VOUCHERS)', urgent: false, unread: true, timestamp: 'JUST NOW', category: 'ALERTS' },
  { id: 51, text: 'ACCOUNT ALERT - DIGITAL CASH (VIEW BALANCE)', urgent: false, unread: true, timestamp: 'JUST NOW', category: 'ALERTS' },
  { id: 52, text: 'ACCOUNT ALERT - LOYALTY POINTS (VIEW REWARDS)', urgent: false, unread: true, timestamp: 'JUST NOW', category: 'ALERTS' },
  { id: 53, text: 'ACCOUNT ALERT - TIER STATUS (VIEW TIER)', urgent: false, unread: true, timestamp: 'JUST NOW', category: 'ALERTS' },
  { id: 54, text: 'ACCOUNT ALERT - MEMBERSHIP (VIEW MEMBERSHIP)', urgent: false, unread: true, timestamp: 'JUST NOW', category: 'ALERTS' },
  { id: 55, text: 'ACCOUNT ALERT - ORDERS (VIEW ORDERS)', urgent: false, unread: true, timestamp: 'JUST NOW', category: 'ALERTS' },
  { id: 56, text: 'ACCOUNT ALERT - REWARDS (VIEW REWARDS)', urgent: false, unread: true, timestamp: 'JUST NOW', category: 'ALERTS' },
  { id: 57, text: 'ACCOUNT ALERT - SALES & OFFERS (SHOP)', urgent: false, unread: true, timestamp: 'JUST NOW', category: 'ALERTS' },
  { id: 58, text: 'ACCOUNT ALERT - REFERRALS (VIEW REFERRALS)', urgent: false, unread: true, timestamp: 'JUST NOW', category: 'ALERTS' },
  { id: 59, text: 'ACCOUNT ALERT - SHIPPING & PAYMENT (MANAGE)', urgent: false, unread: true, timestamp: 'JUST NOW', category: 'ALERTS' },
  { id: 60, text: 'ACCOUNT ALERT - SETTINGS (OPEN SETTINGS)', urgent: false, unread: true, timestamp: 'JUST NOW', category: 'ALERTS' },
  { id: 61, text: 'ACCOUNT ALERT - AFFILIATE (VIEW AFFILIATE)', urgent: false, unread: true, timestamp: 'JUST NOW', category: 'ALERTS' },
  { id: 6, text: 'APPOINTMENT CONFLICT - DOUBLE BOOKING DETECTED', urgent: true, unread: false, timestamp: '15 MIN AGO', category: 'BOOKINGS' },
  { id: 7, text: 'CLIENT COMPLAINT - PRIORITY RESPONSE NEEDED', urgent: true, unread: false, timestamp: '22 MIN AGO', category: 'CLIENTS' },
  { id: 8, text: 'SHIPPING DELAY - 12 ORDERS AFFECTED', urgent: false, unread: false, timestamp: '35 MIN AGO', category: 'ORDERS' },
  { id: 9, text: 'REFUND REQUEST - CUSTOMER ID #789', urgent: false, unread: false, timestamp: '1 HOUR AGO', category: 'ORDERS' },
  { id: 10, text: 'EQUIPMENT FAILURE - PRINTER OFFLINE', urgent: false, unread: false, timestamp: '2 HOURS AGO', category: 'OPERATIONAL' },
  { id: 35, text: 'BULK ORDER PROCESSING - ORDER #23', urgent: false, unread: true, timestamp: '3 HOURS AGO', category: 'ORDERS' },
  { id: 36, text: 'ORDER MODIFICATION REQUEST - ORDER #19', urgent: false, unread: true, timestamp: '4 HOURS AGO', category: 'ORDERS' },
  { id: 37, text: 'ORDER SHIPPED - #ORD-2024-089', urgent: false, unread: false, timestamp: '5 HOURS AGO', category: 'ORDERS' },
  { id: 38, text: 'PAYMENT RECEIVED - $1,250', urgent: false, unread: true, timestamp: '6 HOURS AGO', category: 'SALES' },
  { id: 39, text: 'QUOTE APPROVED - ENTERPRISE CLIENT', urgent: false, unread: false, timestamp: '7 HOURS AGO', category: 'SALES' },
  { id: 40, text: 'PAYMENT RECEIVED - $850', urgent: false, unread: false, timestamp: '8 HOURS AGO', category: 'SALES' },
  { id: 41, text: 'APPOINTMENT CONFIRMED - MICHAEL T.', urgent: false, unread: true, timestamp: '9 HOURS AGO', category: 'BOOKINGS' },
  { id: 42, text: 'BOOKING CANCELLATION - JENNIFER S.', urgent: false, unread: false, timestamp: '10 HOURS AGO', category: 'BOOKINGS' },
  { id: 43, text: 'FOLLOW-UP SCHEDULED - LISA W.', urgent: false, unread: false, timestamp: '12 HOURS AGO', category: 'BOOKINGS' },
];

export type AdminNotificationHubTab = 'ALERTS' | 'ORDERS' | 'SYSTEM';

const SYSTEM_CATEGORIES = new Set(['OPERATIONAL', 'SYSTEM', 'BRAND']);

export function adminNotificationHubTabForCategory(category: string): AdminNotificationHubTab {
  const c = (category || '').toUpperCase();
  if (c === 'ORDERS') return 'ORDERS';
  if (SYSTEM_CATEGORIES.has(c)) return 'SYSTEM';
  return 'ALERTS';
}

/** Category pill color on alerts hub (matches dashboard activity groups). */
export function adminNotificationCategoryColor(category: string): string {
  switch ((category || '').toUpperCase()) {
    case 'ALERTS':
      return '#EB1C24';
    case 'SALES':
      return '#22c55e';
    case 'BOOKINGS':
      return '#3b82f6';
    case 'ORDERS':
      return '#a855f7';
    case 'CLIENTS':
      return '#f97316';
    case 'REMINDERS':
      return '#eab308';
    case 'OPERATIONAL':
      return '#64748b';
    case 'SYSTEM':
      return '#6366f1';
    case 'BRAND':
      return '#ec4899';
    default:
      return '#EB1C24';
  }
}

export function adminNotificationUrgencyBorderColor(urgent: boolean, unread: boolean): string {
  if (urgent) return '#EB1C24';
  return unread ? '#FF8C00' : '#808080';
}
