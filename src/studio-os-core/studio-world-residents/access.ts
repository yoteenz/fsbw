import type { ResidentAccessGrant, ResidentAccessGrantKind, ResidentId } from './types';

export const RESIDENT_ACCESS_GRANT_KINDS: readonly ResidentAccessGrantKind[] = [
  'DEFAULT',
  'STARTER',
  'TIER_BASED',
  'EARNED',
  'PURCHASED',
  'TEMPORARY',
  'CLIENT_SPECIFIC',
  'PREMIUM_SPECIALIST',
  'BOOKING_ONLY',
] as const;

export function isValidAccessGrantKind(value: string): value is ResidentAccessGrantKind {
  return (RESIDENT_ACCESS_GRANT_KINDS as readonly string[]).includes(value);
}

export function listActiveGrantsForResident(
  grants: ResidentAccessGrant[],
  residentId: ResidentId,
  atIso = new Date().toISOString()
): ResidentAccessGrant[] {
  return grants.filter((g) => {
    if (g.residentId !== residentId || !g.active) return false;
    if (g.startsAt && g.startsAt > atIso) return false;
    if (g.endsAt && g.endsAt < atIso) return false;
    return true;
  });
}

/** Foundation: default world cast is defined in canon — not tenant-unlocked yet. */
export function buildDefaultWorldResidentAccessPolicy(): {
  description: string;
  defaultGrantKind: ResidentAccessGrantKind;
} {
  return {
    description:
      'Season 1 residents exist in Studio World canon. Tenant unlock grants are modeled separately — no billing in foundation sprint.',
    defaultGrantKind: 'DEFAULT',
  };
}
