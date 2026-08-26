/** P0.BRIDGE.1A — repo health + live round-trip validation receipts */

export type RepoHealthValidationReceipt = {
  typecheck: 'PASS' | 'FAIL';
  build: 'PASS' | 'FAIL';
  tests: 'PASS' | 'FAIL';
  captureRegression: 'PASS' | 'FAIL';
  bridgeTests: 'PASS' | 'FAIL';
  status: 'GREEN' | 'BLOCKED';
  timestamp: string;
  details?: Record<string, unknown>;
};

export type BridgeRoundTripValidationReceipt = {
  validationId: string;
  changeRequestId: string;
  projectId: string;
  repo: string;
  sourceCommitBefore: string | null;
  sourceCommitAfter: string | null;
  executionClass: string;
  operationType: string;
  scope: string;
  dryRunStatus: string;
  applyStatus: string;
  testsStatus: string;
  buildStatus: string;
  receiptStatus: string;
  idempotencyStatus: string;
  customerImpact: 'NONE';
  supabaseTable: string;
  statusChain: string[];
  timestamp: string;
};

export const BRIDGE_ROUNDTRIP_VALIDATION_ID = 'bridge-roundtrip-20260826-1a';
export const BRIDGE_ROUNDTRIP_CHANGE_REQUEST_ID = 'cr-bridge-roundtrip-20260826-1a';
export const BRIDGE_ROUNDTRIP_FIXTURE_PATH =
  'src/features/studio-world/website/bridge-validation/site00BridgeRoundtripFixture.ts';
