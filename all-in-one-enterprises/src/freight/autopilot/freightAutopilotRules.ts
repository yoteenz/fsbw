import type { Load } from '../../dispatch/dispatchTypes';
import type { FreightAutopilotStep, FreightAutopilotStepKey, FreightAutopilotStepStatus } from './freightAutopilotTypes';
import { evaluateDocumentCompleteness } from './documentCompleteness';

const STEP_DEFS: { key: FreightAutopilotStepKey; label: string }[] = [
  { key: 'carrier_booked', label: 'Carrier booked' },
  { key: 'driver_assigned', label: 'Driver assigned' },
  { key: 'dispatch_package_ready', label: 'Dispatch package ready' },
  { key: 'pickup_confirmed', label: 'Pickup confirmed' },
  { key: 'bol_received', label: 'BOL received' },
  { key: 'delivery_confirmed', label: 'Delivery confirmed' },
  { key: 'pod_received', label: 'POD received' },
  { key: 'document_package_complete', label: 'Document package complete' },
  { key: 'invoice_ready', label: 'Invoice ready' },
  { key: 'factoring_package_ready', label: 'Factoring package ready' },
  { key: 'carrier_settlement_pending', label: 'Carrier settlement pending' },
  { key: 'driver_settlement_pending', label: 'Driver settlement pending' },
  { key: 'bookkeeping_close_pending', label: 'Bookkeeping close pending' },
  { key: 'financially_closed', label: 'Financially closed' },
];

function stepStatus(
  key: FreightAutopilotStepKey,
  load: Load,
  docComplete: boolean,
  hasInvoice: boolean,
  hasBillingPackage: boolean,
): FreightAutopilotStepStatus {
  switch (key) {
    case 'carrier_booked':
      return ['booked', 'dispatched', 'en_route_pickup', 'at_pickup', 'loaded', 'in_transit', 'at_delivery', 'delivered', 'pod_needed', 'complete'].includes(
        load.operationalStatus,
      )
        ? 'complete'
        : load.offerStatus === 'accepted'
          ? 'ready'
          : 'pending';
    case 'driver_assigned':
      return load.primaryDriverId ? 'complete' : load.operationalStatus === 'complete' ? 'blocked' : 'pending';
    case 'dispatch_package_ready':
      return load.primaryDriverId && load.powerUnitId ? 'complete' : 'pending';
    case 'pickup_confirmed':
      return ['at_pickup', 'loaded', 'in_transit', 'at_delivery', 'delivered', 'pod_needed', 'complete'].includes(load.operationalStatus)
        ? 'complete'
        : 'pending';
    case 'bol_received':
      return load.bolDocumentId ? 'complete' : ['at_pickup', 'loaded', 'in_transit', 'at_delivery', 'delivered', 'pod_needed', 'complete'].includes(load.operationalStatus)
        ? 'blocked'
        : 'pending';
    case 'delivery_confirmed':
      return ['delivered', 'pod_needed', 'complete'].includes(load.operationalStatus) ? 'complete' : 'pending';
    case 'pod_received':
      return load.podDocumentId ? 'complete' : load.operationalStatus === 'pod_needed' ? 'blocked' : 'pending';
    case 'document_package_complete':
      return docComplete ? 'complete' : load.operationalStatus === 'complete' ? 'blocked' : 'pending';
    case 'invoice_ready':
      return hasInvoice ? 'complete' : docComplete ? 'ready' : 'blocked';
    case 'factoring_package_ready':
      return load.factoringHandoffStatus === 'ready' ? 'complete' : load.operationalStatus === 'complete' ? 'ready' : 'pending';
    case 'carrier_settlement_pending':
      return load.sourceType === 'brokerage' && load.operationalStatus === 'complete'
        ? hasBillingPackage
          ? 'ready'
          : 'pending'
        : 'skipped';
    case 'driver_settlement_pending':
      return load.primaryDriverId && load.operationalStatus === 'complete' ? 'ready' : 'skipped';
    case 'bookkeeping_close_pending':
      return load.sourceType === 'brokerage' && load.operationalStatus === 'complete' ? 'ready' : 'skipped';
    case 'financially_closed':
      return hasBillingPackage && hasInvoice && load.operationalStatus === 'complete' ? 'ready' : 'pending';
    default:
      return 'pending';
  }
}

export function deriveAutopilotSteps(
  load: Load,
  opts: { hasInvoice?: boolean; hasBillingPackage?: boolean } = {},
): FreightAutopilotStep[] {
  const doc = evaluateDocumentCompleteness(load);
  const docComplete = doc.status === 'complete' || doc.status === 'override';

  return STEP_DEFS.map(({ key, label }) => {
    const status = stepStatus(key, load, docComplete, Boolean(opts.hasInvoice), Boolean(opts.hasBillingPackage));
    return {
      key,
      label,
      status,
      blockedReason:
        status === 'blocked'
          ? key === 'pod_received'
            ? 'Missing POD'
            : key === 'bol_received'
              ? 'Missing BOL'
              : key === 'document_package_complete'
                ? doc.missingLabels.join(', ')
                : undefined
          : undefined,
      automated: !['carrier_settlement_pending', 'driver_settlement_pending', 'bookkeeping_close_pending'].includes(key),
    };
  });
}

export function inferAutopilotEventFromLoadChange(
  load: Load,
  prev?: Partial<Load>,
): import('./freightAutopilotTypes').FreightAutopilotEventType | undefined {
  if (prev?.operationalStatus !== 'complete' && load.operationalStatus === 'complete') return 'DELIVERY_CONFIRMED';
  if (!prev?.podDocumentId && load.podDocumentId) return 'POD_RECEIVED';
  if (!prev?.bolDocumentId && load.bolDocumentId) return 'DOCUMENT_UPLOADED';
  if (!prev?.rateConfirmationDocumentId && load.rateConfirmationDocumentId) return 'DOCUMENT_UPLOADED';
  if (!prev?.primaryDriverId && load.primaryDriverId) return 'DRIVER_ASSIGNED';
  if (prev?.offerStatus !== 'accepted' && load.offerStatus === 'accepted') return 'CARRIER_BOOKED';
  return undefined;
}
