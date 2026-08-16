export interface WorkflowStep {
  id: string;
  label: string;
  customerLabel: string;
  boardColumn: string;
}

export interface WorkflowDefinition {
  division: string;
  steps: WorkflowStep[];
}

export const BOARD_COLUMNS = [
  'NEW REQUEST',
  'INFORMATION NEEDED',
  'DOCUMENTS NEEDED',
  'UNDER REVIEW',
  'IN PROGRESS',
  'SUBMITTED',
  'AWAITING EXTERNAL ACTION',
  'COMPLETE',
] as const;

export const workflowDefinitions: WorkflowDefinition[] = [
  {
    division: 'permitting',
    steps: [
      { id: 'new_request', label: 'New Request', customerLabel: 'Request received', boardColumn: 'NEW REQUEST' },
      { id: 'information_needed', label: 'Information Needed', customerLabel: 'Additional information needed', boardColumn: 'INFORMATION NEEDED' },
      { id: 'documents_needed', label: 'Documents Needed', customerLabel: 'Additional documents requested', boardColumn: 'DOCUMENTS NEEDED' },
      { id: 'under_review', label: 'Under Review', customerLabel: 'Under review by All In One', boardColumn: 'UNDER REVIEW' },
      { id: 'ready_to_submit', label: 'Ready to Submit', customerLabel: 'Preparing submission', boardColumn: 'IN PROGRESS' },
      { id: 'submitted', label: 'Submitted', customerLabel: 'Your request has been submitted for processing', boardColumn: 'SUBMITTED' },
      { id: 'awaiting_agency', label: 'Awaiting Agency', customerLabel: 'Awaiting agency review', boardColumn: 'AWAITING EXTERNAL ACTION' },
      { id: 'completed', label: 'Complete', customerLabel: 'Request complete', boardColumn: 'COMPLETE' },
    ],
  },
  {
    division: 'business-formation',
    steps: [
      { id: 'new_request', label: 'New Request', customerLabel: 'Request received', boardColumn: 'NEW REQUEST' },
      { id: 'information_needed', label: 'Information Needed', customerLabel: 'Additional information needed', boardColumn: 'INFORMATION NEEDED' },
      { id: 'name_review', label: 'Name Review', customerLabel: 'Business name under review', boardColumn: 'UNDER REVIEW' },
      { id: 'documents_needed', label: 'Documents Needed', customerLabel: 'Documents needed', boardColumn: 'DOCUMENTS NEEDED' },
      { id: 'filing_preparation', label: 'Filing Preparation', customerLabel: 'Filing being prepared', boardColumn: 'IN PROGRESS' },
      { id: 'submitted', label: 'Submitted', customerLabel: 'Submitted to state', boardColumn: 'SUBMITTED' },
      { id: 'awaiting_state', label: 'Awaiting State', customerLabel: 'Awaiting state processing', boardColumn: 'AWAITING EXTERNAL ACTION' },
      { id: 'completed', label: 'Complete', customerLabel: 'Formation assistance complete', boardColumn: 'COMPLETE' },
    ],
  },
  {
    division: 'insurance',
    steps: [
      { id: 'new_request', label: 'New Request', customerLabel: 'Insurance inquiry received', boardColumn: 'NEW REQUEST' },
      { id: 'information_needed', label: 'Information Needed', customerLabel: 'Additional information needed', boardColumn: 'INFORMATION NEEDED' },
      { id: 'documents_needed', label: 'Documents Needed', customerLabel: 'Documents needed for quote', boardColumn: 'DOCUMENTS NEEDED' },
      { id: 'quote_review', label: 'Quote Review', customerLabel: 'Quote information under review', boardColumn: 'UNDER REVIEW' },
      { id: 'submitted_to_partner', label: 'Submitted to Partner', customerLabel: 'Submitted for quote options', boardColumn: 'SUBMITTED' },
      { id: 'quotes_available', label: 'Quotes Available', customerLabel: 'Quote options available for review', boardColumn: 'IN PROGRESS' },
      { id: 'client_review', label: 'Client Review', customerLabel: 'Awaiting your review', boardColumn: 'AWAITING EXTERNAL ACTION' },
      { id: 'completed', label: 'Complete', customerLabel: 'Insurance review complete', boardColumn: 'COMPLETE' },
    ],
  },
  {
    division: 'dispatching',
    steps: [
      { id: 'onboarding', label: 'Onboarding', customerLabel: 'Dispatch onboarding', boardColumn: 'NEW REQUEST' },
      { id: 'carrier_ready', label: 'Carrier Ready', customerLabel: 'Carrier setup in progress', boardColumn: 'IN PROGRESS' },
      { id: 'load_search', label: 'Load Search', customerLabel: 'Searching for loads', boardColumn: 'IN PROGRESS' },
      { id: 'booked', label: 'Booked', customerLabel: 'Load booked', boardColumn: 'IN PROGRESS' },
      { id: 'in_transit', label: 'In Transit', customerLabel: 'Load in transit', boardColumn: 'IN PROGRESS' },
      { id: 'delivered', label: 'Delivered', customerLabel: 'Load delivered', boardColumn: 'COMPLETE' },
      { id: 'closed', label: 'Closed', customerLabel: 'Load closed', boardColumn: 'COMPLETE' },
    ],
  },
  {
    division: 'factoring',
    steps: [
      { id: 'inquiry', label: 'Inquiry', customerLabel: 'Factoring inquiry received', boardColumn: 'NEW REQUEST' },
      { id: 'information_needed', label: 'Information Needed', customerLabel: 'Additional information needed', boardColumn: 'INFORMATION NEEDED' },
      { id: 'invoice_review', label: 'Invoice Review', customerLabel: 'Invoice under review', boardColumn: 'UNDER REVIEW' },
      { id: 'documents_needed', label: 'Documents Needed', customerLabel: 'Documents needed', boardColumn: 'DOCUMENTS NEEDED' },
      { id: 'partner_review', label: 'Partner Review', customerLabel: 'Partner review in progress', boardColumn: 'SUBMITTED' },
      { id: 'approved', label: 'Approved', customerLabel: 'Review complete — subject to partner terms', boardColumn: 'AWAITING EXTERNAL ACTION' },
      { id: 'funded', label: 'Funded', customerLabel: 'Demo funding status updated', boardColumn: 'COMPLETE' },
      { id: 'closed', label: 'Closed', customerLabel: 'Factoring case closed', boardColumn: 'COMPLETE' },
    ],
  },
  {
    division: 'brokerage',
    steps: [
      { id: 'quote_requested', label: 'Quote Requested', customerLabel: 'Quote request received', boardColumn: 'NEW REQUEST' },
      { id: 'reviewing', label: 'Reviewing', customerLabel: 'Quote under review', boardColumn: 'UNDER REVIEW' },
      { id: 'quote_prepared', label: 'Quote Prepared', customerLabel: 'Quote prepared', boardColumn: 'IN PROGRESS' },
      { id: 'awaiting_shipper', label: 'Awaiting Shipper', customerLabel: 'Awaiting your approval', boardColumn: 'AWAITING EXTERNAL ACTION' },
      { id: 'booked', label: 'Booked', customerLabel: 'Shipment booked', boardColumn: 'IN PROGRESS' },
      { id: 'in_transit', label: 'In Transit', customerLabel: 'Shipment in transit', boardColumn: 'IN PROGRESS' },
      { id: 'delivered', label: 'Delivered', customerLabel: 'Shipment delivered', boardColumn: 'COMPLETE' },
      { id: 'closed', label: 'Closed', customerLabel: 'Shipment closed', boardColumn: 'COMPLETE' },
    ],
  },
];

