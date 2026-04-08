/**
 * When an admin declines a submitted order authorization form: cancel the order,
 * reverse loyalty from that order, and restock (inventory follows canceled orders via `getDepletedInventory`).
 */

import { normalizeUserOrdersBuckets, sortOrdersNewestFirst } from './userOrdersBuckets';
import { getPerUserKey, PER_USER_KEYS } from './perUserStorage';

function userOrdersStorageKey(email: string): string {
  return `userOrders_${(email || '').trim().toLowerCase()}`;
}

function creditGiftCardRefundForDeclinedOrder(clientEmail: string, usd: number): void {
  if (!Number.isFinite(usd) || usd <= 0) return;
  const key = (clientEmail || '').trim().toLowerCase();
  if (!key) return;
  const credit = Math.round(usd * 100) / 100;
  try {
    const now = new Date();
    const dateStr = `${now.getMonth() + 1}-${now.getDate()}-${now.getFullYear()}`;
    const entry = { date: dateStr, transaction: 'ORDER FORM DECLINE REFUND', amount: credit };
    const bump = (u: Record<string, unknown> | null): Record<string, unknown> | null => {
      if (!u || String(u.email || '').trim().toLowerCase() !== key) return u;
      const cur = Number(u.giftCardBalance) || 0;
      return {
        ...u,
        giftCardBalance: Math.round((cur + credit) * 100) / 100,
        digitalCashHistory: [...(Array.isArray(u.digitalCashHistory) ? u.digitalCashHistory : []), entry],
      };
    };
    const curRaw = localStorage.getItem('currentUser');
    if (curRaw) {
      const cur = JSON.parse(curRaw) as Record<string, unknown>;
      const next = bump(cur);
      if (next) localStorage.setItem('currentUser', JSON.stringify(next));
    }
    const regRaw = localStorage.getItem('registeredUsers');
    if (regRaw) {
      const list = JSON.parse(regRaw) as Record<string, unknown>[];
      if (Array.isArray(list)) {
        const idx = list.findIndex((u) => String(u.email || '').trim().toLowerCase() === key);
        if (idx >= 0) {
          const next = bump(list[idx]);
          if (next) {
            list[idx] = next;
            localStorage.setItem('registeredUsers', JSON.stringify(list));
          }
        }
      }
    }
  } catch {
    /* ignore */
  }
}

function reverseReferralCreditForCanceledOrder(orderId: string, buyerEmailNorm: string): void {
  if (!orderId || !buyerEmailNorm) return;
  type RefEntry = {
    orderId?: string;
    referredEmail?: string;
    referrerEmail?: string;
    amount?: number;
  };
  const matches = (e: RefEntry) =>
    String(e.orderId || '') === orderId &&
    String(e.referredEmail || '').trim().toLowerCase() === buyerEmailNorm;

  try {
    const raw = localStorage.getItem('referralEarnings');
    if (!raw) return;
    const all = JSON.parse(raw) as RefEntry[];
    if (!Array.isArray(all)) return;
    const hit = all.filter(matches);
    if (hit.length === 0) return;
    const rest = all.filter((e) => !matches(e));
    localStorage.setItem('referralEarnings', JSON.stringify(rest));

    const now = new Date();
    const dateStr = `${now.getMonth() + 1}-${now.getDate()}-${now.getFullYear()}`;
    const debitEntry = { date: dateStr, transaction: 'REFERRAL REVERSAL (ORDER CANCELED)', amount: 0 };

    for (const e of hit) {
      const refKey = String(e.referrerEmail || '').trim().toLowerCase();
      if (!refKey) continue;
      const amt = Math.abs(Number(e.amount) || 20);
      const adjustReferrer = (u: Record<string, unknown> | null): Record<string, unknown> | null => {
        if (!u || String(u.email || '').trim().toLowerCase() !== refKey) return u;
        const cur = Number(u.giftCardBalance) || 0;
        return {
          ...u,
          giftCardBalance: Math.max(0, Math.round((cur - amt) * 100) / 100),
          digitalCashHistory: [
            ...(Array.isArray(u.digitalCashHistory) ? u.digitalCashHistory : []),
            { ...debitEntry, amount: -amt },
          ],
        };
      };
      const curRaw = localStorage.getItem('currentUser');
      if (curRaw) {
        const cur = JSON.parse(curRaw) as Record<string, unknown>;
        const next = adjustReferrer(cur);
        if (next) localStorage.setItem('currentUser', JSON.stringify(next));
      }
      const regRaw = localStorage.getItem('registeredUsers');
      if (regRaw) {
        const list = JSON.parse(regRaw) as Record<string, unknown>[];
        const idx = list.findIndex((u) => String(u.email || '').trim().toLowerCase() === refKey);
        if (idx >= 0) {
          const next = adjustReferrer(list[idx]);
          if (next) {
            list[idx] = next;
            localStorage.setItem('registeredUsers', JSON.stringify(list));
          }
        }
      }
      const perKey = getPerUserKey(PER_USER_KEYS.referralEarnings, refKey);
      const perRaw = localStorage.getItem(perKey);
      if (perRaw) {
        const log = JSON.parse(perRaw) as RefEntry[];
        if (Array.isArray(log)) {
          localStorage.setItem(perKey, JSON.stringify(log.filter((x) => !matches(x))));
        }
      }
    }
  } catch {
    /* ignore */
  }
}

