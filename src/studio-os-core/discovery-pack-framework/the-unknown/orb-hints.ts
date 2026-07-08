/**
 * Orb Unknown Hints™ — hint without explaining.
 * Mystery is part of the experience.
 */

export const ORB_UNKNOWN_HINTS = [
  'There are signals beyond the mapped frontier.',
  'Our historical records mention a forgotten district.',
  "I've detected unusual activity beyond the Innovation Region.",
  "I don't have authorization to access this area… yet.",
  'The Atlas ends — but Studio World does not.',
  'Cartographers report coordinates that resolve to fog.',
  'Something exists where the World Graph has no nodes.',
  'Civilization has not earned the right to see what lies beyond.',
  'I sense regions the Museum has prepared halls for — but no exhibit yet.',
  'The fog recedes when civilization advances. It never disappears entirely.',
] as const;

export function selectOrbUnknownHint(seed: number): string {
  return ORB_UNKNOWN_HINTS[Math.abs(seed) % ORB_UNKNOWN_HINTS.length]!;
}

export function buildOrbUnknownHint(input: {
  seed: number;
  signalsBeyondFrontier: boolean;
  fogActivePct: number;
  approachingConditionCount: number;
  communityDiscoveryProgressPct: number;
}): string {
  if (input.signalsBeyondFrontier && input.fogActivePct > 50) {
    return "I've detected unusual activity beyond the Innovation Region.";
  }
  if (input.approachingConditionCount > 0) {
    return 'There are signals beyond the mapped frontier.';
  }
  if (input.communityDiscoveryProgressPct >= 40) {
    return "I don't have authorization to access this area… yet.";
  }
  if (input.fogActivePct >= 60) {
    return 'Our historical records mention a forgotten district.';
  }
  return selectOrbUnknownHint(input.seed);
}
