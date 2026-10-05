/**
 * Wave 1 — live security test identity matrix and CI secret contract.
 * Never store credentials here; only env var names.
 */

export type SecurityTestIdentityId =
  | 'ANON'
  | 'CUSTOMER_A'
  | 'CUSTOMER_B'
  | 'SHIPPER_A'
  | 'SHIPPER_B'
  | 'CARRIER_A'
  | 'DRIVER_A'
  | 'DRIVER_B'
  | 'PROVIDER_A'
  | 'PROVIDER_B'
  | 'STAFF_GENERAL'
  | 'STAFF_SPECIALIST'
  | 'STAFF_ADMIN';

export interface SecurityTestIdentitySpec {
  id: SecurityTestIdentityId;
  jwtEnv: string;
  emailEnv: string;
  passwordEnv: string;
  orgEnv?: string;
  description: string;
}

export const SECURITY_TEST_IDENTITIES: SecurityTestIdentitySpec[] = [
  {
    id: 'CUSTOMER_A',
    jwtEnv: 'AIO_RLS_TEST_CUSTOMER_A_JWT',
    emailEnv: 'AIO_RLS_TEST_CUSTOMER_A_EMAIL',
    passwordEnv: 'AIO_RLS_TEST_CUSTOMER_A_PASSWORD',
    orgEnv: 'AIO_RLS_TEST_CUSTOMER_A_ORG',
    description: 'Organization member — primary carrier/fleet customer tenant A',
  },
  {
    id: 'CUSTOMER_B',
    jwtEnv: 'AIO_RLS_TEST_CUSTOMER_B_JWT',
    emailEnv: 'AIO_RLS_TEST_CUSTOMER_B_EMAIL',
    passwordEnv: 'AIO_RLS_TEST_CUSTOMER_B_PASSWORD',
    orgEnv: 'AIO_RLS_TEST_CUSTOMER_B_ORG',
    description: 'Organization member — tenant B (cross-tenant negative control)',
  },
  {
    id: 'SHIPPER_A',
    jwtEnv: 'AIO_RLS_TEST_SHIPPER_A_JWT',
    emailEnv: 'AIO_RLS_TEST_SHIPPER_A_EMAIL',
    passwordEnv: 'AIO_RLS_TEST_SHIPPER_A_PASSWORD',
    orgEnv: 'AIO_RLS_TEST_SHIPPER_A_ORG',
    description: 'Shipper org A',
  },
  {
    id: 'SHIPPER_B',
    jwtEnv: 'AIO_RLS_TEST_SHIPPER_B_JWT',
    emailEnv: 'AIO_RLS_TEST_SHIPPER_B_EMAIL',
    passwordEnv: 'AIO_RLS_TEST_SHIPPER_B_PASSWORD',
    description: 'Shipper org B',
  },
  {
    id: 'CARRIER_A',
    jwtEnv: 'AIO_RLS_TEST_CARRIER_A_JWT',
    emailEnv: 'AIO_RLS_TEST_CARRIER_A_EMAIL',
    passwordEnv: 'AIO_RLS_TEST_CARRIER_A_PASSWORD',
    description: 'Carrier / brokerage participant A',
  },
  {
    id: 'DRIVER_A',
    jwtEnv: 'AIO_RLS_TEST_DRIVER_A_JWT',
    emailEnv: 'AIO_RLS_TEST_DRIVER_A_EMAIL',
    passwordEnv: 'AIO_RLS_TEST_DRIVER_A_PASSWORD',
    description: 'Driver profile A',
  },
  {
    id: 'DRIVER_B',
    jwtEnv: 'AIO_RLS_TEST_DRIVER_B_JWT',
    emailEnv: 'AIO_RLS_TEST_DRIVER_B_EMAIL',
    passwordEnv: 'AIO_RLS_TEST_DRIVER_B_PASSWORD',
    description: 'Driver profile B',
  },
  {
    id: 'PROVIDER_A',
    jwtEnv: 'AIO_RLS_TEST_PROVIDER_A_JWT',
    emailEnv: 'AIO_RLS_TEST_PROVIDER_A_EMAIL',
    passwordEnv: 'AIO_RLS_TEST_PROVIDER_A_PASSWORD',
    description: 'FleetCare provider A',
  },
  {
    id: 'PROVIDER_B',
    jwtEnv: 'AIO_RLS_TEST_PROVIDER_B_JWT',
    emailEnv: 'AIO_RLS_TEST_PROVIDER_B_EMAIL',
    passwordEnv: 'AIO_RLS_TEST_PROVIDER_B_PASSWORD',
    description: 'FleetCare provider B',
  },
  {
    id: 'STAFF_GENERAL',
    jwtEnv: 'AIO_RLS_TEST_STAFF_JWT',
    emailEnv: 'AIO_RLS_TEST_STAFF_EMAIL',
    passwordEnv: 'AIO_RLS_TEST_STAFF_PASSWORD',
    description: 'Internal staff (general) — legacy STAFF JWT slot',
  },
  {
    id: 'STAFF_SPECIALIST',
    jwtEnv: 'AIO_RLS_TEST_STAFF_SPECIALIST_JWT',
    emailEnv: 'AIO_RLS_TEST_STAFF_SPECIALIST_EMAIL',
    passwordEnv: 'AIO_RLS_TEST_STAFF_SPECIALIST_PASSWORD',
    description: 'Domain specialist staff',
  },
  {
    id: 'STAFF_ADMIN',
    jwtEnv: 'AIO_RLS_TEST_STAFF_ADMIN_JWT',
    emailEnv: 'AIO_RLS_TEST_STAFF_ADMIN_EMAIL',
    passwordEnv: 'AIO_RLS_TEST_STAFF_ADMIN_PASSWORD',
    description: 'Staff administrator',
  },
];

