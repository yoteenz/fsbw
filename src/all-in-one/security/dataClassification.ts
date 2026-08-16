import type { DataClassification, FieldClassification } from './securityTypes';

export const DATA_CLASSIFICATION_ORDER: DataClassification[] = [
  'PUBLIC',
  'INTERNAL',
  'CONFIDENTIAL',
  'RESTRICTED',
];

export const CLASSIFICATION_HANDLING: Record<
  DataClassification,
  {
    view: string;
    edit: string;
    export: string;
    logging: string;
    externalShare: string;
    retention: string;
    audit: string;
    masking: string;
  }
> = {
  PUBLIC: {
    view: 'Anyone (public site) or authenticated users where published intentionally',
    edit: 'Authorized marketing/admin content owners',
    export: 'Permitted for public content',
    logging: 'Minimal operational logging',
    externalShare: 'Permitted when source is public',
    retention: 'Until content is retired',
    audit: 'Optional',
    masking: 'None',
  },
  INTERNAL: {
    view: 'Staff with operational role; not customer-visible by default',
    edit: 'Authorized staff for the workflow/domain',
    export: 'Staff with domain export permission',
    logging: 'Operational logs without sensitive payloads',
    externalShare: 'Not by default',
    retention: 'Business operational policy — TBD before production',
    audit: 'Recommended for configuration changes',
    masking: 'None in staff UI',
  },
  CONFIDENTIAL: {
    view: 'Customer org members or staff with scoped access',
    edit: 'Authorized customer or staff with object-level permission',
    export: 'Explicit export permission + scope check',
    logging: 'Redact PII in logs where possible',
    externalShare: 'Requires consent or business purpose',
    retention: 'Business/legal review required',
    audit: 'Required for view/download of sensitive documents where configured',
    masking: 'Partial masking in summaries (email, phone)',
  },
  RESTRICTED: {
    view: 'Explicit privileged role only',
    edit: 'Highly privileged roles with step-up where configured',
    export: 'Strong permission + audit + optional step-up',
    logging: 'Never log raw values',
    externalShare: 'Prohibited unless encrypted channel + authorization',
    retention: 'Legal/business review required',
    audit: 'Required with before/after where applicable',
    masking: 'Strong masking; secrets never returned to client',
  },
};

/** Field-level classification foundation — extend per domain in Sprint 20+. */
export const FIELD_CLASSIFICATIONS: FieldClassification[] = [
  { field: 'customer.name', category: 'Customer', classification: 'CONFIDENTIAL' },
  { field: 'customer.email', category: 'Customer', classification: 'CONFIDENTIAL' },
  { field: 'customer.phone', category: 'Customer', classification: 'CONFIDENTIAL' },
  { field: 'business.usdot', category: 'Regulatory', classification: 'CONFIDENTIAL', notes: 'Public source; business relationship context is confidential' },
  { field: 'invoice.amount', category: 'Financial', classification: 'CONFIDENTIAL' },
  { field: 'integration.api_secret', category: 'Integration', classification: 'RESTRICTED' },
  { field: 'auth.password', category: 'Identity', classification: 'RESTRICTED' },
  { field: 'document.file', category: 'Document Vault', classification: 'CONFIDENTIAL' },
  { field: 'staff.internal_note', category: 'Operations', classification: 'INTERNAL' },
  { field: 'service.description', category: 'Marketing', classification: 'PUBLIC' },
];

export function classificationRank(c: DataClassification): number {
  return DATA_CLASSIFICATION_ORDER.indexOf(c);
}

export function meetsClassification(required: DataClassification, actorMax: DataClassification): boolean {
  return classificationRank(actorMax) >= classificationRank(required);
}

export function getFieldClassification(field: string): FieldClassification | undefined {
  return FIELD_CLASSIFICATIONS.find((f) => f.field === field);
}
