import type {
  AtlasActivityLevel,
  AtlasConstructionJob,
  AtlasLivingSignal,
  AtlasMapMode,
  AtlasNode,
  AtlasViewState,
} from './types';
import { isUnderConstruction, resolveConstructionPhaseForNode } from './world-construction';

export type LivingWorldContext = {
  mapMode: AtlasMapMode;
  view: Pick<AtlasViewState, 'travelingRoads' | 'travelMode'>;
  constructions: AtlasConstructionJob[];
  hiddenFinds: string[];
  tick: number;
};

export function resolveLivingSignals(node: AtlasNode, ctx: LivingWorldContext): AtlasLivingSignal[] {
  const signals: AtlasLivingSignal[] = [];
  const phase = node.constructionPhase ?? resolveConstructionPhaseForNode(node, ctx.constructions);

  if (isUnderConstruction(phase)) signals.push('construction-crane');
  if (node.activity === 'pulse' || node.activity === 'generating') signals.push('pulse');
  if (node.activity === 'generating') signals.push('ai-glow');
  if (node.engineIds?.includes('architecture-auditor') && node.activity !== 'dormant') {
    signals.push('ai-glow');
  }
  if (node.monumentType === 'golden-build') signals.push('golden-monument');
  if (node.monumentType === 'innovation') signals.push('innovation-monument');
  if (node.flagshipId === 'studio-archives' && node.activity !== 'dormant') {
    signals.push('museum-exhibit');
  }
  if (node.flagshipId === 'studio-warehouse' && node.activity === 'generating') {
    signals.push('ai-glow');
  }
  if (
    (node.flagshipId === 'marketplace' || ctx.mapMode === 'marketplace') &&
    node.engineIds?.includes('creative-portfolio')
  ) {
    signals.push('marketplace-delivery');
  }
  if (ctx.hiddenFinds.includes(node.id)) signals.push('hidden-discovery');
  if (node.monumentType === 'seasonal') signals.push('seasonal-event');
  if (ctx.view.travelingRoads) signals.push('road-illuminated');
  if (
    ctx.view.travelMode === 'observation-train' ||
    ctx.view.travelMode === 'autonomous-transit' ||
    ctx.view.travelMode === 'executive-shuttle'
  ) {
    signals.push('transit-active');
  }

  // Ambient life — subtle pulse on a rotating subset so world never feels frozen
  const ambientIdx = (ctx.tick + node.mapX + node.mapY) % 7;
  if (ambientIdx === 0 && node.unlocked && !node.fogged) signals.push('pulse');

  return [...new Set(signals)];
}

export function livingSignalClass(signal: AtlasLivingSignal): string {
  return `has-signal-${signal}`;
}

export function resolveMonumentType(
  node: AtlasNode,
  hiddenFinds: string[]
): AtlasNode['monumentType'] {
  if (node.monumentType) return node.monumentType;
  if (node.migrationStatus === 'immersive-live') return 'golden-build';
  if (hiddenFinds.includes(node.id) && node.id.includes('innovation')) return 'innovation';
  return null;
}

export function ambientWorldTicker(nodes: AtlasNode[], ctx: LivingWorldContext): string {
  const active = nodes.filter((n) => n.activity === 'generating' || n.activity === 'pulse').length;
  const building = ctx.constructions.filter((j) => isUnderConstruction(j.phase)).length;
  const parts = [
    `${active} DESTINATIONS LIVE`,
    building > 0 ? `${building} CONSTRUCTION SITES` : null,
    'AI CONCIERGES PATROLLING CAMPUS',
    ctx.mapMode === 'master-planner' ? 'MASTER PLANNER™ — SIMULATE BEFORE YOU GENERATE' : null,
  ].filter(Boolean);
  return parts.join(' · ');
}

export function boostActivityForEngines(activity: AtlasActivityLevel, engineCount: number): AtlasActivityLevel {
  if (engineCount >= 4 && activity === 'idle') return 'active';
  if (engineCount >= 2 && activity === 'dormant') return 'idle';
  return activity;
}
