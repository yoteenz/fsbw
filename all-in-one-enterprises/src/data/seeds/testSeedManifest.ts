/** Deterministic test fixtures for authorization and RLS contract tests */

export const TEST_ORG_A = '00000000-0000-4000-8000-000000000001';
export const TEST_ORG_B = '00000000-0000-4000-8000-000000000002';
export const TEST_CUSTOMER_A_USER = '00000000-0000-4000-8000-000000000010';
export const TEST_CUSTOMER_B_USER = '00000000-0000-4000-8000-000000000011';
export const TEST_DISPATCHER_USER = '00000000-0000-4000-8000-000000000020';
export const TEST_FINANCE_USER = '00000000-0000-4000-8000-000000000021';
export const TEST_ADMIN_USER = '00000000-0000-4000-8000-000000000022';
export const TEST_SECURITY_USER = '00000000-0000-4000-8000-000000000023';

export const TEST_SEED_MANIFEST = {
  organizations: [
    { id: TEST_ORG_A, name: 'Test Org A' },
    { id: TEST_ORG_B, name: 'Test Org B' },
  ],
  crossOrgInvoiceScenario: true,
  restrictedFactoringRecord: true,
} as const;
