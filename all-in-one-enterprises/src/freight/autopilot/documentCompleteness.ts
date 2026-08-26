import type { Load } from '../../dispatch/dispatchTypes';
import type { LoadAccessorial } from '../../dispatch/dispatchTypes';
import {
  FACTORING_EXTRA_REQUIREMENTS,
  LOAD_CLOSE_BASE_REQUIREMENTS,
  type FreightDocumentType,
  type FreightLoadDocumentRef,
} from './freightDocumentTypes';

export type DocumentPackageStatus = 'incomplete' | 'complete' | 'override';

export interface DocumentCompletenessResult {
  status: DocumentPackageStatus;
  items: FreightLoadDocumentRef[];
  missingLabels: string[];
  readyForBilling: boolean;
  readyForFactoring: boolean;
  readyForSettlement: boolean;
}

export interface DocumentCompletenessOverride {
  loadId: string;
  staffId: string;
  reason: string;
  timestamp: string;
}

const DOC_LABELS: Record<FreightDocumentType, string> = {
  RATE_CONFIRMATION: 'Rate Confirmation',
  BOL: 'BOL',
  POD: 'POD',
  LUMPER_RECEIPT: 'Lumper Receipt',
  FUEL_RECEIPT: 'Fuel Receipt',
  SCALE_TICKET: 'Scale Ticket',
  DETENTION_DOCUMENT: 'Detention Document',
  TONU_DOCUMENT: 'TONU Document',
  ACCESSORIAL_RECEIPT: 'Accessorial Receipt',
  CARRIER_PACKET: 'Carrier Packet',
  INSURANCE_CERTIFICATE: 'Insurance Certificate',
  W9: 'W-9',
  INVOICE: 'Invoice',
  SETTLEMENT: 'Settlement',
  FACTORING_DOCUMENT: 'Factoring Document',
  OTHER_LOAD_DOCUMENT: 'Other Load Document',
};

function hasLumperAccessorial(accessorials: LoadAccessorial[]): boolean {
  return accessorials.some((a) => a.type === 'lumper' && a.status === 'approved');
}

function mapLoadDoc(type: FreightDocumentType, load: Load): FreightLoadDocumentRef {
  const lumperRequired = type === 'LUMPER_RECEIPT' && hasLumperAccessorial(load.accessorials);
  const requiredForClose = LOAD_CLOSE_BASE_REQUIREMENTS.includes(type);
  const requiredForFactoring =
    LOAD_CLOSE_BASE_REQUIREMENTS.includes(type) ||
    (type === 'LUMPER_RECEIPT' && lumperRequired);

  let documentId: string | undefined;
  let status: FreightLoadDocumentRef['status'] = 'missing';

  if (type === 'RATE_CONFIRMATION') {
    documentId = load.rateConfirmationDocumentId;
    if (documentId || load.rateDetailsReviewed) status = 'received';
  } else if (type === 'BOL') {
    documentId = load.bolDocumentId;
    if (documentId) status = 'received';
  } else if (type === 'POD') {
    documentId = load.podDocumentId;
    if (documentId) status = 'received';
  } else if (type === 'LUMPER_RECEIPT') {
    status = lumperRequired ? 'missing' : 'not_required';
  } else {
    status = 'not_required';
  }

  return {
    documentType: type,
    documentId,
    requiredForClose,
    requiredForFactoring,
    requiredForSettlement: requiredForClose,
    status,
  };
}

export function evaluateDocumentCompleteness(
  load: Load,
  override?: DocumentCompletenessOverride,
): DocumentCompletenessResult {
  const types = [...LOAD_CLOSE_BASE_REQUIREMENTS, ...FACTORING_EXTRA_REQUIREMENTS];
  const items = types.map((t) => mapLoadDoc(t, load));

  if (override) {
    return {
      status: 'override',
      items: items.map((i) => ({ ...i, status: i.status === 'missing' ? 'override' : i.status })),
      missingLabels: [],
      readyForBilling: true,
      readyForFactoring: true,
      readyForSettlement: true,
    };
  }

  const missing = items.filter(
    (i) =>
      (i.requiredForClose && i.status === 'missing') ||
      (i.requiredForFactoring && i.status === 'missing' && i.documentType !== 'BOL'),
  );

  const missingLabels = missing.map((m) => DOC_LABELS[m.documentType]);
  const complete = missing.length === 0 && load.operationalStatus === 'complete';

  return {
    status: complete ? 'complete' : 'incomplete',
    items,
    missingLabels,
    readyForBilling: complete && Boolean(load.podDocumentId),
    readyForFactoring: complete && Boolean(load.podDocumentId) && Boolean(load.rateConfirmationDocumentId || load.rateDetailsReviewed),
    readyForSettlement: complete && Boolean(load.podDocumentId),
  };
}

export function formatDocumentChecklistLine(item: FreightLoadDocumentRef): string {
  const label = DOC_LABELS[item.documentType];
  const status =
    item.status === 'received'
      ? 'RECEIVED'
      : item.status === 'not_required'
        ? 'NOT_REQUIRED'
        : item.status === 'override'
          ? 'OVERRIDE'
          : 'MISSING';
  return `${label.padEnd(12)} ${status}`;
}
