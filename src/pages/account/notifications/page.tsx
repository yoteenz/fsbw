import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import DynamicCartIcon from '../../../components/DynamicCartIcon';
import ConfirmationModal from '../../../components/ConfirmationModal';
import BrandMenuLinks from '../../../components/BrandMenuLinks';
import SocialMenuIcons from '../../../components/SocialMenuIcons';
import { isAyoteenzAdminAccount, clearAppAuth } from '../../../utils/adminAuth';
import {
  buildConsultViewOfferOrdersHref,
  getNotificationsStorageKeyForUserEmail,
  getOrderReceivedAccountAlerts,
  migrateNotificationsLocalStorageKeys
} from '../../../utils/orderAccountAlerts';
import { getSupabase, isSupabaseConfigured } from '../../../utils/supabase';
import { ShopMobileMenuShopTab } from '../../../components/ShopMobileMenuShopTab';
import { ShopMobileMenuToolsTab } from '../../../components/ShopMobileMenuToolsTab';
import { signInHrefWithReturnTo } from '../../../utils/signInReturnTo';
import { usePersistentQueryState } from '../../../hooks/usePersistentQueryState';
import { MENU_TOGGLE_PANEL_HEIGHT } from '../../../layouts/menuToggleHeights';

interface Notification {
  id: string;
  title: string;
  message: string;
  actionText?: string;
  actionRoute?: string;
  date: string;
  /** Epoch ms when known — newest alerts sort first. */
  sortAt?: number;
  isRead: boolean;
  icon: string; // 'f' or 'fc'
  /** Consult-offer-ready row: black Futura header, gray body, red VIEW OFFER link. */
  variant?: 'consult_offer_ready';
  /** Set on migrated Supabase **admin_*** consult rows so they tie-break above **acc_***. */
  consultOfferReady?: boolean;
}

const ACCOUNT_NOTIFICATION_PREFIX = 'acc_';
const ADMIN_SENT_PREFIX = 'admin_';

/** Parse admin-sent notification text "[HEADER · TOPIC] body" into title (short, like other alerts) and message (one line). */
export function parseAdminSentNotificationText(text: string): { title: string; message: string } {
  const t = (text || '').trim();
  const match = t.match(/^\[([^\]]+)\]\s*(.*)$/s);
  if (match) {
    const title = (match[1] || '').trim().toUpperCase();
    const message = (match[2] || '').trim().toUpperCase();
    return { title, message: message || 'VIEW DETAILS.' };
  }
  return { title: 'ALERT', message: t.toUpperCase() || 'VIEW DETAILS.' };
}

