/** Bookkeeping service configuration — Refinement 04 */

export const DEMO_BOOKKEEPING_LABEL =
  'Demo environment — bookkeeping workflows and pricing are illustrative. All In One is not a CPA firm, tax preparer, payroll processor, bank, or factor.';

export const BOOKKEEPING_SERVICE_SLUG = 'bookkeeping';
export const BOOKS_RESCUE_SERVICE_SLUG = 'books-rescue';

export const BOOKKEEPING_DISCLOSURES = [
  'Bookkeeping services do not constitute legal advice.',
  'Bookkeeping services do not automatically include income-tax return preparation.',
  'Bookkeeping services do not imply CPA, audit, or attestation services unless separately provided by an appropriately qualified professional.',
  'IFTA bookkeeping support does not automatically include IFTA filing unless the applicable All In One filing service has been separately selected.',
  'Payroll bookkeeping/reconciliation does not make All In One the payroll processor.',
  'Factoring reconciliation does not make All In One the factor.',
  'Financial reports prepared through bookkeeping are not audited or certified financial statements unless explicitly stated.',
  'Do not submit bank passwords, credit-card login passwords, or accounting software passwords through All In One forms or messages.',
] as const;

export const BOOKKEEPING_FAQ = [
  {
    question: 'What makes trucking bookkeeping different?',
    answer:
      'Trucking businesses have expense and revenue categories that generic bookkeeping often misses — fuel, tolls, permits, factoring fees, dispatch fees, truck payments, driver settlements, and load revenue. All In One organizes books around how carriers actually operate.',
  },
  {
    question: 'Which plan is right for me?',
    answer:
      'Use Get My Recommendation for a transparent tier suggestion based on your trucks, accounts, transaction volume, and operational needs. Essentials fits very small operations; Plus adds deeper reporting and reconciliation; All In One Bookkeeping is the full back-office package.',
  },
  {
    question: 'Why does pricing say "starting at"?',
    answer:
      'Final pricing can depend on operational complexity — trucks, accounts, transaction volume, factoring, driver settlements, A/R, A/P, payroll reconciliation, and cleanup backlog. We confirm pricing before service begins.',
  },
  {
    question: 'What if my books are behind?',
    answer:
      'Books Rescue is a one-time cleanup service starting at $499 (also "starting at") to get historical books current before recurring bookkeeping begins. Your assessment may recommend Books Rescue first.',
  },
  {
    question: 'Does bookkeeping include tax preparation?',
    answer:
      'No. Bookkeeping Plus and All In One Bookkeeping include tax-preparer handoff support and 1099 preparation support — organizing data for your CPA or tax preparer — but do not include filing income tax returns unless a separate service is selected.',
  },
  {
    question: 'Does bookkeeping include IFTA filing?',
    answer:
      'IFTA bookkeeping support helps organize fuel and mileage records for reporting. Actual IFTA filing is a separate All In One compliance service if you need government filing assistance.',
  },
  {
    question: 'Can you work with my accountant or tax preparer?',
    answer:
      'Yes. Plus and All In One plans include year-end packages and handoff materials designed for your CPA or tax preparer.',
  },
  {
    question: 'Do you support factoring reconciliation?',
    answer:
      'Bookkeeping Plus and All In One Bookkeeping include factoring statement reconciliation when you use factoring — without All In One acting as your factor.',
  },
  {
    question: 'Can you show profitability by truck?',
    answer:
      'Truck-by-truck profitability reporting is included in All In One Bookkeeping. Allocations are staff-reviewed; unknown expenses remain unassigned until reviewed.',
  },
  {
    question: 'What accounting software can you work with?',
    answer:
      'We capture your current system during onboarding — QuickBooks Online, QuickBooks Desktop, Xero, Wave, spreadsheets, or other. Direct integrations are added when approved; staff-managed uploads are supported now.',
  },
  {
    question: 'Do I have to give you my bank password?',
    answer:
      'No. Never submit online banking or accounting passwords through All In One. Use secure document uploads or approved connection methods when available.',
  },
] as const;

export const BOOKKEEPING_DOCUMENT_CATEGORIES = [
  'Bank Statements',
  'Credit Card Statements',
  'Loan Statements',
  'Factoring Statements',
  'Fuel Reports',
  'Maintenance Receipts',
  'Truck Purchase/Lease Documents',
  'Insurance Statements',
  'Driver/Contractor Payment Records',
  'Invoices',
  'Settlement Statements',
  '1099 Information',
  'Prior Financial Statements',
  'Tax Preparer Requests',
] as const;

export const ACCOUNTING_SOFTWARE_OPTIONS = [
  'QuickBooks Online',
  'QuickBooks Desktop',
  'Xero',
  'Wave',
  'Spreadsheet',
  'None',
  'Other',
] as const;

/** Configurable recommendation thresholds — adjust without UI changes */
export const BOOKKEEPING_RECOMMENDATION_THRESHOLDS = {
  booksRescueBehind: ['3_6_months', '7_12_months', 'more_than_12'] as const,
  customReviewTruckCount: 8,
  customReviewBankAccounts: 5,
  customReviewCreditCards: 5,
  customReviewTransactionBand: '400_plus' as const,
  essentialsMaxTrucks: 2,
  plusMaxTrucks: 5,
};

export const BOOKKEEPING_CUSTOMER_STATUS_LABELS: Record<string, string> = {
  onboarding: 'Getting Started',
  documents_requested: 'Waiting On You',
  waiting_on_customer: 'Waiting On You',
  transactions_categorized: 'Books In Progress',
  reconciliation: 'Books In Progress',
  staff_review: 'Under Review',
  questions_for_customer: 'Waiting On You',
  reports_prepared: 'Reports Ready',
  reports_delivered: 'Reports Ready',
  period_complete: 'Complete For This Period',
  paused: 'Paused',
  active: 'Books In Progress',
};

export const BOOKKEEPING_ASSESSMENT_STORAGE_KEY = 'aio_bookkeeping_assessment_v1';
export const BOOKKEEPING_RECOMMENDATION_STORAGE_KEY = 'aio_bookkeeping_recommendation_v1';
