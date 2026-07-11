/**
 * Experience Lab validation compile — ephemeral ProductionAuthorization™ (Option A).
 * Admin-only studio-builder routes; exploratory_draft output; no Asset Registry writes.
 */

export const VALIDATION_EPHEMERAL_AUTHORIZATION_ID = 'auth-experience-lab-validation-ephemeral-v1';

export function isValidationEphemeralAuthorizationId(id: string | undefined | null): boolean {
  return id?.trim() === VALIDATION_EPHEMERAL_AUTHORIZATION_ID;
}
