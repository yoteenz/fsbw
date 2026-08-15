import type { AmountStatus, BillingLineItem, FeeCategory } from './billingTypes';
import { addMinor, clampMinor, multiplyMinor } from './money';

export interface LineItemInput {
  description: string;
  quantity: number;
  unitAmountMinor: number;
  feeCategory: FeeCategory;
  amountStatus?: AmountStatus;
  notes?: string;
}

export interface BillingTotals {
  lineItems: BillingLineItem[];
  subtotalServiceFeesMinor: number;
  subtotalExternalFeesMinor: number;
  discountTotalMinor: number;
  taxTotalMinor: number;
  totalKnownMinor: number;
  hasPendingExternalFees: boolean;
}

export function computeLineAmount(unitAmountMinor: number, quantity: number): number {
  if (quantity < 0) throw new Error('Quantity cannot be negative');
  return multiplyMinor(unitAmountMinor, quantity);
}

export function buildLineItems(inputs: LineItemInput[]): BillingLineItem[] {
  return inputs.map((input, index) => {
    const lineAmountMinor = computeLineAmount(input.unitAmountMinor, input.quantity);
    return {
      id: `li-${index}-${input.description.slice(0, 8).replace(/\s/g, '-')}`,
      description: input.description,
      quantity: input.quantity,
      unitAmountMinor: input.unitAmountMinor,
      lineAmountMinor,
      feeCategory: input.feeCategory,
      amountStatus: input.amountStatus ?? 'known',
      notes: input.notes,
    };
  });
}

export function calculateBillingTotals(lineItems: BillingLineItem[]): BillingTotals {
  let subtotalServiceFeesMinor = 0;
  let subtotalExternalFeesMinor = 0;
  let discountTotalMinor = 0;
  let taxTotalMinor = 0;
  let hasPendingExternalFees = false;

  for (const item of lineItems) {
    if (item.amountStatus === 'pending') {
      hasPendingExternalFees = true;
      if (item.feeCategory === 'service_fee' || item.feeCategory === 'tax') {
        // pending on service is unusual; still don't add to total
      }
      continue;
    }
    switch (item.feeCategory) {
      case 'service_fee':
        subtotalServiceFeesMinor = addMinor(subtotalServiceFeesMinor, item.lineAmountMinor);
        break;
      case 'government_fee':
      case 'third_party_fee':
        subtotalExternalFeesMinor = addMinor(subtotalExternalFeesMinor, item.lineAmountMinor);
        break;
      case 'discount':
        discountTotalMinor = addMinor(discountTotalMinor, Math.abs(item.lineAmountMinor));
        break;
      case 'tax':
        taxTotalMinor = addMinor(taxTotalMinor, item.lineAmountMinor);
        break;
      default:
        break;
    }
  }

  const totalKnownMinor = addMinor(
    subtotalServiceFeesMinor,
    subtotalExternalFeesMinor,
    taxTotalMinor,
    -discountTotalMinor,
  );

  return {
    lineItems,
    subtotalServiceFeesMinor,
    subtotalExternalFeesMinor,
    discountTotalMinor,
    taxTotalMinor,
    totalKnownMinor: clampMinor(totalKnownMinor),
    hasPendingExternalFees,
  };
}

export function computeBalanceDue(totalMinor: number, amountPaidMinor: number): number {
  return clampMinor(totalMinor - amountPaidMinor);
}

export function canAcceptPayment(invoiceStatus: string, balanceDueMinor: number): boolean {
  if (invoiceStatus === 'void' || invoiceStatus === 'paid') return false;
  return balanceDueMinor > 0;
}
