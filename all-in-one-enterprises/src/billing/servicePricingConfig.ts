import type { PricingMode, ServicePricingConfig } from './billingTypes';
import { dollarsToMinor, formatMoney } from './money';

/** Demo/sample pricing — clearly fictional. Replace via Office pricing settings in production. */
export const DEFAULT_SERVICE_PRICING: ServicePricingConfig[] = [
  {
    serviceSlug: 'boc-3-assistance',
    title: 'BOC-3 Process Agent Assistance',
    division: 'permitting',
    pricingMode: 'fixed',
    baseServiceFeeMinor: dollarsToMinor(125),
    externalFeeLabel: 'Third-party agent fee may apply',
    active: true,
    paymentTiming: 'payment_before_work',
  },
  {
    serviceSlug: 'irp-apportioned-registration',
    title: 'IRP Apportioned Registration Assistance',
    division: 'permitting',
    pricingMode: 'quote_required',
    active: true,
    paymentTiming: 'payment_before_work',
  },
  {
    serviceSlug: 'operating-authority-assistance',
    title: 'Operating Authority Assistance',
    division: 'permitting',
    pricingMode: 'quote_required',
    active: true,
    paymentTiming: 'payment_before_work',
  },
  {
    serviceSlug: 'llc-formation-assistance',
    title: 'LLC Formation Assistance',
    division: 'business-formation',
    pricingMode: 'variable',
    baseServiceFeeMinor: dollarsToMinor(299),
    externalFeeLabel: 'State filing fee',
    active: true,
    paymentTiming: 'payment_before_work',
  },
  {
    serviceSlug: 'commercial-auto-liability',
    title: 'Commercial Auto Liability',
    division: 'insurance',
    pricingMode: 'consultation',
    active: true,
    paymentTiming: 'manual_billing',
  },
  {
    serviceSlug: 'renewals',
    title: 'Renewals & Compliance Support',
    division: 'permitting',
    pricingMode: 'quote_required',
    active: true,
    paymentTiming: 'payment_before_work',
  },
  {
    serviceSlug: 'bookkeeping',
    title: 'Trucking Bookkeeping',
    division: 'bookkeeping',
    pricingMode: 'starting_at',
    baseServiceFeeMinor: dollarsToMinor(249),
    active: true,
    paymentTiming: 'manual_billing',
  },
  {
    serviceSlug: 'bookkeeping-essentials',
    title: 'Bookkeeping Essentials',
    division: 'bookkeeping',
    pricingMode: 'starting_at',
    baseServiceFeeMinor: dollarsToMinor(249),
    active: true,
    paymentTiming: 'manual_billing',
  },
  {
    serviceSlug: 'bookkeeping-plus',
    title: 'Bookkeeping Plus',
    division: 'bookkeeping',
    pricingMode: 'starting_at',
    baseServiceFeeMinor: dollarsToMinor(449),
    active: true,
    paymentTiming: 'manual_billing',
  },
  {
    serviceSlug: 'all-in-one-bookkeeping',
    title: 'All In One Bookkeeping',
    division: 'bookkeeping',
    pricingMode: 'starting_at',
    baseServiceFeeMinor: dollarsToMinor(749),
    active: true,
    paymentTiming: 'manual_billing',
  },
  {
    serviceSlug: 'books-rescue',
    title: 'Books Rescue',
    division: 'bookkeeping',
    pricingMode: 'starting_at',
    baseServiceFeeMinor: dollarsToMinor(499),
    active: true,
    paymentTiming: 'manual_billing',
  },
];

export function getServicePricing(slug: string, configs: ServicePricingConfig[] = DEFAULT_SERVICE_PRICING): ServicePricingConfig | undefined {
  return configs.find((c) => c.serviceSlug === slug && c.active);
}

export function pricingModeLabel(mode: PricingMode): string {
  const labels: Record<PricingMode, string> = {
    fixed: 'Fixed Price',
    starting_at: 'Starting At',
    quote_required: 'Quote Required',
    variable: 'Service Fee + External Fees',
    government_fee_only: 'Government Fee Only',
    consultation: 'Request Quote',
    custom: 'Custom Pricing',
  };
  return labels[mode];
}

export function pricingDisplayForMode(config: ServicePricingConfig): string {
  if (!config.active) return 'Inactive';
  if (config.pricingMode === 'quote_required' || config.pricingMode === 'consultation') return 'Quote Required';
  if (config.pricingMode === 'fixed' && config.baseServiceFeeMinor != null) {
    return 'Configured';
  }
  if (config.pricingMode === 'starting_at' && config.baseServiceFeeMinor != null) return 'Starting At';
  if (config.pricingMode === 'variable' && config.baseServiceFeeMinor != null) return 'Service Fee + External Fees';
  return 'No Price Configured';
}

/** Customer-facing price label — never fabricates unknown external fees. */
export function customerPriceLabel(config: ServicePricingConfig | undefined): string {
  if (!config || !config.active) return 'Pricing After Review';
  switch (config.pricingMode) {
    case 'fixed':
      return config.baseServiceFeeMinor != null ? formatMoney(config.baseServiceFeeMinor) : 'No Price Configured';
    case 'starting_at':
      return config.baseServiceFeeMinor != null
        ? `Starting at ${formatMoney(config.baseServiceFeeMinor)}`
        : 'Starting Price Not Yet Configured';
    case 'quote_required':
    case 'consultation':
      return 'Quote Required';
    case 'variable':
      return config.baseServiceFeeMinor != null
        ? `${formatMoney(config.baseServiceFeeMinor)} + external fees may apply`
        : 'Service Fee + External Fees';
    case 'government_fee_only':
      return 'Government / Agency Fees Only';
    case 'custom':
      return 'Custom Pricing';
    default:
      return 'Pricing After Review';
  }
}
