import type { PSAEpisodeEntitlement, PSAEntitlementStatus } from './types';

export function deriveEntitlementStatus(ent: PSAEpisodeEntitlement): PSAEntitlementStatus {
  if (ent.status === 'revoked') return 'revoked';
  if (new Date(ent.expiresAt).getTime() <= Date.now()) return 'expired';
  if (ent.watchesRemaining <= 0) return 'watches-exhausted';
  return ent.status === 'active' ? 'active' : ent.status;
}

export function psaEntitlementIsExpired(ent: PSAEpisodeEntitlement): boolean {
  return deriveEntitlementStatus(ent) === 'expired';
}

export function psaEntitlementWatchesExhausted(ent: PSAEpisodeEntitlement): boolean {
  return deriveEntitlementStatus(ent) === 'watches-exhausted';
}

/** Can begin a new paid Camera B session (watches remain + not expired). */
export function psaEntitlementCanStartNewWatch(ent: PSAEpisodeEntitlement): boolean {
  const status = deriveEntitlementStatus(ent);
  return status === 'active' && ent.watchesRemaining > 0;
}

/** Paid lesson access — entitlement with watches or grace session already qualified in-flight. */
export function psaEntitlementAllowsPaidPlayback(
  ent: PSAEpisodeEntitlement | null | undefined,
  options?: { graceSessionOpen?: boolean }
): boolean {
  if (!ent) return false;
  if (options?.graceSessionOpen) return true;
  return psaEntitlementCanStartNewWatch(ent);
}

export function psaEntitlementNeedsRedemption(ent: PSAEpisodeEntitlement | null | undefined): boolean {
  if (!ent) return true;
  const status = deriveEntitlementStatus(ent);
  return status === 'expired' || status === 'watches-exhausted';
}
