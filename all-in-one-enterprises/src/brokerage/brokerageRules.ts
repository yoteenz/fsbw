import type { Load } from '../dispatch/dispatchTypes';
import type {
  BrokerageLoadFinancials,
  BrokerageLoadLink,
  BrokerageQuoteStatus,
  CarrierOffer,
  CarrierOfferStatus,
  CarrierPayable,
  ShipmentRequestStatus,
} from './brokerageTypes';
import { computeBrokerageGrossMargin } from './brokerageCalculations';

export function canViewShipperCharge(role: 'shipper' | 'carrier' | 'broker_finance' | 'broker_ops'): boolean {
  return role === 'shipper' || role === 'broker_finance' || role === 'broker_ops';
}

export function canViewCarrierPay(role: 'shipper' | 'carrier' | 'broker_finance' | 'broker_ops'): boolean {
  return role === 'carrier' || role === 'broker_finance' || role === 'broker_ops';
}

export function canViewGrossMargin(role: 'shipper' | 'carrier' | 'broker_finance' | 'broker_ops'): boolean {
  return role === 'broker_finance' || role === 'broker_ops';
}

export function isBrokerageLoad(load: Load): boolean {
  return load.sourceType === 'brokerage';
}

export function computeGrossMarginFromFinancials(fin: BrokerageLoadFinancials): number {
  return computeBrokerageGrossMargin(fin.confirmedShipperChargeMinor, fin.confirmedCarrierPayMinor);
}

export function isReadyToBill(load: Load, link?: BrokerageLoadLink): boolean {
  if (!isBrokerageLoad(load)) return false;
  if (load.operationalStatus !== 'complete' && load.operationalStatus !== 'pod_needed') return false;
  if (!load.podDocumentId) return false;
  if (link?.coverageStatus !== 'booked') return false;
  return true;
}

export function isReadyForCarrierPayable(load: Load, payable?: CarrierPayable): boolean {
  if (!isBrokerageLoad(load)) return false;
  if (!load.podDocumentId) return false;
  if (load.operationalStatus !== 'complete') return false;
  if (payable?.factoringAssignmentOnFile && payable.paymentDestinationProtected) return payable.status === 'approved';
  return true;
}

export function canTransitionQuoteStatus(from: BrokerageQuoteStatus, to: BrokerageQuoteStatus): boolean {
  if (from === to) return true;
  if (from === 'converted') return false;
  if (from === 'accepted' && to !== 'converted') return false;
  const allowed: Partial<Record<BrokerageQuoteStatus, BrokerageQuoteStatus[]>> = {
    draft: ['sent', 'revised', 'expired'],
    sent: ['viewed', 'accepted', 'declined', 'expired', 'revised'],
    viewed: ['accepted', 'declined', 'expired', 'revised'],
    revised: ['sent', 'expired'],
    accepted: ['converted'],
    declined: [],
    expired: [],
    converted: [],
  };
  return (allowed[from] ?? []).includes(to);
}

export function canTransitionOfferStatus(from: CarrierOfferStatus, to: CarrierOfferStatus): boolean {
  if (from === to) return true;
  if (from === 'accepted') return false;
  const allowed: Partial<Record<CarrierOfferStatus, CarrierOfferStatus[]>> = {
    draft: ['sent', 'withdrawn'],
    sent: ['viewed', 'accepted', 'declined', 'withdrawn', 'expired', 'revised'],
    viewed: ['accepted', 'declined', 'withdrawn', 'revised'],
    revised: ['sent', 'withdrawn'],
    declined: [],
    withdrawn: [],
    expired: [],
    accepted: [],
  };
  return (allowed[from] ?? []).includes(to);
}

export function canTransitionShipmentRequest(from: ShipmentRequestStatus, to: ShipmentRequestStatus): boolean {
  if (from === to) return true;
  if (from === 'converted_to_load') return false;
  const allowed: Partial<Record<ShipmentRequestStatus, ShipmentRequestStatus[]>> = {
    draft: ['submitted', 'cancelled'],
    submitted: ['under_review', 'cancelled'],
    under_review: ['quote_pending', 'declined', 'cancelled'],
    quote_pending: ['quoted', 'cancelled'],
    quoted: ['accepted', 'declined', 'cancelled'],
    accepted: ['converted_to_load'],
    declined: [],
    cancelled: [],
    converted_to_load: [],
  };
  return (allowed[from] ?? []).includes(to);
}

export function findActiveCarrierOffer(offers: CarrierOffer[], loadId: string): CarrierOffer | undefined {
  const active: CarrierOfferStatus[] = ['sent', 'viewed', 'accepted'];
  return offers.find((o) => o.loadId === loadId && active.includes(o.status));
}

export function isCarrierPayableLocked(payable: CarrierPayable): boolean {
  return payable.status === 'paid_future';
}

export function isShipperInvoiceLocked(status: string): boolean {
  return status === 'paid';
}
