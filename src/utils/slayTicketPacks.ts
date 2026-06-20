import { SLAY_TICKET_CART_THUMBNAIL_SRC } from '../constants/slayTicketAssets';

/** List rate per ticket before pack volume discounts. */
export const SLAY_TICKET_UNIT_PRICE_USD = 4;

/** Cart / bag / checkout line title — always singular; quantity holds ticket count. */
export const SLAY_TICKET_CART_LINE_NAME = 'SLAY TICKET';

export type SlayTicketPack = {
  id: string;
  ticketCount: number;
  /** Pack checkout total (may be below list rate for larger packs). */
  priceUsd: number;
  /** @deprecated Display-only; cart lines use {@link SLAY_TICKET_CART_LINE_NAME}. */
  label: string;
};

/** List price at {@link SLAY_TICKET_UNIT_PRICE_USD} per ticket (no volume discount). */
export function slayTicketPackListPriceUsd(ticketCount: number): number {
  return SLAY_TICKET_UNIT_PRICE_USD * ticketCount;
}

/** Per-ticket unit price for cart/checkout (pack total ÷ ticket count). */
export function slayTicketPackUnitPriceUsd(pack: SlayTicketPack): number {
  return pack.priceUsd / pack.ticketCount;
}

export const SLAY_TICKET_PACKS: SlayTicketPack[] = [
  {
    id: 'slay-tickets-4',
    ticketCount: 4,
    priceUsd: 16,
    label: SLAY_TICKET_CART_LINE_NAME,
  },
  {
    id: 'slay-tickets-8',
    ticketCount: 8,
    priceUsd: 30,
    label: SLAY_TICKET_CART_LINE_NAME,
  },
  {
    id: 'slay-tickets-12',
    ticketCount: 12,
    priceUsd: 46,
    label: SLAY_TICKET_CART_LINE_NAME,
  },
  {
    id: 'slay-tickets-24',
    ticketCount: 24,
    priceUsd: 90,
    label: SLAY_TICKET_CART_LINE_NAME,
  },
];

export const SLAY_TICKET_DEFAULT_PACK_ID = 'slay-tickets-4';

export function getSlayTicketPackById(id: string | null | undefined): SlayTicketPack | undefined {
  return SLAY_TICKET_PACKS.find((p) => p.id === id);
}

export function slayTicketPackPdpPath(packId?: string): string {
  const id = packId || SLAY_TICKET_DEFAULT_PACK_ID;
  return `/tools/slay-tickets?pack=${encodeURIComponent(id)}`;
}

export function parseSlayTicketPackId(raw: string | null | undefined): string | null {
  const t = (raw || '').trim();
  if (!t) return null;
  return getSlayTicketPackById(t) ? t : null;
}

export function isSlayTicketPackCartLine(item: {
  type?: string;
  name?: string;
  slayTicketProduct?: boolean;
  slayTicketPackCount?: number;
} | null | undefined): boolean {
  if (!item) return false;
  if (item.slayTicketProduct === true) return true;
  if (String(item.name || '').trim().toUpperCase() === SLAY_TICKET_CART_LINE_NAME) return true;
  if (typeof item.slayTicketPackCount === 'number' && item.slayTicketPackCount > 0) return true;
  return /\bSLAY\s+TICKETS?\b/i.test(String(item.name || ''));
}

export function slayTicketPackCartLine(pack: SlayTicketPack) {
  return {
    id: pack.id,
    name: SLAY_TICKET_CART_LINE_NAME,
    price: slayTicketPackUnitPriceUsd(pack),
    quantity: pack.ticketCount,
    type: 'digital' as const,
    slayTicketProduct: true,
    slayTicketPackCount: pack.ticketCount,
    slayTicketPackTotalUsd: pack.priceUsd,
    image: SLAY_TICKET_CART_THUMBNAIL_SRC,
  };
}

export function slayTicketsCreditedForCartLine(line: {
  name?: string;
  quantity?: number;
  slayTicketPackCount?: number;
  slayTicketProduct?: boolean;
}): number {
  if (!isSlayTicketPackCartLine(line)) return 0;
  const q = Math.max(1, Math.floor(Number(line.quantity) || 1));
  if (String(line.name || '').trim().toUpperCase() === SLAY_TICKET_CART_LINE_NAME) {
    return q;
  }
  const pack = Math.max(0, Math.floor(Number(line.slayTicketPackCount) || 0));
  if (pack > 0) return pack * q;
  const match = String(line.name || '').match(/(\d+)\s*SLAY\s+TICKETS?/i);
  if (match) return Number(match[1]) * q;
  return q;
}

export function slayTicketLineTotalUsd(item: {
  price?: number;
  quantity?: number;
  id?: string;
  slayTicketPackTotalUsd?: number;
} | null | undefined): number {
  if (!item) return 0;
  const packTotal = Number(item.slayTicketPackTotalUsd);
  if (Number.isFinite(packTotal) && packTotal > 0) return Math.round(packTotal);
  const pack = getSlayTicketPackById(item.id);
  const q = Math.max(1, Math.floor(Number(item.quantity) || 1));
  if (pack && pack.ticketCount === q) return pack.priceUsd;
  const unit = Number(item.price);
  if (Number.isFinite(unit)) return Math.round(unit * q);
  return SLAY_TICKET_UNIT_PRICE_USD * q;
}

export { SLAY_TICKET_CART_THUMBNAIL_SRC };
