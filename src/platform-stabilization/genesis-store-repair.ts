/**
 * Genesis localStorage repair — prevents stale/corrupt persisted state from breaking Studio OS.
 */

import { GENESIS_FRAMEWORK_VERSION, GENESIS_STORAGE_KEY } from '../studio-os-core/genesis/constants';
import { invalidateGenesisStoreCache } from '../studio-os-core/genesis/persistence/store';
import type { GenesisStore } from '../studio-os-core/genesis/types';
import { purgeOversizedStudioLocalKeys, writeStudioOsMemoryValue } from '../utils/studioOsBrowserStorage';
import { repairGenesisExperiencePersistence } from './genesis-experience-persistence-repair';

const MAX_GENESIS_BYTES = 512 * 1024;

export type GenesisRepairResult = {
  repaired: boolean;
  reason?: string;
};

function safeParseGenesis(raw: string): GenesisStore | null {
  try {
    const parsed = JSON.parse(raw) as GenesisStore;
    if (!parsed || typeof parsed !== 'object') return null;
    return parsed;
  } catch {
    return null;
  }
}

function clearGenesisKey(): void {
  try {
    localStorage.removeItem(GENESIS_STORAGE_KEY);
  } catch {
    /* ignore */
  }
  invalidateGenesisStoreCache();
}

/** Validate and repair genesis_v1 in localStorage before first read. Safe on every boot. */
export function repairGenesisLocalStorageIfNeeded(): GenesisRepairResult {
  if (typeof window === 'undefined' || !window.localStorage) {
    return { repaired: false };
  }

  purgeOversizedStudioLocalKeys();

  let raw: string | null = null;
  try {
    raw = localStorage.getItem(GENESIS_STORAGE_KEY);
  } catch {
    return { repaired: false, reason: 'localStorage unreadable' };
  }

  if (!raw) return { repaired: false };

  if (raw.length > MAX_GENESIS_BYTES) {
    writeStudioOsMemoryValue(GENESIS_STORAGE_KEY, raw);
    clearGenesisKey();
    return { repaired: true, reason: `genesis payload exceeded ${MAX_GENESIS_BYTES} bytes` };
  }

  const parsed = safeParseGenesis(raw);
  if (!parsed) {
    clearGenesisKey();
    return { repaired: true, reason: 'genesis JSON parse failed' };
  }

  const version = parsed.frameworkVersion ?? parsed.version;
  if (version && version !== GENESIS_FRAMEWORK_VERSION) {
    writeStudioOsMemoryValue(`${GENESIS_STORAGE_KEY}_backup_${version}`, raw);
    clearGenesisKey();
    return { repaired: true, reason: `genesis version reset (${version} → ${GENESIS_FRAMEWORK_VERSION})` };
  }

  const experienceRepair = repairGenesisExperiencePersistence(parsed);
  if (experienceRepair.repaired) {
    try {
      const repairedRaw = JSON.stringify(experienceRepair.genesis);
      localStorage.setItem(GENESIS_STORAGE_KEY, repairedRaw);
      invalidateGenesisStoreCache();
      return {
        repaired: true,
        reason: experienceRepair.reasons.join('; '),
      };
    } catch {
      clearGenesisKey();
      return { repaired: true, reason: 'experience DNA repair write failed — cleared genesis' };
    }
  }

  return { repaired: false };
}
