/** Customer-facing service-model comparison — config-driven (Refinement 04A) */

export type ComparisonCellValue =
  | 'Yes'
  | 'Some'
  | 'Varies'
  | 'Often'
  | 'Plan Dependent'
  | 'Plus+'
  | 'All In One'
  | 'Not Typical'
  | 'No'
  | 'Available with connected accounts'
  | 'Designed into AIO ecosystem';

export interface ComparisonMatrixRow {
  id: string;
  label: string;
  footnote?: string;
  diy: ComparisonCellValue;
  generalManaged: ComparisonCellValue;
  truckingService: ComparisonCellValue;
  allInOne: ComparisonCellValue;
  visible: boolean;
}

export const BOOKKEEPING_COMPARISON_MATRIX: ComparisonMatrixRow[] = [
  { id: 'managed', label: 'Managed Bookkeeping', diy: 'No', generalManaged: 'Yes', truckingService: 'Yes', allInOne: 'Yes', visible: true },
  { id: 'bank_sync', label: 'Automatic Bank Sync', diy: 'Varies', generalManaged: 'Often', truckingService: 'Varies', allInOne: 'Available with connected accounts', visible: true },
  { id: 'trucking_coa', label: 'Trucking-Specific Categories', diy: 'Some', generalManaged: 'Varies', truckingService: 'Yes', allInOne: 'Yes', visible: true },
  { id: 'receipt_match', label: 'Receipt Matching', diy: 'Varies', generalManaged: 'Varies', truckingService: 'Varies', allInOne: 'Yes', visible: true },
  { id: 'factoring', label: 'Factoring Reconciliation', diy: 'Varies', generalManaged: 'Not Typical', truckingService: 'Varies', allInOne: 'Plus+', visible: true },
  { id: 'load_revenue', label: 'Load/Revenue Reconciliation', diy: 'Varies', generalManaged: 'Not Typical', truckingService: 'Varies', allInOne: 'Plus+', visible: true },
  { id: 'ifta_bk', label: 'IFTA Bookkeeping Support', diy: 'Varies', generalManaged: 'Not Typical', truckingService: 'Varies', allInOne: 'Plus+', visible: true },
  { id: 'truck_profit', label: 'Truck-Level Profitability', diy: 'Some', generalManaged: 'Not Typical', truckingService: 'Varies', allInOne: 'All In One', visible: true },
  { id: 'ar_ap', label: 'A/R + A/P', diy: 'Plan Dependent', generalManaged: 'Plan Dependent', truckingService: 'Varies', allInOne: 'All In One', visible: true },
  { id: 'driver_settlements', label: 'Driver Settlement Bookkeeping', diy: 'No', generalManaged: 'Not Typical', truckingService: 'Varies', allInOne: 'All In One', visible: true },
  { id: 'compliance_eco', label: 'Bookkeeping + Permits/Compliance Ecosystem', diy: 'Not Typical', generalManaged: 'Not Typical', truckingService: 'Varies', allInOne: 'Yes', visible: true },
  { id: 'dispatch', label: 'Dispatch Integration', diy: 'Not Typical', generalManaged: 'Not Typical', truckingService: 'Varies', allInOne: 'Designed into AIO ecosystem', visible: true },
  { id: 'road_ready', label: 'Road Ready™ Integration', diy: 'No', generalManaged: 'No', truckingService: 'No', allInOne: 'Yes', visible: true },
  { id: 'one_portal', label: 'One Client Portal', diy: 'Varies', generalManaged: 'Varies', truckingService: 'Varies', allInOne: 'Yes', visible: true },
];

export const COMPARISON_MATRIX_DISCLAIMER =
  'Comparison reflects general service models and publicly available product information. Features vary by provider and plan. All In One pricing is canonical service configuration — competitor pricing shown separately when verified.';

export const BOOKKEEPING_VALUE_HEADLINE = 'More than bookkeeping.';
export const BOOKKEEPING_VALUE_SUBHEAD =
  'Most bookkeeping solutions see your transactions. All In One is designed to understand the trucking business behind them.';

export const BOOKKEEPING_AUTOPILOT_HEADLINE = 'Bookkeeping on Autopilot.';
export const BOOKKEEPING_AUTOPILOT_COPY =
  'Connected accounts, trucking-specific transaction rules, document matching, and smart reconciliation do the repetitive work automatically — while exceptions and important decisions receive human review.';

export const BOOKKEEPING_AUTOPILOT_FLOW = ['Connect', 'Sort', 'Match', 'Reconcile', 'Review Exceptions', 'Report'] as const;

export const BOOKKEEPING_VALUE_STACK = [
  'Bookkeeping',
  'Road Ready™',
  'Permits & Compliance',
  'Dispatch',
  'Factoring',
  'Fleet',
  'Documents',
  'Billing',
] as const;
