import { listBuildOrderRegistry } from '../build-order/registry';
import type { BuildOrderRegistryEntry, BuildPhaseView } from '../types';

const PHASE_META: Record<number, { label: string; goal: string }> = {
  0: { label: 'Kernel truth', goal: 'Define canonical laws, objects, interactions, decisions, build order' },
  1: { label: 'Business truth', goal: 'Convert real businesses into platform-understandable operating objects' },
  2: { label: 'Tenancy and trust', goal: 'Establish organizations, companies, actors, authentication, permissions' },
  3: { label: 'Knowledge substrate', goal: 'Store, connect, retain, and publish source-backed knowledge' },
  4: { label: 'Operational spine', goal: 'Move work safely through events, workflows, missions, commands, automation' },
  5: { label: 'Workspace and executive surfaces', goal: 'Present stable operational state without owning source truth' },
  6: { label: 'Creation substrate', goal: 'Own assets, recipes, scenes, compilers, experiences, foundry workflows' },
  7: { label: 'Professional intelligence', goal: 'Build profession cognition, memory, research, and simulation' },
  8: { label: 'Economy and learning surfaces', goal: 'Package, distribute, learn, sell, license, and monetize' },
  9: { label: 'Platform externalization', goal: 'Expose Studio OS safely to developers and external integrations' },
};

function toEntry(system: ReturnType<typeof listBuildOrderRegistry>[number]): BuildOrderRegistryEntry {
  return {
    systemId: system.systemId,
    officialName: system.officialName,
    topologicalOrder: system.topologicalOrder,
    architecturalPhase: system.architecturalPhase,
    priority: system.priority,
    currentStatus: system.currentStatus,
    architecturalReadiness: system.architecturalReadiness,
    implementationReadiness: system.implementationReadiness,
  };
}

/** Build phases view */
export function getBuildPhasesView(): BuildPhaseView[] {
  const systems = listBuildOrderRegistry();
  const phases = [...new Set(systems.map((s) => s.architecturalPhase))].sort((a, b) => a - b);

  return phases.map((phase) => {
    const meta = PHASE_META[phase] ?? { label: `Phase ${phase}`, goal: '' };
    return {
      phase,
      label: meta.label,
      goal: meta.goal,
      systems: systems.filter((s) => s.architecturalPhase === phase).map(toEntry),
    };
  });
}

export function getBuildPhaseLabel(phase: number): string {
  return PHASE_META[phase]?.label ?? `Phase ${phase}`;
}
