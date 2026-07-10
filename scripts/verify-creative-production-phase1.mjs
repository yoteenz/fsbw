#!/usr/bin/env node
/**
 * Phase 1 verification — Creative Production Graph contracts (no FAL execution).
 * Usage: node scripts/verify-creative-production-phase1.mjs
 */

import {
  createDemoAssetIntent,
  createDemoCreativeInitiative,
  createDemoProductionAuthorizationPayload,
  representGovernedGenerationRequest,
  validateAuthorizationStructure,
  enforceCieOnMaterialPath,
  assertRegistryWritePolicy,
  buildRegistryLineageMetadata,
} from '../src/studio-os-core/creative-production/index.ts';

const assert = (cond, msg) => {
  if (!cond) {
    console.error('FAIL:', msg);
    process.exitCode = 1;
    throw new Error(msg);
  }
  console.log('PASS:', msg);
};

async function main() {
  const initiative = createDemoCreativeInitiative();
  const authPayload = createDemoProductionAuthorizationPayload(initiative);

  // Dynamic import for server signing (Node crypto)
  const { signProductionAuthorization, verifyProductionAuthorizationSignature } = await import(
    '../api/_lib/creativeProduction/authorization-signing.ts'
  );

  const authorization = signProductionAuthorization(authPayload);
  assert(verifyProductionAuthorizationSignature(authorization), 'ProductionAuthorization signature verifies');

  const structure = validateAuthorizationStructure(authorization);
  assert(structure.ok, 'Authorization structure valid');

  const intent = createDemoAssetIntent(initiative.id);
  const request = {
    productionAuthorizationId: authorization.id,
    assetIntent: intent,
    orgId: initiative.tenantId,
    sourceRoute: '/scripts/verify-creative-production-phase1',
    sourceSystem: 'generation-gateway',
    execution: { model: 'fal-ai/nano-banana-pro/edit' },
  };

  const represented = representGovernedGenerationRequest({ authorization, initiative, request });
  assert(represented.ok, 'Governed generation request represented through production graph');
  if (represented.ok) {
    assert(represented.audit.outputClass === 'material', 'Audit records material output class');
    assert(represented.audit.productionAuthorizationId === authorization.id, 'Audit records authorization ID');
    const meta = buildRegistryLineageMetadata(represented.audit);
    assert(Boolean(meta.creative_production), 'Registry lineage metadata envelope present');
  }

  const cieBlock = enforceCieOnMaterialPath({ ...request, skipCie: true });
  assert(!cieBlock.ok && cieBlock.code === 'CIE_SKIP_FORBIDDEN', 'skipCie blocked on material path');

  const policy = assertRegistryWritePolicy({
    registryKey: 'studioOsStudioBuilderRegistry_v1',
    caller: 'verify-script',
  });
  assert(!policy.allowed, 'Deprecated local registry write blocked by policy');

  if (process.exitCode) {
    console.error('\nPhase 1 verification FAILED');
    process.exit(process.exitCode);
  }
  console.log('\nPhase 1 verification PASSED');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