function extractOrderDigitsForConsultAlert(message: string): string {
  const m = String(message || '').match(/\bORDER\s*#?\s*(\d{1,8})\b/i);
  if (m) return m[1];
  const m2 = String(message || '').match(/#\s*(\d{1,8})\b/);
  return m2 ? m2[1] : '';
}

/** Upgrades legacy consult-offer rows (old **localStorage** + older **Supabase** payloads). */
export function migrateConsultYourOrderReadyNotification(n: Notification): Notification {
  const rawTitle = (n.title || '').trim();
  const titleU = rawTitle.toUpperCase();
  const actionU = String(n.actionText || '').trim().toUpperCase();
  const route = String(n.actionRoute || '').trim();
  const isReady =
    titleU === 'YOUR ORDER IS READY!' ||
    (titleU.includes('YOUR ORDER IS READY') && titleU.includes('CONSULT'));
  const isTargetAction = actionU === 'VIEW OFFER' || actionU === 'VIEW QUOTE' || actionU === '';
  if (!isReady || !isTargetAction) return n;

  const digits =
    extractOrderDigitsForConsultAlert(n.message) ||
    extractOrderDigitsForConsultAlert(n.title) ||
    extractOrderDigitsForConsultAlert(route);
  const orderRef = digits ? `ORDER #${digits}` : '';
  let actionRoute = n.actionRoute;
  if (!route.includes('consultOffer=1')) {
    actionRoute = buildConsultViewOfferOrdersHref(orderRef || n.message, undefined);
  }
  const messageU = String(n.message || '').toUpperCase();
  let message = n.message;
  if (digits && (!messageU.includes('IS COMPLETE') || messageU.includes('VIEW YOUR') || messageU.includes('CUSTOMIZED'))) {
    message = `ORDER #${digits} IS COMPLETE.`;
  } else if (digits && !messageU.includes(`ORDER #${digits}`)) {
    message = `ORDER #${digits} IS COMPLETE.`;
  }

  return {
    ...n,
    title: 'YOUR ORDER IS READY!',
    message,
    actionText: 'VIEW OFFER',
    actionRoute,
    variant: 'consult_offer_ready',
    consultOfferReady: n.id.startsWith(ADMIN_SENT_PREFIX) || n.id.startsWith('consult_offer_sent_'),
  };
}

function notificationFromSupabaseAdminItem(
  it: unknown,
  today: string
): Notification {
  const item = it as {
    id?: string;
    text?: string;
    read?: boolean;
    createdAt?: string;
    actionText?: string;
    actionRoute?: string;
  };
  const { title, message } = parseAdminSentNotificationText((item.text || '').trim());
  const created = item.createdAt || '';
  const createdMs = created ? new Date(created).getTime() : NaN;
  const date =
    created && !Number.isNaN(createdMs)
      ? `${new Date(created).getMonth() + 1}-${new Date(created).getDate()}-${new Date(created).getFullYear()}`
      : today;
  const draft: Notification = {
    id: ADMIN_SENT_PREFIX + (item.id || crypto.randomUUID()),
    title,
    message,
    date,
    ...(created && !Number.isNaN(createdMs) ? { sortAt: createdMs } : {}),
    isRead: !!item.read,
    icon: 'f',
    actionText: item.actionText,
    actionRoute: item.actionRoute,
  };
  return migrateConsultYourOrderReadyNotification(draft);
}

/** Vouchers and free gifts are valid for 6 months once credited (keeps inventory moving). Free gifts stay combinable with other checkout offers (see checkout / rewards copy). */
const VOUCHER_VALIDITY_MONTHS = 6;

/** Parse M-D-YYYY to Date; return null if invalid. */
function parseVoucherDate(dateStr: string): Date | null {
  const parts = (dateStr || '').trim().split('-').map(Number);
  if (parts.length !== 3) return null;
  const [month, day, year] = parts;
  const d = new Date(year, month - 1, day);
  return isNaN(d.getTime()) ? null : d;
}

/** Get expiration date (added date + 6 months). */
function getVoucherExpiration(addedDate: Date): Date {
  const exp = new Date(addedDate);
  exp.setMonth(exp.getMonth() + VOUCHER_VALIDITY_MONTHS);
  return exp;
}

/** Get list of { type, expiresAt } for each voucher/free-gift row, using voucherList + voucherHistory (credits only; 6 months from credit date). */
function getVoucherExpirations(user: { voucherList?: string[]; voucherHistory?: Array<{ date: string; transaction: string; amount: number }> }): Array<{ type: string; expiresAt: Date }> {
  const list = Array.isArray(user.voucherList) ? user.voucherList : [];
  const history = Array.isArray(user.voucherHistory) ? user.voucherHistory : [];
  if (list.length === 0) return [];

  const countByType: Record<string, number> = {};
  for (const v of list) {
    const key = (v || '').trim().toUpperCase();
    if (!key) continue;
    countByType[key] = (countByType[key] || 0) + 1;
  }

  const result: Array<{ type: string; expiresAt: Date }> = [];
  for (const type of Object.keys(countByType)) {
    const n = countByType[type];
    const credits = history
      .filter((h) => (h.transaction || '').trim().toUpperCase() === type && h.amount > 0)
      .map((h) => parseVoucherDate(h.date))
      .filter((d): d is Date => d !== null)
      .sort((a, b) => b.getTime() - a.getTime())
      .slice(0, n);
    for (const added of credits) {
      result.push({ type, expiresAt: getVoucherExpiration(added) });
    }
  }
  return result;
}

/** True when the account has not yet made a first purchase; only core onboarding alerts (tier, membership, shipping+payment, update profile) should show. */
export function isNewAccount(user: { hasMadeFirstPurchase?: boolean; [k: string]: any } | null): boolean {
  if (!user) return true;
  return user.hasMadeFirstPurchase !== true;
}

/** Build account-specific notifications. All text UPPERCASE. Header (title) = short summary. Body (message) = one descriptive sentence that summarizes the alert. Exported so account page can compute badge (hasAlertsNotifications) from current list including mock voucher alerts. For new accounts (no first purchase yet) only tier, membership, shipping+payment, and update profile alerts are shown; all others fire only after activity. */
export function getAccountNotifications(user: { email?: string; [k: string]: any } | null): Notification[] {
  if (!user?.email) return [];
  const email = (user.email || '').trim().toLowerCase();
  const today = (() => {
    const d = new Date();
    return `${d.getMonth() + 1}-${d.getDate()}-${d.getFullYear()}`;
  })();
  const notifs: Notification[] = [];
  const newAccount = isNewAccount(user);

  /** Checkout / orders happen after signup — surface above onboarding acc_* when dates tie. */
  const orderReceivedAlertsEarly = getOrderReceivedAccountAlerts(user);
  if (orderReceivedAlertsEarly.length > 0) {
    notifs.push(...orderReceivedAlertsEarly);
  }

  // New accounts: only these four alerts (no spend tier, standard member, add shipping+payment, update profile)
  const storedTier = typeof window !== 'undefined' ? localStorage.getItem(`lastKnownTier_${email}`) : null;
  const tier = (user.currentTierName || user.tier || storedTier || '').toUpperCase() || 'PENDING';
  const tierDisplay = tier === 'PENDING' ? 'NO TIER YET' : tier;
  notifs.push({
    id: `${ACCOUNT_NOTIFICATION_PREFIX}tier`,
    title: tier === 'PENDING' ? 'NO SPEND TIER YET' : `YOU'RE NOW ${tierDisplay} TIER STATUS`,
    message: tier === 'PENDING'
      ? 'EARN 1,000 POINTS TO UNLOCK SILVER TIER.'
      : 'VIEW YOUR TIER BENEFITS ON REWARDS PAGE.',
    actionText: 'VIEW TIER',
    actionRoute: '/account/rewards',
    date: today,
    isRead: false,
    icon: 'f'
  });

  const membership = (user.membershipType || 'STANDARD').toUpperCase();
  const isPremium = membership === 'PREMIUM' || user.subscriptionTier;
  notifs.push({
    id: `${ACCOUNT_NOTIFICATION_PREFIX}membership`,
    title: isPremium ? 'PREMIUM MEMBERSHIP IS ACTIVE' : "YOU'RE STANDARD MEMBER",
    message: isPremium
      ? 'MANAGE YOUR PREMIUM PERKS ON REWARDS PAGE.'
      : 'UPGRADE TO PREMIUM FOR 2X POINTS + PERKS.',
    actionText: 'VIEW MEMBERSHIP',
    actionRoute: '/account/rewards',
    date: today,
    isRead: false,
    icon: 'f'
  });

  const hasAddress = Array.isArray(user.savedAddresses) && user.savedAddresses.length > 0;
  const hasPayment = !!user.defaultPaymentMethod || (Array.isArray(user.savedPaymentMethods) && user.savedPaymentMethods.length > 0);
  notifs.push({
    id: `${ACCOUNT_NOTIFICATION_PREFIX}shipping_payment`,
    title: hasAddress && hasPayment ? 'SHIPPING + PAYMENT SAVED' : hasAddress ? 'SHIPPING SAVED, ADD PAYMENT' : hasPayment ? 'PAYMENT SAVED, ADD SHIPPING' : 'ADD SHIPPING + PAYMENT',
    message: hasAddress && hasPayment
      ? 'UPDATE YOUR SAVED ADDRESS + PAYMENT IN SETTINGS.'
      : hasAddress
        ? 'ADD A PAYMENT METHOD IN SETTINGS.'
        : hasPayment
          ? 'ADD A SHIPPING ADDRESS IN SETTINGS.'
          : 'ADD SHIPPING + PAYMENT IN SETTINGS.',
    actionText: 'MANAGE',
    actionRoute: '/account/shipping',
    date: today,
    isRead: false,
    icon: 'f'
  });

  notifs.push({
    id: `${ACCOUNT_NOTIFICATION_PREFIX}settings`,
    title: 'UPDATE PROFILE + PREFERENCES',
    message: 'KEEP YOUR PROFILE + PREFERENCES UP TO DATE.',
    actionText: 'OPEN SETTINGS',
    actionRoute: '/account/settings',
    date: today,
    isRead: false,
    icon: 'f'
  });

  if (newAccount) {
    return notifs;
  }

  // Below: only for accounts that have had activity (hasMadeFirstPurchase or equivalent)

  const voucherCount = Array.isArray(user.voucherList) ? user.voucherList.length : (user.voucherCount ?? 0);
  notifs.push({
    id: `${ACCOUNT_NOTIFICATION_PREFIX}voucher`,
    title: voucherCount === 0 ? 'NO VOUCHERS AVAILABLE YET' : `${voucherCount} VOUCHER${voucherCount === 1 ? '' : 'S'} AVAILABLE`,
    message: voucherCount === 0
      ? 'REDEEM POINTS FOR VOUCHERS ON REWARDS PAGE.'
      : 'YOU HAVE VOUCHERS READY TO APPLY AT CHECKOUT.',
    actionText: 'VIEW VOUCHERS',
    actionRoute: '/account',
    date: today,
    isRead: false,
    icon: 'f'
  });

  const now = Date.now();
  const oneDayMs = 24 * 60 * 60 * 1000;
  const oneWeekMs = 7 * oneDayMs;
  const oneMonthMs = 30 * oneDayMs;
  const expirations = getVoucherExpirations(user as { voucherList?: string[]; voucherHistory?: Array<{ date: string; transaction: string; amount: number }> });
  for (const { type, expiresAt } of expirations) {
    const expMs = expiresAt.getTime();
    if (expMs <= now) continue;
    const msLeft = expMs - now;
    const typeLabel = type.replace(/^1X\s+/i, '').trim() || type;
    let timeLabel: string;
    if (msLeft <= oneDayMs) {
      timeLabel = '24 HOURS';
    } else if (msLeft <= oneWeekMs) {
      timeLabel = '1 WEEK';
    } else if (msLeft <= oneMonthMs) {
      timeLabel = '1 MONTH';
    } else {
      continue;
    }
    notifs.push({
      id: `${ACCOUNT_NOTIFICATION_PREFIX}voucher_expiring_${typeLabel}_${expMs}`,
      title: 'FREE VOUCHER EXPIRING SOON',
      message: `YOUR ${typeLabel.replace(/\s+/g, ' ')} VOUCHER EXPIRES IN ${timeLabel}.`,
      actionText: 'VIEW VOUCHERS',
      actionRoute: '/account',
      date: today,
      isRead: false,
      icon: 'f'
    });
  }

  if (isAyoteenzAdminAccount(user)) {
    const mockVoucherTypes = ['COLOR', 'HAIRLINE', 'STYLING', 'FLEXIBLE CAP'];
    const mockTimeStates: Array<{ label: string; key: string }> = [
      { label: '24 HOURS', key: '24h' },
      { label: '1 WEEK', key: '1w' },
      { label: '1 MONTH', key: '1m' }
    ];
    for (const voucherType of mockVoucherTypes) {
      for (const { label: timeLabel, key: timeKey } of mockTimeStates) {
        notifs.push({
          id: `${ACCOUNT_NOTIFICATION_PREFIX}voucher_expiring_mock_${voucherType.replace(/\s+/g, '_')}_${timeKey}`,
          title: 'FREE VOUCHER EXPIRING SOON',
          message: `YOUR ${voucherType} VOUCHER EXPIRES IN ${timeLabel}.`,
          actionText: 'VIEW VOUCHERS',
          actionRoute: '/account',
          date: today,
          isRead: false,
          icon: 'f'
        });
      }
    }
  }

  const balance = typeof user.giftCardBalance === 'number' ? user.giftCardBalance : 0;
  notifs.push({
    id: `${ACCOUNT_NOTIFICATION_PREFIX}digital_cash`,
    title: 'DIGITAL CASH BALANCE',
    message: balance <= 0
      ? 'EARN CREDIT VIA TIER DISCOUNTS OR REWARDS.'
      : `$${balance.toFixed(2)} USD APPLIES AT CHECKOUT + NEVER EXPIRES.`,
    actionText: 'VIEW BALANCE',
    actionRoute: '/account',
    date: today,
    isRead: false,
    icon: 'f'
  });

  const points = typeof user.loyaltyPoints === 'number' ? user.loyaltyPoints : 0;
  if (points > 0) {
    notifs.push({
      id: `${ACCOUNT_NOTIFICATION_PREFIX}loyalty_points`,
      title: `YOU HAVE ${points.toLocaleString()} LOYALTY PTS`,
      message: 'EARN + REDEEM POINTS FOR VOUCHERS + CASH.',
      actionText: 'VIEW REWARDS',
      actionRoute: '/account/rewards',
      date: today,
      isRead: false,
      icon: 'f'
    });
  }

  try {
    const ordersRaw = localStorage.getItem(`userOrders_${email}`);
    const orders = ordersRaw ? JSON.parse(ordersRaw) : { activeOrders: [], pastOrders: [] };
    const active = orders.activeOrders || [];
    const past = orders.pastOrders || [];
    const total = active.length + past.length;
    notifs.push({
      id: `${ACCOUNT_NOTIFICATION_PREFIX}order`,
      title: total === 0 ? 'NO ORDERS AVAILABLE YET' : `${active.length} ACTIVE, ${past.length} PAST ORDERS`,
      message: total === 0
        ? 'TRACK + VIEW YOUR ORDERS ON ORDERS PAGE.'
        : 'VIEW ORDER STATUS + TRACK SHIPPING HERE.',
      actionText: 'VIEW ORDERS',
      actionRoute: '/account/orders',
      date: today,
      isRead: false,
      icon: 'f'
    });
  } catch (_) {
    notifs.push({
      id: `${ACCOUNT_NOTIFICATION_PREFIX}order`,
      title: 'ORDER HISTORY IS AVAILABLE',
      message: 'TRACK + VIEW YOUR ORDERS ON ORDERS PAGE.',
      actionText: 'VIEW ORDERS',
      actionRoute: '/account/orders',
      date: today,
      isRead: false,
      icon: 'f'
    });
  }

  notifs.push({
    id: `${ACCOUNT_NOTIFICATION_PREFIX}rewards`,
    title: 'REWARDS PROGRAM OVERVIEW PAGE',
    message: 'EARN + REDEEM POINTS ON REWARDS PAGE.',
    actionText: 'VIEW REWARDS',
    actionRoute: '/account/rewards',
    date: today,
    isRead: false,
    icon: 'f'
  });

  notifs.push({
    id: `${ACCOUNT_NOTIFICATION_PREFIX}sales`,
    title: 'MEMBER SALES + TIER DISCOUNTS',
    message: 'SHOP MEMBER SALES + TIER DISCOUNTS NOW.',
    actionText: 'SHOP',
    actionRoute: '/build-a-wig',
    date: today,
    isRead: false,
    icon: 'f'
  });

  const referralCode = (user.referralCode || '').toUpperCase();
  notifs.push({
    id: `${ACCOUNT_NOTIFICATION_PREFIX}referrals`,
    title: referralCode ? `YOUR REFERRAL CODE ${referralCode}` : 'GET REFERRAL CODE + EARN',
    message: referralCode
      ? 'SHARE YOUR CODE + EARN WHEN FRIENDS JOIN.'
      : 'GET YOUR REFERRAL CODE ON REFERRALS PAGE.',
    actionText: 'VIEW REFERRALS',
    actionRoute: '/account/referrals',
    date: today,
    isRead: false,
    icon: 'f'
  });

  const affiliatePoints = typeof user.affiliatePoints === 'number' ? user.affiliatePoints : 0;
  notifs.push({
    id: `${ACCOUNT_NOTIFICATION_PREFIX}affiliate`,
    title: affiliatePoints > 0 ? `YOU HAVE ${affiliatePoints} AFFILIATE PTS` : 'EARN AFFILIATE POINTS NOW',
    message: affiliatePoints > 0
      ? 'REDEEM ON AFFILIATE PAGE.'
      : 'SUBMIT CONTENT TO EARN AFFILIATE POINTS.',
    actionText: 'VIEW AFFILIATE',
    actionRoute: '/account/affiliate',
    date: today,
    isRead: false,
    icon: 'f'
  });

  return notifs;
}

/**
 * Alert **`date`** → local midnight ms for **primary** sort (**newest calendar day at top**).
 * Accepts **M-D-YYYY**, **MM-DD-YYYY**, **M/D/YYYY**, **MM/DD/YYYY**, or strings **`Date.parse`** handles.
 */
function parseNotificationDisplayDateMs(dateStr: string): number {
  const t = (dateStr || '').trim();
  if (!t) return 0;
  const dash = t.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
  if (dash) {
    const ms = new Date(Number(dash[3]), Number(dash[1]) - 1, Number(dash[2])).getTime();
    return Number.isNaN(ms) ? 0 : ms;
  }
  const slash = t.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (slash) {
    const ms = new Date(Number(slash[3]), Number(slash[1]) - 1, Number(slash[2])).getTime();
    return Number.isNaN(ms) ? 0 : ms;
  }
  const d = Date.parse(t);
  return Number.isNaN(d) ? 0 : d;
}

/** Within the same **`date`** calendar day, use **`sortAt`** when set; else fall back to day start so **`date`** still wins across days. */
function notificationWithinDaySortMs(n: Notification, dayMs: number): number {
  if (typeof n.sortAt === 'number' && !Number.isNaN(n.sortAt)) return n.sortAt;
  return dayMs;
}

/**
 * **Newest alert date first** (parsed **`date`**), then **newest `sortAt`** within the same day.
 * Previously **`sortAt`** was the primary key, so an old consult (**`sortAt`** last week) could sit above a **today** row that only had **`date: today`**.
 * Removed per-type tie-break ranks that reordered same-day rows (e.g. consult above order-received).
 */
export function sortNotificationsNewestFirst(list: Notification[]): Notification[] {
  return [...list].sort((a, b) => {
    const da = parseNotificationDisplayDateMs(a.date);
    const db = parseNotificationDisplayDateMs(b.date);
    if (db !== da) return db - da;
    const wa = notificationWithinDaySortMs(a, da);
    const wb = notificationWithinDaySortMs(b, db);
    if (wb !== wa) return wb - wa;
    return String(b.id).localeCompare(String(a.id));
  });
}

/** Merge stored notifications with account notifications (account ones upserted by id). Account + order-received alerts stay in NEW until user archives — do not use stored isRead for them. Exported for account page badge logic. */
export function mergeAccountNotifications(stored: Notification[], account: Notification[]): Notification[] {
  const byId = new Map<string, Notification>();
  stored.forEach((n) => byId.set(n.id, migrateConsultYourOrderReadyNotification(n)));
  account.forEach((n) => {
    const migrated = migrateConsultYourOrderReadyNotification(n);
    const existing = byId.get(migrated.id);
    const isManaged =
      migrated.id.startsWith(ACCOUNT_NOTIFICATION_PREFIX) || migrated.id.startsWith('order_received_');
    byId.set(migrated.id, { ...migrated, isRead: isManaged ? false : (existing?.isRead ?? migrated.isRead) });
  });
  return sortNotificationsNewestFirst(Array.from(byId.values()));
}

function NotificationsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [cartCount, setCartCount] = useState(() => {
    try {
      return parseInt(localStorage.getItem('cartCount') || '0', 10);
    } catch (e) {
      return 0;
    }
  });
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [mobileMenuActiveTab, setMobileMenuActiveTab] = useState(() => {
    const pathname = window.location.pathname;
    if (pathname.includes('/tools') || pathname === '/tools/gift-card') {
      return 'TOOLS';
    } else if (pathname.includes('/brand') || pathname.includes('/about') || pathname.includes('/contact') || pathname.includes('/faq') || pathname.includes('/reviews') || pathname.includes('/terms')) {
      return 'BRAND';
    }
    return 'SHOP';
  });
  const [mobileMenuExpandedItems, setMobileMenuExpandedItems] = useState<string[]>([]);
  const [isSignedIn, setIsSignedIn] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        return localStorage.getItem('isSignedIn') === 'true';
      } catch (e) {
        return false;
      }
    }
    return false;
  });
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);
  const [notificationToArchive, setNotificationToArchive] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [notificationToDelete, setNotificationToDelete] = useState<string | null>(null);
  const [activeTab, setActiveTab] = usePersistentQueryState<'NEW' | 'SEEN'>({
    queryKey: 'tab',
    storageKey: 'accountNotificationsTab',
    defaultValue: 'NEW',
    allowedValues: ['NEW', 'SEEN'] as const,
  });
  const [profileImage, setProfileImage] = useState(() => {
    // Load from localStorage on mount
    if (typeof window !== 'undefined') {
      try {
        const savedImage = localStorage.getItem('profileImage');
        return savedImage || '/assets/profile-thumb.png';
      } catch (e) {
        return '/assets/profile-thumb.png';
      }
    }
    return '/assets/profile-thumb.png';
  });

  const [notifications, setNotifications] = useState<Notification[]>(() => {
    try {
      const raw = localStorage.getItem('currentUser');
      const user = raw ? JSON.parse(raw) : null;
      migrateNotificationsLocalStorageKeys(user?.email);
      const key = getNotificationsStorageKeyForUserEmail(user?.email);
      const stored = localStorage.getItem(key);
      const list: Notification[] = stored && Array.isArray(JSON.parse(stored)) ? JSON.parse(stored) : [];
      const account = getAccountNotifications(user);
      return mergeAccountNotifications(list, account);
    } catch {
      return [];
    }
  });

  const newNotifications = notifications.filter(n => !n.isRead);
  const seenNotifications = notifications.filter(n => n.isRead);

  const persistNotifications = (list: Notification[]) => {
    try {
      const rawUser = localStorage.getItem('currentUser');
      const user = rawUser ? JSON.parse(rawUser) : null;
      const key = getNotificationsStorageKeyForUserEmail(user?.email);
      localStorage.setItem(key, JSON.stringify(list));
    } catch (_) {}
  };

  // Merge account notifications on visit; fetch admin-sent from Supabase and merge with same theme (title/message).
  // Set viewed flag so the account card badge clears (grace) without moving alerts to SEEN.
  useEffect(() => {
    const today = (() => {
      const d = new Date();
      return `${d.getMonth() + 1}-${d.getDate()}-${d.getFullYear()}`;
    })();

    (async () => {
      try {
        const rawUser = localStorage.getItem('currentUser');
        const user = rawUser ? JSON.parse(rawUser) : null;
        migrateNotificationsLocalStorageKeys(user?.email);
        const key = getNotificationsStorageKeyForUserEmail(user?.email);
        const raw = localStorage.getItem(key);
        const stored: Notification[] = raw && Array.isArray(JSON.parse(raw)) ? JSON.parse(raw) : [];
        const account = getAccountNotifications(user);
        let merged = mergeAccountNotifications(stored, account);

        if (isSupabaseConfigured()) {
          const supabase = getSupabase();
          const { data: sessionData } = await supabase?.auth.getSession() ?? {};
          const userId = sessionData?.session?.user?.id;
          if (userId && supabase) {
            const { data: row } = await supabase
              .from('notifications')
              .select('items')
              .eq('user_id', userId)
              .maybeSingle();
            const items: unknown[] = Array.isArray((row as { items?: unknown[] } | null)?.items) ? (row as { items: unknown[] }).items : [];
            const adminNotifs: Notification[] = items.map((it) => notificationFromSupabaseAdminItem(it, today));
            const byId = new Map(merged.map((n) => [n.id, n]));
            adminNotifs.forEach((n) => {
              byId.set(n.id, { ...n, isRead: byId.get(n.id)?.isRead ?? n.isRead });
            });
            merged = sortNotificationsNewestFirst(Array.from(byId.values()));
          }
        }

        localStorage.setItem(key, JSON.stringify(merged));
        setNotifications(merged);
        const email = (user?.email || '').trim().toLowerCase();
        if (email) localStorage.setItem(`alertsPageViewed_${email}`, 'true');
        window.dispatchEvent(new CustomEvent('accountCardAlertsViewed'));
      } catch (_) {}
    })();
  }, []);

  // Reload notifications when storage or user changes (e.g. after login or data update); re-fetch admin-sent and merge.
  useEffect(() => {
    const today = (() => {
      const d = new Date();
      return `${d.getMonth() + 1}-${d.getDate()}-${d.getFullYear()}`;
    })();

    const sync = async () => {
      try {
        const rawUser = localStorage.getItem('currentUser');
        const user = rawUser ? JSON.parse(rawUser) : null;
        migrateNotificationsLocalStorageKeys(user?.email);
        const key = getNotificationsStorageKeyForUserEmail(user?.email);
        const raw = localStorage.getItem(key);
        const stored: Notification[] = raw && Array.isArray(JSON.parse(raw)) ? JSON.parse(raw) : [];
        const account = getAccountNotifications(user);
        let merged = mergeAccountNotifications(stored, account);

        if (isSupabaseConfigured()) {
          const supabase = getSupabase();
          const { data: sessionData } = await supabase?.auth.getSession() ?? {};
          const userId = sessionData?.session?.user?.id;
          if (userId && supabase) {
            const { data: row } = await supabase
              .from('notifications')
              .select('items')
              .eq('user_id', userId)
              .maybeSingle();
            const items: unknown[] = Array.isArray((row as { items?: unknown[] } | null)?.items) ? (row as { items: unknown[] }).items : [];
            const adminNotifs: Notification[] = items.map((it) => notificationFromSupabaseAdminItem(it, today));
            const byId = new Map(merged.map((n) => [n.id, n]));
            adminNotifs.forEach((n) => {
              byId.set(n.id, { ...n, isRead: byId.get(n.id)?.isRead ?? n.isRead });
            });
            merged = sortNotificationsNewestFirst(Array.from(byId.values()));
          }
        }

        setNotifications(merged);
      } catch (_) {}
    };

    sync();
    window.addEventListener('storage', sync);
    window.addEventListener('signInStateChanged', sync);
    window.addEventListener('focus', sync);
    return () => {
      window.removeEventListener('storage', sync);
      window.removeEventListener('signInStateChanged', sync);
      window.removeEventListener('focus', sync);
    };
  }, []);

  // Listen for cart count changes and profile image updates
  useEffect(() => {
    const handleCartCountUpdate = (event: CustomEvent) => {
      setCartCount(event.detail);
    };

    const handleStorageChange = () => {
      try {
        const newCartCount = parseInt(localStorage.getItem('cartCount') || '0', 10);
        setCartCount(newCartCount);
        
        // Update profile image if it changed
        const savedImage = localStorage.getItem('profileImage');
        if (savedImage && savedImage !== profileImage) {
          setProfileImage(savedImage);
        } else if (!savedImage && profileImage !== '/assets/profile-thumb.png') {
          setProfileImage('/assets/profile-thumb.png');
        }
      } catch (e) {
        setCartCount(0);
      }
    };

    window.addEventListener('cartCountUpdated', handleCartCountUpdate as EventListener);
    window.addEventListener('cartUpdated', handleStorageChange);
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('focus', handleStorageChange);

    return () => {
      window.removeEventListener('cartCountUpdated', handleCartCountUpdate as EventListener);
      window.removeEventListener('cartUpdated', handleStorageChange);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleStorageChange);
    };
  }, [profileImage]);

  const handleMobileMenuToggle = () => {
    setShowMobileMenu(!showMobileMenu);
  };

  const handleMobileMenuTabClick = (tab: string) => {
    setMobileMenuActiveTab(tab);
  };

  const handleMobileMenuItemToggle = (item: string) => {
    setMobileMenuExpandedItems(prev => 
      prev.includes(item) 
        ? prev.filter(i => i !== item)
        : [...prev, item]
    );
  };

  const handleMobileMenuSignInToggle = () => {
    if (isSignedIn) {
      setShowSignOutConfirm(true);
    } else {
      navigate(signInHrefWithReturnTo(location));
    }
  };

  const handleSignOut = () => {
    setIsSignedIn(false);
    clearAppAuth();
    window.dispatchEvent(new CustomEvent('signInStateChanged', { detail: 'false' }));
    setShowSignOutConfirm(false);
    setShowMobileMenu(false);
  };

  const handleBack = () => {
    navigate('/account');
  };

  const handleNotificationClick = (notification: Notification) => {
    if (notification.actionRoute) {
      navigate(notification.actionRoute);
    }
    // Do not mark as read here — only the eye (archive) icon moves to SEEN
  };

  const displayedNotifications = activeTab === 'NEW' ? newNotifications : seenNotifications;

  return (
    <>
      <div className="min-h-screen" style={{
        position: 'relative',
        backgroundImage: `url('/assets/marble-half.png')`,
        backgroundSize: 'contain',
        backgroundPosition: 'center',
        backgroundRepeat: 'repeat',
        backgroundAttachment: 'fixed'
      }}>
        {/* Scrollable Content */}
        <div className="relative z-10">
          {/* MAIN CONTENT */}
          <div className="flex flex-col py-5 px-4">
            {/* HEADER */}
            <div
              className="border-solid border-black flex justify-center items-center py-3 w-full mb-5 px-5 bg-white/60 backdrop-blur-sm relative"
              style={{ border: '1.3px solid black' }}
            >
              <div className="flex gap-5 absolute left-4">
                {showMobileMenu ? (
                  <>
                    <button 
                      onClick={() => navigate(isSignedIn ? '/account' : signInHrefWithReturnTo(location))}
                      className="cursor-pointer" 
                      style={{ height: '15px !important', width: '21px !important', padding: '0 !important', border: 'none !important', background: 'none !important', transform: 'translateX(4px)' }}
                    >
                      <img
                        alt="Account icon"
                        width="16"
                        height="16"
                        src="/assets/NOIR/account-icon.svg"
                      />
                    </button>
                    <button 
                      onClick={() => navigate(isSignedIn ? '/wishlist' : signInHrefWithReturnTo(location))} 
                      className="cursor-pointer"
                      style={{ height: '21px !important', width: '21px !important', padding: '0 !important', border: 'none !important', background: 'none !important', transform: 'translateX(2px)' }}
                    >
                      <img
                        alt="Wishlist"
                        width="18"
                        height="18"
                        src="/assets/wishlist-heart.svg"
                      />
                    </button>
                  </>
                ) : (
                  <>
                    <button 
                      onClick={handleBack} 
                      className="cursor-pointer"
                      style={{ height: '15px !important', width: '21px !important', padding: '0 !important', border: 'none !important', background: 'none !important' }}
                    >
                      <img
                        alt="Back"
                        width="21"
                        height="15"
                        src="/assets/back-button.svg"
                      />
                    </button>
                  </>
                )}
              </div>
              <p className="text-sm" style={{ fontFamily: '"Futura PT Book"', transform: 'translateY(1px)' }}>
                {showMobileMenu ? (
                  <>
                    <span 
                      style={{ fontFamily: '"Futura PT Book"', fontWeight: '400', cursor: 'pointer' }}
                      onClick={() => navigate('/lobby')}
                    >
                      HOME &gt;
                    </span>{' '}
                    <span
                      style={{ color: '#EB1C24', fontFamily: '"Futura PT Medium"', fontWeight: '500' }}
                    >
                      MENU
                    </span>
                  </>
                ) : (
                  <>
                    <span 
                      style={{ fontFamily: '"Futura PT Book"', fontWeight: '400', cursor: 'pointer' }}
                      onClick={() => navigate('/account')}
                    >
                      ACCOUNT &gt;
                    </span>{' '}
                    <span
                      style={{ color: '#EB1C24', fontFamily: '"Futura PT Medium"', fontWeight: '500' }}
                    >
                      ALERTS
                    </span>
                  </>
                )}
              </p>
              <div className="gap-5 flex absolute" style={{ right: '17px' }}>
                <div style={{ transform: `translateX(${cartCount === 0 ? 7 : 5}px)` }}>
                  <DynamicCartIcon count={cartCount} width={22} height={19} variant="nav" />
                </div>
                <div style={{ width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg
                    width="17"
                    height="18"
                    viewBox="0 0 16 14"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="cursor-pointer"
                    onClick={handleMobileMenuToggle}
                    style={{ marginTop: '2px' }}
                  >
                    <path d="M0 0H15.75V0.7H7.875H0V0ZM5.25 6.7H10.5H15.375V7.4H10.5H5.25V6.7ZM0 13.1H15.75V13.8H0V13.1Z" fill="black"/>
                  </svg>
                </div>
              </div>
            </div>

            {/* MAIN CONTENT AREA */}
            {showMobileMenu ? (
              /* MOBILE MENU CONTENT */
              <div
                className="border border-black flex flex-col pt-6 pb-4 px-5 bg-white/60 backdrop-blur-sm w-full"
                style={{ 
                  borderWidth: '1.3px', 
                  minWidth: '100%', 
                  maxWidth: 'none', 
                  overflow: 'visible',
                  backgroundColor: 'rgba(255, 255, 255, 0.6)',
                  minHeight: MENU_TOGGLE_PANEL_HEIGHT,
                  height: MENU_TOGGLE_PANEL_HEIGHT
                }}
              >
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', paddingTop: '20px', flex: 1, minHeight: 0, position: 'relative' }}>
                {/* Navigation Links */}
                <div className="flex justify-center gap-8" style={{ marginBottom: '30px' }}>
                  <button
                    onClick={() => handleMobileMenuTabClick('SHOP')}
                    style={{ 
                      fontFamily: mobileMenuActiveTab === 'SHOP' ? '"Futura PT Medium"' : '"Futura PT Book"',
                      fontSize: '14px',
                      color: mobileMenuActiveTab === 'SHOP' ? '#EB1C24' : 'black',
                      fontWeight: '500',
                      textTransform: 'uppercase',
                      borderBottom: mobileMenuActiveTab === 'SHOP' ? '1px solid #EB1C24' : 'none',
                      borderTop: 'none',
                      borderLeft: 'none',
                      borderRight: 'none',
                      paddingBottom: '4px',
                      background: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    SHOP
                  </button>
                  <button
                    onClick={() => handleMobileMenuTabClick('TOOLS')}
                    style={{ 
                      fontFamily: mobileMenuActiveTab === 'TOOLS' ? '"Futura PT Medium"' : '"Futura PT Book"',
                      fontSize: '14px',
                      color: mobileMenuActiveTab === 'TOOLS' ? '#EB1C24' : 'black',
                      fontWeight: '500',
                      textTransform: 'uppercase',
                      borderBottom: mobileMenuActiveTab === 'TOOLS' ? '1px solid #EB1C24' : 'none',
                      borderTop: 'none',
                      borderLeft: 'none',
                      borderRight: 'none',
                      paddingBottom: '4px',
                      background: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    TOOLS
                  </button>
                  <button
                    onClick={() => handleMobileMenuTabClick('BRAND')}
                    style={{ 
                      fontFamily: mobileMenuActiveTab === 'BRAND' ? '"Futura PT Medium"' : '"Futura PT Book"',
                      fontSize: '14px',
                      color: mobileMenuActiveTab === 'BRAND' ? '#EB1C24' : 'black',
                      fontWeight: '500',
                      textTransform: 'uppercase',
                      borderBottom: mobileMenuActiveTab === 'BRAND' ? '1px solid #EB1C24' : 'none',
                      borderTop: 'none',
                      borderLeft: 'none',
                      borderRight: 'none',
                      paddingBottom: '4px',
                      background: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    BRAND
                  </button>
                </div>

                {/* Menu Items */}
                <div style={{ flex: '1', overflowY: 'auto', marginBottom: '20px', minHeight: '0' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '11px' }}>
                    {mobileMenuActiveTab === 'TOOLS' ? (
                      <ShopMobileMenuToolsTab
                        navigate={navigate}
                        closeMenu={() => setShowMobileMenu(false)}
                        labelTranslateX="13px"
                      />
                    ) : mobileMenuActiveTab === 'BRAND' ? (
                      <BrandMenuLinks onClose={() => setShowMobileMenu(false)} />
                    ) : (
                                            <ShopMobileMenuShopTab
                                              navigate={navigate}
                                              mobileMenuExpandedItems={mobileMenuExpandedItems}
                                              handleMobileMenuItemToggle={handleMobileMenuItemToggle}
                                              closeSubItemMenu={() => setShowMobileMenu(false)}
                                              labelTranslateX="13px"
                                            />
                    )}
                  </div>
                </div>

                {/* Sign In/Out */}
                <div className="flex justify-center" style={{ marginBottom: '20px', marginTop: 'auto' }}>
                  <span 
                    onClick={handleMobileMenuSignInToggle}
                    style={{ 
                      fontFamily: '"Futura PT Medium"',
                      fontSize: '14px',
                      color: '#EB1C24',
                      fontWeight: '500',
                      textTransform: 'uppercase',
                      cursor: 'pointer'
                    }}
                  >
                    {isSignedIn ? 'SIGN OUT' : 'SIGN IN'}
                  </span>
                </div>

                {/* Social Media Icons */}
                <div style={{ marginBottom: '20px' }}><SocialMenuIcons /></div>
                </div>
              </div>
            ) : (
              /* NOTIFICATIONS CONTENT */
              <div className="flex flex-col gap-4 mb-5">
                {/* Notifications Card */}
                <div className="bg-white/60 backdrop-blur-sm border border-black p-4 flex flex-col overflow-hidden transition-all duration-300 ease-out" style={{ borderWidth: '1.3px', minHeight: '560px' }}>
                  {/* Header with tabs */}
                  <div className="flex items-center justify-between -mt-1 pb-1 border-b border-gray-200">
                    <button
                      onClick={() => setActiveTab('NEW')}
                      className={`text-red-500 font-bold text-lg tracking-wider truncate transition-colors text-left uppercase ${
                        activeTab === 'NEW' ? 'opacity-100' : 'opacity-50'
                      }`}
                      style={{ 
                        fontFamily: '"Futura PT Medium"', 
                        color: activeTab === 'NEW' ? '#EB1C24' : '#808080', 
                        fontSize: '12px', 
                        fontWeight: '500',
                        border: 'none',
                        background: 'none',
                        cursor: 'pointer',
                        padding: 0,
                        transform: 'translateX(2px)'
                      }}
                    >
                      NEW
                    </button>
                    <button
                      onClick={() => setActiveTab('SEEN')}
                      className={`text-red-500 font-bold text-lg tracking-wider truncate transition-colors text-right uppercase ${
                        activeTab === 'SEEN' ? 'opacity-100' : 'opacity-50'
                      }`}
                      style={{ 
                        fontFamily: '"Futura PT Medium"', 
                        color: activeTab === 'SEEN' ? '#EB1C24' : '#808080', 
                        fontSize: '12px', 
                        fontWeight: '500',
                        border: 'none',
                        background: 'none',
                        cursor: 'pointer',
                        padding: 0,
                        transform: 'translateX(-2px)'
                      }}
                    >
                      SEEN
                    </button>
                  </div>

                  {/* Notifications List */}
                  <div className="flex-1 flex flex-col overflow-y-auto mt-4" style={{ maxHeight: '467px', scrollBehavior: 'smooth', width: '100%' }}>
                    {displayedNotifications.length === 0 ? (
                      <div className="flex flex-col justify-center items-center my-8 flex-shrink-0">
                        <p
                          style={{
                            fontFamily: '"Futura PT Medium"',
                            fontSize: '12px',
                            color: '#808080',
                            margin: 0,
                            textTransform: 'uppercase',
                            fontWeight: '500'
                          }}
                        >
                          NO {activeTab === 'NEW' ? 'NEW' : 'SEEN'} NOTIFICATIONS
                        </p>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
                        {displayedNotifications.map((notification) => {
                          return (
                          <div
                            key={notification.id}
                            className="flex items-start gap-3 cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => handleNotificationClick(notification)}
                          >
                            {/* Notification Icon - Profile Photo */}
                            <div
                              className="flex-shrink-0 rounded-full border border-black overflow-hidden"
                              style={{
                                width: '56px',
                                height: '56px',
                                borderWidth: '1px'
                              }}
                            >
                              <img
                                src={profileImage}
                                alt="Profile"
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'cover',
                                  borderRadius: '50%'
                                }}
                                onError={(e) => {
                                  e.currentTarget.src = '/assets/profile-thumb.png';
                                }}
                              />
                            </div>

                            {/* Notification Content */}
                            <div className="flex-1 min-w-0" style={{ transform: 'translateY(6px)', marginLeft: '4px' }}>
                              {/* Primary: short summary header (e.g. "You have a new voucher available") */}
                              <div className="flex items-center justify-between gap-2" style={{ marginBottom: '4px' }}>
                                <p
                                  style={{
                                    fontFamily:
                                      '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif',
                                    fontSize: '14px',
                                    fontWeight: 'normal',
                                    color: '#000000',
                                    margin: 0,
                                    lineHeight: '1.2',
                                    flex: 1,
                                    textTransform: 'uppercase'
                                  }}
                                >
                                  {notification.title}
                                </p>
                                {!notification.isRead && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      // Show confirmation modal
                                      setNotificationToArchive(notification.id);
                                      setShowArchiveConfirm(true);
                                    }}
                                    style={{
                                      border: 'none',
                                      background: 'none',
                                      cursor: 'pointer',
                                      padding: 0,
                                      margin: 0,
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      flexShrink: 0,
                                      transform: 'translate(-2px, -3px)'
                                    }}
                                  >
                                    <img
                                      src="/assets/seen-notif.svg"
                                      alt="Archive notification"
                                      style={{
                                        width: '16px',
                                        height: '16px'
                                      }}
                                    />
                                  </button>
                                )}
                                {notification.isRead && activeTab === 'SEEN' && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      // Show delete confirmation modal
                                      setNotificationToDelete(notification.id);
                                      setShowDeleteConfirm(true);
                                    }}
                                    style={{
                                      border: 'none',
                                      background: 'none',
                                      cursor: 'pointer',
                                      padding: 0,
                                      margin: 0,
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      flexShrink: 0,
                                      transform: 'translate(-2px, -3px)'
                                    }}
                                  >
                                    <img
                                      src="/assets/close-icon.svg"
                                      alt="Delete notification"
                                      style={{
                                        width: '16px',
                                        height: '16px',
                                        filter: 'brightness(0) saturate(100%) invert(20%) sepia(93%) saturate(7151%) hue-rotate(349deg) brightness(92%) contrast(92%)'
                                      }}
                                    />
                                  </button>
                                )}
                              </div>

                              {/* Secondary: one short line, no wrap; fits viewport; uppercase */}
                              <p
                                style={{
                                  fontFamily: '"Futura PT Demi"',
                                  fontSize: '10px',
                                  color: '#808080',
                                  margin: '0 0 3px 0',
                                  lineHeight: '1.3',
                                  textTransform: 'uppercase',
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis'
                                }}
                              >
                                {notification.message}
                              </p>

                              {/* Action Link */}
                              {notification.actionText && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (notification.actionRoute) {
                                      navigate(notification.actionRoute);
                                    }
                                  }}
                                  style={{
                                    fontFamily: '"Futura PT Medium"',
                                    fontSize: '10px',
                                    color: '#EB1C24',
                                    fontWeight: '500',
                                    textTransform: 'uppercase',
                                    border: 'none',
                                    background: 'none',
                                    cursor: 'pointer',
                                    padding: 0,
                                    margin: 0,
                                    transform: 'translateY(-2px)'
                                  }}
                                >
                                  {notification.actionText}
                                </button>
                              )}
                            </div>
                          </div>
                        );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sign Out Confirmation Modal */}
      <ConfirmationModal
        isOpen={showSignOutConfirm}
        onClose={() => setShowSignOutConfirm(false)}
        onConfirm={handleSignOut}
        title="SIGN OUT"
        message="ARE YOU SURE YOU WANT TO SIGN OUT?"
        confirmText="CONFIRM"
        cancelText="CANCEL"
        dataAttribute="sign-out-confirm"
      />

      {/* Archive Notification Confirmation Modal */}
      <ConfirmationModal
        isOpen={showArchiveConfirm}
        onClose={() => {
          setShowArchiveConfirm(false);
          setNotificationToArchive(null);
        }}
        onConfirm={() => {
          if (notificationToArchive) {
            const next = notifications.map(n =>
              n.id === notificationToArchive ? { ...n, isRead: true } : n
            );
            setNotifications(next);
            persistNotifications(next);
            if (activeTab === 'NEW' && newNotifications.length === 1) {
              setActiveTab('SEEN');
            }
          }
          setShowArchiveConfirm(false);
          setNotificationToArchive(null);
        }}
        title="ARCHIVE ALERT?"
        message="ARE YOU SURE YOU WANT TO ARCHIVE THIS NOTIFICATION?"
        confirmText="CONFIRM"
        cancelText="CANCEL"
        dataAttribute="archive-notification-confirm"
      />

      {/* Delete Notification Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setNotificationToDelete(null);
        }}
        onConfirm={() => {
          if (notificationToDelete) {
            const next = notifications.filter(n => n.id !== notificationToDelete);
            setNotifications(next);
            persistNotifications(next);
          }
          setShowDeleteConfirm(false);
          setNotificationToDelete(null);
        }}
        title="REMOVE ALERT?"
        message="ARE YOU SURE YOU WANT TO DELETE THIS NOTIFICATION?"
        confirmText="CONFIRM"
        cancelText="CANCEL"
        dataAttribute="delete-notification-confirm"
      />
    </>
  );
}

export default NotificationsPage;

