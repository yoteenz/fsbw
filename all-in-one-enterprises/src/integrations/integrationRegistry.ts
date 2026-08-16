import type {
  IntegrationCapability,
  IntegrationProvider,
  IntegrationProviderCategory,
  IntegrationResearchRecord,
  ProviderRequirementState,
  StateCapabilityEntry,
} from './integrationTypes';

export const INTEGRATION_CATEGORIES: { id: IntegrationProviderCategory; label: string }[] = [
  { id: 'REGULATORY', label: 'Regulatory / Transportation' },
  { id: 'GOVERNMENT_DATA', label: 'Government Data' },
  { id: 'PAYMENTS', label: 'Payments' },
  { id: 'MESSAGING', label: 'Email / SMS' },
  { id: 'MAPS_ROUTING', label: 'Maps & Routing' },
  { id: 'ADDRESS_VALIDATION', label: 'Address Validation' },
  { id: 'BUSINESS_VERIFICATION', label: 'Business Verification' },
  { id: 'IDENTITY_VERIFICATION', label: 'Identity Verification' },
  { id: 'FACTORING', label: 'Factoring Partners' },
  { id: 'INSURANCE', label: 'Insurance Partners' },
  { id: 'LOAD_BOARD', label: 'Load Boards' },
  { id: 'DISPATCH', label: 'Dispatch Systems' },
  { id: 'ELD_TELEMATICS', label: 'ELD / Telematics' },
  { id: 'ACCOUNTING', label: 'Accounting' },
  { id: 'DOCUMENT_SIGNATURE', label: 'Document Signature' },
  { id: 'CALENDAR', label: 'Calendar' },
  { id: 'STORAGE', label: 'Cloud Storage' },
  { id: 'OTHER', label: 'Other' },
];

export const OFFICIAL_PORTAL_LINKS: Record<string, { label: string; url: string }> = {
  fmcsa_safer: {
    label: 'FMCSA SAFER Company Snapshot',
    url: 'https://safer.fmcsa.dot.gov/CompanySnapshot.aspx',
  },
  fmcsa_l_and_i: {
    label: 'FMCSA Licensing & Insurance',
    url: 'https://li-public.fmcsa.dot.gov/LIVIEW/pkg_carrquery.prc_carrlist',
  },
  irs_ein: {
    label: 'IRS EIN Information',
    url: 'https://www.irs.gov/businesses/small-businesses-self-employed/apply-for-an-employer-identification-number-ein-online',
  },
};

function provider(
  id: string,
  slug: string,
  name: string,
  category: IntegrationProviderCategory,
  caps: IntegrationCapability[],
  requirementState: ProviderRequirementState,
  description: string,
): IntegrationProvider {
  return {
    id,
    slug,
    name,
    category,
    description,
    supportedCapabilities: caps,
    supportedEnvironments: requirementState === 'AVAILABLE' ? ['DEMO', 'SANDBOX', 'PRODUCTION'] : ['DEMO'],
    lifecycle: 'ACTIVE',
    requirementState,
    authTypes: requirementState === 'MANUAL_ONLY' ? ['manual'] : ['api_key', 'oauth2'],
    version: '1.0.0',
  };
}

