import type { InnovationGraph } from './types';

export type AtlasLineageSignal = {
  nodeId: string;
  title: string;
  spreadIntensity: number;
  forkBranches: number;
  companiesUsing: number;
  glowLabel: string;
};

export function resolveAtlasLineageSignals(graphs: InnovationGraph[]): AtlasLineageSignal[] {
  return graphs.flatMap((graph) => {
    const flagship = graph.nodes.find((n) => n.marketplaceBestseller) ?? graph.nodes[graph.nodes.length - 1];
    if (!flagship) return [];
    const forks = graph.edges.filter((e) => e.relationType === 'forked-from').length;
    return [
      {
        nodeId: flagship.id,
        title: flagship.title,
        spreadIntensity: Math.min(100, Math.round(flagship.companiesUsing / 200 + forks * 10)),
        forkBranches: forks,
        companiesUsing: flagship.companiesUsing,
        glowLabel: `${forks} forks · ${flagship.companiesUsing.toLocaleString()} adopters`,
      },
    ];
  });
}

export function formatAtlasLineageLine(signals: AtlasLineageSignal[]): string | null {
  if (signals.length === 0) return null;
  const top = signals.sort((a, b) => b.spreadIntensity - a.spreadIntensity)[0]!;
  return `Innovation Lineage™ spreading — ${top.title}: ${top.glowLabel}`;
}
