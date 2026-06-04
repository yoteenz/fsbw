/**
 * Smart order celebrations — one-time PSA nudges for placed / shipped / delivered.
 */
import { getPerUserKey, getCurrentUserEmailFromStorage } from './perUserStorage';
import { resolveNudgeCopy } from './copyDebugResolve';

export type PsaOrderCelebrationKind = 'placed' | 'shipped' | 'delivered';

export type PsaOrderCelebration = {
  kind: PsaOrderCelebrationKind;
  orderNumber: string;
  headline: string;
  body: string;
  prefilledMessage: string;
  actionLabel?: string;
};

const STORAGE_PREFIX = 'psaOrderCelebrated';

type CelebratedMap = Record<string, PsaOrderCelebrationKind[]>;

function storageKey(): string {
  return getPerUserKey(STORAGE_PREFIX, getCurrentUserEmailFromStorage());
}

function readCelebrated(): CelebratedMap {
  try {
    const raw = localStorage.getItem(storageKey());
    if (!raw) return {};
    return JSON.parse(raw) as CelebratedMap;
  } catch {
    return {};
  }
}

function writeCelebrated(map: CelebratedMap): void {
  localStorage.setItem(storageKey(), JSON.stringify(map));
}

export function markOrderCelebrated(orderId: string, kind: PsaOrderCelebrationKind): void {
  const key = orderId.trim();
  if (!key) return;
  const map = readCelebrated();
  const list = map[key] ?? [];
  if (!list.includes(kind)) map[key] = [...list, kind];
  writeCelebrated(map);
}

function wasCelebrated(orderId: string, kind: PsaOrderCelebrationKind): boolean {
  return (readCelebrated()[orderId.trim()] ?? []).includes(kind);
}

function orderNum(order: Record<string, unknown>): string {
  return String(order.orderNumber ?? order.id ?? '').trim();
}

function orderId(order: Record<string, unknown>): string {
  return String(order.id ?? order.orderNumber ?? '').trim();
}

function celebrationCopy(
  kind: PsaOrderCelebrationKind,
  num: string
): Pick<PsaOrderCelebration, 'headline' | 'body' | 'prefilledMessage' | 'actionLabel'> {
  const withOrder = Boolean(num);
  const variantId = `order_celebration.${kind}.${withOrder ? 'with_order' : 'fallback'}`;
  const copy = resolveNudgeCopy(variantId, {
    orderRef: num,
    orderNumber: num.replace(/^ORDER\s*#?\s*/i, '').trim() || num,
    num,
  });
  return {
    headline: copy.headline,
    body: num || copy.body || (kind === 'placed' ? 'ORDER CONFIRMED' : kind === 'shipped' ? 'PACKAGE SHIPPED' : 'DELIVERED'),
    prefilledMessage: copy.prefilledMessage ?? '',
    actionLabel: copy.actionLabel,
  };
}

export function detectPsaOrderCelebration(
  orders: Record<string, unknown>[]
): PsaOrderCelebration | null {
  const now = Date.now();
  const placedWindow = 48 * 60 * 60 * 1000;
  const deliveredWindow = 72 * 60 * 60 * 1000;

  for (const order of orders) {
    const id = orderId(order);
    const num = orderNum(order);
    if (!id) continue;
    const status = String(order.status || '').toUpperCase();
    const placedAt = typeof order.placedAt === 'number' ? order.placedAt : 0;

    if (
      (status === 'PLACED' || status === 'CONFIRMED' || status === 'PROCESSING') &&
      placedAt > 0 &&
      now - placedAt <= placedWindow &&
      !wasCelebrated(id, 'placed')
    ) {
      return {
        kind: 'placed',
        orderNumber: num,
        ...celebrationCopy('placed', num),
      };
    }

    if (status === 'SHIPPED' && !wasCelebrated(id, 'shipped')) {
      return {
        kind: 'shipped',
        orderNumber: num,
        ...celebrationCopy('shipped', num),
      };
    }

    if (status === 'DELIVERED' && placedAt > 0 && now - placedAt <= deliveredWindow && !wasCelebrated(id, 'delivered')) {
      return {
        kind: 'delivered',
        orderNumber: num,
        ...celebrationCopy('delivered', num),
      };
    }
  }

  return null;
}