/** Canonical provider catalog — placeholders until commercial agreements exist */
export const INTEGRATION_PROVIDER_CATALOG: IntegrationProvider[] = [
  provider('prov-regulatory-demo', 'demo-regulatory', 'Demo Regulatory Data', 'REGULATORY', ['READ', 'VERIFY', 'REGULATORY'], 'AVAILABLE', 'Deterministic demo carrier lookup — no live FMCSA API in debug phase.'),
  provider('prov-regulatory-fmcsa', 'fmcsa-public', 'FMCSA Public Data', 'REGULATORY', ['READ', 'VERIFY', 'REGULATORY'], 'RESEARCH_REQUIRED', 'Official FMCSA public data — API access must be verified before live integration.'),
  provider('prov-payment-demo', 'demo-payment', 'Demo Payment Provider', 'PAYMENTS', ['PAYMENT', 'WEBHOOK', 'WRITE'], 'AVAILABLE', 'Simulated checkout, webhooks, refunds — no real money.'),
  provider('prov-email-demo', 'demo-email', 'Demo Email Provider', 'MESSAGING', ['MESSAGING', 'WEBHOOK'], 'AVAILABLE', 'Simulated email delivery and webhooks.'),
  provider('prov-sms-demo', 'demo-sms', 'Demo SMS Provider', 'MESSAGING', ['MESSAGING', 'WEBHOOK'], 'AVAILABLE', 'Simulated SMS delivery, opt-out, inbound.'),
  provider('prov-maps-demo', 'demo-maps', 'Demo Maps Provider', 'MAPS_ROUTING', ['ROUTING', 'READ'], 'AVAILABLE', 'Deterministic Atlanta → Dallas route estimate.'),
  provider('prov-loadboard-demo', 'demo-loadboard', 'Demo Load Board', 'LOAD_BOARD', ['SEARCH', 'READ', 'WRITE'], 'AVAILABLE', 'Fictional demo loads — import only, no booking.'),
  provider('prov-factoring-demo', 'demo-factoring', 'Demo Factoring Partner', 'FACTORING', ['WRITE', 'READ', 'SYNC'], 'AVAILABLE', 'Simulated factoring submission lifecycle.'),
  provider('prov-insurance-demo', 'demo-insurance', 'Demo Insurance Partner', 'INSURANCE', ['WRITE', 'READ'], 'AVAILABLE', 'Simulated referral and quote status — not coverage confirmation.'),
  provider('prov-accounting-demo', 'demo-accounting', 'Demo Accounting Export', 'ACCOUNTING', ['FINANCIAL', 'WRITE', 'SYNC'], 'AVAILABLE', 'Simulated invoice export with idempotency.'),
  provider('prov-address', 'address-validation', 'Address Validation Provider', 'ADDRESS_VALIDATION', ['VERIFY', 'READ'], 'API_ACCESS_REQUIRED', 'Future address validation — suggest, never silently overwrite.'),
  provider('prov-business-verify', 'business-verification', 'Business Verification Provider', 'BUSINESS_VERIFICATION', ['VERIFY', 'READ'], 'COMMERCIAL_AGREEMENT_REQUIRED', 'Future legal entity lookup.'),
  provider('prov-identity', 'identity-verification', 'Identity Verification Provider', 'IDENTITY_VERIFICATION', ['VERIFY'], 'LICENSE_AUTHORITY_REVIEW_REQUIRED', 'Boundary only — no invasive KYC in debug phase.'),
  provider('prov-esign', 'e-signature', 'E-Signature Provider', 'DOCUMENT_SIGNATURE', ['DOCUMENT', 'WEBHOOK'], 'COMMERCIAL_AGREEMENT_REQUIRED', 'Future envelope workflow.'),
  provider('prov-calendar', 'calendar', 'Calendar Provider', 'CALENDAR', ['CALENDAR', 'SYNC', 'WEBHOOK'], 'API_ACCESS_REQUIRED', 'External calendar sync for appointments.'),
  provider('prov-telematics', 'telematics', 'ELD / Telematics Provider', 'ELD_TELEMATICS', ['TELEMATICS', 'READ', 'SYNC'], 'CUSTOMER_AUTHORIZATION_REQUIRED', 'Vehicle location with explicit consent.'),
  provider('prov-accounting-qb', 'quickbooks', 'Accounting Platform', 'ACCOUNTING', ['FINANCIAL', 'SYNC'], 'COMMERCIAL_AGREEMENT_REQUIRED', 'Future QuickBooks — not implemented in Sprint 18.'),
  provider('prov-storage', 'cloud-storage', 'Cloud Storage Provider', 'STORAGE', ['DOCUMENT', 'READ', 'WRITE'], 'API_ACCESS_REQUIRED', 'Future document storage sync.'),
];

export function getProviderById(id: string): IntegrationProvider | undefined {
  return INTEGRATION_PROVIDER_CATALOG.find((p) => p.id === id);
}

export function getProvidersByCategory(category: IntegrationProviderCategory): IntegrationProvider[] {
  return INTEGRATION_PROVIDER_CATALOG.filter((p) => p.category === category);
}

export const DEFAULT_RESEARCH_RECORDS: IntegrationResearchRecord[] = [
  {
    id: 'research-fmcsa',
    providerSlug: 'fmcsa-public',
    category: 'REGULATORY',
    officialSource: 'https://www.fmcsa.dot.gov/',
    apiVerified: false,
    sandboxVerified: false,
    commercialAgreementRequired: false,
    licensingConcerns: 'Public carrier data may be accessed via official channels; verify current API/program before live integration.',
    authentication: 'Unknown — requires official verification',
    webhooksSupported: false,
    rateLimits: 'Unknown',
    dataScope: 'USDOT carrier snapshot, authority, insurance filing status where publicly available',
    lastResearchedAt: '2026-08-16T00:00:00.000Z',
    researchNotes: 'Sprint 18 implements adapter boundary + demo only. Do not fabricate endpoints.',
  },
  {
    id: 'research-payment',
    providerSlug: 'payment-processor',
    category: 'PAYMENTS',
    officialSource: undefined,
    apiVerified: false,
    sandboxVerified: false,
    commercialAgreementRequired: true,
    webhooksSupported: true,
    lastResearchedAt: '2026-08-16T00:00:00.000Z',
    researchNotes: 'Live payment processor requires explicit configuration and merchant agreement.',
  },
];

export const DEFAULT_STATE_CAPABILITY_MATRIX: StateCapabilityEntry[] = [
  {
    stateCode: 'GA',
    service: 'LLC Formation',
    fulfillmentMethod: 'EXTERNAL_PORTAL',
    manualPortalUrl: 'https://ecorp.sos.ga.gov/',
    automationSupported: false,
    customerAuthorizationRequired: true,
    partnerRequired: false,
  },
  {
    stateCode: 'TX',
    service: 'MC Authority Application',
    fulfillmentMethod: 'EXTERNAL_PORTAL',
    manualPortalUrl: OFFICIAL_PORTAL_LINKS.fmcsa_safer.url,
    automationSupported: false,
    customerAuthorizationRequired: true,
    partnerRequired: true,
  },
  {
    stateCode: 'US',
    service: 'BOC-3 Filing',
    fulfillmentMethod: 'PARTNER',
    automationSupported: false,
    customerAuthorizationRequired: true,
    partnerRequired: true,
  },
];
