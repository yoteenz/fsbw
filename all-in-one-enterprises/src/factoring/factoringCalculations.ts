/** Estimated factoring previews — label ESTIMATED until provider confirms. */

export function computeEstimatedAdvanceMinor(
  invoiceAmountMinor: number,
  advanceRateBasisPoints?: number,
): number {
  if (!advanceRateBasisPoints || advanceRateBasisPoints <= 0) return 0;
  return Math.round((invoiceAmountMinor * advanceRateBasisPoints) / 10000);
}

export function computeEstimatedReserveMinor(
  invoiceAmountMinor: number,
  reserveBasisPoints?: number,
): number {
  if (!reserveBasisPoints || reserveBasisPoints <= 0) return 0;
  return Math.round((invoiceAmountMinor * reserveBasisPoints) / 10000);
}

export function computeEstimatedFeeMinor(
  invoiceAmountMinor: number,
  feeBasisPoints?: number,
): number {
  if (!feeBasisPoints || feeBasisPoints <= 0) return 0;
  return Math.round((invoiceAmountMinor * feeBasisPoints) / 10000);
}
