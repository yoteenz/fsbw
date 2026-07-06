import { getDigitalStaffDefinition } from '../monetization-architecture/digital-staff-catalog';
import type { ConciergeBrainBinding, OrganizationProfessionBrainProfile } from './types';

export function listConciergeBrainBindings(
  profile: OrganizationProfessionBrainProfile
): ConciergeBrainBinding[] {
  const bindings: ConciergeBrainBinding[] = [];

  for (const brain of profile.brains) {
    if (!brain.conciergeId) continue;
    const staff = getDigitalStaffDefinition(brain.conciergeId);
    bindings.push({
      conciergeId: brain.conciergeId,
      brainId: brain.id,
      voiceNote: `${staff?.name ?? 'Concierge'} speaks from ${brain.label} — never invents policy; references organizational memory.`,
    });
  }

  if (bindings.length === 0) {
    bindings.push({
      conciergeId: 'chief-concierge',
      brainId: profile.brains[0]?.id ?? 'marketing',
      voiceNote: 'Chief Concierge coordinates all Profession Brains — routes requests to the right institutional intelligence.',
    });
  }

  return bindings;
}

export function resolveConciergeForBrain(
  profile: OrganizationProfessionBrainProfile,
  brainId: string
): string {
  const brain = profile.brains.find((b) => b.id === brainId);
  return brain?.conciergeId ?? 'chief-concierge';
}

export function resolveBrainForConcierge(
  profile: OrganizationProfessionBrainProfile,
  conciergeId: string
): string | null {
  return profile.brains.find((b) => b.conciergeId === conciergeId)?.id ?? null;
}
