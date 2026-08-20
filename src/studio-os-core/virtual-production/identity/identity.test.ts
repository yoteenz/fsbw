import { describe, expect, it } from 'vitest';
import {
  REFERENCE_PACK_V1_SLOTS,
  buildNiaReferencePackV1SlotStates,
} from '../canon/frontal-slayer-canon';
import {
  REFERENCE_PACK_V1_SLOT_LABELS,
  allSlotsApprovedOrLocked,
  applyLockToSlotStates,
  buildReferencePackV1SlotStates,
  normalizeSlotStates,
  packReadyToLock,
} from './reference-pack-v1';
import { evaluateCampaignIdentityGate, IDENTITY_FOUNDATION_BLOCKER } from './identity-gate';
import {
  approveReferenceSlot,
  assignCandidateToSlot,
  isPackLocked,
  lockReferencePackV1,
  ReferencePackImmutableError,
  rejectReferenceSlot,
} from './reference-pack-lifecycle';
import { OPENART_CHARACTER_AUDIT } from './openart-character-audit';
import { NIA_IDENTITY_REPO_AUDIT } from './identity-audit';
import { buildIdentityInvariantsDocument } from './identity-invariants';

describe('Nia Identity Lock — Reference Pack V1', () => {
  it('defines 13 labeled slots', () => {
    expect(REFERENCE_PACK_V1_SLOTS).toHaveLength(13);
    expect(REFERENCE_PACK_V1_SLOT_LABELS.front).toBe('01 FRONT');
    expect(REFERENCE_PACK_V1_SLOT_LABELS.skin_detail).toBe('13 SKIN DETAIL');
  });

  it('starts all slots MISSING', () => {
    const states = buildNiaReferencePackV1SlotStates();
    expect(Object.values(states).every((s) => s.state === 'missing')).toBe(true);
  });

  it('normalizes legacy string slot states', () => {
    const normalized = normalizeSlotStates({ front: 'approved', profile_left: 'missing' });
    expect(normalized.front.state).toBe('approved');
    expect(normalized.profile_left.state).toBe('missing');
  });

  it('assign → approve → lock lifecycle', () => {
    let states = buildReferencePackV1SlotStates();
    const assetIds: Record<string, string> = {};

    for (const slot of REFERENCE_PACK_V1_SLOTS) {
      const assetId = `asset-${slot}`;
      assetIds[slot] = assetId;
      states = assignCandidateToSlot(states, slot, { assetId, mediaUrl: `https://example/${slot}.jpg` });
      states = approveReferenceSlot(states, slot, {
        assetId,
        qc: [{ category: 'identity', status: 'pass' }],
      });
    }

    expect(allSlotsApprovedOrLocked(states)).toBe(true);
    expect(packReadyToLock(states, true)).toBe(true);

    const { lockedStates, lockRecord } = lockReferencePackV1({
      packKey: 'reference-pack-v1',
      version: 1,
      slotStates: states,
      primaryAnchorAssetId: assetIds.front,
      operator: 'test@frontalslayer.com',
    });

    expect(isPackLocked(lockedStates)).toBe(true);
    expect(lockRecord.immutable).toBe(true);
    expect(lockedStates.front.state).toBe('locked');
  });

  it('blocks mutation after lock', () => {
    let states = buildReferencePackV1SlotStates();
    states = approveReferenceSlot(states, 'front', {
      assetId: 'a1',
      qc: [{ category: 'overall', status: 'pass' }],
    });
    const locked = applyLockToSlotStates(
      Object.fromEntries(
        REFERENCE_PACK_V1_SLOTS.map((s) => [
          s,
          approveReferenceSlot(buildReferencePackV1SlotStates(), s, {
            assetId: `a-${s}`,
            qc: [{ category: 'overall', status: 'pass' }],
          })[s],
        ])
      ) as ReturnType<typeof buildReferencePackV1SlotStates>
    );

    expect(() =>
      assignCandidateToSlot(locked, 'front', { assetId: 'new' })
    ).toThrow(ReferencePackImmutableError);
  });

  it('rejects candidate but preserves provenance ids', () => {
    let states = buildReferencePackV1SlotStates();
    states = assignCandidateToSlot(states, 'profile_left', { assetId: 'bad-profile' });
    states = rejectReferenceSlot(states, 'profile_left', {
      candidateAssetId: 'bad-profile',
      reason: 'Different person — profile stress test fail',
      qc: [{ category: 'identity', status: 'fail', notes: 'MANUAL IDENTITY QC' }],
    });
    expect(states.profile_left.state).toBe('rejected');
    expect(states.profile_left.rejectedCandidateIds).toContain('bad-profile');
  });

  it('campaign identity gate blocked until pack locked with anchor', () => {
    const states = buildReferencePackV1SlotStates();
    const blocked = evaluateCampaignIdentityGate({
      packVersion: 1,
      packLockedAt: null,
      hasPrimaryAnchor: false,
      slotStates: states,
    });
    expect(blocked.status).toBe('blocked');
    expect(blocked.blockerReason).toBe(IDENTITY_FOUNDATION_BLOCKER);
    expect(blocked.allowsPrecisionMotion).toBe(false);
    expect(blocked.allowsPreviewWork).toBe(true);
  });

  it('campaign identity gate passes when V1 locked with 13 approved slots', () => {
    let states = buildReferencePackV1SlotStates();
    for (const slot of REFERENCE_PACK_V1_SLOTS) {
      states = approveReferenceSlot(states, slot, {
        assetId: `id-${slot}`,
        qc: [{ category: 'overall', status: 'pass' }],
      });
    }
    const { lockedStates, lockRecord } = lockReferencePackV1({
      packKey: 'reference-pack-v1',
      version: 1,
      slotStates: states,
      primaryAnchorAssetId: 'id-front',
      operator: 'operator',
    });

    const pass = evaluateCampaignIdentityGate({
      packVersion: 1,
      packLockedAt: lockRecord.lockedAt,
      hasPrimaryAnchor: true,
      slotStates: lockedStates,
    });
    expect(pass.status).toBe('pass');
    expect(pass.allowsPrecisionMotion).toBe(true);
  });

  it('OpenArt persistent character is EXTERNAL not programmatic', () => {
    expect(OPENART_CHARACTER_AUDIT.programmaticPersistentCharacter).toBe(false);
    expect(OPENART_CHARACTER_AUDIT.status).toBe('external');
  });

  it('repo audit finds no approved Nia imagery', () => {
    expect(NIA_IDENTITY_REPO_AUDIT.approvedImageryFound).toBe(false);
    expect(NIA_IDENTITY_REPO_AUDIT.findings.length).toBeGreaterThan(0);
  });

  it('identity invariants are text-derived not biometric', () => {
    const doc = buildIdentityInvariantsDocument();
    expect(doc.qcMode).toBe('MANUAL IDENTITY QC');
    expect(doc.imageAnchorRequired).toBe(true);
  });
});
