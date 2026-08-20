/**
 * Campaign 001 identity gate — blocks expensive identity-dependent motion until pack locked.
 */

import type { CampaignIdentityGateStatus } from './types';
import type { ReferencePackSlotStates } from './types';
import { allSlotsApprovedOrLocked } from './reference-pack-v1';

export const IDENTITY_FOUNDATION_BLOCKER = 'IDENTITY FOUNDATION REQUIRED';

export type IdentityGateEvaluation = {
  status: CampaignIdentityGateStatus;
  blockerReason: string | null;
  referencePackVersion: number | null;
  referencePackLocked: boolean;
  hasPrimaryAnchor: boolean;
  approvedSlotCount: number;
  totalSlots: number;
  allowsPreviewWork: true;
  allowsPrecisionMotion: boolean;
};

export function evaluateCampaignIdentityGate(input: {
  packVersion: number | null;
  packLockedAt: string | null;
  hasPrimaryAnchor: boolean;
  slotStates: ReferencePackSlotStates;
}): IdentityGateEvaluation {
  const approvedSlotCount = Object.values(input.slotStates).filter(
    (s) => s.state === 'approved' || s.state === 'locked'
  ).length;
  const totalSlots = Object.keys(input.slotStates).length;
  const packLocked = Boolean(input.packLockedAt);
  const allReady = allSlotsApprovedOrLocked(input.slotStates);

  const pass =
    packLocked &&
    input.hasPrimaryAnchor &&
    allReady &&
    approvedSlotCount === totalSlots &&
    totalSlots === 13;

  return {
    status: pass ? 'pass' : 'blocked',
    blockerReason: pass ? null : IDENTITY_FOUNDATION_BLOCKER,
    referencePackVersion: input.packVersion,
    referencePackLocked: packLocked,
    hasPrimaryAnchor: input.hasPrimaryAnchor,
    approvedSlotCount,
    totalSlots,
    allowsPreviewWork: true,
    allowsPrecisionMotion: pass,
  };
}

export function assertPrecisionMotionAllowed(gate: IdentityGateEvaluation): void {
  if (!gate.allowsPrecisionMotion) {
    throw new Error(gate.blockerReason ?? IDENTITY_FOUNDATION_BLOCKER);
  }
}
