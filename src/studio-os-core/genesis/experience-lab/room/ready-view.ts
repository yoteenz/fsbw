import { assembleExperienceRuntime } from '../../experience-runtime/runtime-engine/experience-runtime';
import { buildRuntimeInspectorView } from '../../experience-runtime/runtime-preview/inspector-view';
import { validateRuntimeBoot } from '../../experience-runtime/runtime-boot/runtime-boot-validator';
import { resolveRuntimeSelection } from '../../experience-runtime/runtime-boot/runtime-fallback-resolver';
import { readExperienceLabStore } from '../persistence';
import { applyLabSwitchersToGraph, getScenarioHeroLabel, getScenarioLabel } from '../engines/lab-switchers';
import type { XelabReadyView, XelabRuntimeInput } from '../types';

export function buildXelabOrbNote(): string {
  return 'Experience Lab™ — inspect, test, switch, and validate every DNA layer before production. Same runtime spine; only inherited DNA changes.';
}

export function buildExperienceLabReadyView(input?: XelabRuntimeInput): XelabReadyView {
  const store = readExperienceLabStore();
  const selection = input?.selection ? { ...store.selection, ...input.selection } : store.selection;

  const bootReport = validateRuntimeBoot({
    brandId: selection.brandId,
    departmentId: selection.departmentId,
    sceneId: selection.sceneId,
    motionDnaId: selection.motionDnaId,
  });

  const resolved = bootReport.resolved;

  let runtimeGraph = null;
  let inspector = null;

  try {
    const rawGraph = assembleExperienceRuntime({
      brandId: resolved.brandId,
      departmentId: resolved.registryDepartmentId,
      sceneId: resolved.sceneId,
      motionDnaId: resolved.motionDnaId,
      skipCache: true,
    });
    runtimeGraph = applyLabSwitchersToGraph(rawGraph, selection.switchers);
    inspector = buildRuntimeInspectorView(runtimeGraph);
  } catch (err) {
    bootReport.warnings.push(
      err instanceof Error ? err.message : 'Runtime assembly failed — showing diagnostics only'
    );
  }

  const effectiveSelection = {
    ...selection,
    brandId: resolved.brandId,
    departmentId: resolved.departmentId,
    sceneId: resolved.sceneId,
    motionDnaId: resolved.motionDnaId,
  };

  return {
    selection: effectiveSelection,
    scenarioLabel: getScenarioLabel(selection.scenarioId),
    scenarioHeroLabel: getScenarioHeroLabel(selection.scenarioId),
    runtimeGraph,
    inspector,
    bootReport,
    switchCount: store.switchCount,
    orbNote: buildXelabOrbNote(),
    constitutionLocked: store.constitutionLocked,
  };
}

export { validateRuntimeBoot, resolveRuntimeSelection };
