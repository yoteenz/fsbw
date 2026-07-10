import { invalidateRuntimeCache } from '../experience-runtime/runtime-cache/runtime-cache';
import { updateRuntimeSelectionStore } from '../experience-runtime/bootstrap/seed';
import { XER_DEFAULT_RUNTIME_CONTRACT } from '../experience-runtime/runtime-boot/default-contract';
import type { GenesisStore } from '../types';
import {
  XELAB_DEFAULT_SWITCHERS,
  XELAB_PANEL_IDS,
  XELAB_SUBSYSTEM_VERSION,
  XELAB_SWITCHER_OPTIONS,
  XELAB_TEST_SCENARIOS,
  type XelabPanelId,
  type XelabScenarioId,
} from './constants';
import {
  emptyExperienceLabStore,
  normalizeExperienceLabStore,
  readExperienceLabStore,
  writeExperienceLabStore,
} from './persistence';
import type { XelabSelection, XelabStore } from './types';
import type { XelabLabSwitchers } from './constants';

export type ExperienceLabRepairResult = {
  repaired: boolean;
  reasons: string[];
};

function isEnumValue<T extends string>(value: unknown, options: readonly T[]): value is T {
  return typeof value === 'string' && (options as readonly string[]).includes(value);
}

function defaultLabSelection(): XelabSelection {
  const scenario = XELAB_TEST_SCENARIOS[0];
  return {
    scenarioId: scenario.scenarioId,
    brandId: scenario.brandId,
    departmentId: scenario.departmentId,
    sceneId: scenario.sceneId,
    motionDnaId: `motion-${scenario.brandId}`,
    switchers: { ...XELAB_DEFAULT_SWITCHERS },
    activePanel: 'runtime-status',
  };
}

/** Validate and coerce Experience Lab DNA — never leave incompatible persisted selection. */
export function sanitizeExperienceLabStore(stored?: Partial<XelabStore>): {
  store: XelabStore;
  repaired: boolean;
  reasons: string[];
} {
  const reasons: string[] = [];
  let repaired = false;

  if (!stored) {
    return { store: emptyExperienceLabStore(), repaired: false, reasons };
  }

  if (stored.version && stored.version !== XELAB_SUBSYSTEM_VERSION) {
    reasons.push(`experienceLabDna.version:${stored.version}→${XELAB_SUBSYSTEM_VERSION}`);
    repaired = true;
  }

  const base = repaired ? emptyExperienceLabStore() : normalizeExperienceLabStore(stored);
  const selection = { ...base.selection };
  let selectionChanged = false;

  const scenario = XELAB_TEST_SCENARIOS.find((s) => s.scenarioId === selection.scenarioId);
  if (!scenario) {
    reasons.push(`experienceLabDna.scenarioId:${selection.scenarioId ?? '∅'}→studio-os-hq`);
    const fallback = defaultLabSelection();
    Object.assign(selection, fallback);
    selectionChanged = true;
    repaired = true;
  }

  if (!isEnumValue(selection.brandId, XELAB_SWITCHER_OPTIONS.brand)) {
    reasons.push(`experienceLabDna.brandId:${selection.brandId}→${XER_DEFAULT_RUNTIME_CONTRACT.brandId}`);
    selection.brandId = XER_DEFAULT_RUNTIME_CONTRACT.brandId;
    selection.motionDnaId = `motion-${selection.brandId}`;
    selectionChanged = true;
    repaired = true;
  }

  if (!isEnumValue(selection.departmentId, XELAB_SWITCHER_OPTIONS.department)) {
    reasons.push(`experienceLabDna.departmentId:${selection.departmentId}→executive`);
    selection.departmentId = XER_DEFAULT_RUNTIME_CONTRACT.departmentId;
    selectionChanged = true;
    repaired = true;
  }

  if (!isEnumValue(selection.sceneId, XELAB_SWITCHER_OPTIONS.scene)) {
    reasons.push(`experienceLabDna.sceneId:${selection.sceneId}→${XER_DEFAULT_RUNTIME_CONTRACT.sceneId}`);
    selection.sceneId = XER_DEFAULT_RUNTIME_CONTRACT.sceneId;
    selectionChanged = true;
    repaired = true;
  }

  if (!isEnumValue(selection.activePanel, XELAB_PANEL_IDS)) {
    reasons.push(`experienceLabDna.activePanel:${selection.activePanel}→runtime-status`);
    selection.activePanel = 'runtime-status' as XelabPanelId;
    selectionChanged = true;
    repaired = true;
  }

  const switchers: XelabLabSwitchers = {
    themeVariant: isEnumValue(selection.switchers.themeVariant, XELAB_SWITCHER_OPTIONS.theme)
      ? selection.switchers.themeVariant
      : XELAB_DEFAULT_SWITCHERS.themeVariant,
    orbVariant: isEnumValue(selection.switchers.orbVariant, XELAB_SWITCHER_OPTIONS.orb)
      ? selection.switchers.orbVariant
      : XELAB_DEFAULT_SWITCHERS.orbVariant,
    lightingVariant: isEnumValue(selection.switchers.lightingVariant, XELAB_SWITCHER_OPTIONS.lighting)
      ? selection.switchers.lightingVariant
      : XELAB_DEFAULT_SWITCHERS.lightingVariant,
    particleVariant: isEnumValue(selection.switchers.particleVariant, XELAB_SWITCHER_OPTIONS.particle)
      ? selection.switchers.particleVariant
      : XELAB_DEFAULT_SWITCHERS.particleVariant,
    typographyVariant: isEnumValue(
      selection.switchers.typographyVariant,
      XELAB_SWITCHER_OPTIONS.typography
    )
      ? selection.switchers.typographyVariant
      : XELAB_DEFAULT_SWITCHERS.typographyVariant,
    animationVariant: isEnumValue(selection.switchers.animationVariant, XELAB_SWITCHER_OPTIONS.animation)
      ? selection.switchers.animationVariant
      : XELAB_DEFAULT_SWITCHERS.animationVariant,
  };

  if (
    switchers.themeVariant !== selection.switchers.themeVariant ||
    switchers.orbVariant !== selection.switchers.orbVariant ||
    switchers.lightingVariant !== selection.switchers.lightingVariant ||
    switchers.particleVariant !== selection.switchers.particleVariant ||
    switchers.typographyVariant !== selection.switchers.typographyVariant ||
    switchers.animationVariant !== selection.switchers.animationVariant
  ) {
    reasons.push('experienceLabDna.switchers:invalid→defaults');
    selectionChanged = true;
    repaired = true;
  }

  if (!selection.brandId || !selection.departmentId || !selection.sceneId) {
    Object.assign(selection, defaultLabSelection());
    reasons.push('experienceLabDna.selection:incomplete→default-scenario');
    selectionChanged = true;
    repaired = true;
  }

  const store: XelabStore = {
    ...base,
    version: XELAB_SUBSYSTEM_VERSION,
    selection: selectionChanged ? { ...selection, switchers } : { ...selection, switchers },
    switchCount: typeof base.switchCount === 'number' && base.switchCount >= 0 ? base.switchCount : 0,
    constitutionLocked: base.constitutionLocked ?? true,
  };

  if (selectionChanged) {
    store.seededAt = store.seededAt ?? new Date().toISOString();
  }

  return { store, repaired, reasons };
}

