import type { FeeCategory } from './billingTypes';

export const FEE_CATEGORY_LABELS: Record<FeeCategory, string> = {
  service_fee: 'All In One Service Fee',
  government_fee: 'Government / Agency Fee',
  third_party_fee: 'Third-Party Fee',
  discount: 'Discount / Credit',
  tax: 'Tax',
};

export const QUOTE_ACCEPTANCE_TERMS =
  'By accepting, you authorize All In One to proceed according to the services and charges shown above, subject to any identified pending external fees. This placeholder will be replaced with approved terms.';

export const DEMO_BILLING_LABEL = 'DEMO · Fictional amounts for review only';
