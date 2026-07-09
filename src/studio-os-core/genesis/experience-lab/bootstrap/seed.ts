import { ensureExperienceRuntimeSubsystem } from '../../experience-runtime/engine';
import { updateRuntimeSelectionStore } from '../../experience-runtime/bootstrap/seed';
import { readExperienceLabStore, writeExperienceLabStore } from '../persistence';
import { buildExperienceLabSeedStore } from './seed-data';
import type { XelabLabSwitchers, XelabScenarioId } from '../constants';
import type { XelabSelection } from '../types';
import { XELAB_TEST_SCENARIOS } from '../constants';

export function seedExperienceLabStore(): void {
  ensureExperienceRuntimeSubsystem();
  const seed = buildExperienceLabSeedStore();
  const current = readExperienceLabStore();
  writeExperienceLabStore({
    ...current,
    ...seed,
    bootstrappedAt: new Date().toISOString(),
  });
}

export function ensureExperienceLabStore() {
  ensureExperienceRuntimeSubsystem();
  const current = readExperienceLabStore();
  if (!current.seededAt || !current.selection?.brandId) {
    seedExperienceLabStore();
    return readExperienceLabStore();
  }
  return current;
}

export function recordExperienceLabOpened(): void {
  const store = readExperienceLabStore();
  if (store.lastOpenedAt) return;
  writeExperienceLabStore({
    ...store,
    lastOpenedAt: new Date().toISOString(),
  });
}

export function applyLabScenario(scenarioId: XelabScenarioId): XelabSelection {
  const scenario = XELAB_TEST_SCENARIOS.find((s) => s.scenarioId === scenarioId);
  const store = readExperienceLabStore();
  if (!scenario) return store.selection;
  const selection: XelabSelection = {
    ...store.selection,
    scenarioId,
    brandId: scenario.brandId,
    departmentId: scenario.departmentId,
    sceneId: scenario.sceneId,
    motionDnaId: `motion-${scenario.brandId}`,
  };
  updateRuntimeSelectionStore({
    brandId: selection.brandId,
    departmentId: selection.departmentId,
    sceneId: selection.sceneId,
    motionDnaId: selection.motionDnaId,
  });
  writeExperienceLabStore({
    ...store,
    selection,
    switchCount: store.switchCount + 1,
  });
  return selection;
}

export function updateLabSelection(partial: Partial<XelabSelection>): XelabSelection {
  const store = readExperienceLabStore();
  const selection = { ...store.selection, ...partial };
  if (partial.brandId || partial.departmentId || partial.sceneId || partial.motionDnaId) {
    updateRuntimeSelectionStore({
      brandId: selection.brandId,
      departmentId: selection.departmentId,
      sceneId: selection.sceneId,
      motionDnaId: selection.motionDnaId,
    });
  }
  writeExperienceLabStore({
    ...store,
    selection,
    switchCount: store.switchCount + 1,
  });
  return selection;
}

export function updateLabSwitchers(partial: Partial<XelabLabSwitchers>): XelabLabSwitchers {
  const store = readExperienceLabStore();
  const switchers = { ...store.selection.switchers, ...partial };
  writeExperienceLabStore({
    ...store,
    selection: { ...store.selection, switchers },
    switchCount: store.switchCount + 1,
  });
  return switchers;
}

export function setActiveLabPanel(panel: XelabSelection['activePanel']): void {
  const store = readExperienceLabStore();
  writeExperienceLabStore({
    ...store,
    selection: { ...store.selection, activePanel: panel },
  });
}
