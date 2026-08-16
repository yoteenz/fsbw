/**
 * All In One — isolated data infrastructure constants.
 * Frontal Slayer production project MUST NEVER be used for AIO business data.
 */

/** Frontal Slayer / Build-a-Wig Supabase — forbidden target for AIO migrations */
export const FRONTAL_SLAYER_SUPABASE_PROJECT_ID = 'hyycomvcaqxxvyrfupes';

/** Placeholder until dedicated AIO Supabase is provisioned — migrations abort if URL matches FS */
export const AIO_EXPECTED_PROJECT_REF_ENV = 'AIO_SUPABASE_PROJECT_REF';

/** Canonical demo schema version (Sprint 20) */
export const AIO_DEMO_SCHEMA_VERSION = 20;

/** Canonical migration directory (repo-relative) */
export const AIO_MIGRATIONS_DIR = 'supabase/migrations';

/** Human-readable ID prefixes */
export const AIO_ID_PREFIX = {
  customer: 'AIO-CUS',
  serviceRequest: 'AIO-SVC',
  invoice: 'AIO-INV',
  load: 'AIO-LOAD',
  factoring: 'AIO-FAC',
  insurance: 'AIO-INS',
} as const;

/** Private storage bucket names (dedicated AIO project) */
export const AIO_STORAGE_BUCKETS = {
  customerDocuments: 'aio-customer-documents',
  serviceDocuments: 'aio-service-documents',
  dispatchDocuments: 'aio-dispatch-documents',
  factoringDocuments: 'aio-factoring-documents',
  insuranceDocuments: 'aio-insurance-documents',
  internalDocuments: 'aio-internal-documents',
  generatedExports: 'aio-generated-exports',
  temporaryUploads: 'aio-temporary-uploads',
} as const;
