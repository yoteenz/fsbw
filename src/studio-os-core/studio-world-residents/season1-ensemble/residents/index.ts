import type { Season1ResidentCanonRecord } from '../types';
import { SW_RESIDENT_001 } from './SW-RESIDENT-001-etta-vale';
import { SW_RESIDENT_002 } from './SW-RESIDENT-002-zuri-xu';
import { SW_RESIDENT_003 } from './SW-RESIDENT-003-jules-mercer';
import { SW_RESIDENT_004 } from './SW-RESIDENT-004-noa-kline';
import { SW_RESIDENT_005 } from './SW-RESIDENT-005-caspian-reed';
import { SW_RESIDENT_006 } from './SW-RESIDENT-006-iona-wells';
import { SW_RESIDENT_007 } from './SW-RESIDENT-007-marlowe-saint';
import { SW_RESIDENT_008 } from './SW-RESIDENT-008-elio-vahn';

export const SEASON1_ENSEMBLE_RESIDENTS: Season1ResidentCanonRecord[] = [
  SW_RESIDENT_001,
  SW_RESIDENT_002,
  SW_RESIDENT_003,
  SW_RESIDENT_004,
  SW_RESIDENT_005,
  SW_RESIDENT_006,
  SW_RESIDENT_007,
  SW_RESIDENT_008,
];

export function getEnsembleCanonById(id: string): Season1ResidentCanonRecord | undefined {
  return SEASON1_ENSEMBLE_RESIDENTS.find((r) => r.id === id);
}
