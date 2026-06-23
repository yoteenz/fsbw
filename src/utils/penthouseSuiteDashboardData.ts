import {
  getEffectiveSubscriptionTier,
  getEffectiveTierName,
  isMockProfileChromeActive,
} from './adminAuth';
import { getPerUserKey, PER_USER_KEYS } from './perUserStorage';
import { getSlayTicketBalanceFromUser } from './slayTicketHistoryDisplay';
import { normalizeUserOrdersBuckets } from './userOrdersBuckets';

export type PenthouseSuiteActivityItem = {
  label: string;
  when: string;
};

export type PenthouseSuiteDashboardData = {
  hero: {
    tierLabel: string;
    memberSinceYear: number;
    href: string;
  };
  diamondPoints: {
    points: number;
    lifetimeEarned: number;
    nextMilestoneLabel: string;
    progressPct: number;
    href: string;
  };
  slayTickets: {
    available: number;
    href: string;
  };
  vouchers: {
    activeCount: number;
    href: string;
  };
  digitalCash: {
    balance: number;
    href: string;
  };
  myOrders: {
    activeCount: number;
    href: string;
  };
  rewardsCollection: {
    rewardCount: number;
    href: string;
  };
  referrals: {
    successfulCount: number;
    nextBonusRemaining: number;
    progressPct: number;
    href: string;
  };
  wishlist: {
    savedCount: number;
    href: string;
  };
  myActivity: {
    items: PenthouseSuiteActivityItem[];
    href: string;
  };
  affiliate: {
    totalEarnedPoints: number;
    commissionRateLabel: string;
    href: string;
  };
  accountSettings: {
    href: string;
  };
};

type UserRecord = Record<string, unknown> & {
  email?: string;
  loyaltyPoints?: number;
  giftCardBalance?: number;
  voucherList?: string[];
  voucherCount?: number;
  createdAt?: string;
  pointsHistory?: Array<{ date: string; transaction: string; points?: number; amount?: number }>;
  slayChallengeProgress?: Record<string, unknown>;
  earnedEarnTaskIds?: string[];
};

function getCurrentSixMonthPeriod(now = new Date()): { start: Date; end: Date } {
  const year = now.getFullYear();
  const month = now.getMonth();
  if (month < 6) {
    return { start: new Date(year, 0, 1), end: new Date(year, 5, 30, 23, 59, 59) };
  }
  return { start: new Date(year, 6, 1), end: new Date(year, 11, 31, 23, 59, 59) };
}

function parseOrderDate(dateStr: string): Date | null {
  const parts = dateStr.split('-').map(Number);
  if (parts.length !== 3) return null;
  const [month, day, year] = parts;
  if (!month || !day || !year) return null;
  return new Date(year, month - 1, day);
}

function getPeriodSpending(user: UserRecord | null): number {
  if (!user?.email) return 0;
  try {
    const raw = localStorage.getItem(`userOrders_${user.email}`);
    if (!raw) return 0;
    const data = JSON.parse(raw);
    const period = getCurrentSixMonthPeriod();
    const all = [...(data.activeOrders || []), ...(data.pastOrders || [])];
    return all.reduce((sum: number, order: { date?: string; total?: number }) => {
      if (!order.date) return sum;
      const orderDate = parseOrderDate(order.date);
      if (!orderDate || orderDate < period.start || orderDate > period.end) return sum;
      return sum + (order.total || 0);
    }, 0);
  } catch {
    return 0;
  }
}

function resolveSpendTier(user: UserRecord | null): string {
  if (!user) return 'MEMBER';
  if (isMockProfileChromeActive(user)) {
    const mock = (getEffectiveTierName(user) || 'BLACK').toUpperCase();
    return mock === 'BLACK' ? 'BLACK MEMBER' : `${mock} MEMBER`;
  }
  const spending = getPeriodSpending(user);
  if (spending >= 4000) return 'BLACK MEMBER';
  if (spending >= 2000) return 'RED MEMBER';
  if (spending >= 1000) return 'SILVER MEMBER';
  const stored = (getEffectiveTierName(user) || '').toUpperCase();
  if (stored === 'BLACK') return 'BLACK MEMBER';
  if (stored === 'RED') return 'RED MEMBER';
  if (stored === 'SILVER') return 'SILVER MEMBER';
  const sub = getEffectiveSubscriptionTier(user);
  if (sub) return 'PREMIUM MEMBER';
  return 'MEMBER';
}

