/** Purchasable Slay Ticket pack products (digital — no bonus tickets on purchase). */

export type SlayTicketPack = {
  id: string;
  ticketCount: number;
  priceUsd: number;
  label: string;
};

export const SLAY_TICKET_PACKS: SlayTicketPack[] = [
  { id: 'slay-tickets-4', ticketCount: 4, priceUsd: 10, label: '4 SLAY TICKETS' },
  { id: 'slay-tickets-8', ticketCount: 8, priceUsd: 18, label: '8 SLAY TICKETS' },
  { id: 'slay-tickets-12', ticketCount: 12, priceUsd: 24, label: '12 SLAY TICKETS' },
  { id: 'slay-tickets-24', ticketCount: 24, priceUsd: 40, label: '24 SLAY TICKETS' },
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
  if (typeof item.slayTicketPackCount === 'number' && item.slayTicketPackCount > 0) return true;
  return /\bSLAY\s+TICKETS?\b/i.test(String(item.name || ''));
}

export function slayTicketPackCartLine(pack: SlayTicketPack) {
  return {
    id: pack.id,
    name: pack.label,
    price: pack.priceUsd,
    quantity: 1,
    type: 'digital' as const,
    slayTicketProduct: true,
    slayTicketPackCount: pack.ticketCount,
  };
}

/** Thumbnail for Slay Ticket pack lines in bag / checkout. */
export const SLAY_TICKET_CART_THUMBNAIL_SRC = '/assets/slay-challenge.svg';