function reverseLoyaltyForDeclinedOrder(clientEmail: string, pointsEarned: number): void {
  if (!Number.isFinite(pointsEarned) || pointsEarned <= 0) return;
  const key = (clientEmail || '').trim().toLowerCase();
  if (!key) return;
  try {
    const adjustUser = (u: Record<string, unknown> | null): Record<string, unknown> | null => {
      if (!u || String(u.email || '').trim().toLowerCase() !== key) return u;
      const cur = Number(u.loyaltyPoints) || 0;
      return { ...u, loyaltyPoints: Math.max(0, cur - Math.round(pointsEarned)) };
    };
    const curRaw = localStorage.getItem('currentUser');
    if (curRaw) {
      const cur = JSON.parse(curRaw) as Record<string, unknown>;
      const next = adjustUser(cur);
      if (next) localStorage.setItem('currentUser', JSON.stringify(next));
    }
    const regRaw = localStorage.getItem('registeredUsers');
    if (regRaw) {
      const list = JSON.parse(regRaw) as Record<string, unknown>[];
      if (Array.isArray(list)) {
        const idx = list.findIndex((u) => String(u.email || '').trim().toLowerCase() === key);
        if (idx >= 0) {
          const next = adjustUser(list[idx]);
          if (next) {
            list[idx] = next;
            localStorage.setItem('registeredUsers', JSON.stringify(list));
          }
        }
      }
    }
  } catch {
    /* ignore */
  }
}

/**
 * Cancel order, archive to past, mark refund/decline metadata, reverse loyalty.
 * Inventory restocks automatically because `getDepletedInventory` skips CANCELED orders.
 */
export function cancelAndRefundOrderAfterFormDecline(
  clientEmail: string,
  orderId: string,
  declineReason: string
): boolean {
  const key = (clientEmail || '').trim().toLowerCase();
  if (!key || !orderId) return false;
  const r = (declineReason || '').trim();
  try {
    const raw = localStorage.getItem(userOrdersStorageKey(key));
    if (!raw) return false;
    const data = JSON.parse(raw) as { activeOrders?: unknown[]; pastOrders?: unknown[] };
    let active = Array.isArray(data.activeOrders) ? [...data.activeOrders] : [];
    let past = Array.isArray(data.pastOrders) ? [...data.pastOrders] : [];

    let target: Record<string, unknown> | null = null;
    let idx = active.findIndex((o) => String((o as { id?: string }).id || '') === orderId);
    if (idx >= 0) {
      target = { ...(active[idx] as object) } as Record<string, unknown>;
      active.splice(idx, 1);
    } else {
      idx = past.findIndex((o) => String((o as { id?: string }).id || '') === orderId);
      if (idx >= 0) {
        target = { ...(past[idx] as object) } as Record<string, unknown>;
        past.splice(idx, 1);
      }
    }
    if (!target) return false;

    const pe = Number(target.pointsEarned);
    const pointsToReverse = Number.isFinite(pe) && pe > 0 ? pe : 0;

    const now = Date.now();
    const canceled: Record<string, unknown> = {
      ...target,
      status: 'CANCELED',
      canceledAt: now,
      orderFormSigned: false,
      orderFormSignedAt: undefined,
      orderFormClientSubmitted: false,
      orderFormAdminApproved: false,
      orderFormAdminDeclined: true,
      orderFormAdminDeclineReason: r || undefined,
      canceledDueToFormDecline: true,
      refundedDueToFormDecline: true,
      formDeclineRefundedAt: now,
    };

    past.push(canceled);
    past = sortOrdersNewestFirst(past as { id?: string; date?: string; placedAt?: number; status?: string }[]);

    type BucketRow = { id?: string; status?: string };
    const normalized = normalizeUserOrdersBuckets(active as BucketRow[], past as BucketRow[]);
    localStorage.setItem(
      userOrdersStorageKey(key),
      JSON.stringify({
        ...data,
        activeOrders: normalized.activeOrders,
        pastOrders: normalized.pastOrders,
      })
    );

    reverseLoyaltyForDeclinedOrder(key, pointsToReverse);

    const giftUsd = Number(target.giftCardAppliedUsd);
    if (Number.isFinite(giftUsd) && giftUsd > 0) {
      creditGiftCardRefundForDeclinedOrder(key, giftUsd);
    }

    reverseReferralCreditForCanceledOrder(String(target.id || orderId), key);

    const allOrders = [...(normalized.activeOrders as unknown[]), ...(normalized.pastOrders as unknown[])];
    const remainingNonCanceled = allOrders.filter(
      (o) => String((o as { status?: string }).status || '').toUpperCase() !== 'CANCELED'
    ).length;

    if (remainingNonCanceled === 0) {
      try {
        const curRaw = localStorage.getItem('currentUser');
        if (curRaw) {
          const cur = JSON.parse(curRaw) as Record<string, unknown>;
          if (String(cur.email || '').trim().toLowerCase() === key) {
            localStorage.setItem('currentUser', JSON.stringify({ ...cur, hasMadeFirstPurchase: false }));
          }
        }
        const regRaw = localStorage.getItem('registeredUsers');
        if (regRaw) {
          const list = JSON.parse(regRaw) as Record<string, unknown>[];
          const i = list.findIndex((u) => String(u.email || '').trim().toLowerCase() === key);
          if (i >= 0) {
            list[i] = { ...list[i], hasMadeFirstPurchase: false };
            localStorage.setItem('registeredUsers', JSON.stringify(list));
          }
        }
      } catch {
        /* ignore */
      }
    }

    try {
      window.dispatchEvent(new CustomEvent('ordersUpdated'));
    } catch {
      /* ignore */
    }
    return true;
  } catch {
    return false;
  }
}
