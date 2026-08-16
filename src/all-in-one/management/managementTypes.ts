/** Management intelligence layer — Sprint 17 (read/analysis only) */

export type ManagementPeriodId = 'today' | 'week' | 'month' | 'quarter' | 'year' | 'custom';

export type ManagementDateBasis = 'payment_date' | 'invoice_date' | 'service_completion' | 'created_at';

export type AttentionSeverity = 'info' | 'watch' | 'action' | 'urgent';

export type HealthState = 'on_track' | 'watch' | 'action_needed' | 'insufficient_data';

export type ReceivablesBucket = 'current' | '1_30' | '31_60' | '61_90' | '90_plus';

export interface ManagementDateRange {
  periodId: ManagementPeriodId;
  start: string;
  end: string;
  label: string;
  comparePrevious: boolean;
  previousStart?: string;
  previousEnd?: string;
}

export interface MetricValue {
  key: string;
  label: string;
  value: number | string | null;
  formatted: string;
  description?: string;
  drillDownHref?: string;
  unknown?: boolean;
  incomplete?: boolean;
}

export interface FinancialAllocation {
  collectedCashMinor: number;
  serviceFeesMinor: number;
  passThroughMinor: number;
  unallocatedMinor: number;
}

export interface FinancialSummary {
  serviceFeesInvoicedMinor: number;
  serviceFeesCollectedMinor: number;
  passThroughCollectedMinor: number;
  collectedCashMinor: number;
  outstandingServiceReceivablesMinor: number;
  totalOutstandingMinor: number;
  refundsMinor: number;
  discountsMinor: number;
  hasIncompleteAllocation: boolean;
  waterfall: {
    grossCustomerPaymentsMinor: number;
    passThroughMinor: number;
    refundsMinor: number;
    serviceFeesCollectedMinor: number;
  };
}

export interface ReceivablesAgingRow {
  bucket: ReceivablesBucket;
  label: string;
  count: number;
  balanceMinor: number;
  invoiceIds: string[];
}

export interface ManagementAttentionItem {
  id: string;
  dedupeKey: string;
  severity: AttentionSeverity;
  title: string;
  explanation: string;
  whyItMatters: string;
  recommendedAction: string;
  entityType?: string;
  entityId?: string;
  organizationId?: string;
  organizationName?: string;
  ownerLabel?: string;
  ageLabel?: string;
  ctaLabel: string;
  ctaHref: string;
}

export interface DataQualityIssue {
  ruleId: string;
  name: string;
  severity: AttentionSeverity;
  description: string;
  entityType: string;
  entityId: string;
  resolutionGuidance: string;
  ctaHref?: string;
}

export interface ReportDefinition {
  id: string;
  name: string;
  category: string;
  description: string;
  href: string;
  permission: string;
}

export interface SavedReportConfig {
  id: string;
  name: string;
  reportId: string;
  periodId: ManagementPeriodId;
  savedAt: string;
}

export interface ManagementPreferences {
  defaultPeriodId: ManagementPeriodId;
  pinnedReportIds: string[];
  financialDateBasis: ManagementDateBasis;
}

export interface PeriodComparison {
  current: number;
  previous: number | null;
  changePct: number | null;
  label: string;
}
