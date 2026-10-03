import { SEASON1_ENSEMBLE_RESIDENTS } from './residents';
import { SEASON1_WORK_UNIFORM_SYSTEM } from './uniform-system';
import { SEASON1_SUPERSEDED_CANON } from './superseded-canon';

export function validateSeason1EnsembleCanon(): string[] {
  const errors: string[] = [];
  if (SEASON1_ENSEMBLE_RESIDENTS.length !== 8) {
    errors.push(`expected 8 residents, got ${SEASON1_ENSEMBLE_RESIDENTS.length}`);
  }
  const ids = SEASON1_ENSEMBLE_RESIDENTS.map((r) => r.id);
  const names = SEASON1_ENSEMBLE_RESIDENTS.map((r) => r.canonicalName);
  if (new Set(ids).size !== 8) errors.push('resident IDs not unique');
  if (new Set(names).size !== 8) errors.push('canonical names not unique');

  const zuri = SEASON1_ENSEMBLE_RESIDENTS.find((r) => r.id === 'SW-RESIDENT-002');
  if (zuri?.canonicalName !== 'Zuri Xu') errors.push('Zuri canonical surname must be Xu');

  const marlowe = SEASON1_ENSEMBLE_RESIDENTS.find((r) => r.id === 'SW-RESIDENT-007');
  if (marlowe?.age !== 54) errors.push('Marlowe age must be 54');
  if (!marlowe?.physicalCanon.build.toLowerCase().includes('larger')) {
    errors.push('Marlowe body canon must include larger-bodied');
  }

  const caspian = SEASON1_ENSEMBLE_RESIDENTS.find((r) => r.id === 'SW-RESIDENT-005');
  if (!caspian?.sexuality.label.toLowerCase().includes('fluid')) {
    errors.push('Caspian sexuality must be fluid');
  }

  const ev = SEASON1_ENSEMBLE_RESIDENTS.find((r) => r.id === 'SW-RESIDENT-008');
  if (ev?.sexuality.authority !== 'OPEN') errors.push('EV sexuality must be OPEN/unresolved');

  const noa = SEASON1_ENSEMBLE_RESIDENTS.find((r) => r.id === 'SW-RESIDENT-004');
  if (!noa?.heritage?.includes('Okinawan')) errors.push('Noa heritage must include Okinawan/Ryukyuan');
  if (!noa?.relationshipStatus.summary.includes('Two daughters')) {
    errors.push('Noa family must include wife + two daughters');
  }

  const iona = SEASON1_ENSEMBLE_RESIDENTS.find((r) => r.id === 'SW-RESIDENT-006');
  if (!iona?.glamourArc?.notMakeoverEndpoint) {
    errors.push('Iona glamour arc must not encode makeover-final-state');
  }

  if (SEASON1_WORK_UNIFORM_SYSTEM.status !== 'CONCEPT_LOCKED_VISUAL_PENDING') {
    errors.push('work uniform status must be CONCEPT_LOCKED_VISUAL_PENDING');
  }

  for (const r of SEASON1_ENSEMBLE_RESIDENTS) {
    if (r.naturalWardrobeAuthority === SEASON1_WORK_UNIFORM_SYSTEM.summary) {
      errors.push(`${r.id}: natural wardrobe must not equal work uniform`);
    }
    for (const field of r.protectedOpenFields) {
      if (!field || field.trim().length === 0) errors.push(`${r.id}: empty protected field`);
    }
  }

  const activeNames = names.join(' ').toLowerCase();
  for (const s of SEASON1_SUPERSEDED_CANON) {
    if (s.id === 'zuri-hale-surname' && activeNames.includes('hale')) {
      errors.push('superseded Zuri Hale must not appear in active names');
    }
  }

  return errors;
}
