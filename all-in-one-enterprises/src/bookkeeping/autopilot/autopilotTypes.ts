/** Bookkeeping Autopilot — Refinement 04A domain types */

export type ClassificationConfidence = 'VERY_HIGH' | 'HIGH' | 'MEDIUM' | 'LOW' | 'UNCLASSIFIED';

export type ClassificationSource =
  | 'MERCHANT_RULE'
  | 'CUSTOMER_RULE'
  | 'ORGANIZATION_RULE'
  | 'HISTORICAL_MATCH'
  | 'TRANSACTION_PATTERN'
  | 'DOCUMENT_MATCH'
  | 'LOAD_MATCH'
  | 'TRUCK_MATCH'
  | 'PROVIDER_CATEGORY'
  | 'MODEL_SUGGESTION'
  | 'STAFF_OVERRIDE'
  | 'CUSTOMER_CONFIRMATION';

export type TransactionReviewState =
  | 'AUTO_APPROVABLE'
  | 'REVIEW_REQUIRED'
  | 'CUSTOMER_CLARIFICATION'
  | 'STAFF_APPROVAL_REQUIRED';

export type TransactionStatus = 'pending' | 'classified' | 'posted' | 'excluded' | 'removed';

export type FinancialConnectionStatus =
  | 'PENDING'
  | 'CONNECTED'
  | 'SYNCING'
  | 'ACTION_REQUIRED'
  | 'DEGRADED'
  | 'DISCONNECTED'
  | 'ERROR';

export type ReconciliationStatus =
  | 'NOT_STARTED'
  | 'IN_PROGRESS'
  | 'MATCHED'
  | 'DIFFERENCE_FOUND'
  | 'REVIEW_REQUIRED'
  | 'APPROVED'
  | 'CLOSED';

export type AutopilotPeriodStatus =
  | 'OPEN'
  | 'RUNNING'
  | 'WAITING_FOR_DATA'
  | 'WAITING_FOR_CUSTOMER'
  | 'EXCEPTIONS_FOUND'
  | 'READY_FOR_REVIEW'
  | 'READY_TO_CLOSE'
  | 'CLOSED'
  | 'ERROR';

export type ExceptionType =
  | 'UNKNOWN_CATEGORY'
  | 'LOW_CONFIDENCE_CATEGORY'
  | 'UNKNOWN_TRUCK'
  | 'UNKNOWN_LOAD'
  | 'MISSING_RECEIPT'
  | 'DOCUMENT_MISMATCH'
  | 'RECONCILIATION_DIFFERENCE'
  | 'FACTORING_DIFFERENCE'
  | 'DUPLICATE_CANDIDATE'
  | 'AR_MATCH_ISSUE'
  | 'AP_DUPLICATE'
  | 'CUSTOMER_CLARIFICATION'
  | 'ACCOUNT_CONNECTION_ERROR'
  | 'OTHER';

export type ExceptionPriority = 'CRITICAL' | 'HIGH' | 'NORMAL' | 'LOW';

export type DocumentMatchResult = 'MATCHED' | 'LIKELY_MATCH' | 'MULTIPLE_CANDIDATES' | 'NO_MATCH' | 'REVIEW_REQUIRED';

export type DataProvenance =
  | 'BANK_FEED'
  | 'CUSTOMER_UPLOAD'
  | 'ACCOUNTING_PLATFORM'
  | 'AIO_DISPATCH'
  | 'AIO_BILLING'
  | 'FACTORING_PROVIDER'
  | 'PAYROLL_PROVIDER'
  | 'STAFF_ENTRY'
  | 'CUSTOMER_CONFIRMATION';

export interface FinancialConnection {
  id: string;
  organizationId: string;
  provider: 'demo' | 'plaid' | 'manual';
  providerItemReference?: string;
  institutionName: string;
  status: FinancialConnectionStatus;
  lastSuccessfulSyncAt?: string;
  lastAttemptedSyncAt?: string;
  requiresCustomerAction: boolean;
  errorCode?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FinancialAccount {
  id: string;
  connectionId: string;
  organizationId: string;
  providerAccountReference?: string;
  accountName: string;
  accountMask?: string;
  accountType: string;
  accountSubtype?: string;
  currency: string;
  active: boolean;
  bookkeepingEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BookkeepingTransaction {
  id: string;
  organizationId: string;
  financialAccountId: string;
  providerTransactionReference?: string;
  transactionDate: string;
  postedDate?: string;
  amountMinor: number;
  direction: 'debit' | 'credit';
  merchantName?: string;
  providerDescription?: string;
  normalizedDescription?: string;
  category?: string;
  subcategory?: string;
  classificationSource?: ClassificationSource;
  classificationConfidence?: ClassificationConfidence;
  classificationReason?: string;
  truckId?: string;
  driverId?: string;
  loadId?: string;
  receiptId?: string;
  status: TransactionStatus;
  reviewState: TransactionReviewState;
  periodId?: string;
  provenance: DataProvenance;
  createdAt: string;
  updatedAt: string;
}

export interface BookkeepingPeriod {
  id: string;
  subscriptionId: string;
  organizationId: string;
  periodStart: string;
  periodEnd: string;
  label: string;
  status: AutopilotPeriodStatus;
  transactionCount: number;
  autoClassifiedCount: number;
  reviewCount: number;
  reconciliationStatus: ReconciliationStatus;
  reportStatus: 'DRAFT' | 'GENERATED' | 'REVIEW_REQUIRED' | 'APPROVED' | 'DELIVERED';
  autopilotCoveragePct?: number;
  openedAt: string;
  readyToCloseAt?: string;
  closedAt?: string;
}

export interface BookkeepingException {
  id: string;
  organizationId: string;
  periodId: string;
  type: ExceptionType;
  priority: ExceptionPriority;
  title: string;
  explanation: string;
  transactionId?: string;
  documentId?: string;
  status: 'open' | 'resolved' | 'escalated';
  createdAt: string;
  updatedAt: string;
}

export interface CustomerClarification {
  id: string;
  organizationId: string;
  periodId: string;
  transactionId: string;
  merchantLabel: string;
  amountMinor: number;
  transactionDate: string;
  question: string;
  options: string[];
  answer?: string;
  truckAnswer?: string;
  status: 'pending' | 'answered' | 'staff_review';
  createdAt: string;
  updatedAt: string;
}

export interface ClassificationAuditEntry {
  transactionId: string;
  originalCategory?: string;
  suggestedCategory: string;
  finalCategory?: string;
  source: ClassificationSource;
  confidence: ClassificationConfidence;
  ruleReference?: string;
  actor?: string;
  timestamp: string;
}

export interface AutopilotClientSummary {
  organizationId: string;
  companyName: string;
  plan: string;
  currentPeriodLabel: string;
  autopilotStatus: AutopilotPeriodStatus;
  autopilotCoveragePct: number;
  autoClassifiedCount: number;
  needsReviewCount: number;
  waitingOnCustomerCount: number;
  reconciliationStatus: ReconciliationStatus;
  reportStatus: string;
}

export interface AutopilotDashboardMetrics {
  activeClients: number;
  readyToClose: number;
  waitingOnCustomer: number;
  exceptionsFound: number;
  autoClassifiedTotal: number;
  reviewRequiredTotal: number;
}
