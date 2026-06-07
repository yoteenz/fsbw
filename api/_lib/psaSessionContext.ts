/**
 * Format client session context for PSA system instructions.
 */
import { resolvePsaMoodInstruction, type PsaMoodId } from './psaMood.js';
import {
  formatPsaSlayJournalBlock,
  type HallOfSlayMilestoneId,
  type SlayJournalEntry,
} from './psaSlayJournal.js';

export type PsaSessionMode =
  | 'talk_me_out_of_it'
  | 'event_ready'
  | 'what_would_you_pick'
  | 'what_might_i_regret'
  | 'slay_forecast'
  | 'build_my_look'
  | 'why_this';

export type PsaClientSessionContextPayload = {
  pathname?: string;
  firstName?: string | null;
  tierLabel?: string | null;
  subscriptionTier?: string | null;
  cart?: {
    itemCount: number;
    unitNames: string[];
    hasOutOfStock: boolean;
  };
  orders?: {
    unsignedFormCount: number;
    unsignedFormOrderNumbers: string[];
    expiringConsultCount: number;
    expiringConsultOrderNumbers: string[];
  };
  unreadStockAlertCount?: number;
  slayReadiness?: {
    percent: number;
    checklist: { label: string; done: boolean }[];
  };
  bawDraft?: {
    unitLabel: string;
    buildPath: string;
    source: 'draft' | 'session';
  };
  mode?: PsaSessionMode;
  welcomeKind?: 'first' | 'returning' | 'default';
  mood?: PsaMoodId;
  moodReason?: string;
  journal?: {
    recentEntries?: SlayJournalEntry[];
    hallMilestones?: HallOfSlayMilestoneId[];
    pendingMilestone?: HallOfSlayMilestoneId | null;
  };
};

export function formatPsaSessionContextBlock(raw: unknown): string {
  if (!raw || typeof raw !== 'object') return '';
  const ctx = raw as PsaClientSessionContextPayload;
  const lines: string[] = ['## Current session snapshot (from member device — treat as hints, verify with tools)'];

  if (typeof ctx.pathname === 'string' && ctx.pathname.trim()) {
    lines.push(`- Page: \`${ctx.pathname.trim()}\``);
  }
  if (typeof ctx.firstName === 'string' && ctx.firstName.trim()) {
    lines.push(
      `- Member first name (Settings): **${ctx.firstName.trim()}** — use in greetings when natural.`
    );
  }
  if (ctx.welcomeKind === 'first') {
    lines.push(
      '- **Welcome kind: first unlock** — member just gained PSA access. Greet with "Welcome, {firstName}!" (not "Welcome back").'
    );
  } else if (ctx.welcomeKind === 'returning') {
    lines.push(
      '- **Welcome kind: returning session** — member came back after leaving the site. "Welcome back, {firstName}!" is appropriate.'
    );
  } else if (ctx.welcomeKind === 'default') {
    lines.push(
      '- **Welcome kind: same session** — skip "Welcome" / "Welcome back" prefixes unless they ask; continue the conversation naturally.'
    );
  }
  if (ctx.tierLabel || ctx.subscriptionTier) {
    lines.push(
      `- Tier hint: ${[ctx.tierLabel, ctx.subscriptionTier].filter(Boolean).join(' / ')}`
    );
  }
  if (ctx.cart) {
    const units = ctx.cart.unitNames?.length ? ctx.cart.unitNames.join(', ') : 'none';
    lines.push(
      `- Cart: ${ctx.cart.itemCount} item(s)${ctx.cart.hasOutOfStock ? ' (includes out-of-stock line)' : ''}; units: ${units}`
    );
  }
  if (ctx.orders) {
    if (ctx.orders.unsignedFormCount > 0) {
      lines.push(
        `- **Unsigned order form(s):** ${ctx.orders.unsignedFormCount} — ${ctx.orders.unsignedFormOrderNumbers.join(', ') || 'see orders'} (urgent — 24h window)`
      );
    }
    if (ctx.orders.expiringConsultCount > 0) {
      lines.push(
        `- **Expiring consult offer(s):** ${ctx.orders.expiringConsultCount} — ${ctx.orders.expiringConsultOrderNumbers.join(', ') || 'see orders'}`
      );
    }
  }
  if (typeof ctx.unreadStockAlertCount === 'number' && ctx.unreadStockAlertCount > 0) {
    lines.push(`- Unread stock alerts on wishlist: ${ctx.unreadStockAlertCount}`);
  }
  if (ctx.slayReadiness) {
    lines.push(`- Slay Readiness Score: **${ctx.slayReadiness.percent}%**`);
    for (const item of ctx.slayReadiness.checklist) {
      lines.push(`  - ${item.done ? '[x]' : '[ ]'} ${item.label}`);
    }
    if (ctx.slayReadiness.percent < 100) {
      lines.push('- Mention readiness naturally when they are close to checkout or booking.');
    }
  }
  if (ctx.bawDraft?.buildPath) {
    lines.push(
      `- Incomplete Build-a-Wig: **${ctx.bawDraft.unitLabel}** (${ctx.bawDraft.source === 'draft' ? 'saved draft' : 'in-progress session'}) → ${ctx.bawDraft.buildPath}`
    );
  }

  if (ctx.mode === 'talk_me_out_of_it') {
    lines.push(
      '- **MODE: Talk Me Out Of It** — honest verdict, not automatic no. Compare to cart and rotation.'
    );
  }
  if (ctx.mode === 'what_might_i_regret') {
    lines.push(
      '- **MODE: What Might I Regret** — pre-purchase regret prevention. Name maintenance, texture mismatch, or redundant rotation risks clearly. Build trust.'
    );
  }
  if (ctx.mode === 'event_ready' || ctx.mode === 'slay_forecast') {
    lines.push(
      '- **MODE: Slay Forecast / Event Ready** — call `get_slay_forecast` when they name a city or event. Output HEAT, HUMIDITY, MY PICK, WHY, MAINTENANCE, INSTALL TIMING.'
    );
  }
  if (ctx.mode === 'build_my_look') {
    lines.push(
      '- **MODE: Build My Entire Look** — full event blueprint: texture, length, install date, maintenance, Lounge lesson, booking path. Not just a product list.'
    );
  }
  if (ctx.mode === 'what_would_you_pick') {
    lines.push(
      '- **MODE: What Would You Pick** — use `get_founder_pick`. Lead with MY PERSONAL PICK HERE WOULD BE {UNIT}.'
    );
  }
  if (ctx.mode === 'why_this') {
    lines.push(
      '- **MODE: Why This** — explain the last recommendation using their stated preferences and memories. Transparent reasoning, no jargon.'
    );
  }

  const journalBlock = formatPsaSlayJournalBlock({
    recentEntries: ctx.journal?.recentEntries,
    hallMilestones: ctx.journal?.hallMilestones,
    pendingMilestone: ctx.journal?.pendingMilestone ?? null,
  });

  const moodBlock = resolvePsaMoodInstruction({
    mood: ctx.mood,
    moodReason: ctx.moodReason,
    isBlackTier: (ctx.tierLabel ?? '').trim().toUpperCase() === 'BLACK',
    pendingMilestone: ctx.journal?.pendingMilestone ?? null,
  });

  if (lines.length <= 1 && !journalBlock && !moodBlock) return '';

  lines.push(
    '- Use this snapshot to personalize greetings and proactive help. Still call tools for authoritative cart/order data before acting.'
  );

  return `${lines.join('\n')}${moodBlock}${journalBlock}`;
}
