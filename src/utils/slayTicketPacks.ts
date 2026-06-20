import { SLAY_TICKET_CART_THUMBNAIL_SRC } from '../constants/slayTicketAssets';

/** Purchasable Slay Ticket pack products (digital — no bonus tickets on purchase). */

export const SLAY_TICKET_UNIT_PRICE_USD = 4;

/** Cart / bag / checkout line title — always singular; quantity holds ticket count. */
export const SLAY_TICKET_CART_LINE_NAME = 'SLAY TICKET';

export type SlayTicketPack = {
  id: string;
  ticketCount: number;
  priceUsd: number;
  /** @deprecated Display-only; cart lines use {@link SLAY_TICKET_CART_LINE_NAME}. */
  label: string;
};

export const SLAY_TICKET_PACKS: SlayTicketPack[] = [
  {
    id: 'slay-tickets-4',
    ticketCount: 4,
    priceUsd: SLAY_TICKET_UNIT_PRICE_USD * 4,
    label: SLAY_TICKET_CART_LINE_NAME,
  },
  {
    id: 'slay-tickets-8',
    ticketCount: 8,
    priceUsd: SLAY_TICKET_UNIT_PRICE_USD * 8,
    label: SLAY_TICKET_CART_LINE_NAME,
  },
  {
    id: 'slay-tickets-12',
    ticketCount: 12,
    priceUsd: SLAY_TICKET_UNIT_PRICE_USD * 12,
    label: SLAY_TICKET_CART_LINE_NAME,
  },
  {
    id: 'slay-tickets-24',
    ticketCount: 24,
    priceUsd: SLAY_TICKET_UNIT_PRICE_USD * 24,
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
    price: SLAY_TICKET_UNIT_PRICE_USD,
    quantity: pack.ticketCount,
    type: 'digital' as const,
    slayTicketProduct: true,
    slayTicketPackCount: pack.ticketCount,
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
} | null | undefined): number {
  if (!item) return 0;
  const unit = Math.round(Number(item.price) || SLAY_TICKET_UNIT_PRICE_USD);
  const q = Math.max(1, Math.floor(Number(item.quantity) || 1));
  return unit * q;
}

export { SLAY_TICKET_CART_THUMBNAIL_SRC };
