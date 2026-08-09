/**
 * Slay Ticket economy policy — prospective business rules.
 *
 * Historical ledger rows are NEVER rewritten. Orders that already received
 * `slay_ticket_transactions.type = 'earned'` keep those balances.
 *
 * Cutoff: orders placed on or after this instant do not earn hair-purchase tickets.
 * Set via env `FSBW_HAIR_SLAY_TICKET_EARNING_CUTOFF_ISO` or default below.
 */
export const HAIR_PURCHASE_SLAY_TICKET_EARNING_DEPRECATED = true;

/** Default cutoff — sprint implementation date (UTC). Override in env for staged rollout. */
export const DEFAULT_HAIR_SLAY_TICKET_EARNING_CUTOFF_ISO = '2026-08-09T00:00:00.000Z';

export function hairSlayTicketEarningCutoffMs(): number {
  const raw =
    (typeof import.meta !== 'undefined' &&
      import.meta.env?.VITE_HAIR_SLAY_TICKET_EARNING_CUTOFF_ISO) ||
    (typeof process !== 'undefined' && process.env?.FSBW_HAIR_SLAY_TICKET_EARNING_CUTOFF_ISO) ||
    DEFAULT_HAIR_SLAY_TICKET_EARNING_CUTOFF_ISO;
  const ms = Date.parse(String(raw));
  return Number.isFinite(ms) ? ms : Date.parse(DEFAULT_HAIR_SLAY_TICKET_EARNING_CUTOFF_ISO);
}

/** Whether physical hair lines may still earn +2 tickets at checkout (prospective only). */
export function isHairPurchaseSlayTicketEarningEnabled(orderPlacedAt?: string | number | Date): boolean {
  if (!HAIR_PURCHASE_SLAY_TICKET_EARNING_DEPRECATED) return true;
  const placedMs =
    orderPlacedAt == null
      ? Date.now()
      : typeof orderPlacedAt === 'number'
        ? orderPlacedAt
        : new Date(orderPlacedAt).getTime();
  if (Number.isNaN(placedMs)) return false;
  return placedMs < hairSlayTicketEarningCutoffMs();
}

export const SLAY_TICKET_ECONOMY_MIGRATION_NOTE =
  'Prospective-only: hair purchases after the earning cutoff no longer grant complimentary Slay Tickets. Historical earned transactions and balances are preserved unchanged.';
