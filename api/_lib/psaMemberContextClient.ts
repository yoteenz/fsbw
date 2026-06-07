/**
 * Strip server-only fields before returning member context to the client.
 */
import type { PsaMemberContextSnapshot } from './psaMemberContext.js';

export function sanitizePsaMemberContextForClient(
  snapshot: PsaMemberContextSnapshot | null
): Omit<PsaMemberContextSnapshot, 'slayDna'> | null {
  if (!snapshot) return null;
  const { slayDna: _dna, ...rest } = snapshot;
  return rest;
}
