/**
 * Sprint 23 Part I — infrastructure requirements inventory.
 * Classifies each component; never claims CONNECTED without evidence.
 */

export type InventoryClassification =
  | 'REQUIRED_FOR_CORE_LAUNCH'
  | 'OPTIONAL'
  | 'DEFERRED'
  | 'REQUIRES_BUSINESS_ACCOUNT'
  | 'REQUIRES_PARTNER_APPROVAL'
  | 'REQUIRES_LEGAL_COMPLIANCE'
  | 'REQUIRES_PRODUCTION_CREDENTIALS';

export interface InfrastructureInventoryItem {
  id: string;
  label: string;
  provider: string;
  classification: InventoryClassification;
  notes?: string;
}

export const INFRASTRUCTURE_INVENTORY: InfrastructureInventoryItem[] = [
  { id: 'app-host', label: 'Application host (Vercel/similar)', provider: 'Vercel (standalone project)', classification: 'REQUIRED_FOR_CORE_LAUNCH', notes: 'Separate from Frontal Slayer deployment' },
  { id: 'database', label: 'PostgreSQL database', provider: 'Supabase (dedicated AIO project)', classification: 'REQUIRED_FOR_CORE_LAUNCH' },
  { id: 'auth', label: 'Authentication', provider: 'Supabase Auth (dedicated)', classification: 'REQUIRED_FOR_CORE_LAUNCH' },
  { id: 'storage', label: 'Private object storage', provider: 'Supabase Storage (dedicated)', classification: 'REQUIRED_FOR_CORE_LAUNCH' },
  { id: 'server-api', label: 'Server/API layer', provider: 'Vercel serverless / edge', classification: 'REQUIRED_FOR_CORE_LAUNCH', notes: 'Architecture ready; routes deploy with app host' },
  { id: 'background-jobs', label: 'Background jobs', provider: 'Supabase cron / host scheduler', classification: 'OPTIONAL', notes: 'Outbox pattern in migrations; scheduling pending provider config' },
  { id: 'webhooks', label: 'Inbound webhooks', provider: 'App host endpoints', classification: 'REQUIRED_FOR_CORE_LAUNCH', notes: 'Architecture in integrations module; per-provider activation' },
  { id: 'email', label: 'Transactional email', provider: 'Resend/SendGrid/similar', classification: 'REQUIRES_PRODUCTION_CREDENTIALS' },
  { id: 'sms', label: 'SMS', provider: 'Twilio/similar', classification: 'REQUIRES_BUSINESS_ACCOUNT' },
  { id: 'payments', label: 'Payments', provider: 'Stripe/similar', classification: 'REQUIRES_BUSINESS_ACCOUNT' },
  { id: 'calendar', label: 'Calendar', provider: 'Google/Microsoft adapter', classification: 'OPTIONAL' },
  { id: 'maps', label: 'Maps / routing', provider: 'Google Maps/similar', classification: 'OPTIONAL' },
  { id: 'analytics', label: 'Product analytics', provider: 'Privacy-conscious provider TBD', classification: 'DEFERRED' },
  { id: 'error-monitoring', label: 'Error monitoring', provider: 'Sentry/similar', classification: 'REQUIRED_FOR_CORE_LAUNCH', notes: 'Adapter ready; account pending' },
  { id: 'logs', label: 'Structured logging', provider: 'Host + provider logs', classification: 'REQUIRED_FOR_CORE_LAUNCH' },
  { id: 'backup', label: 'Database backup', provider: 'Supabase managed', classification: 'REQUIRED_FOR_CORE_LAUNCH' },
  { id: 'dns', label: 'DNS / domain', provider: 'Cloudflare or registrar', classification: 'REQUIRES_PRODUCTION_CREDENTIALS', notes: 'Domain not selected — owner action required' },
  { id: 'security-edge', label: 'WAF / edge protection', provider: 'Cloudflare (optional)', classification: 'OPTIONAL' },
  { id: 'factoring-provider', label: 'Factoring partner API', provider: 'Partner-specific', classification: 'REQUIRES_PARTNER_APPROVAL' },
  { id: 'insurance-provider', label: 'Insurance partner API', provider: 'Partner-specific', classification: 'REQUIRES_PARTNER_APPROVAL' },
  { id: 'regulatory', label: 'Government filing APIs', provider: 'Manual / partner', classification: 'REQUIRES_LEGAL_COMPLIANCE', notes: 'No fabricated government APIs' },
  { id: 'malware-scan', label: 'File malware scanning', provider: 'TBD', classification: 'DEFERRED', notes: 'FILE MALWARE SCANNING — PENDING' },
];

export const PROVIDER_DECISIONS = {
  applicationHosting: 'Vercel — standalone All In One project (not Frontal Slayer)',
  databaseAuthStorage: 'Supabase — dedicated production + staging projects',
  edgeDns: 'Cloudflare where selected — DNS pending domain selection',
  email: 'Architecture prepared — provider account pending',
  sms: 'Architecture prepared — business registration pending',
  payments: 'Demo/sandbox architecture — dedicated merchant pending',
  errorMonitoring: 'Adapter abstraction — provider account pending',
} as const;
