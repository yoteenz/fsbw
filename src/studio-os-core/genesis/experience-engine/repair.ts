import type { GenesisStore } from '../types';
import {
  XEE_DEMO_BRAND_IDS,
  XEE_SUBSYSTEM_VERSION,
  type XeeDemoBrandId,
} from './constants';
import {
  emptyExperienceEngineDnaStore,
  normalizeExperienceEngineDnaStore,
  readExperienceEngineDnaStore,
  writeExperienceEngineDnaStore,
} from './persistence';
import { SEED_BRAND_DNA, SEED_DEPARTMENT_DNA, SEED_MOTION_DNA, SEED_SCENE_DNA } from './bootstrap/seed-data';
import type { XeeBrandDna, XeePlaygroundSelection, XeeStore } from './types';

export const EXPERIENCE_ENGINE_MIGRATION_LEDGER_KEY = 'studioOsExperienceEngineMigration_v1';

export type ExperienceEngineRepairResult = {
  repaired: boolean;
  reasons: string[];
};

function isDemoBrand(value: unknown): value is XeeDemoBrandId {
  return typeof value === 'string' && (XEE_DEMO_BRAND_IDS as readonly string[]).includes(value);
}

function brandRecordValid(brand: XeeBrandDna | undefined): brand is XeeBrandDna {
  return Boolean(
    brand?.brandId &&
      brand.colorSystem?.primary &&
      brand.glassStyle?.border &&
      brand.typography?.displayFont &&
      brand.lighting?.ambientGradient
  );
}

function registryValid(store: XeeStore): boolean {
  if (!store.brands?.length || !store.departments?.length || !store.scenes?.length) return false;
  if (!store.motions?.length || !store.interactions?.length) return false;
  if (store.brands.length < SEED_BRAND_DNA.length) return false;

  const requiredBrandIds = new Set(SEED_BRAND_DNA.map((b) => b.brandId));
  for (const brand of store.brands) {
    if (!brandRecordValid(brand) || !requiredBrandIds.has(brand.brandId)) return false;
  }

  for (const demoId of XEE_DEMO_BRAND_IDS) {
    if (!store.brands.some((b) => b.brandId === demoId)) return false;
    if (!store.departments.some((d) => d.brandId === demoId)) return false;
    if (!store.motions.some((m) => m.brandId === demoId)) return false;
  }

  if (store.scenes.length < 5) return false;
  if (!store.scenes.every((s) => typeof s?.sceneId === 'string' && s.sceneId.length > 0)) return false;

  return true;
}

function defaultPlayground(): XeePlaygroundSelection {
  return emptyExperienceEngineDnaStore().playground;
}

function departmentValid(brandId: string, departmentId: string, store: XeeStore): boolean {
  return (
    SEED_DEPARTMENT_DNA.some((d) => d.brandId === brandId && d.departmentId === departmentId) ||
    store.departments.some((d) => d.brandId === brandId && d.departmentId === departmentId)
  );
}

function sceneValid(sceneId: string, store: XeeStore): boolean {
  return (
    SEED_SCENE_DNA.some((s) => s.sceneId === sceneId) ||
    store.scenes.some((s) => s.sceneId === sceneId)
  );
}

function motionValid(brandId: string, motionDnaId: string, store: XeeStore): boolean {
  return (
    SEED_MOTION_DNA.some((m) => m.motionDnaId === motionDnaId && m.brandId === brandId) ||
    store.motions.some((m) => m.motionDnaId === motionDnaId)
  );
}

function appendMigrationLedger(reasons: string[]): void {
  if (typeof window === 'undefined' || reasons.length === 0) return;
  try {
    const entry = {
      at: new Date().toISOString(),
      subsystem: 'experienceEngineDna',
      schemaVersion: XEE_SUBSYSTEM_VERSION,
      reasons,
    };
    const raw = localStorage.getItem(EXPERIENCE_ENGINE_MIGRATION_LEDGER_KEY);
    const prev = raw ? (JSON.parse(raw) as unknown[]) : [];
    localStorage.setItem(
      EXPERIENCE_ENGINE_MIGRATION_LEDGER_KEY,
      JSON.stringify([...prev.slice(-19), entry])
    );
  } catch {
    /* quota — non-fatal */
  }
}

