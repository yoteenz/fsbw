/** Gift card USD denominations — shared by tools strip, PDP picker, and checkout. */
export const GIFT_CARD_BALANCE_OPTIONS = [10, 15, 25, 50, 75, 100, 250, 500] as const;

export type GiftCardBalanceUsd = (typeof GIFT_CARD_BALANCE_OPTIONS)[number];

export const GIFT_CARD_DEFAULT_BALANCE: GiftCardBalanceUsd = 10;

export function parseGiftCardBalance(raw: unknown): GiftCardBalanceUsd | null {
  const n = typeof raw === 'number' ? raw : parseInt(String(raw ?? ''), 10);
  if (!Number.isFinite(n)) return null;
  return (GIFT_CARD_BALANCE_OPTIONS as readonly number[]).includes(n) ? (n as GiftCardBalanceUsd) : null;
}

/** Gift card PDP path; optional `balance` pre-selects the denomination chip. */
export function giftCardPdpPath(balanceUsd?: number): string {
  const parsed = balanceUsd == null ? null : parseGiftCardBalance(balanceUsd);
  return parsed == null ? '/tools/gift-card' : `/tools/gift-card?balance=${parsed}`;
}
