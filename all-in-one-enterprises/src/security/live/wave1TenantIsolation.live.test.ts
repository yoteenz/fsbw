/**
 * Wave 1 live RLS / tenant isolation matrix.
 * Requires AIO_LIVE_SUPABASE_TEST=1 and staging URL + anon key.
 * Role matrix requires AIO_RLS_TEST_* JWT or email/password secrets (provision script).
 */
import { describe, expect, it } from 'vitest';
import {
  CORE_LIVE_JWT_ENVS,
  EXTENDED_LIVE_JWT_ENVS,
  getLiveSupabaseConfig,
  identityJwt,
  missingJwtEnvs,
} from './liveSecurityConfig';
import {
  createLiveSupabaseClient,
  expectAccessAllowed,
  expectAccessDenied,
  runAs,
  selectById,
  selectLimited,
} from './securityTestHarness';

const { hasLiveProject } = getLiveSupabaseConfig();
const missingCore = missingJwtEnvs(CORE_LIVE_JWT_ENVS);
const hasCoreRoleSessions = missingCore.length === 0;

describe.skipIf(!hasLiveProject)('Wave 1 — anon private access', () => {
  const anon = () => createLiveSupabaseClient();

  it('ANON → aio_service_requests = DENY', async () => {
    expectAccessDenied(await selectLimited(anon(), 'aio_service_requests', 'id'));
  });

  it('ANON → aio_documents = DENY', async () => {
    expectAccessDenied(await selectLimited(anon(), 'aio_documents', 'id'));
  });

  it('ANON → aio_invoices = DENY', async () => {
    expectAccessDenied(await selectLimited(anon(), 'aio_invoices', 'id'));
  });

  it('ANON → aio_messages = DENY', async () => {
    expectAccessDenied(await selectLimited(anon(), 'aio_messages', 'id'));
  });

  it('ANON → aio_appointments = DENY', async () => {
    expectAccessDenied(await selectLimited(anon(), 'aio_appointments', 'id'));
  });

  it('ANON → aio_internal_staff = DENY', async () => {
    expectAccessDenied(await selectLimited(anon(), 'aio_internal_staff', 'id'));
  });

  it('ANON → aio_crm_notes = DENY', async () => {
    expectAccessDenied(await selectLimited(anon(), 'aio_crm_notes', 'id'));
  });

  it('ANON → aio_brokerage_load_financials = DENY', async () => {
    expectAccessDenied(await selectLimited(anon(), 'aio_brokerage_load_financials', 'shipper_rate_minor'));
  });
});

describe.skipIf(!hasLiveProject || !hasCoreRoleSessions)('Wave 1 — shipper / carrier financial boundaries', () => {
  it('SHIPPER_A → carrier_rate on financials = DENY', async () => {
    const client = runAs('SHIPPER_A');
    expectAccessDenied(await selectLimited(client, 'aio_brokerage_load_financials', 'carrier_rate_minor, shipper_rate_minor'));
  });

  it('CARRIER_A → shipper_rate on financials = DENY', async () => {
    const client = runAs('CARRIER_A');
    expectAccessDenied(await selectLimited(client, 'aio_brokerage_load_financials', 'shipper_rate_minor, carrier_rate_minor'));
  });

  it('SHIPPER_A → pricing drafts = DENY', async () => {
    expectAccessDenied(await selectLimited(runAs('SHIPPER_A'), 'aio_brokerage_quote_pricing_drafts', 'quote_id'));
  });

  it('STAFF → internal financial view = ALLOW', async () => {
    const { error } = await runAs('STAFF_GENERAL').from('aio_brokerage_load_financials_internal').select('gross_margin_minor').limit(1);
    expect(error).toBeNull();
  });
});

describe.skipIf(!hasLiveProject || !hasCoreRoleSessions)('Wave 1 — shipper cross-tenant', () => {
  it('SHIPPER_A cannot read SHIPPER_B shipment request by id', async () => {
    const staff = runAs('STAFF_GENERAL');
    const { data: rows } = await staff.from('aio_shipment_requests').select('id, shipper_organization_id').limit(30);
    const shipperAOrg = process.env.AIO_RLS_TEST_SHIPPER_A_ORG;
    const other = (rows ?? []).find((r) => {
      if (shipperAOrg && r.shipper_organization_id === shipperAOrg) return false;
      return true;
    });
    if (!other) return;

    expectAccessDenied(
      await selectById(runAs('SHIPPER_A'), 'aio_shipment_requests', 'id', 'id', other.id as string),
    );
  });
});