function getMemberSinceYear(user: UserRecord | null): number {
  const created = user?.createdAt;
  if (created) {
    const year = new Date(created).getFullYear();
    if (Number.isFinite(year) && year > 2000) return year;
  }
  return new Date().getFullYear();
}

function getLifetimeLoyaltyEarned(user: UserRecord | null, currentBalance: number): number {
  const history = user?.pointsHistory;
  if (Array.isArray(history) && history.length > 0) {
    const earned = history.reduce((sum, row) => {
      const delta = Number(row.points ?? row.amount ?? 0);
      return delta > 0 ? sum + delta : sum;
    }, 0);
    if (earned > 0) return earned;
  }
  return Math.max(currentBalance, 0);
}

function getNextMilestone(
  spending: number,
  points: number,
): { label: string; progressPct: number } {
  const tiers = [
    { name: 'SILVER', spend: 1000 },
    { name: 'RED', spend: 2000 },
    { name: 'BLACK', spend: 4000 },
  ];
  const next = tiers.find((t) => spending < t.spend);
  if (!next) {
    const milestonePoints = Math.ceil((points + 500) / 500) * 500;
    const remaining = Math.max(0, milestonePoints - points);
    return {
      label: `${remaining.toLocaleString()} DP TO GO`,
      progressPct: Math.min(100, Math.round((points / milestonePoints) * 100)),
    };
  }
  const remaining = next.spend - spending;
  return {
    label: `$${remaining.toLocaleString()} TO ${next.name}`,
    progressPct: Math.min(100, Math.round((spending / next.spend) * 100)),
  };
}

function countActiveVouchers(user: UserRecord | null): number {
  if (!user) return 0;
  if (Array.isArray(user.voucherList) && user.voucherList.length > 0) return user.voucherList.length;
  if (typeof user.voucherCount === 'number') return user.voucherCount;
  return 0;
}

function countActiveOrders(user: UserRecord | null): number {
  if (!user?.email) return 0;
  try {
    const raw = localStorage.getItem(`userOrders_${user.email}`);
    if (!raw) return 0;
    const data = JSON.parse(raw);
    const norm = normalizeUserOrdersBuckets(data.activeOrders || [], data.pastOrders || []);
    return norm.activeOrders.filter((o) => {
      const status = String(o.status || '').toUpperCase();
      return status !== 'DELIVERED' && status !== 'COMPLETE' && status !== 'CANCELLED';
    }).length;
  } catch {
    return 0;
  }
}

function countWishlistItems(): number {
  try {
    const raw = localStorage.getItem('wishlistItems');
    if (!raw) return 0;
    const items = JSON.parse(raw);
    return Array.isArray(items) ? items.length : 0;
  } catch {
    return 0;
  }
}

function getReferralStats(user: UserRecord | null): { count: number; nextBonusRemaining: number } {
  const email = (user?.email || '').trim().toLowerCase();
  if (!email) return { count: 0, nextBonusRemaining: 5 };
  try {
    const log = JSON.parse(localStorage.getItem('referralEarnings') || '[]');
    const confirmed = log.filter(
      (e: { referrerEmail?: string; status?: string }) =>
        (e.referrerEmail || '').trim().toLowerCase() === email && e.status === 'confirmed',
    );
    const count = confirmed.length;
    const bonusInterval = 5;
    const nextBonusRemaining = count % bonusInterval === 0 ? bonusInterval : bonusInterval - (count % bonusInterval);
    return { count, nextBonusRemaining };
  } catch {
    return { count: 0, nextBonusRemaining: 5 };
  }
}

function countRewardsCollection(user: UserRecord | null): number {
  const progress = user?.slayChallengeProgress;
  if (progress && typeof progress === 'object') {
    const claimed = Object.values(progress).filter((v) => v === true || v === 'claimed').length;
    if (claimed > 0) return claimed;
  }
  const tasks = user?.earnedEarnTaskIds;
  if (Array.isArray(tasks)) return Math.min(4, tasks.length);
  return 0;
}

function formatRelativeAge(dateStr: string): string {
  const t = Date.parse(dateStr);
  if (Number.isNaN(t)) return '';
  const days = Math.floor((Date.now() - t) / (1000 * 60 * 60 * 24));
  if (days <= 0) return 'today';
  if (days === 1) return '1 day ago';
  if (days < 7) return `${days} days ago`;
  const weeks = Math.floor(days / 7);
  if (weeks === 1) return '1 week ago';
  if (weeks < 5) return `${weeks} weeks ago`;
  const months = Math.floor(days / 30);
  return months === 1 ? '1 month ago' : `${months} months ago`;
}

