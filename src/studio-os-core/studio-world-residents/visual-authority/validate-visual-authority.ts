import { SEASON1_ENSEMBLE_RESIDENTS } from '../season1-ensemble/residents';
import { SEASON1_WORK_UNIFORM_SYSTEM } from '../season1-ensemble/uniform-system';
import type { ResidentId } from '../types';
import {
  SEASON1_VISUAL_AUTHORITY_BUNDLES,
  SEASON1_VISUAL_AUTHORITY_RECORDS,
  getPrimaryNaturalHabitatAuthority,
} from './season1-records';

const RESIDENT_IDS = SEASON1_ENSEMBLE_RESIDENTS.map((r) => r.id);

export function validateSeason1VisualAuthority(): string[] {
  const errors: string[] = [];

  if (SEASON1_VISUAL_AUTHORITY_BUNDLES.length !== 8) {
    errors.push(`expected 8 visual authority bundles, got ${SEASON1_VISUAL_AUTHORITY_BUNDLES.length}`);
  }

  for (const id of RESIDENT_IDS) {
    const bundle = SEASON1_VISUAL_AUTHORITY_BUNDLES.find((b) => b.residentId === id);
    if (!bundle?.visualAuthorityRefs.length) {
      errors.push(`${id}: missing visual authority refs`);
    }
    const natural = getPrimaryNaturalHabitatAuthority(id as ResidentId);
    if (!natural || natural.authorityType !== 'NATURAL_HABITAT_FULL_BODY') {
      errors.push(`${id}: missing natural-habitat primary authority`);
    }
    if (!natural?.isPrimaryIdentityAuthority) {
      errors.push(`${id}: natural habitat must be primary identity authority`);
    }

    const glam = SEASON1_VISUAL_AUTHORITY_RECORDS.find(
      (r) => r.residentId === id && r.authorityType === 'GLAMOUR_OR_ALTERNATE_MODE'
    );
    if (glam?.isPrimaryIdentityAuthority) {
      errors.push(`${id}: glamour/alternate cannot be primary identity authority`);
    }
    if (id === 'SW-RESIDENT-006' && glam && natural?.id === glam.id) {
      errors.push('Iona: full-glam must not replace natural authority');
    }

    for (const refId of bundle?.visualAuthorityRefs ?? []) {
      const rec = SEASON1_VISUAL_AUTHORITY_RECORDS.find((r) => r.id === refId);
      if (!rec) errors.push(`${id}: unresolved visual authority ref ${refId}`);
      else if (rec.residentId !== id) errors.push(`${refId}: residentId mismatch`);
    }
  }

  for (const rec of SEASON1_VISUAL_AUTHORITY_RECORDS) {
    if (!RESIDENT_IDS.includes(rec.residentId)) {
      errors.push(`${rec.id}: unknown residentId ${rec.residentId}`);
    }
    if (rec.authorityType === 'SUPERSEDED_REFERENCE' && rec.isPrimaryIdentityAuthority) {
      errors.push(`${rec.id}: superseded reference cannot be primary`);
    }
    if (rec.status === 'SUPERSEDED' && rec.isPrimaryIdentityAuthority) {
      errors.push(`${rec.id}: superseded status cannot be default authority`);
    }
    if (rec.residentId === 'SW-RESIDENT-002' && rec.authorityType !== 'SUPERSEDED_REFERENCE') {
      const activeBlob = JSON.stringify({
        face: rec.faceAuthority,
        body: rec.bodyAuthority,
        hair: rec.hairAuthority,
        wardrobe: rec.wardrobeAuthority,
        notes: rec.notes,
      }).toLowerCase();
      if (activeBlob.includes('hale')) {
        errors.push('Zuri active visual authority must not reference superseded Hale canon');
      }
    }
  }

  const marloweNatural = getPrimaryNaturalHabitatAuthority('SW-RESIDENT-007');
  if (!marloweNatural?.bodyAuthority?.toLowerCase().includes('larger')) {
    errors.push('Marlowe natural authority must protect larger-bodied body canon');
  }

  const uniformRecords = SEASON1_VISUAL_AUTHORITY_RECORDS.filter(
    (r) => r.authorityType === 'WORK_UNIFORM_REFERENCE'
  );
  if (uniformRecords.length !== 8) {
    errors.push('expected work uniform reference per resident');
  }
  for (const u of uniformRecords) {
    if (u.status !== 'CONCEPT_LOCKED_VISUAL_PENDING') {
      errors.push(`${u.id}: work uniform must stay CONCEPT_LOCKED_VISUAL_PENDING`);
    }
    if (u.founderApproved) {
      errors.push(`${u.id}: work uniform must not be founderApproved`);
    }
  }
  if (SEASON1_WORK_UNIFORM_SYSTEM.status !== 'CONCEPT_LOCKED_VISUAL_PENDING') {
    errors.push('ensemble uniform system must be CONCEPT_LOCKED_VISUAL_PENDING');
  }

  for (const id of RESIDENT_IDS) {
    const naturals = SEASON1_VISUAL_AUTHORITY_RECORDS.filter(
      (r) => r.residentId === id && r.authorityType === 'NATURAL_HABITAT_FULL_BODY'
    );
    if (naturals.length !== 1) errors.push(`${id}: expected exactly one natural habitat authority`);
    const signed = SEASON1_VISUAL_AUTHORITY_RECORDS.filter(
      (r) => r.residentId === id && r.authorityType === 'SIGNED_WALL_PORTRAIT'
    );
    if (signed.length !== 1) errors.push(`${id}: expected signed portrait authority slot`);
  }

  return errors;
}