/** Minimum set for freight + tenant matrix in CI today (extended identities optional). */
export const CORE_LIVE_JWT_ENVS = [
  'AIO_RLS_TEST_SHIPPER_A_JWT',
  'AIO_RLS_TEST_SHIPPER_B_JWT',
  'AIO_RLS_TEST_CARRIER_A_JWT',
  'AIO_RLS_TEST_STAFF_JWT',
] as const;

export const EXTENDED_LIVE_JWT_ENVS = [
  'AIO_RLS_TEST_CUSTOMER_A_JWT',
  'AIO_RLS_TEST_CUSTOMER_B_JWT',
  'AIO_RLS_TEST_DRIVER_A_JWT',
  'AIO_RLS_TEST_DRIVER_B_JWT',
  'AIO_RLS_TEST_PROVIDER_A_JWT',
  'AIO_RLS_TEST_PROVIDER_B_JWT',
  'AIO_RLS_TEST_STAFF_SPECIALIST_JWT',
  'AIO_RLS_TEST_STAFF_ADMIN_JWT',
] as const;

export function getLiveSupabaseConfig() {
  const url = process.env.AIO_STAGING_SUPABASE_URL ?? process.env.VITE_AIO_SUPABASE_URL;
  const anonKey = process.env.AIO_STAGING_SUPABASE_ANON_KEY ?? process.env.VITE_AIO_SUPABASE_ANON_KEY;
  return { url, anonKey, hasLiveProject: Boolean(url && anonKey) };
}

export function missingJwtEnvs(envNames: readonly string[]): string[] {
  return envNames.filter((k) => !process.env[k]?.trim());
}

export function identityJwt(id: SecurityTestIdentityId): string | undefined {
  if (id === 'ANON') return undefined;
  const spec = SECURITY_TEST_IDENTITIES.find((s) => s.id === id);
  if (!spec) return undefined;
  return process.env[spec.jwtEnv]?.trim() || undefined;
}