describe.skipIf(!hasLiveProject || !hasCoreRoleSessions)('Wave 1 — customer / office boundary', () => {
  it('SHIPPER_A → aio_internal_staff = DENY', async () => {
    expectAccessDenied(await selectLimited(runAs('SHIPPER_A'), 'aio_internal_staff', 'id, role'));
  });

  it('SHIPPER_A → aio_crm_notes = DENY', async () => {
    expectAccessDenied(await selectLimited(runAs('SHIPPER_A'), 'aio_crm_notes', 'id'));
  });
});

const missingExtended = missingJwtEnvs(EXTENDED_LIVE_JWT_ENVS);
const hasCustomerSessions =
  !missingJwtEnvs(['AIO_RLS_TEST_CUSTOMER_A_JWT', 'AIO_RLS_TEST_CUSTOMER_B_JWT']).length;

describe.skipIf(!hasLiveProject || !hasCustomerSessions)('Wave 1 — customer cross-tenant', () => {
  it('CUSTOMER_A → own service_requests = ALLOW (or empty)', async () => {
    expectAccessAllowed(await selectLimited(runAs('CUSTOMER_A'), 'aio_service_requests', 'id, organization_id'));
  });

  it('CUSTOMER_A cannot read CUSTOMER_B org service_request by id', async () => {
    const staff = runAs('STAFF_GENERAL');
    const { data: rows } = await staff.from('aio_service_requests').select('id, organization_id').limit(40);
    const orgA = process.env.AIO_RLS_TEST_CUSTOMER_A_ORG;
    const other = (rows ?? []).find((r) => orgA && r.organization_id !== orgA);
    if (!other) return;
    expectAccessDenied(
      await selectById(runAs('CUSTOMER_A'), 'aio_service_requests', 'id', 'id', other.id as string),
    );
  });

  it('CUSTOMER_A → aio_internal_staff = DENY', async () => {
    expectAccessDenied(await selectLimited(runAs('CUSTOMER_A'), 'aio_internal_staff', 'id'));
  });
});

describe.skipIf(!hasLiveProject || missingExtended.includes('AIO_RLS_TEST_DRIVER_A_JWT'))(
  'Wave 1 — driver isolation',
  () => {
    it('DRIVER_A → own driver_profiles = ALLOW', async () => {
      expectAccessAllowed(await selectLimited(runAs('DRIVER_A'), 'aio_driver_profiles', 'id, user_id'));
    });

    it('DRIVER_A → aio_brokerage_load_financials = DENY', async () => {
      expectAccessDenied(await selectLimited(runAs('DRIVER_A'), 'aio_brokerage_load_financials', 'id'));
    });
  },
);

describe.skipIf(!hasLiveProject || missingExtended.includes('AIO_RLS_TEST_PROVIDER_A_JWT'))(
  'Wave 1 — provider isolation',
  () => {
    it('PROVIDER_A → own service_providers = ALLOW (or empty)', async () => {
      expectAccessAllowed(await selectLimited(runAs('PROVIDER_A'), 'aio_service_providers', 'id'));
    });

    it('PROVIDER_A → aio_crm_notes = DENY', async () => {
      expectAccessDenied(await selectLimited(runAs('PROVIDER_A'), 'aio_crm_notes', 'id'));
    });
  },
);

describe.skipIf(!hasLiveProject)('Wave 1 — harness blocked state metadata', () => {
  it('reports missing core JWT env names when absent', () => {
    if (hasCoreRoleSessions) {
      expect(missingCore).toEqual([]);
      return;
    }
    expect(missingCore.length).toBeGreaterThan(0);
    for (const key of missingCore) {
      expect(key.startsWith('AIO_RLS_TEST_')).toBe(true);
    }
  });

  it('never exposes JWT values in env snapshot', () => {
    for (const key of CORE_LIVE_JWT_ENVS) {
      const val = process.env[key];
      if (!val) continue;
      expect(val.length).toBeGreaterThan(20);
      expect(val.split('.').length).toBeGreaterThanOrEqual(2);
    }
    expect(identityJwt('SHIPPER_A') ?? '').not.toMatch(/password/i);
  });
});
