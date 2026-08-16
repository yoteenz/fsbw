import type { Load, LoadOfferStatus, LoadOperationalStatus } from './dispatchTypes';

export function isLoadOfferOpen(offerStatus: LoadOfferStatus): boolean {
  return offerStatus === 'awaiting_carrier';
}

export function canCarrierAcceptLoad(load: Load): boolean {
  return load.offerStatus === 'awaiting_carrier' && !['cancelled', 'complete'].includes(load.operationalStatus);
}

export function canCarrierDeclineLoad(load: Load): boolean {
  return load.offerStatus === 'awaiting_carrier';
}

export function canBookLoad(load: Load): boolean {
  return load.offerStatus === 'accepted' && ['opportunity', 'booking_in_progress'].includes(load.operationalStatus);
}

export function isActiveLoad(status: LoadOperationalStatus): boolean {
  return !['complete', 'cancelled', 'opportunity'].includes(status) || status === 'booking_in_progress';
}

export function isFactoringHandoffReady(load: Load): boolean {
  if (load.operationalStatus !== 'complete') return false;
  if (!load.podDocumentId) return false;
  if (load.rateConfirmationStatus !== 'verified' && load.rateConfirmationStatus !== 'details_reviewed') {
    if (!load.rateDetailsReviewed) return false;
  }
  return true;
}

export function requiredDocumentsForCompletion(load: Load): { kind: string; met: boolean }[] {
  return [
    { kind: 'Rate Confirmation', met: Boolean(load.rateConfirmationDocumentId) || load.rateDetailsReviewed },
    { kind: 'POD', met: Boolean(load.podDocumentId) },
  ];
}

export function canTransitionToComplete(load: Load): boolean {
  if (load.operationalStatus !== 'pod_needed' && load.operationalStatus !== 'delivered') return false;
  const reqs = requiredDocumentsForCompletion(load);
  return reqs.every((r) => r.met);
}

export function nextCustomerAction(load: Load): string | null {
  if (load.offerStatus === 'awaiting_carrier') return 'Review load offer';
  switch (load.operationalStatus) {
    case 'booked':
    case 'dispatched':
      return 'Mark en route to pickup';
    case 'en_route_pickup':
      return 'Mark arrived at pickup';
    case 'at_pickup':
      return 'Mark loaded / upload BOL';
    case 'loaded':
    case 'in_transit':
      return 'Mark at delivery when arrived';
    case 'at_delivery':
      return 'Mark delivered';
    case 'delivered':
    case 'pod_needed':
      return load.podDocumentId ? null : 'Upload POD';
    default:
      return null;
  }
}

export function updateFactoringHandoffStatus(load: Load): Load['factoringHandoffStatus'] {
  if (load.factoringNotFactoredReason) return 'not_factored';
  if (load.operationalStatus !== 'complete') return 'not_ready';
  return isFactoringHandoffReady(load) ? 'ready' : 'not_ready';
}
