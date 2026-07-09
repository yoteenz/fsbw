import { assembleExperienceRuntime } from '../../experience-runtime/runtime-engine/experience-runtime';
import { buildRuntimeInspectorView } from '../../experience-runtime/runtime-preview/inspector-view';
import { readExperienceLabStore } from '../persistence';
import { applyLabSwitchersToGraph, getScenarioHeroLabel, getScenarioLabel } from '../engines/lab-switchers';
import type { XelabReadyView, XelabRuntimeInput } from '../types';

export function buildXelabOrbNote(): string {
  return 'Experience Lab™ — inspect, test, switch, and validate every DNA layer before production. Same runtime spine; only inherited DNA changes.';
}

export function buildExperienceLabReadyView(input?: XelabRuntimeInput): XelabReadyView {
  const store = readExperienceLabStore();
  const selection = input?.selection ? { ...store.selection, ...input.selection } : store.selection;

  const rawGraph = assembleExperienceRuntime({
    brandId: selection.brandId,
    departmentId: selection.departmentId,
    sceneId: selection.sceneId,
    motionDnaId: selection.motionDnaId,
    skipCache: true,
  });

  const runtimeGraph = applyLabSwitchersToGraph(rawGraph, selection.switchers);
  const inspector = buildRuntimeInspectorView(runtimeGraph);

  return {
    selection,
    scenarioLabel: getScenarioLabel(selection.scenarioId),
    scenarioHeroLabel: getScenarioHeroLabel(selection.scenarioId),
    runtimeGraph,
    inspector,
    switchCount: store.switchCount,
    orbNote: buildXelabOrbNote(),
    constitutionLocked: store.constitutionLocked,
  };
}
