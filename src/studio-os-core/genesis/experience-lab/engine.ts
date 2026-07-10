import { updateBuildOrderSystemStatus } from '../build-order/build-order/registry';
import {
  ensureExperienceLabStore,
  recordExperienceLabOpened,
  seedExperienceLabStore,
  applyLabScenario,
  updateLabSelection,
  updateLabSwitchers,
  setActiveLabPanel,
} from './bootstrap/seed';
import { applyLabSwitchersToGraph } from './engines/lab-switchers';
import { buildExperienceLabReadyView } from './room/ready-view';
export { validateRuntimeBoot } from './room/ready-view';
import {
  mutateExperienceLabStore,
  readExperienceLabStore,
} from './persistence';
import {
  repairExperienceLabStoreIfNeeded,
  sanitizeExperienceLabStore,
  repairGenesisExperienceLabDna,
} from './repair';
import {
  XELAB_PANEL_IDS,
  XELAB_PANEL_LABELS,
  XELAB_SUBSYSTEM_NAME,
  XELAB_SUBSYSTEM_VERSION,
  XELAB_TEST_SCENARIOS,
  XELAB_SWITCHER_OPTIONS,
  XELAB_DEFAULT_SWITCHERS,
} from './constants';

export function ensureExperienceLabSubsystem() {
  const store = ensureExperienceLabStore();
  if (store.seededAt) {
    updateBuildOrderSystemStatus('experience-lab', 'implemented');
  }
  return store;
}

export function getExperienceLabReadyView(input?: import('./types').XelabRuntimeInput) {
  return buildExperienceLabReadyView(input);
}

export {
  XELAB_SUBSYSTEM_NAME,
  XELAB_SUBSYSTEM_VERSION,
  XELAB_PANEL_IDS,
  XELAB_PANEL_LABELS,
  XELAB_TEST_SCENARIOS,
  XELAB_SWITCHER_OPTIONS,
  XELAB_DEFAULT_SWITCHERS,
  readExperienceLabStore,
  mutateExperienceLabStore,
  seedExperienceLabStore,
  ensureExperienceLabStore,
  recordExperienceLabOpened,
  applyLabScenario,
  updateLabSelection,
  updateLabSwitchers,
  setActiveLabPanel,
  buildExperienceLabReadyView,
  applyLabSwitchersToGraph,
  repairExperienceLabStoreIfNeeded,
  sanitizeExperienceLabStore,
  repairGenesisExperienceLabDna,
};

export type {
  XelabStore,
  XelabReadyView,
  XelabSelection,
  XelabRuntimeInput,
} from './types';

export type { XelabPanelId, XelabScenarioId, XelabLabSwitchers } from './constants';
export type { XerRuntimeBootReport } from '../experience-runtime/runtime-boot/runtime-boot-validator';
