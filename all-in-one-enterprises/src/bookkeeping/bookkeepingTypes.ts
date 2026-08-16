/** Trucking bookkeeping service types — Refinement 04 */

export type BookkeepingPlanId = 'ESSENTIALS' | 'PLUS' | 'ALL_IN_ONE';

export type BookkeepingBillingInterval = 'MONTHLY' | 'ANNUAL';

export type BooksRescueStatus =
  | 'assessment'
  | 'quoted'
  | 'pending_payment'
  | 'in_progress'
  | 'complete'
  | 'cancelled';

export type BookkeepingSubscriptionStatus =
  | 'recommended'
  | 'quoted'
  | 'pending_approval'
  | 'pending_payment'
  | 'onboarding'
  | 'active'
  | 'paused'
  | 'past_due'
  | 'cancel_pending'
  | 'cancelled'
  | 'completed'
  | 'blocked';

export type BookkeepingCycleStatus =
  | 'period_open'
  | 'documents_requested'
  | 'waiting_on_customer'
  | 'documents_received'
  | 'transactions_categorized'
  | 'reconciliation'
  | 'staff_review'
  | 'questions_for_customer'
  | 'reports_prepared'
  | 'reports_delivered'
  | 'period_complete';

export type BooksCurrentness =
  | 'current'
  | '1_2_months'
  | '3_6_months'
  | '7_12_months'
  | 'more_than_12'
  | 'not_sure';

export type DriverStructure = 'none' | 'company_drivers' | 'contractors' | 'both';

export type MonthlyTransactionBand = 'under_50' | '50_150' | '150_400' | '400_plus';

export interface BookkeepingComplexityProfile {
  truckCount: number;
  bankAccountCount: number;
  creditCardCount: number;
  monthlyTransactionBand: MonthlyTransactionBand;
  factoringUsed: boolean;
  driverStructure: DriverStructure;
  needsDriverSettlements: boolean;
  needsAr: boolean;
  needsAp: boolean;
  needsPayrollReconciliation: boolean;
  needsIftaSupport: boolean;
  needsTruckProfitability: boolean;
  wantsMonthlyReview: boolean;
  booksCurrentness: BooksCurrentness;
  notes?: string;
}

export interface BookkeepingAssessmentAnswers extends BookkeepingComplexityProfile {
  completedAt?: string;
}

export type BookkeepingRecommendationKind = 'plan' | 'books_rescue_first' | 'custom_review';

export interface BookkeepingRecommendationResult {
  kind: BookkeepingRecommendationKind;
  recommendedPlan: BookkeepingPlanId;
  billingInterval: BookkeepingBillingInterval;
  booksRescueRequired: boolean;
  customReviewRequired: boolean;
  reasons: string[];
  rescueReasons?: string[];
  afterRescuePlan?: BookkeepingPlanId;
}

export interface BookkeepingSubscription {
  id: string;
  organizationId: string;
  customerId?: string;
  plan: BookkeepingPlanId;
  billingInterval: BookkeepingBillingInterval;
  basePriceMinor: number;
  finalPriceMinor?: number;
  currency: 'USD';
  status: BookkeepingSubscriptionStatus;
  startedAt?: string;
  renewalDate?: string;
  cancelAt?: string;
  booksRescueRequired: boolean;
  booksRescueStatus?: BooksRescueStatus;
  complexityProfile?: BookkeepingComplexityProfile;
  assignedStaffId?: string;
  reviewerStaffId?: string;
  currentPeriodLabel?: string;
  cycleStatus?: BookkeepingCycleStatus;
  customerStatusLabel?: string;
  latestReportAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BookkeepingCycle {
  id: string;
  subscriptionId: string;
  organizationId: string;
  periodLabel: string;
  status: BookkeepingCycleStatus;
  dueDate?: string;
  reportsDeliveredAt?: string;
  assignedStaffId?: string;
}

export interface BookkeepingReport {
  id: string;
  organizationId: string;
  subscriptionId: string;
  periodLabel: string;
  reportType: 'profit_loss' | 'balance_sheet' | 'cash_flow' | 'snapshot' | 'fleet_profitability' | 'truck_profitability' | 'year_end';
  plan: BookkeepingPlanId;
  preparedFor: string;
  generatedAt: string;
  documentId?: string;
  status: 'draft' | 'delivered';
}

export interface BooksRescueEngagement {
  id: string;
  organizationId: string;
  status: BooksRescueStatus;
  monthsBehind?: string;
  accountCount?: number;
  transactionComplexity?: MonthlyTransactionBand;
  accountingSoftware?: string;
  quoteMinor?: number;
  recommendedPlanAfter?: BookkeepingPlanId;
  assignedStaffId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BookkeepingLead {
  id: string;
  organizationId?: string;
  contactName?: string;
  contactEmail?: string;
  assessment?: BookkeepingAssessmentAnswers;
  recommendation?: BookkeepingRecommendationResult;
  status: 'new' | 'assessment_complete' | 'pricing_review' | 'quoted' | 'converted' | 'closed';
  createdAt: string;
  updatedAt: string;
}

export interface BookkeepingCounters {
  activeSubscriptions: number;
  onboarding: number;
  booksRescue: number;
  pricingReview: number;
  overdueCycles: number;
  leads: number;
}
