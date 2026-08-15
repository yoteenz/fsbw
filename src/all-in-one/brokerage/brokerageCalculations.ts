import type { BrokerageAccessorial, BrokerageLoadFinancials } from './brokerageTypes';

export function computeTotalCarrierPay(fin: Pick<
  BrokerageLoadFinancials,
  'carrierLinehaulMinor' | 'carrierFuelSurchargeMinor' | 'carrierAccessorialMinor'
>): number {
  return fin.carrierLinehaulMinor + fin.carrierFuelSurchargeMinor + fin.carrierAccessorialMinor;
}

export function computeBrokerageGrossMargin(
  confirmedShipperChargeMinor: number,
  confirmedCarrierPayMinor: number,
): number {
  return confirmedShipperChargeMinor - confirmedCarrierPayMinor;
}

export function computeGrossMarginPercent(
  confirmedShipperChargeMinor: number,
  grossMarginMinor: number,
): number | null {
  if (confirmedShipperChargeMinor <= 0) return null;
  return (grossMarginMinor / confirmedShipperChargeMinor) * 100;
}

export function sumApprovedAccessorials(
  accessorials: BrokerageAccessorial[],
  side: BrokerageAccessorial['side'],
): number {
  return accessorials
    .filter((a) => a.side === side && a.status === 'approved')
    .reduce((s, a) => s + a.amountMinor, 0);
}

export function computeShipperInvoiceTotal(
  baseFreightMinor: number,
  accessorialsMinor: number,
  adjustmentsMinor: number,
): number {
  return baseFreightMinor + accessorialsMinor + adjustmentsMinor;
}

export function computeCarrierPayableTotal(
  confirmedAmountMinor: number,
  accessorialAmountMinor: number,
  deductionsMinor: number,
): number {
  return confirmedAmountMinor + accessorialAmountMinor - deductionsMinor;
}
