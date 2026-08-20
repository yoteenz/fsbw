/**
 * Reference Pack V1 — slot registry, labels, state helpers.
 */

import {
  REFERENCE_PACK_V1_SLOTS,
  type ReferencePackSlot,
} from '../canon/frontal-slayer-canon';
import type {
  ReferencePackSlotLifecycleState,
  ReferencePackSlotRecord,
  ReferencePackSlotStates,
} from './types';

export const REFERENCE_PACK_V1_SLOT_LABELS: Record<ReferencePackSlot, string> = {
  front: '01 FRONT',
  three_quarter_left: '02 3/4 LEFT',
  three_quarter_right: '03 3/4 RIGHT',
  profile_left: '04 PROFILE LEFT',
  profile_right: '05 PROFILE RIGHT',
  medium: '06 MEDIUM',
  full_body: '07 FULL BODY',
  neutral: '08 NEUTRAL EXPRESSION',
  smile: '09 SMILE',
  serious: '10 SERIOUS EXPRESSION',
  movement: '11 MOVEMENT',
  hair_detail: '12 HAIR DETAIL',
  skin_detail: '13 SKIN DETAIL',
};

export const PROFILE_STRESS_TEST_SLOTS: ReferencePackSlot[] = [
  'three_quarter_left',
  'three_quarter_right',
  'profile_left',
  'profile_right',
];

export const IDENTITY_QC_CATEGORIES = [
  'identity',
  'face_geometry',
  'age_presentation',
  'skin',
  'hair',
  'body',
  'anatomy',
  'realism',
  'canon_fidelity',
  'overall',
] as const;

export function emptySlotRecord(): ReferencePackSlotRecord {
  return { state: 'missing' };
}

/** Build initial V1 slot map — all MISSING */
export function buildReferencePackV1SlotStates(): ReferencePackSlotStates {
  const states = {} as ReferencePackSlotStates;
  for (const slot of REFERENCE_PACK_V1_SLOTS) {
    states[slot] = emptySlotRecord();
  }
  return states;
}

/** Normalize legacy simple string slot states from DB seed */
export function normalizeSlotStates(raw: unknown): ReferencePackSlotStates {
  const base = buildReferencePackV1SlotStates();
  if (!raw || typeof raw !== 'object') return base;

  for (const slot of REFERENCE_PACK_V1_SLOTS) {
    const value = (raw as Record<string, unknown>)[slot];
    if (typeof value === 'string') {
      base[slot] = { state: coerceLegacyState(value) };
    } else if (value && typeof value === 'object') {
      const rec = value as ReferencePackSlotRecord;
      base[slot] = {
        ...emptySlotRecord(),
        ...rec,
        state: rec.state ?? 'missing',
      };
    }
  }
  return base;
}

function coerceLegacyState(value: string): ReferencePackSlotLifecycleState {
  switch (value) {
    case 'approved':
      return 'approved';
    case 'replace':
      return 'rejected';
    case 'archived':
      return 'rejected';
    case 'missing':
    default:
      return 'missing';
  }
}

export function countSlotsByState(states: ReferencePackSlotStates): Record<ReferencePackSlotLifecycleState, number> {
  const counts: Record<ReferencePackSlotLifecycleState, number> = {
    missing: 0,
    candidate: 0,
    qc_required: 0,
    approved: 0,
    rejected: 0,
    locked: 0,
  };
  for (const slot of REFERENCE_PACK_V1_SLOTS) {
    counts[states[slot]?.state ?? 'missing'] += 1;
  }
  return counts;
}

export function allSlotsApprovedOrLocked(states: ReferencePackSlotStates): boolean {
  return REFERENCE_PACK_V1_SLOTS.every((slot) => {
    const s = states[slot]?.state ?? 'missing';
    return s === 'approved' || s === 'locked';
  });
}

export function packReadyToLock(states: ReferencePackSlotStates, hasAnchor: boolean): boolean {
  return hasAnchor && allSlotsApprovedOrLocked(states);
}

export function applyLockToSlotStates(states: ReferencePackSlotStates): ReferencePackSlotStates {
  const next = { ...states };
  for (const slot of REFERENCE_PACK_V1_SLOTS) {
    const rec = next[slot];
    if (rec?.state === 'approved') {
      next[slot] = { ...rec, state: 'locked' };
    }
  }
  return next;
}

export function slotComparesToAnchor(slot: ReferencePackSlot): boolean {
  return slot !== 'front' && REFERENCE_PACK_V1_SLOTS.includes(slot);
}
