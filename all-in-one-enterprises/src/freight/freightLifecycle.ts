import type { AioFreightLifecycleStatus } from './freightTypes';

const TRANSITIONS: Record<AioFreightLifecycleStatus, AioFreightLifecycleStatus[]> = {
  draft: ['quoted', 'cancelled'],
  quoted: ['shipper_accepted', 'draft', 'cancelled'],
  shipper_accepted: ['available', 'cancelled'],
  available: ['offer_received', 'carrier_selected', 'cancelled'],
  offer_received: ['carrier_selected', 'available', 'cancelled'],
  carrier_selected: ['booked', 'available', 'cancelled'],
  booked: ['assigned', 'cancelled'],
  assigned: ['en_route_to_pickup', 'cancelled'],
  en_route_to_pickup: ['at_pickup', 'cancelled'],
  at_pickup: ['loaded', 'cancelled'],
  loaded: ['in_transit', 'cancelled'],
  in_transit: ['at_delivery', 'cancelled'],
  at_delivery: ['delivered', 'cancelled'],
  delivered: ['pod_received', 'cancelled'],
  pod_received: ['invoiced', 'cancelled'],
  invoiced: ['payment_pending', 'cancelled'],
  payment_pending: ['paid', 'cancelled'],
  paid: ['closed'],
  closed: [],
  cancelled: [],
};

export function canTransitionLifecycle(from: AioFreightLifecycleStatus, to: AioFreightLifecycleStatus): boolean {
  return TRANSITIONS[from]?.includes(to) ?? false;
}

export function inferLifecycleFromLoad(coverageStatus?: string, operationalStatus?: string): AioFreightLifecycleStatus {
  if (operationalStatus === 'cancelled') return 'cancelled';
  if (operationalStatus === 'complete') return 'closed';
  if (operationalStatus === 'pod_needed') return 'delivered';
  if (coverageStatus === 'needs_coverage' || coverageStatus === 'carrier_contacted') return 'available';
  if (coverageStatus === 'rate_negotiation' || coverageStatus === 'carrier_offered') return 'offer_received';
  if (coverageStatus === 'carrier_accepted') return 'carrier_selected';
  if (coverageStatus === 'booked') return 'booked';
  if (operationalStatus === 'in_transit') return 'in_transit';
  if (operationalStatus === 'delivered') return 'delivered';
  return 'draft';
}