function buildActivityItems(user: UserRecord | null): PenthouseSuiteActivityItem[] {
  const items: PenthouseSuiteActivityItem[] = [];
  const history = user?.pointsHistory;
  if (Array.isArray(history)) {
    history.slice(0, 4).forEach((row) => {
      items.push({
        label: String(row.transaction || 'Account activity').toUpperCase(),
        when: formatRelativeAge(row.date) || 'recently',
      });
    });
  }
  if (items.length >= 4) return items.slice(0, 4);
  if (user?.email) {
    try {
      const raw = localStorage.getItem(`userOrders_${user.email}`);
      if (raw) {
        const data = JSON.parse(raw);
        const all = [...(data.pastOrders || []), ...(data.activeOrders || [])];
        all.slice(0, 4 - items.length).forEach((order: { productName?: string; date?: string }) => {
          items.push({
            label: `Purchased ${String(order.productName || 'order').toUpperCase()}`,
            when: order.date ? formatRelativeAge(order.date) : 'recently',
          });
        });
      }
    } catch {
      /* ignore */
    }
  }
  if (items.length === 0) {
    return [
      { label: 'Complete hair analysis', when: 'get started' },
      { label: 'Explore rewards collection', when: 'unlock perks' },
    ];
  }
  return items.slice(0, 4);
}

function getAffiliatePointsEarned(user: UserRecord | null): number {
  const email = (user?.email || '').trim().toLowerCase();
  if (!email) return 0;
  try {
    const key = getPerUserKey(PER_USER_KEYS.affiliateSubmittedContent, email);
    const raw = localStorage.getItem(key);
    if (!raw) return 0;
    const content = JSON.parse(raw);
    if (!Array.isArray(content)) return 0;
    return content.reduce((sum: number, item: { points?: number; status?: string }) => {
      if (item.status !== 'approved') return sum;
      return sum + (Number(item.points) || 0);
    }, 0);
  } catch {
    return 0;
  }
}

export function buildPenthouseSuiteDashboardData(
  user: UserRecord | null,
): PenthouseSuiteDashboardData {
  const spending = getPeriodSpending(user);
  const storedPoints = Number(user?.loyaltyPoints) || 0;
  const spendPoints = spending;
  const points = storedPoints + spendPoints;
  const lifetimeEarned = getLifetimeLoyaltyEarned(user, points);
  const milestone = getNextMilestone(spending, points);
  const referrals = getReferralStats(user);
  const referralProgress = Math.min(
    100,
    Math.round(((5 - referrals.nextBonusRemaining) / 5) * 100),
  );

  return {
    hero: {
      tierLabel: resolveSpendTier(user),
      memberSinceYear: getMemberSinceYear(user),
      href: '/account/rewards',
    },
    diamondPoints: {
      points,
      lifetimeEarned,
      nextMilestoneLabel: milestone.label,
      progressPct: milestone.progressPct,
      href: '/account/rewards',
    },
    slayTickets: {
      available: getSlayTicketBalanceFromUser(user),
      href: '/tools/slay-tickets',
    },
    vouchers: {
      activeCount: countActiveVouchers(user),
      href: '/account/rewards',
    },
    digitalCash: {
      balance: Number(user?.giftCardBalance) || 0,
      href: '/account/load-card',
    },
    myOrders: {
      activeCount: countActiveOrders(user),
      href: '/account/orders',
    },
    rewardsCollection: {
      rewardCount: Math.max(countRewardsCollection(user), 0),
      href: '/account/rewards',
    },
    referrals: {
      successfulCount: referrals.count,
      nextBonusRemaining: referrals.nextBonusRemaining,
      progressPct: referralProgress,
      href: '/account/referrals',
    },
    wishlist: {
      savedCount: countWishlistItems(),
      href: '/wishlist',
    },
    myActivity: {
      items: buildActivityItems(user),
      href: '/account/alerts',
    },
    affiliate: {
      totalEarnedPoints: getAffiliatePointsEarned(user),
      commissionRateLabel: '10%',
      href: '/account/affiliate',
    },
    accountSettings: {
      href: '/account/settings',
    },
  };
}

export function formatPenthouseSuiteCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}
