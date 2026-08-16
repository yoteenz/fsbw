/**
 * Sprint 20 — persistence inventory and migration map.
 * Documents every current persistence mechanism → canonical future table.
 */

export type PersistenceDomain =
  | 'IDENTITY'
  | 'ORGANIZATIONS'
  | 'CUSTOMERS'
  | 'CRM'
  | 'SERVICES'
  | 'WORKFLOW'
  | 'DOCUMENTS'
  | 'BILLING'
  | 'RENEWALS'
  | 'COMMUNICATIONS'
  | 'APPOINTMENTS'
  | 'PERMITTING'
  | 'ROAD_READY'
  | 'DISPATCH'
  | 'BROKERAGE'
  | 'FACTORING'
  | 'INSURANCE'
  | 'INTEGRATIONS'
  | 'REPORTING'
  | 'SECURITY'
  | 'PRIVACY'
  | 'AUDIT'
  | 'SYSTEM';

export interface PersistenceInventoryEntry {
  domain: PersistenceDomain;
  currentStorage: string;
  canonicalTable: string;
  migrationStrategy: string;
  demoStrategy: string;
  productionStrategy: string;
}

/** Canonical migration map — source of truth for Sprint 20 data architecture */
export const PERSISTENCE_INVENTORY: PersistenceInventoryEntry[] = [
  {
    domain: 'IDENTITY',
    currentStorage: 'DemoAuthAdapter + AIOAuthProvider (session); aio_debug_store.staffProfiles',
    canonicalTable: 'aio_profiles, auth.users',
    migrationStrategy: 'Supabase Auth signup → profile trigger; demo personas unchanged',
    demoStrategy: 'Deterministic demo personas; no real auth',
    productionStrategy: 'Dedicated AIO Supabase Auth; invitation-only staff',
  },
  {
    domain: 'ORGANIZATIONS',
    currentStorage: 'aio_debug_store.clients + portalClientId',
    canonicalTable: 'aio_organizations, aio_organization_memberships',
    migrationStrategy: 'Map demo client IDs → org UUIDs on import; repository abstraction',
    demoStrategy: 'client-a…client-g in demo seed',
    productionStrategy: 'Created via onboarding workflow + membership',
  },
  {
    domain: 'CUSTOMERS',
    currentStorage: 'aio_debug_store.clients (combined contact+customer)',
    canonicalTable: 'aio_contacts, aio_customers, aio_customer_organizations',
    migrationStrategy: 'Split Client type into contact + customer relationship',
    demoStrategy: 'Demo seed preserves Client 360 UX via DemoRepository',
    productionStrategy: 'Separate auth user, contact, customer, org membership',
  },
  {
    domain: 'CRM',
    currentStorage: 'aio_debug_store.crm*',
    canonicalTable: 'aio_leads, aio_opportunities, aio_pipeline_stages, aio_sales_activities',
    migrationStrategy: 'CRM module types → SQL; conversion preserves lead history',
    demoStrategy: 'crmSeed.ts fixtures',
    productionStrategy: 'RLS: internal-only; customers never read CRM notes',
  },
  {
    domain: 'SERVICES',
    currentStorage: 'aio_debug_store.serviceRequests + mockServices.ts',
    canonicalTable: 'aio_services, aio_service_requests, aio_service_request_status_history',
    migrationStrategy: 'Repository createServiceRequest() atomic with workflow',
    demoStrategy: 'demoActions + workflowActions',
    productionStrategy: 'Human-readable AIO-SVC numbers via aio_next_request_number()',
  },
  {
    domain: 'WORKFLOW',
    currentStorage: 'aio_debug_store.workflow*',
    canonicalTable: 'aio_workflow_definitions, aio_workflow_instances, aio_workflow_steps',
    migrationStrategy: 'Versioned templates; instances immutable definition ref',
    demoStrategy: 'workflowSeed.ts',
    productionStrategy: 'Customer-safe projection views',
  },
  {
    domain: 'DOCUMENTS',
    currentStorage: 'aio_debug_store.documents + vaultStorage (in-memory blob refs)',
    canonicalTable: 'aio_documents, aio_document_versions, aio_document_sharing_events',
    migrationStrategy: 'Metadata in Postgres; blobs in private buckets',
    demoStrategy: 'DemoStorageProvider — no real files',
    productionStrategy: 'prepareUpload/finalizeUpload + signed download service',
  },
  {
    domain: 'BILLING',
    currentStorage: 'aio_debug_store.invoices, quotes, payments',
    canonicalTable: 'aio_invoices, aio_invoice_items, aio_payments, aio_financial_events',
    migrationStrategy: 'Integer minor units; pass-through fields separated',
    demoStrategy: 'billingActions.ts',
    productionStrategy: 'Finance permission + RLS; idempotent payments',
  },
  {
    domain: 'DISPATCH',
    currentStorage: 'aio_debug_store.loads, drivers, vehicles',
    canonicalTable: 'aio_dispatch_loads, aio_load_stops, aio_load_status_history, aio_vehicles',
    migrationStrategy: 'Transactional load+stops create',
    demoStrategy: 'dispatchActions.ts',
    productionStrategy: 'Org-scoped RLS',
  },
  {
    domain: 'FACTORING',
    currentStorage: 'aio_debug_store.factoring*',
    canonicalTable: 'aio_factoring_cases, aio_factoring_submissions, aio_factoring_events',
    migrationStrategy: 'Restricted classification; separate document bucket',
    demoStrategy: 'factoringActions.ts',
    productionStrategy: 'Factoring permission + stronger RLS',
  },
  {
    domain: 'INSURANCE',
    currentStorage: 'aio_debug_store.insurance*',
    canonicalTable: 'aio_insurance_cases, aio_insurance_referrals, aio_insurance_events',
    migrationStrategy: 'Minimal PII; partner status separate',
    demoStrategy: 'insuranceActions.ts',
    productionStrategy: 'Internal notes restricted',
  },
  {
    domain: 'INTEGRATIONS',
    currentStorage: 'aio_debug_store.integrations*',
    canonicalTable: 'aio_integration_connections, aio_integration_operations (no secrets)',
    migrationStrategy: 'Credential references only in DB',
    demoStrategy: 'Demo adapters — no network',
    productionStrategy: 'Server-side secret vault',
  },
  {
    domain: 'SECURITY',
    currentStorage: 'aio_debug_store.security*',
    canonicalTable: 'aio_security_findings, aio_security_incidents, aio_security_settings',
    migrationStrategy: 'Sprint 19 types → SQL',
    demoStrategy: 'securitySeed.ts',
    productionStrategy: 'Security role only',
  },
  {
    domain: 'AUDIT',
    currentStorage: 'aio_debug_store.auditEvents',
    canonicalTable: 'aio_audit_events (append-only)',
    migrationStrategy: 'No update/delete from app repositories',
    demoStrategy: 'securityAudit.ts',
    productionStrategy: 'Retention policy + security.audit.read',
  },
  {
    domain: 'PRIVACY',
    currentStorage: 'aio_debug_store.privacyRequests',
    canonicalTable: 'aio_privacy_requests, aio_consents',
    migrationStrategy: 'Sprint 19 privacy model → SQL',
    demoStrategy: 'securitySeed privacy fixtures',
    productionStrategy: 'Legal workflow — not auto-fulfilled',
  },
  {
    domain: 'SYSTEM',
    currentStorage: 'localStorage aio_debug_* keys (legacy) + aio_debug_store',
    canonicalTable: 'N/A — demo namespace aio:demo:v20:*',
    migrationStrategy: 'Consolidated demo store v20; legacy key migration',
    demoStrategy: 'RESET DEMO DATA restores canonical seed',
    productionStrategy: 'No localStorage for business data',
  },
];

export function getInventoryByDomain(domain: PersistenceDomain): PersistenceInventoryEntry[] {
  return PERSISTENCE_INVENTORY.filter((e) => e.domain === domain);
}
