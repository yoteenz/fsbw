import { dollarsToMinor } from '../billing/money';
import type { BookkeepingBillingInterval, BookkeepingPlanId } from './bookkeepingTypes';

export interface BookkeepingPlanFeatureRow {
  id: string;
  label: string;
  essentials: boolean | 'partial';
  plus: boolean | 'partial';
  allInOne: boolean | 'partial';
}

export interface BookkeepingPlanConfig {
  id: BookkeepingPlanId;
  slug: string;
  name: string;
  tagline: string;
  bestFor: string;
  monthlyStartingPriceMinor: number;
  annualStartingPriceMinor: number;
  highlight?: 'most_complete';
  features: string[];
}

export const BOOKKEEPING_TRUCKING_CATEGORIES = [
  'Fuel',
  'Repairs & Maintenance',
  'Insurance',
  'Permits & Registration',
  'Factoring Fees',
  'Dispatch Fees',
  'Truck Payments',
  'Driver Expenses',
  'Tolls & Parking',
  'Load Revenue',
  'Lumper Fees',
  'Scale Tickets',
  'ELD',
  'Load Boards',
] as const;

export const BOOKS_RESCUE_STARTING_PRICE_MINOR = dollarsToMinor(749);

export const BOOKKEEPING_PLANS: Record<BookkeepingPlanId, BookkeepingPlanConfig> = {
  ESSENTIALS: {
    id: 'ESSENTIALS',
    slug: 'bookkeeping-essentials',
    name: 'Bookkeeping Essentials',
    tagline: 'Clean monthly books for owner-operators and very small carriers.',
    bestFor: 'Owner-operators and very small carriers who need clean, organized monthly books.',
    monthlyStartingPriceMinor: dollarsToMinor(249),
    annualStartingPriceMinor: dollarsToMinor(2490),
    features: [
      'Monthly bookkeeping',
      'Transaction categorization',
      'Bank reconciliation',
      'Credit-card reconciliation',
      'Trucking-specific chart of accounts',
      'Monthly Profit & Loss statement',
      'Monthly financial snapshot',
      'Year-to-date bookkeeping visibility',
      'Receipt/document organization',
      'Basic fuel/toll expense tracking',
      'Basic truck/maintenance expense tracking',
      'Secure document storage',
      'Customer Portal access',
      'Document request workflow',
      'Bookkeeping status tracking',
      'Messaging/support through the platform',
    ],
  },
  PLUS: {
    id: 'PLUS',
    slug: 'bookkeeping-plus',
    name: 'Bookkeeping Plus',
    tagline: 'Deeper reconciliation, reporting, and operational financial visibility.',
    bestFor: 'Growing trucking businesses that need deeper reconciliation, reporting, and operational financial visibility.',
    monthlyStartingPriceMinor: dollarsToMinor(449),
    annualStartingPriceMinor: dollarsToMinor(4490),
    features: [
      'Everything in Essentials',
      'Balance Sheet',
      'Cash Flow Statement',
      'Factoring reconciliation',
      'Loan/equipment payment tracking',
      'Contractor/driver payment tracking',
      'Advanced fuel/toll tracking',
      'Advanced truck/maintenance tracking',
      'Load/revenue reconciliation',
      'IFTA bookkeeping support',
      'Quarterly financial review',
      '1099 preparation support',
      'CPA/tax-preparer handoff package',
      'Year-to-date financial package',
      'Enhanced document organization',
      'Financial issue follow-up',
      'Quarterly account review',
    ],
  },
  ALL_IN_ONE: {
    id: 'ALL_IN_ONE',
    slug: 'all-in-one-bookkeeping',
    name: 'All In One Bookkeeping',
    tagline: 'Your bookkeeping back office — fleet-level and truck-level visibility.',
    bestFor: 'Fleet owners and trucking businesses that want All In One functioning as their bookkeeping back office.',
    monthlyStartingPriceMinor: dollarsToMinor(749),
    annualStartingPriceMinor: dollarsToMinor(7490),
    highlight: 'most_complete',
    features: [
      'Everything in Essentials and Plus',
      'Accounts Receivable tracking',
      'Accounts Payable tracking',
      'Invoice reconciliation',
      'Driver settlement bookkeeping',
      'Payroll bookkeeping/reconciliation',
      'Fleet-level profitability reporting',
      'Truck-by-truck profitability reporting',
      'Advanced financial dashboard',
      'Monthly financial review meeting',
      'Year-end books cleanup/close',
      'Priority bookkeeping support',
      'Enhanced reconciliation review',
      'Recurring financial health review',
      'Advanced reporting package',
      'Tax-preparer-ready year-end handoff',
    ],
  },
};

export const BOOKKEEPING_PLAN_ORDER: BookkeepingPlanId[] = ['ESSENTIALS', 'PLUS', 'ALL_IN_ONE'];

