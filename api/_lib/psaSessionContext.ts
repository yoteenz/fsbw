/**
 * Format client session context for PSA system instructions.
 */

export type PsaClientSessionContextPayload = {
  pathname?: string;
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
  mode?: 'talk_me_out_of_it' | 'event_ready' | 'what_would_you_pick';
};

export function formatPsaSessionContextBlock(raw: unknown): string {
  if (!raw || typeof raw !== 'object') return '';
  const ctx = raw as PsaClientSessionContextPayload;
  const lines: string[] = ['## Current session snapshot (from member device — treat as hints, verify with tools)'];

  if (typeof ctx.pathname === 'string' && ctx.pathname.trim()) {
    lines.push(`- Page: \`${ctx.pathname.trim()}\``);
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
      '- **MODE: Talk Me Out Of It** — member wants honest "should I buy this?" feedback. Compare to cart, past orders, and rotation. Say no if it does not change their lineup enough.'
    );
  }
  if (ctx.mode === 'event_ready') {
    lines.push(
      '- **MODE: Get Me Event Ready** — build a transformation roadmap: texture, length, install timing, appointment path. Not just products.'
    );
  }
  if (ctx.mode === 'what_would_you_pick') {
    lines.push(
      '- **MODE: What Would You Pick** — answer with founder conviction: "If I were spending my own money today, I would choose…" and one clear reason.'
    );
  }

  if (lines.length <= 1) return '';
  lines.push(
    '- Use this snapshot to personalize greetings and proactive help. Still call tools for authoritative cart/order data before acting.'
  );
  return lines.join('\n');
}
