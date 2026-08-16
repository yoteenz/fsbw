import type { FactoringInvoiceStatus } from '../services/factoring/factoringTypes';

export const mockFactoringMetrics = {
  availableForFactoring: 12750,
  inReview: 4200,
  fundedThisWeek: 8550,
  outstandingReceivables: 23400,
};

export const mockFactoringDashboardCard = {
  eligibleForFactoring: 12750,
  inReview: 4200,
};

export interface MockFactoringInvoice {
  id: string;
  loadNumber: string;
  debtor: string;
  invoiceAmount: number;
  deliveryDate: string;
  eligibility: FactoringInvoiceStatus;
  status: FactoringInvoiceStatus;
  estimatedProceeds: number;
  sampleFactoringFee: number;
  sampleNetProceeds: number;
  debtorEligibility?: 'approved' | 'review_required' | 'not_approved' | 'credit_limit_reached';
}

export const mockFactoringInvoices: MockFactoringInvoice[] = [
  {
    id: 'inv-2047',
    loadNumber: '2047',
    debtor: 'Summit Freight LLC',
    invoiceAmount: 3100,
    deliveryDate: 'Mar 10, 2026',
    eligibility: 'eligible',
    status: 'not_submitted',
    estimatedProceeds: 2945,
    sampleFactoringFee: 155,
    sampleNetProceeds: 2945,
    debtorEligibility: 'approved',
  },
  {
    id: 'inv-2039',
    loadNumber: '2039',
    debtor: 'Atlas Logistics Group',
    invoiceAmount: 4200,
    deliveryDate: 'Mar 08, 2026',
    eligibility: 'eligible',
    status: 'verification',
    estimatedProceeds: 3990,
    sampleFactoringFee: 210,
    sampleNetProceeds: 3990,
    debtorEligibility: 'review_required',
  },
  {
    id: 'inv-2031',
    loadNumber: '2031',
    debtor: 'Midwest Carrier Partners',
    invoiceAmount: 2850,
    deliveryDate: 'Mar 05, 2026',
    eligibility: 'eligible',
    status: 'funded',
    estimatedProceeds: 2708,
    sampleFactoringFee: 142,
    sampleNetProceeds: 2708,
    debtorEligibility: 'approved',
  },
  {
    id: 'inv-2024',
    loadNumber: '2024',
    debtor: 'QuickHaul Brokerage',
    invoiceAmount: 1950,
    deliveryDate: 'Mar 02, 2026',
    eligibility: 'not_eligible',
    status: 'not_eligible',
    estimatedProceeds: 0,
    sampleFactoringFee: 0,
    sampleNetProceeds: 0,
    debtorEligibility: 'not_approved',
  },
  {
    id: 'inv-2018',
    loadNumber: '2018',
    debtor: 'Summit Freight LLC',
    invoiceAmount: 3600,
    deliveryDate: 'Feb 28, 2026',
    eligibility: 'eligible',
    status: 'submitted',
    estimatedProceeds: 3420,
    sampleFactoringFee: 180,
    sampleNetProceeds: 3420,
    debtorEligibility: 'approved',
  },
];

export const mockFactoringHistory = [
  {
    id: 'fh-1',
    invoice: 'INV-2031',
    originalAmount: 2850,
    fee: 142,
    netFunded: 2708,
    fundedDate: 'Mar 06, 2026',
    debtor: 'Midwest Carrier Partners',
    status: 'funded' as FactoringInvoiceStatus,
  },
  {
    id: 'fh-2',
    invoice: 'INV-2012',
    originalAmount: 2400,
    fee: 120,
    netFunded: 2280,
    fundedDate: 'Feb 22, 2026',
    debtor: 'Summit Freight LLC',
    status: 'funded' as FactoringInvoiceStatus,
  },
  {
    id: 'fh-3',
    invoice: 'INV-2004',
    originalAmount: 1750,
    fee: 88,
    netFunded: 1662,
    fundedDate: 'Feb 14, 2026',
    debtor: 'Atlas Logistics Group',
    status: 'closed' as FactoringInvoiceStatus,
  },
];

export const mockFactoringStatements = [
  { id: 'stmt-1', period: 'February 2026', label: 'February 2026 Statement' },
  { id: 'stmt-2', period: 'January 2026', label: 'January 2026 Statement' },
];

export const mockFactoringWorkflowDocuments = [
  { id: 'rate-conf', label: 'Rate Confirmation', onFile: true },
  { id: 'invoice', label: 'Invoice', onFile: true },
  { id: 'pod', label: 'Proof of Delivery', onFile: true },
  { id: 'carrier-info', label: 'Carrier Information', onFile: true },
];

export const mockFactoringHowItWorks = [
  { step: '01', title: 'DELIVER', subtitle: 'Complete the load.' },
  { step: '02', title: 'SUBMIT', subtitle: 'Upload the required invoice documents.' },
  { step: '03', title: 'REVIEW', subtitle: 'The invoice and debtor are reviewed for factoring eligibility.' },
  { step: '04', title: 'FUND', subtitle: 'If approved, funding is processed according to the applicable factoring agreement.' },
];

export const mockFactoringDocumentFlow = [
  'Load Completed',
  'POD Uploaded',
  'Invoice Generated',
  'Eligible for Factoring',
  'Submit for Review',
  'Verification',
  'Approved',
  'Funded',
];

export const mockOperateGrowSteps = [
  { step: 'DISPATCH', title: 'DISPATCH', subtitle: 'Find and coordinate freight.' },
  { step: 'FACTOR', title: 'FACTOR', subtitle: 'Turn eligible invoices into faster working capital.' },
  { step: 'SCALE', title: 'SCALE', subtitle: 'Grow the fleet and business operations.' },
];

export const FACTORING_STATUS_LABELS: Record<FactoringInvoiceStatus, string> = {
  eligible: 'Eligible',
  not_eligible: 'Not Eligible',
  not_submitted: 'Not Submitted',
  submitted: 'Submitted',
  verification: 'Verification',
  additional_documents_required: 'Docs Required',
  approved: 'Approved',
  funding_processing: 'Funding Processing',
  funded: 'Funded',
  rejected: 'Rejected',
  closed: 'Closed',
};

export const mockFactoringReviewInvoice = mockFactoringInvoices[0];
