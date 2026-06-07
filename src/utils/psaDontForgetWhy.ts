/**
 * Don't Forget Why — proactive nudges from stored purchase context (30+ days).
 */
import { getPerUserKey, getCurrentUserEmailFromStorage } from './perUserStorage';
import { getCachedPsaMemberContext, type CachedPurchaseContext } from './psaMemberContextCache';

const REMINDER_SEEN_PREFIX = 'psaPurchaseReminderSeen';

/** Minimum age before surfacing a "remember why you bought" nudge. */
const MIN_AGE_MS = 30 * 24 * 60 * 60 * 1000;

export type PsaDontForgetWhyNudge = {
  id: string;
  headline: string;
  body: string;
  prefilledMessage: string;
  actionPath: string;
  actionLabel: string;
  contextId: string;
};

function seenKey(): string {
  return getPerUserKey(REMINDER_SEEN_PREFIX, getCurrentUserEmailFromStorage());
}

function readSeen(): Set<string> {
  try {
    const raw = localStorage.getItem(seenKey());
    if (!raw) return new Set();
    const arr = JSON.parse(raw) as string[];
    return new Set(Array.isArray(arr) ? arr : []);
  } catch {
    return new Set();
  }
}

function markSeen(contextId: string): void {
  const set = readSeen();
  set.add(contextId);
  localStorage.setItem(seenKey(), JSON.stringify([...set]));
}

function formatOccasionLine(ctx: CachedPurchaseContext): string {
  const unit = ctx.unitName ? ` ${ctx.unitName}` : '';
  return `YOU ORIGINALLY CHOSE${unit} FOR ${ctx.occasion.toUpperCase()}.`;
}

export function detectPsaDontForgetWhyNudge(): PsaDontForgetWhyNudge | null {
  const member = getCachedPsaMemberContext();
  if (!member?.purchaseContexts?.length) return null;

  const seen = readSeen();
  const now = Date.now();

  for (const ctx of member.purchaseContexts) {
    if (!ctx.id || seen.has(ctx.id)) continue;
    const created = Date.parse(ctx.createdAt);
    if (!Number.isFinite(created) || now - created < MIN_AGE_MS) continue;

    const line = formatOccasionLine(ctx);
    return {
      id: `dont-forget-${ctx.id}`,
      contextId: ctx.id,
      headline: 'REMEMBER WHY YOU CHOSE HER',
      body: line.slice(0, 72),
      prefilledMessage: `You reminded me I chose this for ${ctx.occasion}. Does it still fit my rotation?`,
      actionPath: ctx.unitId ? `/build-a-wig/${ctx.unitId}` : '/account/orders',
      actionLabel: ctx.unitName ? `VIEW ${ctx.unitName}` : 'VIEW ORDERS',
    };
  }

  return null;
}

export function markDontForgetWhyNudgeShown(contextId: string): void {
  if (contextId) markSeen(contextId);
}
