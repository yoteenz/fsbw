/**
 * P0.BRIDGE.1A — dedicated SITE 00 ↔ FSBW round-trip validation fixture.
 * Not routed in production nav; metadata-only mutations prove the bridge without customer impact.
 */
export const SITE00_BRIDGE_ROUNDTRIP_FIXTURE = {
  scope: 'bridge-validation',
  customerFacing: false,
} as const;

export default SITE00_BRIDGE_ROUNDTRIP_FIXTURE;

/* site00-bridge */ export const pageMetadata = {"validationId":"bridge-roundtrip-20260826-1a","executionClass":"BRIDGE_ROUNDTRIP_VALIDATION","bridgeValidation":true,"founderApprovedTestFixture":true};
