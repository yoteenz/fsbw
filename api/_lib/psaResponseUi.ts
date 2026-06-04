/**
 * PSA rich UI: quick-reply suffix parsing + cards from tool trace.
 */
import { formatPsaVoiceText } from './psaVoiceFormat.js';

export type PsaChatCard =
  | {
      type: 'product';
      name: string;
      startingPriceUsd?: number | null;
      path: string;
      buildAWigPath: string;
      summary?: string;
    }
  | { type: 'nav'; label: string; path: string; description?: string }
  | { type: 'order'; orderNumber: string; status?: string; path: string; note?: string }
  | { type: 'action'; label: string; path: string };

export type PsaToolTraceEntry = {
  name: string;
  output: string;
};

const QUICK_SUFFIX_RE = /\n?>>QUICK:\s*(.+)$/i;

function formatCardCopy(text: string | undefined): string | undefined {
  if (!text) return undefined;
  return formatPsaVoiceText(text, { stripGreeting: false });
}

export function parseQuickRepliesFromReply(text: string): { reply: string; quickReplies: string[] } {
  const match = text.match(QUICK_SUFFIX_RE);
  if (!match) return { reply: text.trim(), quickReplies: [] };
  const reply = text.replace(QUICK_SUFFIX_RE, '').trim();
  const quickReplies = match[1]
    .split('|')
    .map((s) => formatPsaVoiceText(s.trim(), { stripGreeting: false }))
    .filter(Boolean)
    .slice(0, 4);
  return { reply, quickReplies };
}

function safeJsonParse(raw: string): unknown {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function buildCardsFromToolTrace(trace: PsaToolTraceEntry[]): PsaChatCard[] {
  const cards: PsaChatCard[] = [];
  const seen = new Set<string>();

  for (const entry of trace) {
    const data = safeJsonParse(entry.output);
    if (!data || typeof data !== 'object') continue;

    if (entry.name === 'search_products' && Array.isArray(data)) {
      for (const row of data) {
        if (!row || typeof row !== 'object') continue;
        const p = row as Record<string, unknown>;
        const name = String(p.name ?? '').trim();
        const path = String(p.productPage ?? p.path ?? '').trim();
        const buildAWigPath = String(p.buildAWig ?? p.buildAWigPath ?? '').trim();
        if (!name || !path) continue;
        const key = `product:${name}`;
        if (seen.has(key)) continue;
        seen.add(key);
        cards.push({
          type: 'product',
          name: formatCardCopy(name) ?? name,
          startingPriceUsd: typeof p.startingPriceUsd === 'number' ? p.startingPriceUsd : null,
          path,
          buildAWigPath: buildAWigPath || path,
          summary: formatCardCopy(typeof p.summary === 'string' ? p.summary : undefined),
        });
      }
    }

    if (entry.name === 'suggest_navigation' && Array.isArray(data)) {
      for (const row of data.slice(0, 3)) {
        if (!row || typeof row !== 'object') continue;
        const n = row as Record<string, unknown>;
        const path = String(n.path ?? '').trim();
        const label = String(n.label ?? path).trim();
        if (!path) continue;
        const key = `nav:${path}`;
        if (seen.has(key)) continue;
        seen.add(key);
        cards.push({
          type: 'nav',
          label: formatCardCopy(label) ?? label,
          path,
          description: formatCardCopy(typeof n.description === 'string' ? n.description : undefined),
        });
      }
    }

    if (entry.name === 'get_order_status' && !Array.isArray(data)) {
      const order = (data as { order?: Record<string, unknown> }).order;
      if (order && typeof order === 'object') {
        const num = String(order.orderNumber ?? order.id ?? '').trim();
        if (num) {
          const key = `order:${num}`;
          if (!seen.has(key)) {
            seen.add(key);
            cards.push({
              type: 'order',
              orderNumber: formatCardCopy(num) ?? num,
              status: formatCardCopy(typeof order.status === 'string' ? order.status : undefined),
              path: '/orders',
              note: formatCardCopy(
                order.requiresOrderForm && !order.orderFormSigned
                  ? 'Order form signature needed'
                  : undefined
              ),
            });
          }
        }
      }
    }
  }

  return cards.slice(0, 6);
}