export const BOOKKEEPING_FEATURE_MATRIX: BookkeepingPlanFeatureRow[] = [
  { id: 'monthly', label: 'Monthly Bookkeeping', essentials: true, plus: true, allInOne: true },
  { id: 'categorization', label: 'Transaction Categorization', essentials: true, plus: true, allInOne: true },
  { id: 'bank_recon', label: 'Bank Reconciliation', essentials: true, plus: true, allInOne: true },
  { id: 'cc_recon', label: 'Credit Card Reconciliation', essentials: true, plus: true, allInOne: true },
  { id: 'coa', label: 'Trucking-Specific Chart of Accounts', essentials: true, plus: true, allInOne: true },
  { id: 'pnl', label: 'Monthly P&L', essentials: true, plus: true, allInOne: true },
  { id: 'balance_sheet', label: 'Balance Sheet', essentials: false, plus: true, allInOne: true },
  { id: 'cash_flow', label: 'Cash Flow Statement', essentials: false, plus: true, allInOne: true },
  { id: 'docs', label: 'Document Organization', essentials: true, plus: true, allInOne: true },
  { id: 'fuel_toll', label: 'Fuel/Toll Tracking', essentials: 'partial', plus: true, allInOne: true },
  { id: 'maintenance', label: 'Maintenance Expense Tracking', essentials: 'partial', plus: true, allInOne: true },
  { id: 'loan_equipment', label: 'Loan/Equipment Tracking', essentials: false, plus: true, allInOne: true },
  { id: 'contractor', label: 'Contractor/Driver Payment Tracking', essentials: false, plus: true, allInOne: true },
  { id: 'factoring', label: 'Factoring Reconciliation', essentials: false, plus: true, allInOne: true },
  { id: 'load_revenue', label: 'Load/Revenue Reconciliation', essentials: false, plus: true, allInOne: true },
  { id: 'ifta', label: 'IFTA Bookkeeping Support', essentials: false, plus: true, allInOne: true },
  { id: 'quarterly_review', label: 'Quarterly Financial Review', essentials: false, plus: true, allInOne: true },
  { id: '1099', label: '1099 Preparation Support', essentials: false, plus: true, allInOne: true },
  { id: 'cpa_handoff', label: 'CPA/Tax-Preparer Handoff', essentials: false, plus: true, allInOne: true },
  { id: 'ar', label: 'Accounts Receivable', essentials: false, plus: false, allInOne: true },
  { id: 'ap', label: 'Accounts Payable', essentials: false, plus: false, allInOne: true },
  { id: 'invoice_recon', label: 'Invoice Reconciliation', essentials: false, plus: false, allInOne: true },
  { id: 'driver_settlements', label: 'Driver Settlements', essentials: false, plus: false, allInOne: true },
  { id: 'payroll_recon', label: 'Payroll Bookkeeping/Reconciliation', essentials: false, plus: false, allInOne: true },
  { id: 'fleet_profit', label: 'Fleet Profitability', essentials: false, plus: false, allInOne: true },
  { id: 'truck_profit', label: 'Truck-by-Truck Profitability', essentials: false, plus: false, allInOne: true },
  { id: 'dashboard', label: 'Advanced Financial Dashboard', essentials: false, plus: false, allInOne: true },
  { id: 'monthly_review', label: 'Monthly Financial Review', essentials: false, plus: false, allInOne: true },
  { id: 'year_end', label: 'Year-End Close/Cleanup', essentials: false, plus: false, allInOne: true },
  { id: 'priority', label: 'Priority Support', essentials: false, plus: false, allInOne: true },
];

export function planStartingPriceMinor(planId: BookkeepingPlanId, interval: BookkeepingBillingInterval): number {
  const plan = BOOKKEEPING_PLANS[planId];
  return interval === 'ANNUAL' ? plan.annualStartingPriceMinor : plan.monthlyStartingPriceMinor;
}

export function annualSavingsLabel(planId: BookkeepingPlanId): string {
  const plan = BOOKKEEPING_PLANS[planId];
  const monthlyTotal = plan.monthlyStartingPriceMinor * 12;
  const savedMonths = Math.round((monthlyTotal - plan.annualStartingPriceMinor) / plan.monthlyStartingPriceMinor);
  if (savedMonths >= 2) return 'Save approx. 2 months';
  if (savedMonths === 1) return 'Save approx. 1 month';
  return 'Billed annually';
}

export function planIncludesFeature(planId: BookkeepingPlanId, row: BookkeepingPlanFeatureRow): boolean {
  const val = planId === 'ESSENTIALS' ? row.essentials : planId === 'PLUS' ? row.plus : row.allInOne;
  return val === true || val === 'partial';
}
