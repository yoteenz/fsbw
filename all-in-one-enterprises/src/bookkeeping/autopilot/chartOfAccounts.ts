/** Trucking-specific chart of accounts — configurable taxonomy (Refinement 04A) */

export const TRUCKING_CHART_OF_ACCOUNTS = [
  'Freight Revenue',
  'Dispatch Revenue',
  'Other Operating Revenue',
  'Fuel',
  'DEF / Fuel Additives',
  'Tolls',
  'Parking',
  'Scale Tickets',
  'Lumper Fees',
  'Truck Repairs',
  'Truck Maintenance',
  'Tires',
  'Trailer Expense',
  'Truck Payment',
  'Trailer Payment',
  'Equipment Loan',
  'Commercial Insurance',
  'Permits',
  'Registration',
  'IFTA / Tax-Related Bookkeeping',
  'ELD / Fleet Technology',
  'Load Board',
  'Factoring Fees',
  'Dispatch Fees',
  'Driver / Contractor Cost',
  'Payroll Expense',
  'Office / Admin',
  'Professional Services',
  'Bank Fees',
  'Interest',
  'Owner / Personal',
  'Transfer',
  'Other — Review Required',
] as const;

export type TruckingChartCategory = (typeof TRUCKING_CHART_OF_ACCOUNTS)[number];

export interface MerchantRule {
  id: string;
  pattern: string;
  category: TruckingChartCategory;
  confidence: 'VERY_HIGH' | 'HIGH';
  scope: 'global' | 'organization';
  organizationId?: string;
}

export const DEFAULT_MERCHANT_RULES: MerchantRule[] = [
  { id: 'mr-loves', pattern: "love's", category: 'Fuel', confidence: 'VERY_HIGH', scope: 'global' },
  { id: 'mr-pilot', pattern: 'pilot flying', category: 'Fuel', confidence: 'VERY_HIGH', scope: 'global' },
  { id: 'mr-ta', pattern: 'travel centers', category: 'Fuel', confidence: 'HIGH', scope: 'global' },
  { id: 'mr-ezpass', pattern: 'ez-pass', category: 'Tolls', confidence: 'VERY_HIGH', scope: 'global' },
  { id: 'mr-bestpass', pattern: 'bestpass', category: 'Tolls', confidence: 'VERY_HIGH', scope: 'global' },
  { id: 'mr-eld', pattern: 'samsara', category: 'ELD / Fleet Technology', confidence: 'HIGH', scope: 'global' },
  { id: 'mr-keeptruckin', pattern: 'motive', category: 'ELD / Fleet Technology', confidence: 'HIGH', scope: 'global' },
  { id: 'mr-dat', pattern: 'dat solutions', category: 'Load Board', confidence: 'HIGH', scope: 'global' },
  { id: 'mr-truckstop', pattern: 'truckstop', category: 'Load Board', confidence: 'HIGH', scope: 'global' },
  { id: 'mr-insurance', pattern: 'progressive', category: 'Commercial Insurance', confidence: 'HIGH', scope: 'global' },
];
