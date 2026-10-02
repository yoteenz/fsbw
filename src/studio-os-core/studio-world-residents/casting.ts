import type {
  CastRolePersonaView,
  ResidentCanonicalIdentity,
  ResidentCastRoleContract,
} from './types';

/** Deep-freeze style clone for canon protection in tests and APIs. */
export function cloneCanonicalIdentity(identity: ResidentCanonicalIdentity): ResidentCanonicalIdentity {
  return structuredClone(identity);
}

/**
 * Build a client-facing persona from a cast contract + canonical resident.
 * Does not mutate the resident record.
 */
export function buildCastRolePersonaView(
  resident: ResidentCanonicalIdentity,
  contract: ResidentCastRoleContract
): CastRolePersonaView {
  if (contract.residentId !== resident.residentId) {
    throw new Error('Cast contract residentId does not match canonical resident');
  }

  return {
    contractId: contract.id,
    residentId: resident.residentId,
    displayName: contract.displayNameIfDifferent ?? resident.displayName,
    roleName: contract.roleName,
    toneAdjustment: contract.toneAdjustment,
    temporaryBackstory: contract.temporaryBackstory,
    authorizedKnowledge: [...contract.authorizedKnowledge],
    authorizedBehaviors: [...contract.authorizedBehaviors],
    restrictedBehaviors: [...contract.restrictedBehaviors],
  };
}

/**
 * Apply in-memory cast overlay for runtime simulation.
 * Returns a new object; canonical resident in registry is unchanged.
 */
export function applyCastOverlayForSimulation(
  resident: ResidentCanonicalIdentity,
  contract: ResidentCastRoleContract
): ResidentCanonicalIdentity & { _castOverlay: CastRolePersonaView } {
  const persona = buildCastRolePersonaView(resident, contract);
  const clone = cloneCanonicalIdentity(resident);
  return Object.freeze({
    ...clone,
    _castOverlay: Object.freeze(persona),
  });
}

/** Guard: mutating a contract field must not alter canonical identity snapshot. */
export function assertCastContractDoesNotMutateCanon(
  before: ResidentCanonicalIdentity,
  after: ResidentCanonicalIdentity
): boolean {
  return JSON.stringify(before) === JSON.stringify(after);
}
