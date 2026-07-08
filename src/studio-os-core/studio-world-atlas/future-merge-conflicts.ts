import type { AtlasParallelFuture, MergeConflict, ParallelFutureBuilding } from './types';

function uid(): string {
  return `conflict-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

function distance(a: ParallelFutureBuilding, b: ParallelFutureBuilding): number {
  return Math.hypot(a.mapX - b.mapX, a.mapY - b.mapY);
}

/** Merge Engine™ — detect conflicts, explain, recommend. Never silent. */
export function detectMergeConflicts(
  merged: AtlasParallelFuture,
  sources: AtlasParallelFuture[]
): MergeConflict[] {
  const conflicts: MergeConflict[] = [];
  const buildings = merged.buildings;

  for (let i = 0; i < buildings.length; i++) {
    for (let j = i + 1; j < buildings.length; j++) {
      const a = buildings[i]!;
      const b = buildings[j]!;
      if (distance(a, b) < 8) {
        conflicts.push({
          id: uid(),
          kind: 'land-overlap',
          severity: 'critical',
          description: `${a.label} and ${b.label} occupy overlapping land (${distance(a, b).toFixed(1)} units apart).`,
          recommendation: `Relocate ${b.label} east +12 units or merge into a shared wing with ${a.label}.`,
          affectedBuildingIds: [a.id, b.id],
          resolved: false,
        });
      }
    }
  }

  const deptCounts = new Map<string, ParallelFutureBuilding[]>();
  for (const b of buildings) {
    const list = deptCounts.get(b.department) ?? [];
    list.push(b);
    deptCounts.set(b.department, list);
  }
  for (const [dept, list] of deptCounts) {
    if (list.length > 1 && dept !== 'Executive') {
      conflicts.push({
        id: uid(),
        kind: 'duplicate-department',
        severity: 'warning',
        description: `Duplicate ${dept} department — ${list.map((b) => b.label).join(' · ')}.`,
        recommendation: `Consolidate into one ${dept} headquarters or assign distinct wings with skybridge connection.`,
        affectedBuildingIds: list.map((b) => b.id),
        resolved: false,
      });
    }
  }

  const styles = new Set(sources.map((s) => s.archetype));
  if (styles.size >= 3) {
    conflicts.push({
      id: uid(),
      kind: 'style-mismatch',
      severity: 'warning',
      description: 'Architectural styles span Luxury, Enterprise, Lean, and Experimental — visual coherence at risk.',
      recommendation: 'Apply Company Genome™ lighting palette to unify glass/atrium treatments across wings.',
      affectedBuildingIds: buildings.map((b) => b.id),
      resolved: false,
    });
  }

  if (merged.analysis.assetReusePct < 50 && sources.some((s) => s.analysis.assetReusePct > 70)) {
    conflicts.push({
      id: uid(),
      kind: 'blueprint-dependency',
      severity: 'info',
      description: 'Merged layout reduces asset reuse below Lean Startup baseline.',
      recommendation: 'Pull Budget Strategy from Future D™ and add Warehouse reuse wing from Future C™.',
      affectedBuildingIds: [],
      resolved: false,
    });
  }

  if (merged.analysis.navigationEfficiency < 78) {
    conflicts.push({
      id: uid(),
      kind: 'ai-routing',
      severity: 'warning',
      description: `AI routing efficiency projected at ${merged.analysis.navigationEfficiency}% — below campus target.`,
      recommendation: 'Add transit hub from Future A™ transportation network to reduce walking distance ~23%.',
      affectedBuildingIds: buildings.slice(0, 2).map((b) => b.id),
      resolved: false,
    });
  }

  const genomeSpread =
    Math.max(...sources.map((s) => s.analysis.navigationEfficiency)) -
    Math.min(...sources.map((s) => s.analysis.navigationEfficiency));
  if (genomeSpread > 15) {
    conflicts.push({
      id: uid(),
      kind: 'genome-inconsistency',
      severity: 'warning',
      description: 'Company Genome™ signals conflict between brand-forward and lean-operational sources.',
      recommendation: 'Run Experience Intelligence™ pass — prioritize brand consistency OR operational simplicity, not both at full intensity.',
      affectedBuildingIds: [],
      resolved: false,
    });
  }

  if (merged.roads.length > 3) {
    conflicts.push({
      id: uid(),
      kind: 'road-conflict',
      severity: 'info',
      description: 'Multiple transportation networks intersect at central plaza — potential congestion.',
      recommendation: 'Merge boulevards into a single spine with autonomous transit loop.',
      affectedBuildingIds: [],
      resolved: false,
    });
    conflicts.push({
      id: uid(),
      kind: 'lighting-mismatch',
      severity: 'info',
      description: 'Lighting systems from different futures use incompatible atmosphere presets.',
      recommendation: 'Standardize on Executive Atrium™ golden-hour lighting for all merged wings.',
      affectedBuildingIds: [],
      resolved: false,
    });
  }

  return conflicts;
}

export function resolveMergeConflict(conflicts: MergeConflict[], conflictId: string): MergeConflict[] {
  return conflicts.map((c) => (c.id === conflictId ? { ...c, resolved: true } : c));
}

export function unresolvedConflictCount(conflicts: MergeConflict[]): number {
  return conflicts.filter((c) => !c.resolved && c.severity === 'critical').length;
}
