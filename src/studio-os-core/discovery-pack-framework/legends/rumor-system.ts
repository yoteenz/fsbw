/**
 * The Rumor System™ — Orb references unusual observations.
 * Do not confirm. Do not deny.
 */

import type { PublicRumorSnapshot } from '../types';

export const ORB_RUMOR_OBSERVATIONS = [
  "I've detected architectural signatures beyond the mapped frontier.",
  'Historical records mention a civilization that no longer appears on the Atlas.',
  'There are unresolved references inside the World Graph.',
  'I cannot verify the existence of this location.',
  "I've found incomplete Blueprint fragments.",
  'Cartographers report coordinates that resolve to fog — I will not speculate further.',
  'The Museum catalog lists exhibits with no corresponding wing. I have no explanation.',
  'Some World Graph nodes reference inventors whose names appear nowhere else in the archives.',
  'I am not authorized to confirm what the Cartographers Guild is investigating.',
  'Expedition journals mention a district at these coordinates. The Atlas disagrees.',
] as const;

export function selectOrbRumorObservation(seed: number): string {
  return ORB_RUMOR_OBSERVATIONS[Math.abs(seed) % ORB_RUMOR_OBSERVATIONS.length]!;
}

export function buildOrbRumorLine(input: {
  seed: number;
  investigationActive: boolean;
  collaborationCapital: number;
  knowledgeCapital: number;
}): string {
  if (input.investigationActive && input.collaborationCapital >= 40) {
    return 'There are unresolved references inside the World Graph.';
  }
  if (input.knowledgeCapital >= 50) {
    return "I've found incomplete Blueprint fragments.";
  }
  if (input.collaborationCapital >= 55) {
    return 'Historical records mention a civilization that no longer appears on the Atlas.';
  }
  return selectOrbRumorObservation(input.seed);
}

export function buildPublicRumor(input: {
  seed: number;
  investigationActive: boolean;
  collaborationCapital: number;
  knowledgeCapital: number;
}): PublicRumorSnapshot {
  return {
    observation: buildOrbRumorLine(input),
    stance: 'Do not confirm. Do not deny.',
    verifiable: false,
  };
}