const defaultWorkflow = workflowDefinitions[0];

export function getWorkflowForDivision(division: string): WorkflowDefinition {
  return workflowDefinitions.find((w) => w.division === division) ?? defaultWorkflow;
}

export function statusLabelForStep(stepId: string): string {
  for (const wf of workflowDefinitions) {
    const step = wf.steps.find((s) => s.id === stepId);
    if (step) return step.label;
  }
  return stepId.replace(/_/g, ' ');
}

export function buildCustomerTimeline(division: string, currentStepId: string) {
  const wf = getWorkflowForDivision(division);
  const idx = wf.steps.findIndex((s) => s.id === currentStepId);
  const milestones = [
    { id: 'received', label: 'Request Received' },
    { id: 'review', label: 'Initial Review' },
    { id: 'docs', label: 'Documents' },
    { id: 'processing', label: 'Processing' },
    { id: 'complete', label: 'Complete' },
  ];
  const current = Math.min(Math.max(idx, 1), milestones.length - 1);
  return milestones.map((m, i) => ({
    ...m,
    status: (i < current ? 'completed' : i === current ? 'current' : 'upcoming') as 'completed' | 'current' | 'upcoming',
  }));
}

export function boardColumnForStep(division: string, stepId: string): string {
  const wf = getWorkflowForDivision(division);
  return wf.steps.find((s) => s.id === stepId)?.boardColumn ?? 'UNDER REVIEW';
}