/** Repair persisted lab DNA and sync runtime selection when lab selection was corrected. */
export function repairExperienceLabStoreIfNeeded(): ExperienceLabRepairResult {
  const { store, repaired, reasons } = sanitizeExperienceLabStore(readExperienceLabStore());

  if (!repaired) {
    return { repaired: false, reasons: [] };
  }

  writeExperienceLabStore(store);
  updateRuntimeSelectionStore({
    brandId: store.selection.brandId,
    departmentId: store.selection.departmentId,
    sceneId: store.selection.sceneId,
    motionDnaId: store.selection.motionDnaId,
  });
  invalidateRuntimeCache();

  return { repaired: true, reasons };
}

/** Boot-time repair for genesis_v1 nested experienceLabDna (no localStorage write here). */
export function repairGenesisExperienceLabDna(
  genesis: GenesisStore
): { genesis: GenesisStore; repaired: boolean; reasons: string[] } {
  const { store, repaired, reasons } = sanitizeExperienceLabStore(genesis.experienceLabDna);
  if (!repaired) {
    return { genesis, repaired: false, reasons: [] };
  }

  const runtimeSelection = genesis.experienceRuntimeDna?.selection;
  const runtimeDna = genesis.experienceRuntimeDna
    ? {
        ...genesis.experienceRuntimeDna,
        selection: {
          brandId: store.selection.brandId,
          departmentId: store.selection.departmentId,
          sceneId: store.selection.sceneId,
          motionDnaId: store.selection.motionDnaId,
          componentId:
            runtimeSelection?.componentId ?? XER_DEFAULT_RUNTIME_CONTRACT.componentId,
        },
      }
    : genesis.experienceRuntimeDna;

  return {
    genesis: { ...genesis, experienceLabDna: store, experienceRuntimeDna: runtimeDna },
    repaired: true,
    reasons,
  };
}

export function applyLabScenarioSelection(scenarioId: XelabScenarioId): XelabSelection {
  const scenario = XELAB_TEST_SCENARIOS.find((s) => s.scenarioId === scenarioId);
  if (!scenario) return defaultLabSelection();
  return {
    scenarioId: scenario.scenarioId,
    brandId: scenario.brandId,
    departmentId: scenario.departmentId,
    sceneId: scenario.sceneId,
    motionDnaId: `motion-${scenario.brandId}`,
    switchers: { ...XELAB_DEFAULT_SWITCHERS },
    activePanel: 'runtime-status',
  };
}
