/**
 * Sprint 24 — canonical SOP registry pointing to docs/operations/.
 */

export interface SopEntry {
  id: string;
  title: string;
  path: string;
  ownerRole: string;
  version: string;
  effectiveDate: string;
  category: string;
}

export const SOP_REGISTRY: SopEntry[] = [
  { id: 'master', title: 'Operations Master Guide', path: 'docs/operations/OPERATIONS_MASTER_GUIDE.md', ownerRole: 'OWNER', version: '1.0', effectiveDate: '2026-08-16', category: 'Core' },
  { id: 'onboarding', title: 'Customer Onboarding', path: 'docs/operations/CUSTOMER_ONBOARDING_SOP.md', ownerRole: 'OPERATIONS', version: '1.0', effectiveDate: '2026-08-16', category: 'Customer' },
  { id: 'road-ready', title: 'Road Ready', path: 'docs/operations/ROAD_READY_SOP.md', ownerRole: 'OPERATIONS', version: '1.0', effectiveDate: '2026-08-16', category: 'Customer' },
  { id: 'permitting', title: 'Permitting', path: 'docs/operations/PERMITTING_SOP.md', ownerRole: 'PERMITTING_SPECIALIST', version: '1.0', effectiveDate: '2026-08-16', category: 'Services' },
  { id: 'tags', title: 'Tag Services', path: 'docs/operations/TAG_SERVICES_SOP.md', ownerRole: 'PERMITTING_SPECIALIST', version: '1.0', effectiveDate: '2026-08-16', category: 'Services' },
  { id: 'tax', title: 'Tax Services', path: 'docs/operations/TAX_SERVICES_SOP.md', ownerRole: 'FINANCE', version: '1.0', effectiveDate: '2026-08-16', category: 'Services' },
  { id: 'authority', title: 'Authority Services', path: 'docs/operations/AUTHORITY_SERVICES_SOP.md', ownerRole: 'PERMITTING_SPECIALIST', version: '1.0', effectiveDate: '2026-08-16', category: 'Services' },
  { id: 'boc3-req', title: 'BOC-3 Activation Requirements', path: 'docs/operations/BOC3_ACTIVATION_REQUIREMENTS.md', ownerRole: 'OWNER', version: '1.0', effectiveDate: '2026-08-16', category: 'Services' },
  { id: 'formation', title: 'Business Formation', path: 'docs/operations/BUSINESS_FORMATION_SOP.md', ownerRole: 'OPERATIONS', version: '1.0', effectiveDate: '2026-08-16', category: 'Services' },
  { id: 'documents', title: 'Document Review', path: 'docs/operations/DOCUMENT_REVIEW_SOP.md', ownerRole: 'DOCUMENT_REVIEWER', version: '1.0', effectiveDate: '2026-08-16', category: 'Operations' },
  { id: 'billing', title: 'Billing & Payments', path: 'docs/operations/BILLING_AND_PAYMENTS_SOP.md', ownerRole: 'FINANCE', version: '1.0', effectiveDate: '2026-08-16', category: 'Finance' },
  { id: 'renewals', title: 'Renewals', path: 'docs/operations/RENEWALS_SOP.md', ownerRole: 'OPERATIONS', version: '1.0', effectiveDate: '2026-08-16', category: 'Operations' },
  { id: 'dispatch', title: 'Dispatch Operations', path: 'docs/operations/DISPATCH_OPERATIONS_SOP.md', ownerRole: 'DISPATCHER', version: '1.0', effectiveDate: '2026-08-16', category: 'Services' },
  { id: 'brokerage-req', title: 'Brokerage Activation Requirements', path: 'docs/operations/BROKERAGE_ACTIVATION_REQUIREMENTS.md', ownerRole: 'OWNER', version: '1.0', effectiveDate: '2026-08-16', category: 'Services' },
  { id: 'factoring', title: 'Factoring (Partner Model)', path: 'docs/operations/FACTORING_PARTNER_SOP.md', ownerRole: 'FINANCE', version: '1.0', effectiveDate: '2026-08-16', category: 'Services' },
  { id: 'insurance', title: 'Insurance (Referral Model)', path: 'docs/operations/INSURANCE_REFERRAL_SOP.md', ownerRole: 'OPERATIONS', version: '1.0', effectiveDate: '2026-08-16', category: 'Services' },
  { id: 'crm', title: 'CRM & Sales', path: 'docs/operations/CRM_AND_SALES_SOP.md', ownerRole: 'CRM_SALES', version: '1.0', effectiveDate: '2026-08-16', category: 'Growth' },
  { id: 'communications', title: 'Customer Communications', path: 'docs/operations/CUSTOMER_COMMUNICATIONS_SOP.md', ownerRole: 'CUSTOMER_SUPPORT', version: '1.0', effectiveDate: '2026-08-16', category: 'Operations' },
  { id: 'appointments', title: 'Appointments', path: 'docs/operations/APPOINTMENTS_SOP.md', ownerRole: 'CUSTOMER_SUPPORT', version: '1.0', effectiveDate: '2026-08-16', category: 'Operations' },
  { id: 'support', title: 'Customer Support', path: 'docs/operations/CUSTOMER_SUPPORT_SOP.md', ownerRole: 'CUSTOMER_SUPPORT', version: '1.0', effectiveDate: '2026-08-16', category: 'Support' },
  { id: 'privacy', title: 'Privacy Requests', path: 'docs/operations/PRIVACY_REQUESTS_SOP.md', ownerRole: 'ADMIN', version: '1.0', effectiveDate: '2026-08-16', category: 'Privacy' },
  { id: 'security-incident', title: 'Security Incident', path: 'docs/operations/SECURITY_INCIDENT_SOP.md', ownerRole: 'SECURITY_ADMIN', version: '1.0', effectiveDate: '2026-08-16', category: 'Security' },
  { id: 'provider-outage', title: 'Provider Outage', path: 'docs/operations/PROVIDER_OUTAGE_SOP.md', ownerRole: 'OPERATIONS', version: '1.0', effectiveDate: '2026-08-16', category: 'Incidents' },
  { id: 'system-outage', title: 'System Outage', path: 'docs/operations/SYSTEM_OUTAGE_SOP.md', ownerRole: 'TECHNICAL', version: '1.0', effectiveDate: '2026-08-16', category: 'Incidents' },
  { id: 'staff-onboard', title: 'Staff Onboarding', path: 'docs/operations/STAFF_ONBOARDING.md', ownerRole: 'ADMIN', version: '1.0', effectiveDate: '2026-08-16', category: 'Staff' },
  { id: 'staff-offboard', title: 'Staff Offboarding', path: 'docs/operations/STAFF_OFFBOARDING.md', ownerRole: 'ADMIN', version: '1.0', effectiveDate: '2026-08-16', category: 'Staff' },
];