/** Validate and coerce Experience Engine DNA — never leave incompatible persisted playground or registries. */
export function sanitizeExperienceEngineDnaStore(stored?: Partial<XeeStore>): {
  store: XeeStore;
  repaired: boolean;
  reasons: string[];
} {
  const reasons: string[] = [];
  let repaired = false;

  if (!stored) {
    return { store: emptyExperienceEngineDnaStore(), repaired: false, reasons };
  }

  if (stored.version && stored.version !== XEE_SUBSYSTEM_VERSION) {
    reasons.push(`experienceEngineDna.version:${stored.version}→${XEE_SUBSYSTEM_VERSION}`);
    repaired = true;
  }

  let base = repaired ? emptyExperienceEngineDnaStore() : normalizeExperienceEngineDnaStore(stored);

  if (!registryValid(base)) {
    reasons.push('experienceEngineDna.registry:invalid→bundled-seed-fallback');
    base = {
      ...base,
      brands: [],
      departments: [],
      scenes: [],
      components: [],
      motions: [],
      interactions: [],
      seededAt: undefined,
      bootstrappedAt: undefined,
    };
    repaired = true;
  }

  const playground = { ...defaultPlayground(), ...base.playground };
  let playgroundChanged = false;

  if (!isDemoBrand(playground.brandId)) {
    reasons.push(`experienceEngineDna.playground.brandId:${playground.brandId}→studio-os`);
    playground.brandId = 'studio-os';
    playground.motionDnaId = 'motion-studio-os';
    playgroundChanged = true;
    repaired = true;
  }

  if (!departmentValid(playground.brandId, playground.departmentId, base)) {
    reasons.push(`experienceEngineDna.playground.departmentId:${playground.departmentId}→executive`);
    playground.departmentId = 'executive';
    playgroundChanged = true;
    repaired = true;
  }

  if (!sceneValid(playground.sceneId, base)) {
    reasons.push(`experienceEngineDna.playground.sceneId:${playground.sceneId}→executive-headquarters`);
    playground.sceneId = 'executive-headquarters';
    playgroundChanged = true;
    repaired = true;
  }

  if (!motionValid(playground.brandId, playground.motionDnaId, base)) {
    reasons.push(`experienceEngineDna.playground.motionDnaId:${playground.motionDnaId}→motion-${playground.brandId}`);
    playground.motionDnaId = `motion-${playground.brandId}`;
    playgroundChanged = true;
    repaired = true;
  }

  const store: XeeStore = playgroundChanged
    ? { ...base, playground, version: XEE_SUBSYSTEM_VERSION }
    : { ...base, version: XEE_SUBSYSTEM_VERSION };

  return { store, repaired, reasons };
}

/** Repair persisted engine DNA in genesis — writes when invoked from route hook. */
export function repairExperienceEngineDnaIfNeeded(options?: { force?: boolean }): ExperienceEngineRepairResult {
  const current = readExperienceEngineDnaStore();
  const { store, repaired, reasons } = options?.force
    ? {
        store: emptyExperienceEngineDnaStore(),
        repaired: true,
        reasons: ['experienceEngineDna:force-quarantine→default'],
      }
    : sanitizeExperienceEngineDnaStore(current);

  if (!repaired) {
    return { repaired: false, reasons: [] };
  }

  writeExperienceEngineDnaStore(store);
  appendMigrationLedger(reasons);
  return { repaired: true, reasons };
}

/** Boot-time repair for genesis_v1 nested experienceEngineDna (no direct localStorage write). */
export function repairGenesisExperienceEngineDna(
  genesis: GenesisStore
): { genesis: GenesisStore; repaired: boolean; reasons: string[] } {
  const { store, repaired, reasons } = sanitizeExperienceEngineDnaStore(genesis.experienceEngineDna);
  if (!repaired) {
    return { genesis, repaired: false, reasons: [] };
  }
  return {
    genesis: { ...genesis, experienceEngineDna: store },
    repaired: true,
    reasons,
  };
}

/** Quarantine only Experience Engine-owned genesis slice — preserves unrelated genesis data. */
export function quarantineExperienceEngineDnaSlice(): ExperienceEngineRepairResult {
  return repairExperienceEngineDnaIfNeeded({ force: true });
}
