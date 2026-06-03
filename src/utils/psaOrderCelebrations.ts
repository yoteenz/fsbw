/**
 * Smart order celebrations — one-time PSA nudges for placed / shipped / delivered.
 */
import { getPerUserKey, getCurrentUserEmailFromStorage } from './perUserStorage';

export type PsaOrderCelebrationKind = 'placed' | 'shipped' | 'delivered';

export type PsaOrderCelebration = {
  kind: PsaOrderCelebrationKind;
  orderNumber: string;
  headline: string;
  body: string;
  prefilledMessage: string;
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
        headline: 'YOUR ORDER IS IN MOTION',
        body: num || 'ORDER CONFIRMED',
        prefilledMessage: num
          ? `Beautiful, my order ${num} just went through. What happens next?`
          : 'My order just went through. What happens next?',
      };
    }

    if (status === 'SHIPPED' && !wasCelebrated(id, 'shipped')) {
      return {
        kind: 'shipped',
        orderNumber: num,
        headline: "SHE'S ON THE WAY",
        body: num || 'PACKAGE SHIPPED',
        prefilledMessage: num
          ? `Track my order ${num} for me.`
          : 'Something shipped. Help me track it.',
      };
    }

    if (status === 'DELIVERED' && placedAt > 0 && now - placedAt <= deliveredWindow && !wasCelebrated(id, 'delivered')) {
      return {
        kind: 'delivered',
        orderNumber: num,
        headline: 'YOUR PACKAGE ARRIVED',
        body: num || 'DELIVERED',
        prefilledMessage: num
          ? `My order ${num} was delivered. Any first-wear tips?`
          : 'My package arrived. Any first-wear tips?',
      };
    }
  }

  return null;
}
